// jobs-http-requests.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AddAttachmentsPayload, AddJobNotePayload, JobDetail, JobProcessPayload, JobProcessResponse } from '../../models/jobs/jobs.model';
import { GridItem } from '../../models/common-datagrid/common-data-grid.model';
import { User } from '../../models/user/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersHttpRequestsService {
  private readonly baseUrl = environment.api;

  constructor(private http: HttpClient) {}


  getManagersUsers(stringIds: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}user/qualified/myusers/equipment?${stringIds}`)
      .pipe(
        retry(2), // Retry failed requests up to 2 times
        catchError(this.handleError)
      );
  }

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

  assignJobsToUser(userName: string, payload: any): Observable<JobProcessResponse> {
    return this.http.put<JobProcessResponse>(`${this.baseUrl}job/process/batch/assign/${userName}`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
  }

  reassignPausedJobToUser(userName: string, payload: any): Observable<JobProcessResponse> {
    return this.http.put<JobProcessResponse>(`${this.baseUrl}job/process/incomplete/reassign/${userName}`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
  }

  bookBatchJobToUser(payload: any): Observable<JobProcessResponse> {
    return this.http.put<JobProcessResponse>(`${this.baseUrl}job/process/batch/book`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
  }

}