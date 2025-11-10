
import { Injectable } from '@angular/core';

  
  @Injectable({
    providedIn: 'root'
  })
  export class EquipmentChecksService {
    /**
   * Create equipment update payloads from form value
   */
  createEquipmentPayloads(formValue: any) {
    const equipmentId = formValue.equipmentId;

    return {
      equipment: {
        equipmentId,
        newAssetNumber: formValue.newAssetNumber,
        newSerialNumber: formValue.newSerialNumber,
        newDepartmentId: formValue.newDepartmentId
      },
      clinical: {
        equipmentId,
        newGMDN: formValue.newgmdn,
        newECRI: formValue.newecri
      },
      condition: {
        equipmentId,
        newConditionScaleId: formValue.conditionScaleId
      }
    };
  }
}