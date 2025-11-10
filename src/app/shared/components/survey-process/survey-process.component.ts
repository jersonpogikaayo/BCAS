import { Component, Input, OnInit, OnDestroy, ViewChild, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { WizardComponent } from 'angular-archwizard';
import { Survey, SurveySection, SurveyQuestion } from 'src/app/core/models/survey/survey.model';
import { JobDetail, JobStatus } from 'src/app/core/models/jobs/jobs.model';
import { SurveyProcessService } from 'src/app/core/services/common/survey-process.service';
import Swal from 'sweetalert2';
import { AnswerService, AnswerSubmission } from 'src/app/core/services/http-requests/answer-http-requests.service';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { NgbdImagePreviewModalComponent } from '../modals/ngbd-image-preview-modal/ngbd-image-preview-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CameraModalComponent } from '../modals/jobs/camera-modal/camera-modal.component';
import { NgbdSketchModalComponent } from '../modals/ngbd-sketch-modal/ngbd-sketch-modal.component';

@Component({
  selector: 'app-survey-process',
  templateUrl: './survey-process.component.html',
  styleUrls: ['./survey-process.component.scss']
})
export class SurveyProcessComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() survey!: Survey;
  @Input() job!: JobDetail;
  @Input() currentAnswers: any[] = [];
  @Input() jobStatus: JobStatus = 'in_progress';
  @ViewChild('surveyWizard') surveyWizard!: WizardComponent;
  
  @Output() stepChanged = new EventEmitter<{
    currentStep: number,
    totalSteps: number,
    isLastStep: boolean
  }>();

  @Output() surveyCompleted = new EventEmitter<any>();
  @Output() surveyFailed = new EventEmitter<any>();

  surveyForm!: FormGroup;
  currentStepIndex = 0;
  private failedAnswers: any[] = [];

  private destroy$ = new Subject<void>();

  selectedImages: { [questionId: number]: any[] } = {};
  selectedFiles: { [questionId: number]: any[] } = {};
  signatureData: { [questionId: number]: string } = {};
  signatureDefaultValues: { [questionId: number]: string } = {};

  private autoSaveSubject = new Subject<{question: SurveyQuestion, answer: any}>();
  lastSaveTime: Date | null = null;

  constructor(
    private formBuilder: FormBuilder,
    public surveyProcessService: SurveyProcessService,
    private answerService: AnswerService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    if (this.survey && this.survey.sections) {
      this.initializeSurveyForm();
      this.setupAutoSave();
    }
  }

  isReadOnly(): boolean {
    return this.jobStatus === 'is_completed';
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSurveyForm(): void {
  
    if (this.jobStatus === 'to_fail') {
      const filteredSections = this.survey.sections.filter((section: any) => section.questions.some((question: any) => question.requiresCompletionOnFail));
      if(filteredSections.length !== 0) {
        this.survey.sections = filteredSections;
      } else {
        this.surveyForm = this.surveyProcessService.initializeSurveyForm(this.survey, this.formBuilder);
        this.completeSurvey();
      }
    } else {
      console.log('Job status is not to_fail, using full survey');
    }

    this.surveyForm = this.surveyProcessService.initializeSurveyForm(this.survey, this.formBuilder);
    if (this.job?.id) {
      this.loadExistingAnswersIntoForm();
    }
  }
  

  // =================== NAVIGATION ===================
  proceedToNext(): void {
    if (this.isReadOnly()) {
      console.log('📖 Survey is read-only, skipping validation');
    } else {
      console.log('✅ Survey is editable, performing validation');
      if (!this.isCurrentStepValid()) {
        console.log('❌ Current step validation failed');
        this.markCurrentStepAsTouched();
        return;
      }
    }

    const isLastStep = this.currentStepIndex === (this.survey.sections.length - 1);
    
    if (isLastStep) {
      this.completeSurvey();
    } else {
      this.emitStepChange();
      this.surveyWizard.goToNextStep();
    }
  }

  goToPreviousStep(): void {
    if (this.surveyWizard && this.currentStepIndex > 0) {
      console.log('⬅️ Going to previous step from:', this.currentStepIndex);
      this.surveyWizard.goToPreviousStep();
      this.currentStepIndex--;
    }
  }

  private emitStepChange(): void {
    this.currentStepIndex++;
    this.stepChanged.emit({
      currentStep: this.currentStepIndex + 1,
      totalSteps: this.survey.sections.length,
      isLastStep: this.currentStepIndex === (this.survey.sections.length - 1)
    });
  }

  // =================== VALIDATION ===================
  private isCurrentStepValid(): boolean {
    const currentSection = this.survey.sections[this.currentStepIndex];
    if (!currentSection) return false;

    return currentSection.questions.every(question => {
      if (question.isOptional) return true;
      const control = this.getQuestionControl(question.id);
      return control && control.valid;
    });
  }

  private markCurrentStepAsTouched(): void {
    const currentSection = this.survey.sections[this.currentStepIndex];
    if (currentSection) {
      currentSection.questions.forEach(question => {
        if (!question.isOptional) {
          const control = this.getQuestionControl(question.id);
          if (control) {
            control.markAsTouched();
          }
        }
      });
    }
  }

  isQuestionInvalid(question: SurveyQuestion): boolean {
  if (question.isOptional) return false;
  
  const control = this.getQuestionControl(question.id);
  
  if (control && control.touched && control.invalid) {
    return true;
  }

  if (question.questionTypeId === 2 && control && control.touched && control.value) {
    const textValidation = this.surveyProcessService.isTextInputInvalid(question, this.surveyForm);
    return textValidation.isInvalid;
  }

  if (question.questionTypeId === 1 && control && control.touched && control.value) {
    const dateValidation = this.surveyProcessService.validateDateInput(question, control.value);
    return !dateValidation.isValid;
  }

  if (question.questionTypeId === 3 && control && control.touched && control.value) {
    const decimalValidation = this.surveyProcessService.isDecimalInputInvalid(question, this.surveyForm);
    return decimalValidation.isInvalid;
  }

  if (question.questionTypeId === 6 && control && control.touched && control.value) {
    const rangeValidation = this.surveyProcessService.isRangeInputInvalid(question, this.surveyForm);
    return rangeValidation.isInvalid;
  }

  if (question.questionTypeId === 8 && control && control.touched && control.value) {
    const fileValidation = this.validateFileUploads(question, this.selectedFiles[question.id] || []);
    return !fileValidation.isValid;
  }

  if (question.questionTypeId === 9) {
    const hasSignature = this.signatureData[question.id] && this.signatureData[question.id].trim() !== '';
    
    if (!question.isOptional && !hasSignature) {
      return true;
    }
    
    return false;
  }

  if (question.questionTypeId === 12 && control && control.touched && control.value) {
    const ratingValue = parseInt(control.value);
    if (!isNaN(ratingValue)) {
        const ratingValidation = this.validateRatingInput(question, ratingValue);
        return !ratingValidation.isValid;
    }
}


  return false;
}

  getValidationErrorMessage(question: SurveyQuestion): string {
    const control = this.getQuestionControl(question.id);
    
    if (question.questionTypeId === 2 && control && control.value && control.touched) {
      return this.surveyProcessService.getValidationErrorMessage(question, this.surveyForm);
    }
    
    if (question.questionTypeId === 1 && control && control.value && control.touched) {
      const dateValidation = this.surveyProcessService.validateDateInput(question, control.value);
      return dateValidation.errorMessage || 'Invalid date';
    }
    
    if (question.questionTypeId === 3 && control && control.value && control.touched) {
      const decimalValidation = this.surveyProcessService.isDecimalInputInvalid(question, this.surveyForm);
      return decimalValidation.errorMessage || 'Invalid number';
    }
    
    if (question.questionTypeId === 6 && control && control.value && control.touched) {
      const rangeValidation = this.surveyProcessService.isRangeInputInvalid(question, this.surveyForm);
      return rangeValidation.errorMessage || 'Invalid range value';
    }

    if (question.questionTypeId === 8 && control && control.touched) {
      const fileValidation = this.validateFileUploads(question, this.selectedFiles[question.id] || []);
      return fileValidation.errorMessage || 'Invalid files selected';
    }

    if (question.questionTypeId === 9) {
      const hasSignature = this.signatureData[question.id] && this.signatureData[question.id].trim() !== '';
      
      if (!question.isOptional && !hasSignature) {
        return 'Signature is required';
      }
      
      return '';
    }

    if (question.questionTypeId === 12 && control && control.value && control.touched) {
        const ratingValue = parseInt(control.value);
        if (!isNaN(ratingValue)) {
            const ratingValidation = this.validateRatingInput(question, ratingValue);
            return ratingValidation.errorMessage || 'Invalid rating';
        }
    }
    
    if (control?.errors) {
      if (control.errors['required']) {
        return 'This field is required';
      }
    }
    
    return 'This field is required.';
  }

  // =================== QUESTION HANDLING ===================
  onQuestionAnswered(question: SurveyQuestion, answer: any): void {
     if (this.isReadOnly()) {
      console.log('Survey is read-only, ignoring answer change');
      return;
    }

    const control = this.getQuestionControl(question.id);
    if (control) {
      control.setValue(answer);
      control.markAsDirty();
      control.markAsTouched();
    }
    
    if (question.questionTypeId === 2 && answer) {
      const regexValidation = this.surveyProcessService.validateTextInputRegex(question, answer);
      if (!regexValidation.isValid) {
        this.handleRegexValidationError(question, answer, regexValidation);
        return;
      }
    }

    if (question.questionTypeId === 1 && answer) {
      const dateValidation = this.surveyProcessService.validateDateInput(question, answer);
      if (!dateValidation.isValid) {
        this.handleDateValidationError(question, answer, dateValidation);
        return;
      }
    }

    if (question.questionTypeId === 3 && answer) {
      const decimalValue = parseFloat(answer);
      if (!isNaN(decimalValue)) {
        const decimalValidation = this.surveyProcessService.validateDecimalInput(question, decimalValue);
        if (!decimalValidation.isValid) {
          this.handleDecimalValidationError(question, answer, decimalValidation);
          return;
        }
      }
    }

    if ((question.questionTypeId === 4 || question.questionTypeId) && answer) {
      // Check if answer exceeds fail threshold using service
      if (this.surveyProcessService.checkFailThreshold(question, answer)) {
        console.log(this.surveyProcessService.checkFailThreshold(question, answer));
        this.handleFailThreshold(question, answer);
      }
    }

    if (question.questionTypeId === 6 && answer) {
      const rangeValue = parseFloat(answer);
      if (!isNaN(rangeValue)) {
        const rangeValidation = this.surveyProcessService.validateRangeInput(question, rangeValue);
        if (!rangeValidation.isValid) {
          this.handleRangeValidationError(question, answer, rangeValidation);
          return;
        }
      }
    }

    if (question.questionTypeId === 7 && answer) {
      const imageValidation = this.validateImageUploads(question, answer);
      if (!imageValidation.isValid) {
        this.handleImageValidationError(question, answer, imageValidation);
        return;
      }
    }

    if (question.questionTypeId === 8 && answer) {
      const fileValidation = this.validateFileUploads(question, answer);
      if (!fileValidation.isValid) {
        this.handleFileValidationError(question, answer, fileValidation);
        return;
      }
    }

    if (question.questionTypeId === 12 && answer !== null && answer !== undefined) {
        const ratingValue = parseInt(answer);
        if (!isNaN(ratingValue)) {
            const ratingValidation = this.validateRatingInput(question, ratingValue);
            if (!ratingValidation.isValid) {
                this.handleRatingValidationError(question, answer, ratingValidation);
                return;
            }
        }
    }

    this.saveAnswerToAPI(question, answer);
  }

  private handleRegexValidationError(question: SurveyQuestion, answer: string, validation: any): void {
    this.surveyProcessService.showRegexValidationError(validation).then((result) => {
      if (validation.errorType === 'mask' || !result.isConfirmed) {
        this.handleReenterAnswer(question);
      } else if (validation.errorType === 'fail' && result.isConfirmed) {
        this.handleContinueWithFail(question, answer);
      }
    });
  }

  private handleFailThreshold(question: SurveyQuestion, answer: any): void {
    this.surveyProcessService.showFailWarning().then((result) => {
      if (result.isConfirmed) {
        this.handleReenterAnswer(question);
        this.handleContinueWithFail(question, answer);
      } else {
        this.handleReenterAnswer(question);
      }
    });
  }

  // =================== UTILITY METHODS ===================
  getQuestionControl(questionId: number): FormControl {
    return this.surveyForm?.get(`question_${questionId}`) as FormControl;
  }

  canGoBack(): boolean {
    return this.currentStepIndex > 0;
  }

  private handleContinueWithFail(question: SurveyQuestion, answer: any): void {
    this.failedAnswers.push({
      questionId: question.id,
      questionText: question.description,
      answer: answer,
      failValue: question.failValue,
      timestamp: new Date()
    });

    this.surveyFailed.emit({
      question: question,
      answer: answer,
      failedAnswers: this.failedAnswers
    });
  }

  handleReenterAnswer(question: SurveyQuestion): void {
    const control = this.getQuestionControl(question.id);
    if (!control) {
      console.warn('Form control not found for question:', question.id);
      return;
    }
    control.setValue(null, { emitEvent: false });
    control.markAsPristine();
    control.markAsUntouched();
    switch (question.questionTypeId) {
      case 4:
        this.uncheckAllRadioButtons(question.id);
        break;
        
      case 5:
        control.setValue([], { emitEvent: false });
        break;
        
      case 9:
        delete this.signatureData[question.id];
        this.signatureDefaultValues[question.id] = '';
        break;
        
      case 7:
        delete this.selectedImages[question.id];
        break;
        
      case 8:
        console.log('Clearing selected files for question:', question.id);
        delete this.selectedFiles[question.id];
        break;

      case 12: 
        control.setValue(0, { emitEvent: false }); 
        break;
        
      default:
        console.log('Cleared form control for question type:', question.questionTypeId);
        break;
    }
    this.cdr.detectChanges();
  }

  private uncheckAllRadioButtons(questionId: number): void {
    const radioButtons = document.querySelectorAll(`input[name="question_${questionId}"]`);
    radioButtons.forEach((radio: any) => {
      if (radio.checked) {
        radio.checked = false;
      }
    });
    
  }

  private completeSurvey(): void {
    const surveyData = {
      formData: this.surveyForm.value,
      failedAnswers: this.failedAnswers,
      hasFailed: this.failedAnswers.length > 0,
      completedAt: new Date(),
      survey: this.survey
    };
    
    this.surveyCompleted.emit(surveyData);
  }

  // =================== QUESTION TYPE HANDLERS ===================
  private handleDateValidationError(question: SurveyQuestion, answer: string, validation: any): void {
    Swal.fire({
      title: 'Invalid Date',
      html: validation.errorMessage,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Re-enter',
      confirmButtonText: 'Continue and Fail',
      confirmButtonColor: 'rgb(60,76,128)',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.handleContinueWithFail(question, answer);
      } else {
        this.handleReenterAnswer(question);
      }
    });
  }

  private handleDecimalValidationError(question: SurveyQuestion, answer: string, validation: any): void {
    this.surveyProcessService.showDecimalValidationError(validation).then((result) => {
      if (validation.errorType === 'range' || validation.errorType === 'step' || !result.isConfirmed) {
        this.handleReenterAnswer(question);
      } else if (validation.errorType === 'fail' && result.isConfirmed) {
        this.handleContinueWithFail(question, answer);
      }
    });
  }

  private handleRangeValidationError(question: SurveyQuestion, answer: string, validation: any): void {
    this.surveyProcessService.showRangeValidationError(validation).then((result) => {
      if (validation.errorType === 'range' || validation.errorType === 'step' || !result.isConfirmed) {
        this.handleReenterAnswer(question);
      } else if (validation.errorType === 'fail' && result.isConfirmed) {
        this.handleContinueWithFail(question, answer);
      }
    });
  }

  onRangeValueChanged(question: SurveyQuestion, event: any): void {
    const value = parseFloat(event.target.value);
    this.onQuestionAnswered(question, value);
  }
  
  onRatingChanged(question: SurveyQuestion, rating: number): void {

      const control = this.getQuestionControl(question.id);
      if (control) {
          control.setValue(rating);
          control.markAsDirty();
          control.markAsTouched();
      }

      this.onQuestionAnswered(question, rating);
  }

  getRangeValidationHint(question: SurveyQuestion): string {
    const validation = question.questionValidation;
    if (!validation) return '';
    
    let hints: string[] = [];
    
    if (validation.minValue !== null && validation.maxValue !== null) {
      hints.push(`Range: ${validation.minValue} - ${validation.maxValue}`);
    }
    
    if (validation.step && validation.step > 0) {
      hints.push(`Step: ${validation.step}`);
    }
    
    if (validation.lowerFail !== null || validation.upperFail !== null) {
      hints.push('Note: Values outside acceptable range may fail the survey');
    }
    
    return hints.join(' | ');
  }

  onImagesSelected(question: SurveyQuestion, event: any): void {
    if (this.isReadOnly()) {
      console.log('Survey is read-only, file selection disabled');
      return;
    }
    const fileList = event.target.files;
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    
    if (fileList && fileList.length > 0) {
      const filesArray: File[] = [];
      const oversizedFiles: string[] = [];
      
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        if (file.size > MAX_FILE_SIZE) {
          oversizedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
          console.warn(`File ${file.name} exceeds 100MB limit:`, file.size);
        } else {
          filesArray.push(file);
        }
      }
      
      if (oversizedFiles.length > 0) {
        const message = `The following files exceed the 100MB size limit and will be skipped:\n\n${oversizedFiles.join('\n')}\n\nPlease compress these files or choose smaller images.`;
        alert(message);
        console.warn('Oversized files skipped:', oversizedFiles);
      }
      
      if (filesArray.length === 0) {
        console.log('No valid files after size validation');
        return;
      }
      
      interface SelectedImage {
        name: string;
        size: number;
        preview: string;
        uploadedAt: Date;
        isExisting: boolean;
      }
      const imagePromises: Promise<SelectedImage>[] = [];
      
      filesArray.forEach((file: File, index: number) => { 
        const promise = new Promise<SelectedImage>((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = (e: any) => {
            try {
              const imageData: SelectedImage = {
                name: file.name || `image_${question.id}_${index}_${Date.now()}.jpg`,
                size: file.size || 0,
                preview: e.target.result,
                uploadedAt: new Date(),
                isExisting: false
              };
              resolve(imageData);
            } catch (error) {
              console.error(`Error creating image data for file ${index}:`, error);
              reject(error);
            }
          };
          
          reader.onerror = (error) => {
            console.error(`FileReader error for file ${index}:`, error);
            reject(error);
          };
          
          reader.readAsDataURL(file);
        });
        
        imagePromises.push(promise);
      });
      
      Promise.all(imagePromises).then((newImages: SelectedImage[]) => {
        if (!Array.isArray(newImages)) {
          console.error('newImages is not an array:', newImages);
          return;
        }
        
        const existingImages = this.selectedImages[question.id] || [];
        
        const allImages = [...existingImages, ...newImages];
        
        this.selectedImages[question.id] = allImages;
        
        console.log(`Added ${newImages.length} new images. Total images: ${allImages.length}`);
        
        try {
          const fileAttachments = allImages.map((image: SelectedImage, index: number) => {
            return {
              fileExtension: this.surveyProcessService.getFileExtensionFromDataUrl(image.preview) || 'jpg',
              file: this.surveyProcessService.cleanBase64String(image.preview), 
              fileName: image.name
            };
          });
          
          const answerWithAttachments = {
            fileAttachments: fileAttachments
          };
          
          const control = this.getQuestionControl(question.id);
          if (control) {
            control.setValue('images_uploaded');
            control.markAsDirty();
            control.markAsTouched();
          }
          
          this.onQuestionAnswered(question, answerWithAttachments);
          
        } catch (mapError) {
          console.error('Error creating fileAttachments:', mapError);
        }
        
      }).catch((error) => {
        console.error('Error processing images:', error);
        alert('Error processing images. Please try again.');
      });
      
    }
  }

    removeImage(questionId: number, imageIndex: number): void {
      if (this.selectedImages[questionId] && this.selectedImages[questionId].length > imageIndex) {
        this.selectedImages[questionId].splice(imageIndex, 1);
        if (this.selectedImages[questionId].length === 0) {
          delete this.selectedImages[questionId];
          
          const control = this.getQuestionControl(questionId);
          if (control) {
            control.setValue(null);
            control.markAsDirty();
          }
          
          const question = this.findQuestionById(questionId);
          if (question) {
            this.onQuestionAnswered(question, null);
          }
        } else {
          const remainingImages = this.selectedImages[questionId];
          console.log(remainingImages)
          const fileAttachments = remainingImages.map((image, index) => ({
            fileExtension: this.surveyProcessService.getFileExtensionFromDataUrl(image.preview) || 'jpg',
            file: this.surveyProcessService.cleanBase64String(image.preview),
            fileName: image.name || `image_${questionId}_${index}_${Date.now()}.jpg`
          }));
          
          const question = this.findQuestionById(questionId);
          if (question) {
            this.onQuestionAnswered(question, { fileAttachments });
          }
        }
      }
    }

  getSelectedImages(questionId: number): any[] {
    return this.selectedImages[questionId] || [];
  }


  getTotalFileSize(questionId: number): number {
    return this.selectedImages[questionId]?.reduce((total, img) => total + img.size, 0) || 0;
  }

  private findQuestionById(questionId: number): SurveyQuestion | null {
    for (const section of this.survey.sections) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) return question;
    }
    return null;
  }

  private validateImageUploads(question: SurveyQuestion, attachments: any): {
    isValid: boolean,
    errorMessage: string | null
  } {
    const images = attachments.fileAttachments;
    if (!images || images.length === 0) {
      return { isValid: true, errorMessage: null };
    }

    const maxImages = 10;
    if (images.length > maxImages) {
      return {
        isValid: false,
        errorMessage: `Maximum ${maxImages} images allowed`
      };
    }

    const maxTotalSize = 2 * 1024 * 1024;
    const totalSize = images.reduce((sum: any, img: any) => sum + img.size, 0);
    if (totalSize > maxTotalSize) {
      return {
        isValid: false,
        errorMessage: `Total file size exceeds ${this.surveyProcessService.formatFileSize(maxTotalSize)} limit`
      };
    }

    return { isValid: true, errorMessage: null };
  }

  private handleImageValidationError(question: SurveyQuestion, answer: any, validation: any): void {
    Swal.fire({
      title: 'Upload Error',
      html: validation.errorMessage,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: 'rgb(60,76,128)'
    });
  }

  onDocumentFilesSelected(question: SurveyQuestion, event: any): void {
    if (this.isReadOnly()) {
      return;
    }
    const fileList = event.target.files;
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    
    if (fileList && fileList.length > 0) {
      const filesArray: File[] = [];
      const oversizedFiles: string[] = [];
      
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        if (file.size > MAX_FILE_SIZE) {
          oversizedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
          console.warn(`File ${file.name} exceeds 2MB limit:`, file.size);
        } else {
          filesArray.push(file);
        }
      }
      
      if (oversizedFiles.length > 0) {
        const message = `The following files exceed the 2MB size limit and will be skipped:\n\n${oversizedFiles.join('\n')}\n\nPlease choose smaller files.`;
        alert(message);
        console.warn('Oversized files skipped:', oversizedFiles);
      }
      
      if (filesArray.length === 0) {
        this.clearFiles(question);
        return;
      }
      
      console.log('Valid files after size check:', filesArray.length);
      
      interface SelectedFile {
        name: string;
        size: number;
        content: string;
        uploadedAt: Date;
        isExisting: boolean;
        type: string;
      }
      const filePromises: Promise<SelectedFile>[] = [];
      
      filesArray.forEach((file: File, index: number) => {
        console.log(`Processing file ${index}:`, file.name, `${(file.size / 1024 / 1024).toFixed(2)}MB`);
        
        const promise = new Promise<SelectedFile>((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = (e: any) => {
            try {
              const fileData: SelectedFile = {
                name: file.name || `document_${question.id}_${index}_${Date.now()}.txt`,
                size: file.size || 0,
                content: e.target.result,
                uploadedAt: new Date(),
                isExisting: false,
                type: file.type || this.getFileTypeFromExtension(file.name)
              };
              console.log(`File ${index} processed:`, fileData.name, `${(fileData.size / 1024 / 1024).toFixed(2)}MB`);
              resolve(fileData);
            } catch (error) {
              console.error(`Error creating file data for file ${index}:`, error);
              reject(error);
            }
          };
          
          reader.onerror = (error) => {
            console.error(`FileReader error for file ${index}:`, error);
            reject(error);
          };
          
          reader.readAsDataURL(file);
        });
        
        filePromises.push(promise);
      });
      
      Promise.all(filePromises).then((processedFiles: SelectedFile[]) => {
      this.selectedFiles[question.id] = processedFiles;
      try {
        const fileAttachments = processedFiles.map((file: SelectedFile, index: number) => {
          const cleanBase64 = this.surveyProcessService.cleanBase64StringDocument(file.content);
          
          console.log(`Creating fileAttachment for file ${index}:`, {
            fileName: file.name,
            originalContentStart: file.content.substring(0, 100),
            cleanedBase64Start: cleanBase64.substring(0, 50),
            hasDataPrefix: file.content.includes('data:'),
            cleanedLength: cleanBase64.length
          });
          
          return {
            fileExtension: this.surveyProcessService.getFileExtensionFromName(file.name) || 'txt',
            file: cleanBase64,
            fileName: file.name
          };
        });
        
        console.log('FileAttachments created (clean base64):', fileAttachments);
        
        const answerWithAttachments = {
          fileAttachments: fileAttachments
        };
        
          const control = this.getQuestionControl(question.id);
          if (control) {
            control.setValue('files_uploaded');
            control.markAsDirty();
            control.markAsTouched();
          } else {
            console.warn('Form control not found for question:', question.id);
          }
          
          console.log('🎯 Triggering onQuestionAnswered for documents...');
          this.onQuestionAnswered(question, answerWithAttachments);
          
          this.cdr.detectChanges();

      } catch (mapError) {
        console.error('Error creating fileAttachments:', mapError);
      }
    });
      
    } else {
      this.clearFiles(question);
    }
  }

  removeFile(questionId: number, index: number): void {
    if (this.selectedFiles[questionId] && this.selectedFiles[questionId][index]) {
      this.selectedFiles[questionId].splice(index, 1);
      
      this.updateFileFormControl(questionId);
      
      const question = this.findQuestionById(questionId);
      if (question) {
        this.onQuestionAnswered(question, this.selectedFiles[questionId]);
      }
    }
  }

  getSelectedFiles(questionId: number): any[] {
    return this.selectedFiles[questionId] || [];
  }

  private updateFileFormControl(questionId: number): void {
    const control = this.surveyForm.get(`question_${questionId}`);
    if (control) {
      const files = this.selectedFiles[questionId]?.map(fileData => fileData.file) || [];
      control.setValue(files);
      control.markAsTouched();
    }
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

  private getFileTypeFromExtension(fileName: string): string {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    
    switch (extension) {
      case '.csv':
        return 'text/csv';
      case '.doc':
        return 'application/msword';
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case '.txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  formatUploadDate(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getTotalDocumentFileSize(questionId: number): number {
    return this.selectedFiles[questionId]?.reduce((total, fileData) => total + fileData.size, 0) || 0;
  }

  private validateFileUploads(question: SurveyQuestion, event: any): {
    isValid: boolean,
    errorMessage: string | null
  } {

    const files = event.fileAttachments;
    if (!files || files.length === 0) {
      return { isValid: true, errorMessage: null };
    }
    const maxFiles = 5;
    if (files.length > maxFiles) {
      return {
        isValid: false,
        errorMessage: `Maximum ${maxFiles} files allowed`
      };
    }
    const maxTotalSize = 5 * 1024 * 1024;
    const totalSize = files.reduce((sum: any, fileData: any) => sum + fileData.size, 0);
    if (totalSize > maxTotalSize) {
      return {
        isValid: false,
        errorMessage: `Total file size exceeds ${this.surveyProcessService.formatFileSize(maxTotalSize)} limit`
      };
    }

    const maxFileSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter((fileData: any) => fileData.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      return {
        isValid: false,
        errorMessage: `Some files exceed the ${this.surveyProcessService.formatFileSize(maxFileSize)} size limit`
      };
    }

    return { isValid: true, errorMessage: null };
  }

  private handleFileValidationError(question: SurveyQuestion, answer: any, validation: any): void {
    Swal.fire({
      title: 'Upload Error',
      html: validation.errorMessage,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: 'rgb(60,76,128)'
    });
  }

  getSignatureValue(questionId: number): string {
  return this.signatureData[questionId] || '';
}

onSignatureCaptured(question: SurveyQuestion, imageUrl: string): void {
  this.signatureData[question.id] = imageUrl;
  
  const control = this.surveyForm.get(`question_${question.id}`);
  if (control) {
    control.setValue(imageUrl);
    control.markAsTouched();
    control.markAsDirty();
  }
  
  this.onQuestionAnswered(question, imageUrl);
}

onSignatureStatusChanged(question: SurveyQuestion, hasSignature: boolean): void {  
  if (!hasSignature) {
    const control = this.surveyForm.get(`question_${question.id}`);
    if (control) {
      control.setValue('');
      control.markAsTouched();
    }
  }
}

onSignatureCleared(question: SurveyQuestion): void {
  console.log('Signature cleared for question:', question.id);
  

  this.signatureData[question.id] = '';
  

  const control = this.surveyForm.get(`question_${question.id}`);
  if (control) {
    control.setValue('');
    control.markAsTouched();
    control.markAsDirty();
  }
  
  this.onQuestionAnswered(question, '');
}

onSignatureBegin(question: SurveyQuestion): void {}

onSignatureEnd(question: SurveyQuestion): void {
  const control = this.surveyForm.get(`question_${question.id}`);
  if (control) {
    control.updateValueAndValidity();
  }
}

getSignatureAnswers(): { questionId: number, signature: string }[] {
  const signatures: { questionId: number, signature: string }[] = [];
  
  Object.keys(this.signatureData).forEach(questionIdStr => {
    const questionId = parseInt(questionIdStr);
    const signature = this.signatureData[questionId];
    
    if (signature && signature.trim() !== '') {
      signatures.push({
        questionId: questionId,
        signature: signature
      });
    }
  });
  
  return signatures;
}

  clearAllSignatures(): void {
    this.signatureData = {};

    if (this.surveyForm) {
      Object.keys(this.surveyForm.controls).forEach(controlName => {
        if (controlName.startsWith('question_')) {
          const questionId = parseInt(controlName.replace('question_', ''));
          const question = this.findQuestionById(questionId);
          
          if (question && question.questionTypeId === 9) {
            this.surveyForm.get(controlName)?.setValue('');
          }
        }
      });
    }
  }

  loadSignatureData(signatureAnswers: { questionId: number, signature: string }[]): void {
    signatureAnswers.forEach(answer => {
      this.signatureData[answer.questionId] = answer.signature;
      const control = this.surveyForm.get(`question_${answer.questionId}`);
      if (control) {
        control.setValue(answer.signature);
      }
    });
  }

  private saveAnswerToAPI(question: SurveyQuestion, answer: any): void {
    if (this.isReadOnly()) {
      console.log('Survey is read-only, skipping auto-save');
      return;
    }
    const control = this.getQuestionControl(question.id);
    
    if (control && control.pristine) {
      console.log('Skipping save for pristine control (cleared answer):', question.id);
      return;
    }
    
    if ((question.questionTypeId >= 1 && question.questionTypeId <= 12)) {
      console.log('Answer qualifies for auto-save, adding to queue...');
      this.autoSaveSubject.next({question, answer});
    } else {
      console.log('Answer does not qualify for auto-save (question type:', question.questionTypeId, ')');
    }
  }

  private setupAutoSave(): void {
    this.autoSaveSubject.pipe(
      debounceTime(100),
      distinctUntilChanged((prev, curr) => 
        prev.question.id === curr.question.id && 
        JSON.stringify(prev.answer) === JSON.stringify(curr.answer)
      ),
      takeUntil(this.destroy$)
    ).subscribe(({question, answer}) => {
      this.submitAnswer(question, answer);
    });
  }

private submitAnswer(question: SurveyQuestion, answer: any): void {
  if (!this.job?.id || !this.survey?.id) {
    console.warn('Job ID or Survey ID not available, cannot save');
    return;
  }

  const answerSubmission = this.prepareAnswerSubmission(question, answer);
  this.answerService.submitAnswers(this.job.id, this.survey.id, [answerSubmission])
    .subscribe({
      next: (response) => {
        console.log('Answer saved successfully for question:', question.id, response);
        this.lastSaveTime = new Date();
      },
      error: (error) => {
        console.error('Failed to save answer for question:', question.id, error);
      }
    });
  }

  private prepareAnswerSubmission(question: SurveyQuestion, answer: any): AnswerSubmission {
    const submission: AnswerSubmission = {
      questionId: question.id,
      answer: '',
      pass: true,
      failValue: 0,
      fileAttachments: []
    };

    switch (question.questionTypeId) {
      case 1:
        submission.answer = answer ? new Date(answer).toISOString() : '';
        break;
        
      case 2:
        submission.answer = answer ? answer.toString() : '';
        break;
        
      case 3:
        submission.answer = answer ? parseFloat(answer).toString() : '';
        break;
        
      case 4:
        if (answer && typeof answer === 'object') {
          submission.answer = answer.value || answer.text || answer.id?.toString() || '';
          submission.pass = !(answer.failValue && answer.failValue > 0);
          submission.failValue = answer.failValue || 0;
        } else {
          submission.answer = answer ? answer.toString() : '';
        }
        break;
        
      case 5:
        if (Array.isArray(answer)) {
          submission.answer = answer.map(item => 
            typeof item === 'object' ? (item.value || item.text || item.id) : item
          ).join(',');
        } else if (answer && typeof answer === 'object') {
          submission.answer = answer.value || answer.text || answer.id?.toString() || '';
        } else {
          submission.answer = answer ? answer.toString() : '';
        }
        break;
        
      case 6:
        submission.answer = answer ? parseFloat(answer).toString() : '';
        break;

      case 7:
        if (answer && answer.fileAttachments && answer.fileAttachments.length > 0) {
          if (answer.fileAttachments.length === 1) {
            submission.answer = "Single Photo";
          } else {
            submission.answer = "Multiple Photos";
          }
          
          submission.fileAttachments = answer.fileAttachments;
        }
        else if (this.selectedImages[question.id] && this.selectedImages[question.id].length > 0) {
          const images = this.selectedImages[question.id];
          
          if (images.length === 1) {
            submission.answer = "Single Photo";
          } else {
            submission.answer = "Multiple Photos";
          }
          
          submission.fileAttachments = images.map((image: any, index: number) => ({
            fileExtension: this.surveyProcessService.getFileExtensionFromDataUrl(image.preview) || 'jpg',
            file: this.surveyProcessService.cleanBase64String(image.preview),
            fileName: image.name || `image_${question.id}_${index}_${Date.now()}.jpg`
          }));
        } else {
          submission.answer = "";
          submission.fileAttachments = [];
        }
        break;
      
      case 8:
        console.log('=== PREPARE ANSWER SUBMISSION CASE 8 ===');
        console.log('Question ID:', question.id);
        console.log('Answer input:', answer);
        
        if (answer && answer.fileAttachments && answer.fileAttachments.length > 0) {
          console.log('Using answer.fileAttachments:', answer.fileAttachments);
          
          if (answer.fileAttachments.length === 1) {
            submission.answer = "Single Document";
          } else {
            submission.answer = "Multiple Documents";
          }
          
          submission.fileAttachments = answer.fileAttachments.map((attachment: any) => ({
            fileExtension: attachment.fileExtension,
            file: this.surveyProcessService.cleanBase64StringDocument(attachment.file), 
            fileName: attachment.fileName
          }));
          
          console.log('Cleaned fileAttachments for submission:', submission.fileAttachments);
        }
        else if (this.selectedFiles[question.id] && this.selectedFiles[question.id].length > 0) {
          console.log('Fallback: Using selectedFiles');
          
          const files = this.selectedFiles[question.id];
          
          if (files.length === 1) {
            submission.answer = "Single Document";
          } else {
            submission.answer = "Multiple Documents";
          }
          
          submission.fileAttachments = files.map((file: any, index: number) => ({
            fileExtension: this.surveyProcessService.getFileExtensionFromName(file.name) || 'txt',
            file: this.surveyProcessService.cleanBase64StringDocument(file.content), 
            fileName: file.name || `document_${question.id}_${index}_${Date.now()}.txt`
          }));
          
          console.log('Converted selectedFiles to clean fileAttachments:', submission.fileAttachments);
        } else {
          console.log('No files found - empty submission');
          submission.answer = "";
          submission.fileAttachments = [];
        }
        
        console.log('Final case 8 submission:', submission);
        break;
        
      case 9:
        if(!answer) {
          submission.answer = '';
          submission.fileAttachments = [];
          break;
        }
        const base64Signature = answer.fileAttachments ? answer.fileAttachments[0].file : null;
        const imageSignature = base64Signature ? `data:image/png;base64,${base64Signature}` : null;
        submission.answer = imageSignature || '';
        submission.fileAttachments = answer.fileAttachments || [];
        // if (answer) {
        //   if (answer.fileAttachments && answer.fileAttachments.length > 0) {
        //     submission.answer = this.signatureData[question.id] || 'Signature captured';
        //     submission.fileAttachments = answer.fileAttachments;
        //   }
        //   else if (typeof answer === 'string' && answer.startsWith('data:image/')) {
        //     const signatureAttachment = this.surveyProcessService.parseSignatureToFileAttachment(answer, question.id);
        //     if (signatureAttachment) {
        //       submission.answer = answer; 
        //       submission.fileAttachments = [signatureAttachment];
        //     }
        //   }
        //   else if (this.signatureData[question.id]) {
        //     const signatureAttachment = this.surveyProcessService.parseSignatureToFileAttachment(this.signatureData[question.id], question.id);
        //     if (signatureAttachment) {
        //       submission.answer = this.signatureData[question.id];
        //       submission.fileAttachments = [signatureAttachment];
        //     }
        //   }
        // }
        break;

      case 10:
        if(!answer) {
          submission.answer = '';
          submission.fileAttachments = [];
          break;
        }
        const base64 = answer.fileAttachments ? answer.fileAttachments[0].file : null;
        const image = base64 ? `data:image/png;base64,${base64}` : null;
        submission.answer = image || '';
        submission.fileAttachments = answer.fileAttachments || [];
      break;
      
      case 12:
        const ratingValue = parseInt(answer);
        submission.answer = !isNaN(ratingValue) ? ratingValue.toString() : '';
        
        if (question.failValue && ratingValue <= question.failValue) {
            submission.pass = false;
            submission.failValue = question.failValue;
        }
      break;
        
      default:
        submission.answer = answer ? answer.toString() : '';
  }

    if (question.questionTypeId !== 4 && question.questionTypeId !== 5) {
      submission.pass = this.validateAnswerForSubmission(question, answer);
      submission.failValue = submission.pass ? 0 : 1;
    }

    return submission;
  }

  private validateAnswerForSubmission(question: SurveyQuestion, answer: any): boolean {
   
    if (!question.isOptional) {
      if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
        return false;
      }
    }

    return true;
  }

  onRadioOptionChanged(question: SurveyQuestion, selectedOption: any): void {
    console.log('Radio option changed:', {
      questionId: question.id,
      selectedOption: selectedOption
    });

    const control = this.getQuestionControl(question.id);
    if (control) {
      control.setValue(selectedOption.id);
      control.markAsDirty();
      control.markAsTouched();
    }

    this.onQuestionAnswered(question, selectedOption);
  }

  isRadioOptionSelected(questionId: number, optionId: number): boolean {
    const control = this.getQuestionControl(questionId);
    
    if (!control || control.value === null || control.value === undefined || control.value === '') {
      return false;
    }
    
    const isSelected = control.value === optionId || control.value === optionId.toString();
    
    return isSelected;
  }

private loadExistingAnswersIntoForm(): void {
  console.log('Loading existing answers for job:', this.job.id);
  if(this.currentAnswers.length !== 0) {
    this.setFormDefaults(this.currentAnswers);
  }
}

private setFormDefaults(answersData: any): void {
  if (!answersData || !Array.isArray(answersData)) {
    console.log('No existing answers to set as defaults');
    return;
  }

  answersData.forEach(answerItem => {
    const questionId = answerItem.questionId;
    const answer = answerItem.value;
    
    const question = this.findQuestionById(questionId);
    if (!question) {
      console.warn('Question not found for ID:', questionId);
      return;
    }

    const control = this.getQuestionControl(questionId);
    if (!control) {
      console.warn('Form control not found for question:', questionId);
      return;
    }

    const defaultValue = this.parseAnswerForDefault(question, answer);
    if (defaultValue !== null) {
      control.setValue(defaultValue);
      control.markAsPristine();
    }
    
    this.restoreSpecialQuestionData(question, answerItem);
  });

  console.log('Form defaults set from existing answers');
}

private parseAnswerForDefault(question: SurveyQuestion, answer: string): any {
  if (!answer || answer.trim() === '') {
    return null;
  }

  switch (question.questionTypeId) {
    case 1:
      try {
        return new Date(answer).toISOString().split('T')[0]; 
      } catch {
        return null;
      }
      
    case 2:
      return answer;
      
    case 3:
      const decimalValue = parseFloat(answer);
      return isNaN(decimalValue) ? null : decimalValue;
      
    case 4:
      if (question.options) {
        const matchingOption = question.options.find(opt => 
          opt.id?.toString() === answer || 
          opt.text === answer
        );
        return matchingOption ? matchingOption.id : null;
      }
      return answer;
      
    case 5:
      if (answer.includes(',')) {
        return answer.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      } else {
        const id = parseInt(answer);
        return isNaN(id) ? null : [id];
      }
      
    case 6:
      const rangeValue = parseFloat(answer);
      return isNaN(rangeValue) ? null : rangeValue;
      
    case 7:
    case 8:
    case 9:
      return answer;
    case 12:
      const ratingValue = parseInt(answer);
      return isNaN(ratingValue) ? null : ratingValue;
      
    default:
      return answer;
  }
}

private restoreSpecialQuestionData(question: SurveyQuestion, answerItem: any): void {
  const questionId = question.id;
  switch (question.questionTypeId) {
    case 7:
      if (answerItem.attachments && answerItem.attachments.length > 0) {
        this.selectedImages[questionId] = answerItem.attachments.map((attachment: any, index: number) => ({
          name: attachment.name,
          size: attachment.fileSize,
          preview: `data:image/${attachment.mimeType};base64,${attachment.file}`,
          uploadedAt: new Date(),
          isExisting: true
        }));
        console.log('Restored images for question:', questionId, this.selectedImages[questionId]);
      }
      break;
      
    case 8:
      if (answerItem.attachments && answerItem.attachments.length > 0) {
        console.log('Restoring files from API attachments:', answerItem.attachments);
        
        this.selectedFiles[questionId] = answerItem.attachments.map((attachment: any) => ({
          name: attachment.name || 'unknown.txt',
          size: attachment.fileSize || 0,
          content: `data:${attachment.mimeType || 'application/octet-stream'};base64,${attachment.file}`, 
          uploadedAt: new Date(),
          isExisting: true,
          type: attachment.mimeType || 'application/octet-stream',
          apiId: attachment.id,
          url: attachment.url,
          location: attachment.location
        }));
        
        console.log('Restored files for question:', questionId, this.selectedFiles[questionId]);
      }
      break;
      
    case 9: 
     this.signatureData[questionId] = (!answerItem.value || answerItem.value === "") ? answerItem.attachments[0]?.file : answerItem.value;
      if (answerItem.fileAttachments && answerItem.fileAttachments.length > 0) {
        const signatureAttachment = answerItem.fileAttachments[0];
        this.signatureData[questionId] = `data:image/${signatureAttachment.fileExtension};base64,${signatureAttachment.file}`;
        console.log('Restored signature for question:', questionId);
      }
      break;
  }
}

  hasSelectedImages(questionId: number): boolean {
    return !!(this.selectedImages[questionId] && this.selectedImages[questionId].length > 0);
  }

  getSelectedImagesCount(questionId: number): number {
    return this.selectedImages[questionId] ? this.selectedImages[questionId].length : 0;
  }

  private clearFiles(question: SurveyQuestion): void {
    delete this.selectedFiles[question.id];
    
    const control = this.getQuestionControl(question.id);
    if (control) {
      control.setValue(null);
      control.markAsDirty();
      control.markAsTouched();
    }
    
    this.onQuestionAnswered(question, null);
  }

  hasSelectedFiles(questionId: number): boolean {
    return !!(this.selectedFiles[questionId] && this.selectedFiles[questionId].length > 0);
  }

  getSelectedFilesCount(questionId: number): number {
    return this.selectedFiles[questionId] ? this.selectedFiles[questionId].length : 0;
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

  private validateRatingInput(question: SurveyQuestion, rating: number): {
    isValid: boolean,
    errorMessage: string | null,
    errorType: string | null
} {
    if (rating < 1 || rating > 5) {
        return {
            isValid: false,
            errorMessage: 'Rating must be between 1 and 5 stars',
            errorType: 'range'
        };
    }

    if (question.failValue && rating <= question.failValue) {
        return {
            isValid: false,
            errorMessage: `Rating of ${rating} star(s) may cause survey failure. Minimum rating required: ${question.failValue + 1} stars.`,
            errorType: 'fail'
        };
    }

    return { isValid: true, errorMessage: null, errorType: null };
}

private handleRatingValidationError(question: SurveyQuestion, answer: number, validation: any): void {
    if (validation.errorType === 'range') {
        Swal.fire({
            title: 'Invalid Rating',
            html: validation.errorMessage,
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: 'rgb(60,76,128)'
        }).then(() => {
            this.handleReenterAnswer(question);
        });
    } else if (validation.errorType === 'fail') {
        Swal.fire({
            title: 'Low Rating Warning',
            html: validation.errorMessage,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Change Rating',
            confirmButtonText: 'Continue and Fail',
            confirmButtonColor: 'rgb(60,76,128)',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            if (result.isConfirmed) {
                this.handleContinueWithFail(question, answer);
            } else {
                this.handleReenterAnswer(question);
            }
        });
    }
}


  openImagePreview(image: any, questionId: number): void {
    const modalRef = this.modalService.open(NgbdImagePreviewModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.image = image;
    modalRef.componentInstance.questionId = questionId;
    modalRef.componentInstance.allImages = this.getSelectedImages(questionId);
  }

  getImageIndex(questionId: number, currentImage: any): number {
    const images = this.getSelectedImages(questionId);
    return images.findIndex(img => img.name === currentImage.name);
  }

  async openCamera(questionId: number): Promise<void> {
    if (this.isReadOnly()) {
      console.log('Survey is read-only, camera disabled');
      return;
    }

    const modalRef = this.modalService.open(CameraModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.questionId = questionId;

    modalRef.componentInstance.photoCaptured.subscribe((result: {questionId: number, imageData: any}) => {
      this.handleCameraPhoto(result.questionId, result.imageData);
    });
  }

  private handleCameraPhoto(questionId: number, imageData: any): void {
    const existingImages = this.selectedImages[questionId] || [];
    const allImages = [...existingImages, imageData];
    this.selectedImages[questionId] = allImages;

    console.log(`📷 Camera photo captured for question ${questionId}`);

    try {
      const fileAttachments = allImages.map((image: any) => ({
        fileExtension: this.surveyProcessService.getFileExtensionFromDataUrl(image.preview) || 'jpg',
        file: this.surveyProcessService.cleanBase64String(image.preview),
        fileName: image.name
      }));

      const answerWithAttachments = {
        fileAttachments: fileAttachments
      };

      const control = this.getQuestionControl(questionId);
      if (control) {
        control.setValue('images_uploaded');
        control.markAsDirty();
        control.markAsTouched();
      }

      const question = this.findQuestionById(questionId);
      if (question) {
        this.onQuestionAnswered(question, answerWithAttachments);
      }
      
    } catch (error) {
      console.error('Error processing camera photo:', error);
      alert('Error processing photo. Please try again.');
    }
  }

  getCameraImageCount(questionId: number): number {
    const images = this.getSelectedImages(questionId);
    return images.filter(img => img.source === 'camera').length;
  }

  getGalleryImageCount(questionId: number): number {
    const images = this.getSelectedImages(questionId);
    return images.filter(img => img.source === 'gallery').length;
  }

  openSketchModal(questionId: number, questionTypeId: number): void {
    if (this.isReadOnly()) {
      console.log('Survey is read-only, sketch disabled');
      return;
    }

    const modalRef = this.modalService.open(NgbdSketchModalComponent, {
      size: 'fullscreen',
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'sketch-modal-fullscreen'
    });

    modalRef.componentInstance.questionId = questionId;
    modalRef.componentInstance.questionTypeId = questionTypeId;
    modalRef.componentInstance.existingSketch = this.getSketchValue(questionId);

    modalRef.componentInstance.sketchSaved.subscribe((result: {questionId: number, sketchData: string}) => {
      console.log(result);
      this.handleSketchSaved(result.questionId, result.sketchData);
    });
  }

  private handleSketchSaved(questionId: number, sketchData: string): void {
    const control = this.getQuestionControl(questionId);
    if (control) {
      control.setValue(sketchData);
      control.markAsDirty();
      control.markAsTouched();
    }

    const question = this.findQuestionById(questionId);
    if (question) {
      // Create file attachment for sketch
      const fileAttachment = {
        fileExtension: 'png',
        file: this.surveyProcessService.cleanBase64String(sketchData),
        fileName: `sketch_${questionId}_${Date.now()}.png`
      };

      const answerWithAttachments = {
        fileAttachments: [fileAttachment]
      };

      console.log(answerWithAttachments);
      this.onQuestionAnswered(question, answerWithAttachments);
      console.log(`🎨 Sketch saved for question ${questionId}`);
    }
  }

  getSketchValue(questionId: number): string | null {
    const control = this.getQuestionControl(questionId);
    if (control && control.value && control?.value.fileAttachments) {
      const base64 = control?.value.fileAttachments ? control.value.fileAttachments[0].file : null;
      const image = base64 ? `data:image/png;base64,${base64}` : null;
      return image;
    } else {
      return control.value;
    }
   
  }

  clearSketch(questionId: number): void {
    if (this.isReadOnly()) return;

    const control = this.getQuestionControl(questionId);
    if (control) {
      control.setValue(null);
      control.markAsDirty();
      control.markAsTouched();
    }

    const question = this.findQuestionById(questionId);
    if (question) {
      this.onQuestionAnswered(question, null);
      console.log(`🗑️ Sketch cleared for question ${questionId}`);
    }
  }

 
}