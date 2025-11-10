// equipment-checks.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ClinicalDescPayload, ConditionScale, ConditionScalePayload, EquipmentCheckPayload, EquipmentUpdateRequest, EquipmentUpdateResponse } from '../../models/equipment-checks/equipment-checks.model';


@Injectable({
  providedIn: 'root'
})
export class EquipmentChecksHttpService {
  private readonly baseUrl = environment.api;

  constructor(private http: HttpClient) {}


  /**
   * Get Conditional Scale departments
   */
  getConditionScale(): Observable<ConditionScale[]> {
    return this.http.get<any[]>(`${this.baseUrl}ConditionScale`)
      .pipe(
        catchError(error => {
          console.error('Failed to load departments:', error);
          return of([]);
        })
      );
  }

  /**
   * Update equipment integrity
   */
  updateEquipmentIntegrity(payload: EquipmentCheckPayload): Observable<any> {
    return this.http.put(`${this.baseUrl}equipment/integrity`, payload)
      .pipe(
        catchError(error => {
          console.error('Equipment integrity update failed:', error);
          throw error;
        })
      );
  }

  /**
   * Update clinical description
   */
  updateClinicalDescription(payload: ClinicalDescPayload): Observable<any> {
    return this.http.put(`${this.baseUrl}equipment/integrity/clinical/description`, payload)
      .pipe(
        catchError(error => {
          console.error('Clinical description update failed:', error);
          throw error;
        })
      );
  }

  /**
   * Update condition scale
   */
  updateConditionScale(payload: ConditionScalePayload): Observable<any> {
    return this.http.put(`${this.baseUrl}equipment/conditionscale`, payload)
      .pipe(
        catchError(error => {
          console.error('Condition scale update failed:', error);
          throw error;
        })
      );
  }

  /**
   * Update all equipment data in sequence (original chained approach)
   */
  updateEquipmentSequential(request: EquipmentUpdateRequest): Observable<EquipmentUpdateResponse> {
    return this.updateEquipmentIntegrity(request.equipmentPayload)
      .pipe(
        switchMap(equipmentResult => 
          this.updateClinicalDescription(request.clinicalPayload)
            .pipe(
              switchMap(clinicalResult => 
                this.updateConditionScale(request.conditionPayload)
                  .pipe(
                    switchMap(conditionResult => of({
                      success: true,
                      equipmentIntegrityResult: equipmentResult,
                      clinicalDescResult: clinicalResult,
                      conditionScaleResult: conditionResult
                    }))
                  )
              )
            )
        ),
        catchError(error => of({
          success: false,
          error: error.message || 'Equipment update failed'
        }))
      );
  }

}