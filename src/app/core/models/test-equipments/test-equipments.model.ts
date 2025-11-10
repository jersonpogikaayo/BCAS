// Create file: src/app/core/models/test-equipment.models.ts

export interface UserTestEquipmentResponse {
  userId: number;
  user: User;
  testEquipmentId: number;
  testEquipment: TestEquipment;
  id: number;
  isArchived: boolean;
}

export interface User {
  firstName: string;
  lastName: string;
  level: number;
  isArchived: boolean;
  joinDate: string;
  lastLogin: string;
  profileImage: string | null;
  managers: Manager[];
  id: number;
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  emailConfirmed: boolean;
  passwordHash: string;
  securityStamp: string;
  concurrencyStamp: string;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}

export interface Manager {
  firstName: string;
  lastName: string;
  level: number;
  isArchived: boolean;
  joinDate: string;
  lastLogin: string;
  profileImage: string | null;
  managers: Manager[];
  id: number;
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  emailConfirmed: boolean;
  passwordHash: string;
  securityStamp: string;
  concurrencyStamp: string;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}

export interface TestEquipment {
  modelId: number;
  model: Model;
  equipmentTypeId: number;
  equipmentType: EquipmentType;
  manufacturerId: number;
  manufacturer: Manufacturer;
  siteId: number | null;
  site: Site | null;
  assetNumber: string;
  serialNumber: string;
  conditionId: number | null;
  condition: Condition | null;
  serviceFrequencyId: number | null;
  serviceFrequency: ServiceFrequency | null;
  manufactureDate: string | null;
  ppmDueDate: string | null;
  levelOfCover: string | null;
  lastServiceDate: string | null;
  lifeSpan: number | null;
  lastServiceExpiryDate: string | null;
  acceptanceCheckedDate: string | null;
  retiredDate: string | null;
  isRetired: boolean;
  requiredQualifications: string | null;
  jobs: Job[] | null;
  id: number;
  isArchived: boolean;
  testEquipmentId?: number;
}


export interface Model {
  equipmentTypeId: number;
  equipmentType: EquipmentType;
  manufacturerId: number;
  manufacturer: Manufacturer;
  approved: boolean;
  approvedBy: string;
  approvedDate: string | null;
  createdBy: string | null;
  name: string;
  orderBy: number;
  notes: string | null;
  lastModifiedUser: string | null;
  lastModifiedDate: string | null;
  dateCreated: string;
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
  id: number;
  isArchived: boolean;
}

export interface Condition {
  name: string;
  id: number;
  isArchived: boolean;
}

export interface ServiceFrequency {
  name: string;
  id: number;
  isArchived: boolean;
}

export interface Job {
  id: number;
  name: string;
  description: string;
  // Add other job properties as needed
}

// Simplified model for UI display
export interface TestEquipmentDisplay {
  id: number;
  typeName: string;
  manufacturerName: string;
  modelName: string;
  assetNumber: string;
  serialNumber: string;
  isSelected?: boolean;
  isRetired?: boolean;
  lastServiceDate?: Date;
  ppmDueDate?: Date;
  lastServiceExpiryDate?: Date;
}