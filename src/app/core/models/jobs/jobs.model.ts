export type JobModalMode = 'start' | 'view' | 'continue';
export type JobStatus = 'in_progress' | 'to_fail' | 'to_pause' | 'is_completed';

export interface JobModalConfig {
  mode: JobModalMode;
  title: string;
  allowEdit: boolean;
  showSurvey: boolean;
  showJobDetails: boolean;
  showConfirmation: boolean;
  primaryButtonText: string;
  primaryButtonAction: string;
  canNavigateSteps: boolean;
}

export interface JobModalStep {
  stepNumber: number;
  stepName: string;
  isCompleted: boolean;
  isActive: boolean;
  canProceed: boolean;
  isVisible: boolean;
}

export interface JobDetail {
  id: number;
  dueDate: string;
  bookedDate: string | null;
  completionDate: string | null;
  nextDueDate: string | null;
  recurring: boolean;
  reference: string | null;
  lifeSpan: number;
  title: string;
  specialRequirements: string | null;
  statusId: number;
  status: {
    niceName: string;
    name: string;
    value: number;
    statusType: number;
    parentId: number | null;
    parent: any | null;
    nextStatuses: any | null;
    id: number;
    isArchived: boolean;
  };
  jobTypeId: number;
  jobType: JobType | null;
  contactId: number;
  contact: any | null;
  customerId: number;
  customer: any | null;
  equipmentId: number;
  equipment: {
    modelId: number;
    model: {
      equipmentTypeId: number;
      equipmentType: any | null;
      manufacturerId: number;
      manufacturer: {
        name: string;
        id: number;
        isArchived: boolean;
      };
      approved: boolean;
      approvedBy: any | null;
      approvedDate: any | null;
      createdBy: any | null;
      name: string;
      orderBy: number;
      notes: string;
      lastModifiedUser: any | null;
      lastModifiedDate: any | null;
      dateCreated: any | null;
      id: number;
      isArchived: boolean;
    };
    equipmentTypeId: number;
    equipmentType: any | null;
    manufacturerId: number;
    manufacturer: {
      name: string;
      id: number;
      isArchived: boolean;
    };
    siteId: number;
    site: {
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
      status: any | null;
      type: any | null;
      parentName: string | null;
      parentODSCode: string | null;
      partialPostCode: string | null;
      phone: string | null;
      postCode: string;
      sector: string | null;
      website: string | null;
      active: boolean | null;
      townId: number;
      town: any | null;
      city: string | null;
      countyId: number;
      county: any | null;
      townName: string;
      countyName: string;
      departments: any | null;
      customerId: number;
      customer: any | null;
      lastModifiedUser: string | null;
      lastModifiedDate: string;
      dateCreated: string;
      id: number;
      isArchived: boolean;
    };
    departmentId: number;
    department: any | null;
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
    requiredQualifications: any | null;
    changeHistory: any | null;
    locationHistory: any | null;
    id: number;
    isArchived: boolean;
  };
  surveyId: number;
  survey: {
    title: string;
    name: string;
    slug: string | null;
    description: string;
    active: boolean;
    preferredSurvey: boolean;
    failThreshold: number;
    sections: any | null;
    jobTypeId: number;
    jobType: JobType | null;
    equipmentId: number | null;
    equipment: any | null;
    equipmentTypeId: number;
    equipmentType: any | null;
    equipmentModelId: number | null;
    equipmentModel: any | null;
    fail: boolean;
    failReason: string | null;
    excelTemplateId: number;
    excelTemplate: any | null;
    answers: any | null;
    lastModifiedUser: string | null;
    lastModifiedDate: string;
    dateCreated: string;
    id: number;
    isArchived: boolean;
  };
  userId: number;
  user: {
    firstName: string;
    lastName: string;
    level: number;
    isArchived: boolean;
    joinDate: string;
    lastLogin: string;
    profileImage: string | null;
    managers: any | null;
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
  };
  notes: string | null;
  attachments: any | null;
  documents: any | null;
  requiredQualifications: any | null;
  testEquipment: any[];
  answers: any[];
  answersLocked: boolean;
  hasAnswersSubmitted: boolean;
  hasReceiveCustomerFeedback: boolean;
  lastModifiedUser: string;
  lastModifiedDate: string;
  dateCreated: string;
  isArchived: boolean;
}

export interface JobsApiResponse {
  success: boolean;
  data: JobDetail;
  message?: string;
  error?: string;
}

export interface JobProcessPayload {
  image?: string;
  fileExtension?: string;
  name?: string;
  detail?: string;
  jobStatusId?: number;
  submissionTime: string; // ISO date string
}

export interface JobProcessResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export interface JobHistorySignature {
  url: string;
  name: string | null;
  location: string;
  mimeType: string;
  fileHash: string;
  fileSize: number;
  notes: string | null;
  type: string;
  file: string;
  id: number;
  isArchived: boolean;
}

export interface JobStatusHistorySignature {
  signatureId: number;
  signature: JobHistorySignature;
  name: string;
  id: number;
  isArchived: boolean;
}

export interface JobHistoryItem {
  date: string;
  jobId: number;
  job: JobDetail;
  previousStatusType: number;
  newStatusType: number;
  previousStatus: string;
  newStatus: string;
  userId: number;
  user: any | null;
  detail: string;
  jobStatusHistorySignatureId: number | null;
  jobStatusHistorySignature: JobStatusHistorySignature | null;
  id: number;
  isArchived: boolean;
}

// Simplified version for display purposes
export interface JobHistoryDisplay {
  id: number;
  date: string;
  jobTitle: string;
  previousStatus: string;
  newStatus: string;
  statusChange: string;
  userFullName?: string;
  detail: string;
  hasSignature: boolean;
  signatureUrl?: string;
  completionDate?: string;
  dueDate?: string;
}

// Status type enum for better type safety
export enum JobStatusType {
  NEW = 0,
  PENDING = 1,
  ASSIGNED = 2,
  IN_PROGRESS = 7,
  PENDING_REVIEW = 10,
  COMPLETE = 11,
  FAILED = 12,
  CANCELLED = 13
}

// For status change tracking
export interface StatusChangeInfo {
  from: {
    id: number;
    name: string;
    type: JobStatusType;
  };
  to: {
    id: number;
    name: string;
    type: JobStatusType;
  };
  changedBy?: string;
  changedAt: string;
  reason?: string;
}


export interface AddJobNotePayload {
  Note: string;
  Date: string;
}

export interface AddAttachmentsPayload {
  name: string;
  type: string;
  file: string; // Base64 encoded file content
}


export interface JobType {
  value: number;
  name: string;
  notes: string | null;
  id: number;
  isArchived: boolean;
  isSelected: boolean;
}