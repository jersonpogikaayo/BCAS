// jobs-http-requests.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { Department, Equipment, Manufacturer, Model, Site } from '../../models/equipment/equipment.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsHttpRequestsService {
  private readonly baseUrl = environment.api;

  constructor(private http: HttpClient) {}

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

    getUserSettings() {
        return this.http.get<any>(this.baseUrl + 'user/setting', this.getHttpOptions(true))
        .pipe(map(result => {
            return result;
        }, (error: any) => {
            return error
         }));
    }

    editUserSettings(payload: any) {
        return this.http.put<any>(this.baseUrl + 'user/setting', payload, this.getHttpOptions(true))
        .pipe(map(result => {
            return result;
        }, (error: any) => {
            return error
        }));
    }

  
}