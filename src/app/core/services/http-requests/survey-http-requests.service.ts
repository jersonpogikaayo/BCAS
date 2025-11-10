// survey-http-requests.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Survey, SurveySelectionEquipment } from 'src/app/core/models/survey/survey.model';
import { CacheService } from '../cache/cache.service';
import { QuestionType } from '../../models/survey/survey-section-questions.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyHttpRequestsService {
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

  getSurveyById(surveyId: number): Observable<Survey> {
    if (surveyId < 0) {
      return throwError(() => new Error('Invalid survey ID provided'));
    }

    console.log('📋 Fetching survey:', surveyId);

    return this.http.get<Survey>(`${this.baseUrl}survey/${surveyId}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  getSurveyByJobTypeIdEquipmentId(jobTypeId: number, equipmentId: any, isRaisedJob: boolean): Observable<SurveySelectionEquipment[]> {
    if (jobTypeId < 0 || equipmentId < 0) {
      return throwError(() => new Error('Invalid ID provided'));
    }
    const url = isRaisedJob ? `${this.baseUrl}survey/job/type/${jobTypeId}/equipment?equipmentIds=${equipmentId}` : `${this.baseUrl}survey/job/type/${jobTypeId}/equipment?${equipmentId}`;
    return this.http.get<SurveySelectionEquipment[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
    );
  }

  getCustomerFeedbackSurvey(): Observable<Survey> {
    return this.http.get<Survey>(`${this.baseUrl}customerfeedback/survey`)
      .pipe(
        retry(2),
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
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request. Please check the survey ID.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission to view this survey.';
          break;
        case 404:
          errorMessage = 'Survey not found. The specified survey does not exist.';
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

    console.error('Survey HTTP Service Error:', {
      status: error.status,
      message: errorMessage,
      error: error.error
    });

    return throwError(() => new Error(errorMessage));
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
      const url = `${this.baseUrl}Survey/find?`;
      return this.http.get(url, options);
    }
  
  getGridDataCount(params: any, forceRefresh: boolean = false, isEngineer: boolean = true): Observable<number> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
        httpParams = httpParams.append(key, params[key]);
    });

    const url = `${this.baseUrl}Survey/count/`;
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

  getQuestionType(): Observable<QuestionType[]> {
    return this.http.get<QuestionType[]>(`${this.baseUrl}question/type`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  createSurvey(payload: Survey): Observable<Survey> {
    return this.http.post<Survey>(`${this.baseUrl}Survey`, payload)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
}