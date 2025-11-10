
export interface Equipment {
  modelId: number;
  model: Model;
  equipmentTypeId: number;
  equipmentType: EquipmentType;
  manufacturerId: number;
  manufacturer: Manufacturer;
  siteId: number;
  site: Site;
  departmentId: number;
  department: Department;
  assetNumber: string;
  serialNumber: string;
  conditionId: number | null;
  condition: any | null;
  conditionScaleHistory: any | null;
  serviceFrequencyId: number | null;
  serviceFrequency: any | null;
  manufactureDate: string | null;
  ppmDueDate: string | null;
  levelOfCover: string | null;
  lastServiceDate: string | null;
  lifeSpan: number | null;
  lastServiceExpiryDate: string | null;
  acceptanceCheckedDate: string | null;
  retiredByUsername: string | null;
  retiredDate: string | null;
  isRetired: boolean;
  gmdn: string | null;
  ecri: string | null;
  clinicalDescriptionHistory: any | null;
  requiredQualifications: string | null;
  changeHistory: ChangeHistory[];
  locationHistory: LocationHistory[];
  id: number;
  isArchived: boolean;
  [key: string]: any;

}

export interface Model {
  equipmentTypeId: number;
  equipmentType: EquipmentType;
  manufacturerId: number;
  manufacturer: Manufacturer;
  approved: boolean;
  approvedBy: string | null;
  approvedDate: string | null;
  createdBy: string | null;
  name: string;
  orderBy: number;
  notes: string;
  lastModifiedUser: string | null;
  lastModifiedDate: string | null;
  dateCreated: string | null;
  id: number;
  isArchived: boolean;
}

export interface EquipmentType {
  name: string;
  id: number;
  isArchived: boolean;
}

export interface Manufacturer {
  name: string;
  id: number;
  isArchived: boolean;
}

export interface Site {
  name: string;
  address1: string;
  address2: string | null;
  address3: string | null;
  email: string | null;
  fax: string | null;
  latitude: number;
  longitude: number;
  organisationCode: string | null;
  organisationId: number;
  status: string | null;
  type: string | null;
  parentName: string | null;
  parentODSCode: string | null;
  partialPostCode: string | null;
  phone: string | null;
  postCode: string;
  sector: string | null;
  website: string | null;
  active: boolean | null;
  townId: number;
  town: string | null;
  city: string | null;
  countyId: number;
  county: string | null;
  townName: string;
  countyName: string;
  departments: Department[];
  customerId: number;
  customer: any | null;
  lastModifiedUser: string | null;
  lastModifiedDate: string | null;
  dateCreated: string | null;
  id: number;
  isArchived: boolean;
}

export interface Department {
  name: string;
  contacts: any | null;
  equipment: Equipment[];
  siteId: number;
  site?: Site; // Optional to avoid circular reference
  notes: string | null;
  customerId: number | null;
  customer: any | null;
  lastModifiedUser: string | null;
  lastModifiedDate: string | null;
  dateCreated: string | null;
  id: number;
  isArchived: boolean;
}

export interface ChangeHistory {
  equipmentId: number;
  oldAssetNumber: string;
  newAssetNumber: string;
  oldSerialNumber: string;
  newSerialNumber: string;
  lastModifiedUser: string;
  lastModifiedDate: string | null;
  dateCreated: string;
  id: number;
  isArchived: boolean;
}

export interface LocationHistory {
  // Define properties based on your requirements
  id: number;
  equipmentId: number;
  locationName?: string;
  dateChanged?: string;
  changedBy?: string;
  isArchived: boolean;
}