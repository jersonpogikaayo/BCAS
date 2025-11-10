export interface CsvImportResult<T> {
  csvHeaders: string[];
  records: MappedEntity<T>[];
  propertyMappings: CustomerMappingField[];
}

export interface MappedEntity<T> {
  data: T;
  sourceRowNumber: number;
  csvMapping: { [propertyPath: string]: string };
  validationErrors: { property: string; errorMessage: string }[];
}

export interface CustomerMappingField {
  path: string;
  displayName: string;
  type: string;
  required: boolean;
  mappedColumn?: string;
  expanded?: boolean;
  children?: CustomerMappingField[];
  description?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}