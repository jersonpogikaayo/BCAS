// site-http.requests.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Site } from '../../models/site/site.model';
import { CacheService } from '../cache/cache.service';

@Injectable({
  providedIn: 'root'
})
export class SiteHttpRequestsService {
  private readonly baseUrl = environment.api;

  constructor(private http: HttpClient, private cacheService: CacheService) {}


  private getHttpOptions(forceRefresh: boolean = false) {
      const headers: any = {
        'Content-Type': 'application/json'
      };
  
      if (forceRefresh) {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      }
  
      return {
        headers: new HttpHeaders(headers)
      };
  }

  
  /**
   * Get all sites
   * @returns Observable<Site[]>
   */
  getAllSites(): Observable<Site[]> {
    return this.http.get<Site[]>(`${this.baseUrl}site`)
      .pipe(
        retry(2), // Retry failed requests up to 2 times
        catchError(this.handleError)
      );
  }

    /**
     * Get site departments
     */
    getSiteDepartments(siteId: number): Observable<any[]> {
      return this.http.get<any[]>(`${this.baseUrl}site/department/${siteId}`)
        .pipe(
          catchError(error => {
            console.error('Failed to load departments:', error);
            return of([]);
          })
        );
    }

  getSiteById(siteId: number): Observable<Site> {
    if (!siteId || siteId <= 0) {
      return throwError(() => new Error('Invalid site ID provided'));
    }

    return this.http.get<Site>(`${this.baseUrl}site/${siteId}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  getGridData(params: any, forceRefresh: boolean = false): Observable<any> {
      let httpParams = new HttpParams();
      
      Object.keys(params).forEach(key => {
          httpParams = httpParams.append(key, params[key]);
      });
  
      const options = {
        ...this.getHttpOptions(forceRefresh),
        params: httpParams
      };
  
      // Add timestamp for cache busting when force refresh
      if (forceRefresh) {
        const timestamp = new Date().getTime();
        httpParams = httpParams.append('_t', timestamp.toString());
        options.params = httpParams;
      }
      const url = `${this.baseUrl}Site/find`;
      return this.http.get(url, options);
    }
  
    getGridDataCount(params: any, forceRefresh: boolean = false, isEngineer: boolean = true): Observable<number> {
      let httpParams = new HttpParams();
      
      Object.keys(params).forEach(key => {
          httpParams = httpParams.append(key, params[key]);
      });
  
      const url = `${this.baseUrl}Site/count`;
      const queryString = httpParams.toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      
      console.log(`🔄 Getting count data - Force refresh: ${forceRefresh}`);
      console.log(`📡 URL: ${fullUrl}`);
      
      // Always use cache service but with appropriate options
      return this.cacheService.get<number>(fullUrl, {
        forceRefresh: forceRefresh,
        skipCache: forceRefresh
      });
    }

  /**
   * Handle HTTP errors
   * @private
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while processing your request';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your parameters.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission to view sites.';
          break;
        case 404:
          errorMessage = 'Sites not found or endpoint does not exist.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service unavailable. Please try again later.';
          break;
        default:
          errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }

    console.error('Site HTTP Service Error:', {
      status: error.status,
      message: errorMessage,
      error: error.error
    });

    return throwError(() => new Error(errorMessage));
  }

  addSite(site: Site): Observable<Site> {
    if (!site || !site.name) {
      return throwError(() => new Error('Invalid site data provided'));
    }

    return this.http.post<Site>(`${this.baseUrl}Site`, site, this.getHttpOptions())
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  editSite(site: Site): Observable<Site> {
    if (!site || !site.id) {
      return throwError(() => new Error('Invalid site data provided'));
    }

    return this.http.put<Site>(`${this.baseUrl}Site`, site, this.getHttpOptions())
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
}