import { SectionData } from "./survey-section-questions.model";

export interface Survey {
  title: string;
  name: string;
  slug?: string | null;
  description: string;
  active: boolean;
  preferredSurvey?: boolean;
  failThreshold: number;
  sections: SurveySection[];
  jobTypeId: number;
  jobType?: {
    value: number;
    name: string;
    notes: string | null;
    id: number;
    isArchived: boolean;
  } | null;
  equipmentId?: number | null;
  equipment?: any | null;
  equipmentTypeId?: number | null;
  equipmentType?: any | null;
  equipmentModelId?: number | null;
  equipmentModel?: any | null;
  fail?: boolean;
  failReason?: string | null;
  excelTemplateId?: number | null;
  excelTemplate?: any | null;
  answers?: any | null;
  lastModifiedUser?: string | null;
  lastModifiedDate?: string | null;
  dateCreated?: string | null;
  id?: number | null;
  isArchived?: boolean | null;
}

export interface SurveySection {
  index: number;
  title: string;
  name: string;
  description: string;
  htmlDescription: string | null;
  surveyId: number;
  questions: SurveyQuestion[];
  availableAsTemplateSection: boolean;
  lastModifiedUser: string;
  lastModifiedDate: string;
  dateCreated: string;
  id: number;
  isArchived: boolean;
}

export interface SurveyQuestion {
  description: string;
  htmlDescription: string | null;
  typeValue: any | null;
  index: number;
  active: boolean;
  isOptional: boolean;
  requiresCompletionOnFail: boolean;
  failValue: number;
  questionValidationId: number | null;
  questionValidation: QuestionValidation | null;
  questionDisplayOptionId: number | null;
  questionDisplayOption: QuestionDisplayOption | null;
  questionTypeId: number;
  questionType: QuestionType;
  options: QuestionOption[];
  sectionId: number;
  answers: any | null;
  lastModifiedUser: string;
  lastModifiedDate: string;
  dateCreated: string;
  id: number;
  isArchived: boolean;
}

export interface QuestionType {
  type: 'Radio' | 'Text' | 'Decimal' | 'Signature' | 'Checkbox' | 'Date' | 'Time' | 'DateTime';
  description: string;
  active: boolean;
  lastModifiedUser: string;
  lastModifiedDate: string;
  dateCreated: string;
  id: number;
  isArchived: boolean;
}

export interface QuestionOption {
  failValue: number;
  text: string;
  active: boolean;
  displayOrder: number;
  questions: any[];
  lastModifiedUser: string;
  lastModifiedDate: string;
  dateCreated: string;
  id: number;
  isArchived: boolean;
}

export interface QuestionValidation {
  failRegex: string | null;
  lowerFail: number;
  upperFail: number;
  maxValue: number;
  minValue: number;
  step: number;
  maskRegex: string | null;
  maskErrorMessage: string | null;
  emptyErrorMessage: string | null;
  failErrorMessage: string | null;
  absoluteLowerFail: any | null;
  absoluteUpperFail: any | null;
  relativeLowerFailDays: any | null;
  relativeUpperFailDays: any | null;
  restrictDateSelection: boolean;
  validateOnDateOnly: boolean;
  id: number;
  isArchived: boolean;
}

export interface QuestionDisplayOption {
  fullWidth: boolean;
  id: number;
  isArchived: boolean;
}

// Survey answer interfaces
export interface SurveyAnswer {
  questionId: number;
  answer: any;
  isValid: boolean;
  failValue?: number;
}

export interface SurveySubmission {
  surveyId: number;
  jobId: number;
  answers: SurveyAnswer[];
  submissionTime: string;
  totalFailValue: number;
  isComplete: boolean;
}

export interface SurveySelectionEquipment {
  equipmentId: number;
  equipmentName: string;
  equipmentTypeName: string;
  serialNumber: string;
  assetNumber: string;
  surveys: Survey[];
}