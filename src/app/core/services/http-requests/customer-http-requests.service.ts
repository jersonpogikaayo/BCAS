import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CacheService } from '../cache/cache.service';
import { CoverLevel, Customer, CustomerType } from '../../models/customer/customer.model';
import { catchError, map, retry } from 'rxjs/operators';
import { CsvImportResult } from '../../models/customer/csv-customer.model';
import { AuthService } from '../authentication/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerHttpRequestsService {
  private baseUrl = environment.api;

  constructor(private http: HttpClient, private cacheService: CacheService, private auth: AuthService) {}

   /**
   * Get HTTP options with cache control headers
   */
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
    const url = `${this.baseUrl}Customer/find/`;
    return this.http.get(url, options);
  }

  getGridDataCount(params: any, forceRefresh: boolean = false, isEngineer: boolean = true): Observable<number> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
        httpParams = httpParams.append(key, params[key]);
    });

    const url = `${this.baseUrl}Customer/find/count/`;
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

    getCustomerType(): Observable<CustomerType[]> {
        return this.http.get<any[]>(`${this.baseUrl}customer/type`)
        .pipe(
            catchError(error => {
            console.error('Failed to load departments:', error);
            return of([]);
            })
        );
    }

    getCoverLevels(): Observable<CoverLevel[]> {
        return this.http.get<any[]>(`${this.baseUrl}CoverLevel`)
        .pipe(
            catchError(error => {
            console.error('Failed to load departments:', error);
            return of([]);
            })
        );
    }

  addCustomer(payload: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}Customer`, payload)
      .pipe(
        retry(1),
      );
    }

  editCustomer(payload: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}Customer`, payload)
      .pipe(
        retry(1),
    );
  }

  private getFileUploadOptions() {
    return {
      headers: new HttpHeaders({
        'Accept': '*/*'
      })
    };
  }

  uploadCsvFileWithProgress(formData: FormData): Observable<any> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders({
      'Skip-Interceptor': 'true',
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<any>(
      `${this.baseUrl}csv/customer/parse`,
      formData,
      { 
        headers,
        reportProgress: true,
        observe: 'events' // This is key for progress tracking
      }
    ).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.Sent:
            return { status: 'uploading', progress: 0 };
            
          case HttpEventType.UploadProgress:
            const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
            return { status: 'uploading', progress };
            
          case HttpEventType.Response:
            return { status: 'complete', data: event.body, progress: 100 };
            
          default:
            return { status: 'uploading', progress: 0 };
        }
      }),
      catchError(error => {
        throw error;
      })
    );
  }
  
  saveCustomer(payload: any) {
    return this.http.post<any>(`${this.baseUrl}csv/customer/save`, payload)
      .pipe(
        retry(1),
    );
  }
}