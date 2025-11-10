// jobs-http-requests.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { Department, Equipment, Manufacturer, Model, Site } from '../../models/equipment/equipment.model';

@Injectable({
  providedIn: 'root'
})
export class RaiseJobsHttpRequestsService {
  private readonly baseUrl = environment.api;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
      let errorMessage = 'An error occurred while processing your request';
  
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = 'Invalid request. Please check the job ID.';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please log in again.';
            break;
          case 403:
            errorMessage = 'Access denied. You do not have permission to view this job.';
            break;
          case 404:
            errorMessage = 'Job not found. The specified job does not exist.';
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
  
      console.error('Jobs HTTP Service Error:', {
        status: error.status,
        message: errorMessage,
        error: error.error
      });
  
      return throwError(() => new Error(errorMessage));
    }

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

    /**
   * Generic method to get count with force refresh support
   */
  private get(endpoint: string, forceRefresh: boolean = false): Observable<Equipment[]> {
    const url = `${environment.api}${endpoint}`;
    const options = this.getHttpOptions(forceRefresh);
    
    if (forceRefresh) {
      const timestamp = new Date().getTime();
      const separator = endpoint.includes('?') ? '&' : '?';
      return this.http.get<Equipment[]>(`${url}${separator}_t=${timestamp}`, options);
    }
    
    return this.http.get<Equipment[]>(url, options);
  }

  locateEquipment(assetNumber: string, forceRefresh: boolean = false): Observable<Equipment[]> {
    return this.get(`equipment/locate/${assetNumber}`, forceRefresh);
  }

  getALlSite(): Observable<Site[]> {
    return this.http.get<Site[]>(`${this.baseUrl}site`);
  }

  getAllManufacturer(): Observable<Manufacturer[]> {
    return this.http.get<Manufacturer[]>(`${this.baseUrl}manufacturer`);
  }

  getJobFrequency(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}frequency`);
  }
  
  getDepartmentBySite(siteId: number): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}site/department/${siteId}`);
  }

  getModelByManufacturer(manufacturerId: number): Observable<Model[]> {
    return this.http.get<Model[]>(`${this.baseUrl}equipment/model/manufacturer/${manufacturerId}`);
  }

  addEquipment(equipment: any): Observable<Equipment> {
    return this.http.post<Equipment>(`${this.baseUrl}Equipment`, equipment, this.getHttpOptions());
  }
  
}