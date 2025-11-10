import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Survey, SurveyQuestion } from 'src/app/core/models/survey/survey.model';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SurveyProcessService {
  
  readonly MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB for other files
  constructor(
    private sanitizer: DomSanitizer
  ) {}


  initializeSurveyForm(survey: Survey, formBuilder: FormBuilder, isReadOnly: boolean = false): FormGroup {
    const formControls: { [key: string]: FormControl } = {};

    survey.sections.forEach(section => {
      section.questions.forEach(question => {
        const validators = [];
        
        if (!question.isOptional && !isReadOnly) {
          validators.push(Validators.required);
        }

        formControls[`question_${question.id}`] = new FormControl(
          { value: '', disabled: isReadOnly }, 
          validators
        );
      });
    });

    return formBuilder.group(formControls);
  }

  validateTextInputRegex(question: SurveyQuestion, answer: string): {
    isValid: boolean,
    errorType: 'mask' | 'fail' | null,
    errorMessage: string | null
  } {
   
    const validation = question.questionValidation;
    console.log(question);
    console.log(answer);
    console.log(validation);
    if (!validation) {
      return { isValid: true, errorType: null, errorMessage: null };
    }

    if (validation.maskRegex) {
      const maskRegex = new RegExp(validation.maskRegex);
      if (!maskRegex.test(answer)) {
        return {
          isValid: false,
          errorType: 'mask',
          errorMessage: validation.maskErrorMessage || 'Invalid format'
        };
      }
    }

    if (validation.failRegex) {
      const failRegex = new RegExp(validation.failRegex);
      if (!failRegex.test(answer)) {
        return {
          isValid: false,
          errorType: 'fail',
          errorMessage: validation.failErrorMessage || 'Input matches fail criteria'
        };
      }
    }

    return { isValid: true, errorType: null, errorMessage: null };
  }

  exceedsThreshold(answerValue: any, failValue: any): boolean {
    return answerValue > failValue;
  }

  checkFailThreshold(question: SurveyQuestion, answer: any): boolean {
    if (question.failValue !== null && question.failValue !== undefined) {
      const failValue = question.failValue;
      const answerValue = answer.failValue
      
      console.log('Checking fail threshold:', {
        questionId: question.id,
        failValue: failValue,
        answerValue: answerValue
      });
      return this.exceedsThreshold(answerValue, failValue);
    }
    return false;
  }

  findQuestionById(survey: Survey, questionId: number): SurveyQuestion | undefined {
    for (const section of survey.sections) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) return question;
    }
    return undefined;
  }

  showFailWarning(): Promise<any> {
    return Swal.fire({
      title: 'Warning',
      html: 
        'This would fail the survey' +
        '<br><br>If you wish to proceed please click continue.',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Re-enter',
      confirmButtonText: 'Continue and Fail',
      confirmButtonColor: 'rgb(60,76,128)',
      allowOutsideClick: false,
      allowEscapeKey: false
    });
  }

  showRegexValidationError(validation: any): Promise<any> {
    if (validation.errorType === 'mask') {
      return Swal.fire({
        title: 'Invalid Format',
        html: validation.errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'rgb(60,76,128)',
      });
    } else if (validation.errorType === 'fail') {
      return Swal.fire({
        title: 'Warning',
        html: 
          validation.errorMessage +
          '<br><br>If you wish to proceed please click continue.',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Re-enter',
        confirmButtonText: 'Continue and Fail',
        confirmButtonColor: 'rgb(60,76,128)',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
    }
    return Promise.resolve({ isConfirmed: false });
  }

  getValidationErrorMessage(question: SurveyQuestion, surveyForm: FormGroup): string {
    if (question.questionTypeId === 2) {
      const control = surveyForm?.get(`question_${question.id}`) as FormControl;
      if (control && control.value && control.touched) {
        const regexValidation = this.validateTextInputRegex(question, control.value);
        if (!regexValidation.isValid && regexValidation.errorMessage) {
          return regexValidation.errorMessage;
        }
      }
    }
    return 'This field is required.';
  }

  isTextInputInvalid(question: SurveyQuestion, surveyForm: FormGroup): {
    isInvalid: boolean,
    errorMessage: string | null
  } {
    if (question.questionTypeId !== 2) {
      return { isInvalid: false, errorMessage: null };
    }

    const control = surveyForm?.get(`question_${question.id}`) as FormControl;
    if (!control || !control.value || !control.touched) {
      return { isInvalid: false, errorMessage: null };
    }

    const regexValidation = this.validateTextInputRegex(question, control.value);
    return {
      isInvalid: !regexValidation.isValid,
      errorMessage: regexValidation.errorMessage
    };
  }


  validateDateInput(question: SurveyQuestion, dateValue: string): {
    isValid: boolean,
    errorMessage: string | null
  } {
    if (!question.questionValidation || !dateValue) {
      return { isValid: true, errorMessage: null };
    }

    const validation = question.questionValidation;
    const isValid = this.validateDateWithFilter(dateValue, validation);
    
    return {
      isValid: isValid,
      errorMessage: isValid ? null : (validation.failErrorMessage || 'Date is outside allowed range')
    };
  }

  private validateDateWithFilter(dateToValidate: string, validation: any): boolean {
    const inputDate = new Date(dateToValidate);
    if (isNaN(inputDate.getTime())) {
      console.log('Invalid dateToValidate format');
      return false;
    }

    const today = new Date();
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const removeTime = (dateString: string): string => dateString.split('T')[0];
    
    const caseNumber = this.determineDateValidationCase(validation);

    const userDate = validation.validateOnDateOnly ? 
      removeTime(formatDate(inputDate)) : 
      formatDate(inputDate);

    const todayFormatted = validation.validateOnDateOnly ? 
      removeTime(formatDate(today)) : 
      formatDate(today);

    switch (caseNumber) {
      case 1: 
        return this.validateAbsoluteRange(userDate, validation, validation.validateOnDateOnly);
      
      case 2:
        return this.validateRelativeRange(userDate, today, validation, validation.validateOnDateOnly);
      
      case 3:
        return this.validateRelativePastRange(userDate, todayFormatted, today, validation, validation.validateOnDateOnly);
      
      case 4: 
        return this.validateMixedAbsoluteRelative(userDate, today, validation, validation.validateOnDateOnly);
      
      case 5: 
        return this.validateAbsoluteLowerRelativeUpper(userDate, today, validation, validation.validateOnDateOnly);
      
      default:
        return false;
    }
  }

  private determineDateValidationCase(validation: any): number {
    const hasAbsoluteLower = !!validation.absoluteLowerFail;
    const hasAbsoluteUpper = !!validation.absoluteUpperFail;
    const hasRelativeLower = !!validation.relativeLowerFailDays;
    const hasRelativeUpper = !!validation.relativeUpperFailDays;

    if (hasAbsoluteLower && hasAbsoluteUpper && !hasRelativeLower && !hasRelativeUpper) {
      return 1; 
    }
    if (!hasAbsoluteLower && !hasAbsoluteUpper && hasRelativeLower && hasRelativeUpper) {
      return 2; 
    }
    if (!hasAbsoluteLower && !hasAbsoluteUpper && hasRelativeLower && !hasRelativeUpper) {
      return 3;
    }
    if (hasAbsoluteLower && hasAbsoluteUpper && !hasRelativeLower && hasRelativeUpper) {
      return 4;
    }
    if (hasAbsoluteLower && !hasAbsoluteUpper && !hasRelativeLower && hasRelativeUpper) {
      return 5;
    }
    return 0;
  }

  private validateAbsoluteRange(userDate: string, validation: any, dateOnly: boolean): boolean {
    const formatDateBound = (date: string) => dateOnly ? date.split('T')[0] : new Date(date).toISOString().split('T')[0];
    
    const lowerBound = formatDateBound(validation.absoluteLowerFail);
    const upperBound = formatDateBound(validation.absoluteUpperFail);
    
    return userDate >= lowerBound && userDate <= upperBound;
  }

  private validateRelativeRange(userDate: string, today: Date, validation: any, dateOnly: boolean): boolean {
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const removeTime = (dateString: string): string => dateString.split('T')[0];

    const lowerDate = new Date(today);
    lowerDate.setDate(today.getDate() + validation.relativeLowerFailDays);
    const lowerBound = dateOnly ? removeTime(formatDate(lowerDate)) : formatDate(lowerDate);

    const upperDate = new Date(today);
    upperDate.setDate(today.getDate() + validation.relativeUpperFailDays);
    const upperBound = dateOnly ? removeTime(formatDate(upperDate)) : formatDate(upperDate);

    return userDate >= lowerBound && userDate <= upperBound;
  }


  private validateRelativePastRange(userDate: string, todayFormatted: string, today: Date, validation: any, dateOnly: boolean): boolean {
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const removeTime = (dateString: string): string => dateString.split('T')[0];

    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() + validation.relativeLowerFailDays);
    const lowerBound = dateOnly ? removeTime(formatDate(pastDate)) : formatDate(pastDate);

    return userDate >= lowerBound && userDate <= todayFormatted;
  }

  private validateMixedAbsoluteRelative(userDate: string, today: Date, validation: any, dateOnly: boolean): boolean {
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const removeTime = (dateString: string): string => dateString.split('T')[0];

    const absoluteLower = dateOnly ? 
      removeTime(validation.absoluteLowerFail) : 
      validation.absoluteLowerFail.split('T')[0];

    const relativeDate = new Date(today);
    relativeDate.setDate(today.getDate() + validation.relativeUpperFailDays);
    const relativeUpper = dateOnly ? removeTime(formatDate(relativeDate)) : formatDate(relativeDate);

    return userDate >= absoluteLower && userDate <= relativeUpper;
  }

  private validateAbsoluteLowerRelativeUpper(userDate: string, today: Date, validation: any, dateOnly: boolean): boolean {
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const removeTime = (dateString: string): string => dateString.split('T')[0];

    const absoluteLower = dateOnly ? 
      removeTime(validation.absoluteLowerFail) : 
      validation.absoluteLowerFail.split('T')[0];

    const relativeDate = new Date(today);
    relativeDate.setDate(today.getDate() + validation.relativeUpperFailDays);
    const relativeUpper = dateOnly ? removeTime(formatDate(relativeDate)) : formatDate(relativeDate);

    return userDate >= absoluteLower && userDate <= relativeUpper;
  }

  validateDecimalInput(question: SurveyQuestion, value: number): {
    isValid: boolean,
    errorMessage: string | null,
    errorType: 'range' | 'step' | 'fail' | null
  } {
    if (!question.questionValidation || value === null || value === undefined) {
      return { isValid: true, errorMessage: null, errorType: null };
    }

    const validation = question.questionValidation;
    
    if (validation.minValue !== null && validation.minValue !== undefined && value < validation.minValue) {
      return {
        isValid: false,
        errorMessage: `Value must be at least ${validation.minValue}`,
        errorType: 'range'
      };
    }

    if (validation.maxValue !== null && validation.maxValue !== undefined && value > validation.maxValue) {
      return {
        isValid: false,
        errorMessage: `Value must not exceed ${validation.maxValue}`,
        errorType: 'range'
      };
    }

    if (validation.lowerFail !== null && validation.lowerFail !== undefined && value < validation.lowerFail) {
      return {
        isValid: false,
        errorMessage: validation.failErrorMessage || `Value below ${validation.lowerFail} will fail the survey`,
        errorType: 'fail'
      };
    }

    if (validation.upperFail !== null && validation.upperFail !== undefined && value > validation.upperFail) {
      return {
        isValid: false,
        errorMessage: validation.failErrorMessage || `Value above ${validation.upperFail} will fail the survey`,
        errorType: 'fail'
      };
    }

    return { isValid: true, errorMessage: null, errorType: null };
  }

  showDecimalValidationError(validation: any): Promise<any> {
    if (validation.errorType === 'range' || validation.errorType === 'step') {
      return Swal.fire({
        title: 'Invalid Value',
        html: validation.errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'rgb(60,76,128)',
      });
    } else if (validation.errorType === 'fail') {
      return Swal.fire({
        title: 'Warning',
        html: 
          validation.errorMessage +
          '<br><br>If you wish to proceed please click continue.',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Re-enter',
        confirmButtonText: 'Continue and Fail',
        confirmButtonColor: 'rgb(60,76,128)',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
    }
    return Promise.resolve({ isConfirmed: false });
  }

  isDecimalInputInvalid(question: SurveyQuestion, surveyForm: FormGroup): {
      isInvalid: boolean,
      errorMessage: string | null
    } {
      if (question.questionTypeId !== 3) {
        return { isInvalid: false, errorMessage: null };
      }

      const control = surveyForm?.get(`question_${question.id}`) as FormControl;
      if (!control || !control.value || !control.touched) {
        return { isInvalid: false, errorMessage: null };
      }

      const decimalValidation = this.validateDecimalInput(question, parseFloat(control.value));
      return {
        isInvalid: !decimalValidation.isValid && decimalValidation.errorType !== 'fail',
        errorMessage: decimalValidation.errorMessage
      };
    }

    validateRadioInput(question: SurveyQuestion, selectedValue: any, survey: Survey): {
      isValid: boolean,
      errorMessage: string | null,
      failedOption: any | null
    } {
      if (!selectedValue) {
        return { isValid: true, errorMessage: null, failedOption: null };
      }

      const selectedOption = question.options?.find(opt => opt.id == selectedValue);
      
      if (selectedOption && selectedOption.failValue !== null && selectedOption.failValue !== undefined) {
        if (survey.failThreshold !== null && survey.failThreshold !== undefined) {
          if (selectedOption.failValue > survey.failThreshold) {
            return {
              isValid: false,
              errorMessage: `Selected option "${selectedOption.text}" would fail the survey (${selectedOption.failValue} > ${survey.failThreshold})`,
              failedOption: selectedOption
            };
          }
        }
      }

      return { isValid: true, errorMessage: null, failedOption: null };
    }

    validateRangeInput(question: SurveyQuestion, value: number): {
    isValid: boolean,
    errorMessage: string | null,
    errorType: 'range' | 'step' | 'fail' | null
  } {
    if (!question.questionValidation || value === null || value === undefined) {
      return { isValid: true, errorMessage: null, errorType: null };
    }

    const validation = question.questionValidation;
    
    if (validation.minValue !== null && validation.minValue !== undefined && value < validation.minValue) {
      return {
        isValid: false,
        errorMessage: `Value must be at least ${validation.minValue}`,
        errorType: 'range'
      };
    }

    if (validation.maxValue !== null && validation.maxValue !== undefined && value > validation.maxValue) {
      return {
        isValid: false,
        errorMessage: `Value must not exceed ${validation.maxValue}`,
        errorType: 'range'
      };
    }

    if (validation.step && validation.step > 0) {
      const remainder = (value - (validation.minValue || 0)) % validation.step;
      if (Math.abs(remainder) > 0.0001) { 
        return {
          isValid: false,
          errorMessage: `Value must be in increments of ${validation.step}`,
          errorType: 'step'
        };
      }
    }

    if (validation.lowerFail !== null && validation.lowerFail !== undefined && value < validation.lowerFail) {
      return {
        isValid: false,
        errorMessage: validation.failErrorMessage || `Value below ${validation.lowerFail} will fail the survey`,
        errorType: 'fail'
      };
    }

    if (validation.upperFail !== null && validation.upperFail !== undefined && value > validation.upperFail) {
      return {
        isValid: false,
        errorMessage: validation.failErrorMessage || `Value above ${validation.upperFail} will fail the survey`,
        errorType: 'fail'
      };
    }

    return { isValid: true, errorMessage: null, errorType: null };
  }

  showRangeValidationError(validation: any): Promise<any> {
    if (validation.errorType === 'range' || validation.errorType === 'step') {
      // Format validation errors - force user to correct
      return Swal.fire({
        title: 'Invalid Value',
        html: validation.errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'rgb(60,76,128)',
      });
    } else if (validation.errorType === 'fail') {
      // Business rule failures - allow user to continue or re-enter
      return Swal.fire({
        title: 'Warning',
        html: 
          validation.errorMessage +
          '<br><br>If you wish to proceed please click continue.',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Re-enter',
        confirmButtonText: 'Continue and Fail',
        confirmButtonColor: 'rgb(60,76,128)',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
    }
    return Promise.resolve({ isConfirmed: false });
  }

  isRangeInputInvalid(question: SurveyQuestion, surveyForm: FormGroup): {
    isInvalid: boolean,
    errorMessage: string | null
  } {
    if (question.questionTypeId !== 6) {
      return { isInvalid: false, errorMessage: null };
    }

    const control = surveyForm?.get(`question_${question.id}`) as FormControl;
    if (!control || !control.value || !control.touched) {
      return { isInvalid: false, errorMessage: null };
    }

    const rangeValidation = this.validateRangeInput(question, parseFloat(control.value));
    return {
      isInvalid: !rangeValidation.isValid && rangeValidation.errorType !== 'fail',
      errorMessage: rangeValidation.errorMessage
    };
  }

  parseSignatureToFileAttachment(dataUrl: string, questionId: number): any {
    try {

      const matches = dataUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        console.error('Invalid signature data URL format:', dataUrl.substring(0, 50) + '...');
        return null;
      }

      const fileExtension = matches[1]; 
      const base64Data = matches[2];
      
      const fileAttachment = {
        fileExtension: fileExtension,
        file: base64Data, 
        fileName: `signature_${questionId}_${Date.now()}.${fileExtension}`
      };

      console.log('Parsed signature to fileAttachment:', {
        fileName: fileAttachment.fileName,
        fileExtension: fileAttachment.fileExtension,
        fileSize: base64Data.length
      });
      
      return fileAttachment;
      
    } catch (error) {
      console.error('Error parsing signature to fileAttachment:', error);
      return null;
    }
  }



  cleanBase64String(dataUrl: string): string {
    if (!dataUrl || typeof dataUrl !== 'string') {
      return '';
    }

    const base64Index = dataUrl.indexOf(',');
    if (base64Index !== -1) {
      return dataUrl.substring(base64Index + 1);
    }

    return dataUrl;
  }

  getFileExtensionFromDataUrl(dataUrl: string): string {
    if (typeof dataUrl !== 'string') {
      return 'jpg';
    }
    
    const match = dataUrl.match(/^data:image\/([a-zA-Z]+);base64,/);
    return match ? match[1] : 'jpg';
  }


  getFileExtensionFromName(fileName: string): string {
    if (typeof fileName !== 'string') {
      return 'jpg';
    }
    
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > -1 ? fileName.substring(lastDot + 1).toLowerCase() : 'jpg';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  validateFileSize(file: File, maxSize: number = this.MAX_IMAGE_SIZE): boolean {
    return file.size <= maxSize;
  }

  sanitizeImageUrl(url: string): SafeUrl {
    if (!url) {
      return '';
    }
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }


  isDataUrl(url: string): boolean {
    return !!(url && url.startsWith('data:'));
  }

  
  cleanBase64StringDocument(dataString: string): string {
    if (typeof dataString !== 'string') {
      return '';
    }

    const dataUrlMatch = dataString.match(/^data:[^;]+;base64,(.+)$/);
    if (dataUrlMatch && dataUrlMatch[1]) {
      return dataUrlMatch[1]; 
    }
    
    
    return dataString;
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    
    switch (extension) {
      case '.csv':
        return 'ri-file-excel-line text-success';
      case '.doc':
      case '.docx':
        return 'ri-file-word-line text-primary';
      case '.txt':
        return 'ri-file-text-line text-secondary';
      default:
        return 'ri-file-line text-muted';
    }
  }

  getFileType(fileName: string): string {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    
    switch (extension) {
      case '.csv':
        return 'CSV File';
      case '.doc':
        return 'Word Document';
      case '.docx':
        return 'Word Document';
      case '.txt':
        return 'Text File';
      default:
        return 'Document';
    }
  }

  formatUploadDate(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  downloadFile(file: any): void {
    try {
      const link = document.createElement('a');
      link.href = file.content;
      link.download = file.name;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('File download initiated:', file.name);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  }
  

}