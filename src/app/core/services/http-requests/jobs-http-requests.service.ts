// jobs-http-requests.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AddAttachmentsPayload, AddJobNotePayload, JobDetail, JobProcessPayload, JobProcessResponse } from '../../models/jobs/jobs.model';
import { GridItem } from '../../models/common-datagrid/common-data-grid.model';

@Injectable({
  providedIn: 'root'
})
export class JobsHttpRequestsService {
  private readonly baseUrl = environment.api;

  constructor(private http: HttpClient) {}

  /**
   * Get job details by job ID
   * @param jobId - The ID of the job to retrieve
   * @returns Observable<JobDetail>
   */
  getJobById(jobId: number): Observable<JobDetail> {
    if (!jobId || jobId <= 0) {
      return throwError(() => new Error('Invalid job ID provided'));
    }

    return this.http.get<JobDetail>(`${this.baseUrl}job/${jobId}`)
      .pipe(
        retry(2), // Retry failed requests up to 2 times
        catchError(this.handleError)
      );
  }

  getJobSummaryById(jobId: number): Observable<any> {
    console.log('🚀 Getting job summary for job ID:', jobId);
    if (!jobId || jobId <= 0) {
      return throwError(() => new Error('Invalid job ID provided'));
    }

    return this.http.get<JobDetail>(`${this.baseUrl}job/summary/${jobId}`)
      .pipe(
        retry(1), // Retry failed requests up to 2 times
        catchError(this.handleError)
      );
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

 
  startJob(jobId: number, payload: JobProcessPayload): Observable<JobProcessResponse> {
    if (!jobId || jobId <= 0) {
      return throwError(() => new Error('Invalid job ID provided'));
    }

    if (!payload.submissionTime) {
      payload.submissionTime = new Date().toISOString();
    }

    console.log('🚀 Starting job:', { jobId, payload });

    return this.http.post<JobProcessResponse>(`${this.baseUrl}job/process/start/${jobId}`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
  }

  pendingReviewJob(jobId: number, payload: any): Observable<JobProcessResponse> {
    if (!jobId || jobId <= 0) {
      return throwError(() => new Error('Invalid job ID provided'));
    }

    return this.http.post<JobProcessResponse>(`${this.baseUrl}job/process/pending/review/${jobId}`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
  }

  failJob(jobId: number, payload: any): Observable<JobProcessResponse> {
    if (!jobId || jobId <= 0) {
      return throwError(() => new Error('Invalid job ID provided'));
    }

    return this.http.post<JobProcessResponse>(`${this.baseUrl}job/process/fail/${jobId}`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
  }

  pauseJob(jobId: number, payload: any): Observable<JobProcessResponse> {
    if (!jobId || jobId <= 0) {
      return throwError(() => new Error('Invalid job ID provided'));
    }

    return this.http.post<JobProcessResponse>(`${this.baseUrl}job/process/incomplete/${jobId}`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
  }

   completeJob(jobId: number, payload: JobProcessPayload): Observable<JobProcessResponse> {
    if (!jobId || jobId <= 0) {
      return throwError(() => new Error('Invalid job ID provided'));
    }

    return this.http.post<JobProcessResponse>(`${this.baseUrl}job/process/complete/${jobId}`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
    }

  getJobFailureCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api}job/status/survey/fail`);
  }

  getJobPauseCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api}job/status/survey/pause`);
  }

  getJobHistory(jobId: number): Observable<any[]> {
    if (!jobId || jobId <= 0) {
      return throwError(() => new Error('Invalid job ID provided'));
    }

    return this.http.get<any[]>(`${this.baseUrl}job/status/history/full/${jobId}`)
      .pipe(
        retry(1), // Only retry once for GET requests
        catchError(this.handleError)
      );
  }

  getLinkedJobs(jobId: number): Observable<GridItem[]> {
    if (!jobId || jobId <= 0) {
      return throwError(() => new Error('Invalid job ID provided'));
    }

    return this.http.get<any[]>(`${this.baseUrl}job/related/${jobId}`)
      .pipe(
        retry(1), // Only retry once for GET requests
        catchError(this.handleError)
      );
  }

  addJobNotes(jobId: number, payload: AddJobNotePayload): Observable<any> {
    if (!jobId || jobId <= 0) {
      return throwError(() => new Error('Invalid job ID provided'));
    }
    return this.http.post<JobProcessResponse>(`${this.baseUrl}job/note/${jobId}`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
  }

  getJobNotes(jobId: number): Observable<any[]> {
    if (!jobId || jobId <= 0) {
      return throwError(() => new Error('Invalid job ID provided'));
    }

    return this.http.get<any[]>(`${this.baseUrl}job/note/all/${jobId}`)
      .pipe(
        retry(1), // Only retry once for GET requests
        catchError(this.handleError)
      );
  }

  addJobAttachments(jobId: number, payload: AddAttachmentsPayload[]): Observable<any> {
    if (!jobId || jobId <= 0) {
          return throwError(() => new Error('Invalid job ID provided'));
        }
    return this.http.post<JobProcessResponse>(`${this.baseUrl}job/attachment/${jobId}`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
}

  getJobAttachments(jobId: number): Observable<any[]> {
    if (!jobId || jobId <= 0) {
      return throwError(() => new Error('Invalid job ID provided'));
    }

    return this.http.get<any[]>(`${this.baseUrl}job/attachment/file/${jobId}`)
      .pipe(
        retry(1), // Only retry once for GET requests
        catchError(this.handleError)
      );
  }

  signOffBatchPendingJobs(payload: any): Observable<JobProcessResponse> {
    return this.http.put<JobProcessResponse>(`${this.baseUrl}job/process/batch/complete/`, payload)
      .pipe(
        catchError(this.handleError)
      );
  }

  getJobTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api}job/type`);
  }

  createJob(payload: any): Observable<any> {
    console.log(payload)
    if (!payload || !payload.JobTypeId || !payload.EquipmentId || !payload.SurveyId) {
      return throwError(() => new Error('Invalid payload provided'));
    }

    return this.http.post<any>(`${this.baseUrl}job/create/user`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
  }

  cancelJob(payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}job/process/batch/cancel`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
  }

  cannotLocateJob(payload: any): Observable<any> {
    if (!payload || !payload.jobs || payload.jobs.length === 0) {
      return throwError(() => new Error('Invalid payload provided'));
    }

    return this.http.put<any>(`${this.baseUrl}job/process/batch/cannotlocate`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
  }

  unAssignJob(payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}job/process/batch/unassign`, payload)
      .pipe(
        retry(1), // Only retry once for POST requests
        catchError(this.handleError)
      );
  }



}