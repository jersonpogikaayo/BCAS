export interface EquipmentCheckPayload {
  equipmentId: number;
  newAssetNumber: string;
  newSerialNumber: string;
  newDepartmentId: number;
}

export interface ClinicalDescPayload {
  equipmentId: number;
  newGMDN: string;
  newECRI: string;
}

export interface ConditionScalePayload {
  equipmentId: number;
  newConditionScaleId: number;
}

export interface EquipmentUpdateRequest {
  equipmentPayload: EquipmentCheckPayload;
  clinicalPayload: ClinicalDescPayload;
  conditionPayload: ConditionScalePayload;
}

export interface EquipmentUpdateResponse {
  success: boolean;
  equipmentIntegrityResult?: any;
  clinicalDescResult?: any;
  conditionScaleResult?: any;
  error?: string;
}

export interface ConditionScale {
  value: number;
  name: string;
  id: number;
  isArchived: boolean;
}
