// Create or update src/app/core/services/answer.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface FileAttachment {
  fileExtension: string;
  file: string; // Base64 encoded file
  fileName: string;
}

export interface AnswerSubmission {
  questionId: number;
  answer: string;
  pass: boolean;
  failValue: number;
  fileAttachments: FileAttachment[];
}

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  
  private baseUrl = environment.api;

  constructor(private http: HttpClient) {}

  /**
   * Submit answers array to API
   */
  submitAnswers(jobId: number, surveyId: number, answers: AnswerSubmission[]): Observable<any> {
    const url = `${this.baseUrl}Answer/${jobId}/${surveyId}`;
    
    console.log('Payload:', answers);
    
    return this.http.post(url, answers).pipe(
      catchError(error => {
        console.error('Failed to submit answers:', error);
        throw error;
      })
    );
  }

    getAnswers(jobId: number): Observable<any> {
        const url = `${this.baseUrl}Answer/job/${jobId}/data`;
        
        console.log('Getting answers from:', url);
        
        return this.http.get(url).pipe(
            catchError(error => {
            console.error('Failed to get answers:', error);
            throw error;
            })
        );
    }
}