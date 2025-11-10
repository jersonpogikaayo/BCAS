import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CacheService } from '../cache/cache.service';

@Injectable({
  providedIn: 'root'
})
export class EquipmentsHttpRequestsService {
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
    const url = `${this.baseUrl}equipment/find/datagrid`;
    return this.http.get(url, options);
  }

  getGridDataCount(params: any, forceRefresh: boolean = false, isEngineer: boolean = true): Observable<number> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
        httpParams = httpParams.append(key, params[key]);
    });

    const url = `${this.baseUrl}equipment/find/count/`;
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

  getEquipmentDetails(equipmentId: number): Observable<any> {
    const url = `${this.baseUrl}equipment/${equipmentId}`;
    return this.http.get(url, this.getHttpOptions());
  }

  retireEquipment(equipmentId: number): Observable<any> {
    const url = `${this.baseUrl}equipment/retire/${equipmentId}`;
    return this.http.put(url, {}, this.getHttpOptions(true));
  }

  unRetireEquipment(equipmentId: number): Observable<any> {
    const url = `${this.baseUrl}equipment/unretire/${equipmentId}`;
    return this.http.put(url, {}, this.getHttpOptions(true));
  }
}