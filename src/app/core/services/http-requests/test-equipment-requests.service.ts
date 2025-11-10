// Update: src/app/core/services/test-equipment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserTestEquipmentResponse, TestEquipmentDisplay } from '../../models/test-equipments/test-equipments.model';


@Injectable({
  providedIn: 'root'
})
export class TestEquipmentService {
  private baseUrl = environment.api;

  constructor(private http: HttpClient) {}

  /**
   * Get user's test equipment (raw API response)
   */
  getMyTestEquipmentRaw(): Observable<UserTestEquipmentResponse[]> {
    return this.http.get<UserTestEquipmentResponse[]>(`${this.baseUrl}user/testequipment/myequipment`);
  }

  /**
   * Get user's test equipment (simplified for UI)
   */
  getMyTestEquipment(): Observable<TestEquipmentDisplay[]> {
    return this.getMyTestEquipmentRaw().pipe(
      map(response => this.mapToDisplayModels(response))
    );
  }

  /**
   * Map API response to simplified display models
   */
  private mapToDisplayModels(apiResponse: UserTestEquipmentResponse[]): TestEquipmentDisplay[] {
    return apiResponse.map(item => ({
      id: item.testEquipment.id,
      typeName: item.testEquipment.equipmentType.name,
      manufacturerName: item.testEquipment.manufacturer.name,
      modelName: item.testEquipment.model.name,
      assetNumber: item.testEquipment.assetNumber,
      serialNumber: item.testEquipment.serialNumber,
      isSelected: false,
      isRetired: item.testEquipment.isRetired,
      lastServiceDate: item.testEquipment.lastServiceDate ? new Date(item.testEquipment.lastServiceDate) : undefined,
      ppmDueDate: item.testEquipment.ppmDueDate ? new Date(item.testEquipment.ppmDueDate) : undefined,
      lastServiceExpiryDate: item.testEquipment.lastServiceExpiryDate ? new Date(item.testEquipment.lastServiceExpiryDate) : undefined,
    }));
  }

  /**
   * Get equipment by ID
   */
  getEquipmentById(id: number): Observable<UserTestEquipmentResponse | undefined> {
    return this.getMyTestEquipmentRaw().pipe(
      map(equipment => equipment.find(item => item.testEquipment.id === id))
    );
  }

  /**
   * Get equipment by type
   */
  getEquipmentByType(typeName: string): Observable<TestEquipmentDisplay[]> {
    return this.getMyTestEquipment().pipe(
      map(equipment => equipment.filter(item => 
        item.typeName.toLowerCase().includes(typeName.toLowerCase())
      ))
    );
  }

  submitTestEquipment(jobId: number, testEquipmentIds: number[]): Observable<any> {
    const url = `${this.baseUrl}job/user/testequipment/batch/${jobId}`;
    
    console.log('🔗 Submitting test equipment:', {
        jobId,
        testEquipmentIds,
        url
    });
    
    return this.http.post<any>(url, testEquipmentIds).pipe(
        tap(response => {
        console.log('✅ Test equipment submission response:', response);
        }),
        catchError(error => {
        console.error('❌ Error submitting test equipment:', error);
        return throwError(error);
        })
    );
    }
}