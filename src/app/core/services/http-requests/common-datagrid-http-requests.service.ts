import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CacheService } from '../cache/cache.service';

@Injectable({
  providedIn: 'root'
})
export class CommonDataGridHttpRequestsService {
  private baseUrl = environment.api;

  constructor(private http: HttpClient, private cacheService: CacheService) {
  }

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

  getGridData(params: any, forceRefresh: boolean = false, isEngineer: boolean = true): Observable<any> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      if (key === 'JobStatusTypes' && Array.isArray(params[key])) {
        params[key].forEach((value: any) => {
          httpParams = httpParams.append('JobStatusTypes', value);
        });
      } else {
        httpParams = httpParams.append(key, params[key]);
      }
    });

    const options = {
      ...this.getHttpOptions(forceRefresh),
      params: httpParams
    };

    if (forceRefresh) {
      const timestamp = new Date().getTime();
      httpParams = httpParams.append('_t', timestamp.toString());
      options.params = httpParams;
    }
    const url = isEngineer ? `${this.baseUrl}job/find/user` : `${this.baseUrl}job/find/datagrid`;
    return this.http.get(url, options);
  }

  getGridDataCount(params: any, forceRefresh: boolean = false, isEngineer: boolean = true): Observable<number> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      if (key === 'JobStatusTypes' && Array.isArray(params[key])) {
        params[key].forEach((value: any) => {
          httpParams = httpParams.append('JobStatusTypes', value);
        });
      } else {
        httpParams = httpParams.append(key, params[key]);
      }
    });

    const url = isEngineer ? `${this.baseUrl}job/find/count/user` : `${this.baseUrl}job/find/count/`;
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
}