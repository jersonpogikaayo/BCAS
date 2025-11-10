// jobs-http-requests.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MyJobsHttpRequestsService {
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
  private getCount(endpoint: string, forceRefresh: boolean = false): Observable<number> {
    const url = `${environment.api}${endpoint}`;
    const options = this.getHttpOptions(forceRefresh);
    
    if (forceRefresh) {
      const timestamp = new Date().getTime();
      const separator = endpoint.includes('?') ? '&' : '?';
      return this.http.get<number>(`${url}${separator}_t=${timestamp}`, options);
    }
    
    return this.http.get<number>(url, options);
  }

  getJobsAssignedCounts(forceRefresh: boolean = false): Observable<number> {
    return this.getCount('job/find/count/user?jobStatusType=2&StatusId=9', forceRefresh);
  }

  getBookedJobsCounts(forceRefresh: boolean = false): Observable<number> {
    return this.getCount('job/find/count/user?JobStatusType=5', forceRefresh);
  }

  getInProgressJobsCounts(forceRefresh: boolean = false): Observable<number> {
    return this.getCount('job/find/count/user?JobStatusType=7', forceRefresh);
  }

  getPausedJobsCounts(forceRefresh: boolean = false): Observable<number> {
    return this.getCount('job/find/count/user?JobStatusType=8', forceRefresh);
  }

  getPendingJobsCounts(forceRefresh: boolean = false): Observable<number> {
    return this.getCount('job/find/count/user?JobStatusType=10', forceRefresh);
  }

  getFailedJobsCounts(forceRefresh: boolean = false): Observable<number> {
    return this.getCount('job/find/count/user?JobStatusType=9', forceRefresh);
  }

  getNotPresentedJobsCounts(forceRefresh: boolean = false): Observable<number> {
    return this.getCount('job/find/count/user?JobStatusType=9&Status=CannotLocate', forceRefresh);
  }

  getCompletedJobsCounts(forceRefresh: boolean = false): Observable<number> {
    return this.getCount('job/find/count/user?JobStatusType=11', forceRefresh);
  }
}