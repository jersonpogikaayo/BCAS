export interface SectionData {
    index: number;
    title: string;
    name: string;
    description: string;
    htmlDescription: string | null;
    surveyId: number;
    questions: QuestionData[];
    availableAsTemplateSection: boolean;
    lastModifiedUser: string;
    lastModifiedDate: string;
    dateCreated: string;
    id: number;
    isArchived: boolean;
  }
  
  export interface QuestionData {
    description: string;
    htmlDescription: string | null;
    typeValue: any; // Adjust the type based on your actual data
    index: number;
    active: boolean;
    isOptional: boolean;
    requiresCompletionOnFail: boolean;
    failValue: number;
    questionValidationId: number | null;
    questionValidation: QuestionValidation;
    questionDisplayOptionId: number | null;
    questionDisplayOption: any; // Define the type for questionDisplayOption
    questionTypeId: number;
    questionType: QuestionType;
    options: OptionModel[];
    sectionId: number;
    answers: any[] | null;
    lastModifiedUser: string;
    lastModifiedDate: string;
    dateCreated: string;
    id: number;
    isArchived: boolean;
  }
  
  export interface QuestionType {
    type: string;
    description: string;
    active: boolean;
    lastModifiedUser: string;
    lastModifiedDate: string;
    dateCreated: string;
    id: number;
    isArchived: boolean;
  }
  
  export interface OptionModel {
    failValue: number;
    text: string;
    active: boolean;
    displayOrder: number;
    questions: any[]; // Define the type for questions
    lastModifiedUser: string;
    lastModifiedDate: string;
    dateCreated: string;
    id: number;
    isArchived: boolean;
  }
  

  export interface QuestionValidation {
    failErrorMessage: null | string;
    failRegex: null | string;
    id?: number;
    isArchived: boolean;
    lowerFail: number;
    maskErrorMessage: null | string;
    maskRegex: null | string;
    maxValue: number;
    minValue: number;
    step: number;
    upperFail: number;
  }