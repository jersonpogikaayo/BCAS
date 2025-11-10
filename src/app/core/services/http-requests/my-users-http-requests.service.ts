import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CacheService } from '../cache/cache.service';

@Injectable({
  providedIn: 'root'
})
export class MyUsersHttpRequestsService {
  private baseUrl = environment.api;

  constructor(private http: HttpClient, private cacheService: CacheService) {}

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
    const url = `${this.baseUrl}user/manager/myusers/find/`;
    return this.http.get(url, options);
  }

  getGridDataCount(params: any, forceRefresh: boolean = false, isEngineer: boolean = true): Observable<number> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
        httpParams = httpParams.append(key, params[key]);
    });

    const url = `${this.baseUrl}user/manager/myusers/count/`;
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

  addEngineer(userData: any): Observable<any> {
    const url = `${this.baseUrl}user/manager/create/engineer/`;
    return this.http.post(url, userData, this.getHttpOptions());
  }

  updateEngineer(userData: any): Observable<any> {
    const url = `${this.baseUrl}user/manager/update/engineer/`;
    return this.http.put(url, userData, this.getHttpOptions());
  }

  addManager(userData: any): Observable<any> {
    const url = `${this.baseUrl}user/manager/create/manager/`;
    return this.http.post(url, userData, this.getHttpOptions());
  }

  updateManager(userData: any): Observable<any> {
    const url = `${this.baseUrl}user/manager/update/manager/`;
    return this.http.put(url, userData, this.getHttpOptions());
  }

  getTestEquipmentGridData(params: any, forceRefresh: boolean = false): Observable<any> {
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
    const url = `${this.baseUrl}user/testequipment/myengineers/find/`;
    return this.http.get(url, options);
  }

  getTestEquipmentGridDataCount(params: any, forceRefresh: boolean = false, isEngineer: boolean = true): Observable<number> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
        httpParams = httpParams.append(key, params[key]);
    });

    const url = `${this.baseUrl}user/testequipment/myengineers/find/count/`;
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

  updateServiceDate(payload: any) {
    const url = `${this.baseUrl}testequipment/service`;
    return this.http.put(url, payload, this.getHttpOptions());
  }
}