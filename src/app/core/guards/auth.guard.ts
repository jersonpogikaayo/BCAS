import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/authentication/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: AuthService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const currentUser = this.authService.currentUserValue;
        
        if (currentUser && currentUser.accessToken) {
            return true;
        }

        // If no current user but we have a refresh token, try to refresh
        if (currentUser?.refreshToken) {
            return this.authService.refreshToken(currentUser.refreshToken).pipe(
                map(() => true),
                catchError(() => {
                    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                    return of(false);
                })
            );
        }

        // No valid user, redirect to login
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}
