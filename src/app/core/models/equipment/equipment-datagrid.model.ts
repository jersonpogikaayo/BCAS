export interface EquipmentDatagrid {
  id: number;
  modelId: number;
  modelName: string;
  equipmentTypeId: number;
  equipmentTypeName: string;
  manufacturerId: number;
  manufacturerName: string;
  assetNumber: string;
  serialNumber: string;
  isRetired: boolean;
  departmentId: number;
  departmentName: string;
  siteId: number;
  site: string;
  address1: string;
  address2: string | null;
  address3: string | null;
  postCode: string;
  customerId: number;
  customerName: string | null;
  conditionScale: string | null;
  conditionScaleValue: string | null;
  serviceFrequencyDays: number | null;
  serviceFrequencyName: string | null;
  manufactureDate: string | null;
  ppmDueDate: string | null;
  levelOfCover: string | null;
  lastServiceDate: string | null;
  lastServiceExpiryDate: string | null;
  acceptanceCheckedDate: string | null;
  retiredBy: string | null;
  retiredDate: string | null;
  gmdn: string | null;
  ecri: string | null;
[key: string]: any;

}

export interface EquipmentDatagridResponse {
  items: EquipmentDatagrid[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface EquipmentDatagridParams {
  PageNumber?: number;
  PageSize?: number;
  searchTerm?: string;
  departmentId?: number;
  siteId?: number;
  equipmentTypeId?: number;
  manufacturerId?: number;
  isRetired?: boolean;
  // Add specific column filters
  assetNumber?: string;
  serialNumber?: string;
  modelName?: string;
  equipmentTypeName?: string;
  manufacturerName?: string;
  departmentName?: string;
  site?: string;
  postCode?: string;
  gmdn?: string;
  ecri?: string;
}
