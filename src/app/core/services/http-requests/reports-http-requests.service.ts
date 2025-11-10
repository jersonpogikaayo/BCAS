// Update: src/app/core/services/test-equipment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserTestEquipmentResponse, TestEquipmentDisplay } from '../../models/test-equipments/test-equipments.model';
import { Customer } from '../../models/customer/customer.model';


@Injectable({
  providedIn: 'root'
})
export class ReportsHttpRequestsService {
  private baseUrl = environment.api;

  constructor(private http: HttpClient) {}

  handleError(error: any): Observable<never> {
      console.error('An error occurred:', error);
      return throwError(() => new Error('Something went wrong; please try again later.'));
  }
  
  getCustomer(): Observable<Customer[]> {
      return this.http.get<Customer[]>(`${this.baseUrl}Customer`).pipe(
      catchError(this.handleError)
      );
  }

  getOperationalReport(customerId: number, startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}report/customer/operational/${customerId}/${startDate}/${endDate}`).pipe(
      catchError(this.handleError)
    );
  }

  getNotPresentedReport(customerId: number, startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}report/customer/notpresented/${customerId}/${startDate}/${endDate}`).pipe(
      catchError(this.handleError)
    );
  }

}