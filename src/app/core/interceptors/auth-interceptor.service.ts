import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../services/authentication/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.headers.has('Skip-Interceptor')) {
      const modifiedRequest = request.clone({
        headers: request.headers.delete('Skip-Interceptor')
      });
      return next.handle(modifiedRequest);
    }

    const authRequest = this.addTokenHeader(request);

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !authRequest.url.includes('/Login/refreshToken')) {
          return this.handle401Error(authRequest, next);
        }
        
        if (error.status === 400) {
          this.handle400Error(error);
        }
        
        return throwError(error);
      })
    );
  }

  private handle400Error(error: HttpErrorResponse): void {
    let errorMessage = 'Bad Request';
    let errorDetails = '';

    if (Array.isArray(error.error)) {
      const errorMessages = error.error
        .filter(item => item.hasError && item.message)
        .map(item => item.message);
      
      if (errorMessages.length > 0) {
        errorMessage = errorMessages.length === 1 
          ? errorMessages[0] 
          : 'Multiple validation errors occurred';
        
        if (errorMessages.length > 1) {
          errorDetails = errorMessages.join('\n');
        }
      }
    }
    else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.error?.title) {
      errorMessage = error.error.title;
    } else if (typeof error.error === 'string') {
      errorMessage = error.error;
    }

    if (error.error?.errors && !Array.isArray(error.error)) {
      const validationErrors = error.error.errors;
      const validationMessages = Object.keys(validationErrors)
        .map(key => `${key}: ${validationErrors[key].join(', ')}`)
        .join('\n');
      
      if (validationMessages) {
        errorDetails = errorDetails ? `${errorDetails}\n${validationMessages}` : validationMessages;
      }
    }

    Swal.fire({
      icon: 'error',
      title: 'Request Error',
      text: errorMessage,
      footer: errorDetails ? `<small>${errorDetails.replace(/\n/g, '<br>')}</small>` : undefined,
      confirmButtonColor: '#d33',
      confirmButtonText: 'OK'
    });
  }
  
  private addTokenHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.auth.getToken();
    if (request.body instanceof FormData) {

      return request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
        }
      });
    }

    if (token) {
      return request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    return request.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.auth.getRefreshToken();
      
      if (refreshToken) {
        
        return this.auth.refreshToken(refreshToken).pipe(
          tap((newUser: any) => {
          }),
          switchMap((newUser: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(newUser.accessToken);
            
            const retryRequest = this.addTokenHeader(request);
            return next.handle(retryRequest);
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(null);
            console.error('Token refresh failed:', error);
            this.auth.logout();
            return throwError(error);
          })
        );
      } else {
        this.isRefreshing = false;
        this.auth.logout();
        return throwError('No refresh token available');
      }
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => {
          return next.handle(this.addTokenHeader(request));
        })
      );
    }
  }
}