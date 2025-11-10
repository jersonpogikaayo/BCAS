import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JobDetail } from 'src/app/core/models/jobs/jobs.model';
import { Survey } from 'src/app/core/models/survey/survey.model';
import { SurveyProcessComponent } from '../../../survey-process/survey-process.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestEquipmentDisplay } from 'src/app/core/models/test-equipments/test-equipments.model';
import { JobSummaryData } from '../../../jobs/jobs-summary/jobs-summary.component';
import { SurveyHttpRequestsService } from 'src/app/core/services/http-requests/survey-http-requests.service';
import { CommonService } from 'src/app/core/services/common/common.service';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ngbd-fail-job-modal',
  templateUrl: './ngbd-fail-job-modal.component.html',
  styleUrls: ['./ngbd-fail-job-modal.component.scss']
})
export class NgbdFailJobModalComponent implements OnInit {
  @Input() survey!: Survey;
  @Input() job!: JobDetail;
  @Input() currentAnswers!: any;
  @Input() failureCategories!: any;
  @Input() isCompleted: boolean = false;

  @ViewChild('surveyProcess') surveyProcessComponent!: SurveyProcessComponent;
  
  activeTab = 0;
  surveyActiveTab = 0;
  isSurveyLoading: boolean = false;
  isStepLoading: boolean = false;
  isLastStep: boolean = false;

  // Form properties
  failJobForm!: FormGroup;
  signatureForm!: FormGroup;
  submitted = false;
  
  private selectedTestEquipments: TestEquipmentDisplay[] = [];
  private surveyCopy!: Survey;
  customerFeedackSurvey!: Survey;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private jobsHttpRequestsService: JobsHttpRequestsService,
    private surveyHttpRequestsService: SurveyHttpRequestsService
  ) { }

  ngOnInit(): void {
    console.log('🚀 Survey:', this.survey);
    console.log('🚀 Job:', this.job);
    console.log('🚀 Current Answers:', this.currentAnswers);

    this.initializeFailJobForm();
    this.surveyCopy = JSON.parse(JSON.stringify(this.survey));
    
  }

  private initializeFailJobForm(): void {
    this.failJobForm = this.formBuilder.group({
      reason: ['', [Validators.required]],
      additionalNotes: ['']
    });

    this.signatureForm = this.formBuilder.group({
      name: ['', Validators.required],
      signature: ['', Validators.required],
    });
  }

  close() {
    this.activeModal.close({
      success: false,
      action: 'close'
    });
  }

  surveyBack(): void {
    this.surveyProcessComponent.goToPreviousStep();
  }
  
  handleNextClick(): void {
    this.surveyProcessComponent.proceedToNext();
  }

  onSurveyStepChanged(event: any): void {
    console.log('Survey step changed:', event);
    this.surveyActiveTab = (event.currentStep);
    this.isLastStep = event.isLastStep;
  }

  async onSurveyCompleted(surveyData: any) {
    // Move to next tab or close modal
    try {
      if(this.activeTab === 0) {
        this.updateSurveyCopy();
        this.activeTab = 1;
      } else if(this.activeTab === 5) {
       this.activeModal?.close('finished');
      }
      
    } catch (error) {
      console.error('Error processing equipment checks:', error);
    }
    this.cdr.detectChanges();
  }

   /**
   * Get form controls for validation
   */
  get f() {
    return this.failJobForm.controls;
  }

  get s() {
    return this.signatureForm.controls;
  }

  next() {
    if(this.activeTab == 1) {
      this.submitted = true;
      this.isStepLoading = true;
      if (this.failJobForm.invalid) {
        console.log('Form is invalid');
        this.isStepLoading = false;
        return;
      } else {
        this.isStepLoading = false;
        this.activeTab++;
      }
    } else if(this.activeTab == 4) {
      this.handleSubmitFailJob('submit');
    } else {
      this.activeTab++;
      this.isStepLoading = false;
    }

    console.log('Next tab:', this.activeTab);
  }

  /**
   * Submit fail job form
   */
  submitFailJob(): void {
    this.submitted = true;

    if (this.failJobForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    console.log('Failing job with data:', this.failJobForm.value);
    
    // TODO: Call API to fail the job
    // this.activeModal.close({
    //   success: true,
    //   action: 'fail',
    //   failureData: {
    //     categoryId: this.failJobForm.value.reason,
    //     notes: this.failJobForm.value.additionalNotes,
    //     jobId: this.job.id
    //   }
    // });
  }

  onTestEquipmentSelected(selectedEquipments: TestEquipmentDisplay[]): void {
      console.log('Test equipments selected in modal:', selectedEquipments);
      this.selectedTestEquipments = selectedEquipments;
  }

  getSummaryData(): JobSummaryData {
    return {
      equipmentChecks: this.equipmentFormData(this.job),
      surveyData: { survey: this.surveyCopy },
      testEquipments: this.selectedTestEquipments,
      jobDetails: this.job
    };
  }

  equipmentFormData(job: JobDetail): any {
    if(job.equipment !== null){
       return {
        newAssetNumber: job.equipment.assetNumber,
        newSerialNumber: job.equipment.serialNumber,
        newgmdn: job.equipment.gmdn,
        newecri: job.equipment.ecri,
      };
    }
  }

  updateSurveyCopy(): void {
    console.log('Updating survey copy with current survey data...');
    
    if (!this.survey || !this.surveyCopy) {
      console.warn('Survey or surveyCopy is not available');
      return;
    }

    // Update surveyCopy sections based on this.survey sections using index
    this.surveyCopy.sections = this.surveyCopy.sections.map(copySection => {
      // Find matching section in current survey
      const currentSection = this.survey.sections.find(s => s.index === copySection.index);
      
      if (currentSection) {
        return {
          ...copySection,
          ...currentSection,
          questions: copySection.questions.map(copyQuestion => {
            // Find matching question in current section
            const currentQuestion = currentSection.questions?.find(q => q.index === copyQuestion.index);
            
            if (currentQuestion) {
              return {
                ...copyQuestion,
                ...currentQuestion,
                // Deep copy complex objects
                answers: currentQuestion.answers ? JSON.parse(JSON.stringify(currentQuestion.answers)) : copyQuestion.answers,
                options: currentQuestion.options ? JSON.parse(JSON.stringify(currentQuestion.options)) : copyQuestion.options
              };
            }
            
            return copyQuestion;
          })
        };
      }
      
      return copySection;
    });
    
    this.cdr.detectChanges
  }

  onSignatureCaptured(event: any) {
    this.signatureForm.patchValue({
      signature: event});
      console.log(this.signatureForm.value)
  }

  handleSubmitFailJob(type: string = 'sign_off_later'): void {
    this.submitted = true;
    this.isStepLoading = true;
    
    if (type === 'sign_off_later') {
      this.jobsHttpRequestsService.pendingReviewJob(this.job.id, '').subscribe({
        next: () => this.activeModal?.close('signOffLater'),
        error: (error) => {
          this.isStepLoading = false;
          console.error('Error setting job to pending review:', error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to process the job. Please try again.',
            icon: 'error',
            confirmButtonText: 'Okay',
            confirmButtonColor: 'rgb(60,76,128)',
          });
        }
      });
      return;
    }

    if (this.failJobForm.invalid || this.signatureForm.invalid) {
      this.isStepLoading = false;
      console.log('Form validation failed');
      return;
    }
    
    const payload = {
      image: this.commonService.removeBase64Prefix(this.signatureForm.get('signature')?.value),
      fileExtension: "png",
      name: this.signatureForm.get('name')?.value,
      detail: this.failJobForm.get('additionalNotes')?.value,
      jobStatusId: this.failJobForm.get('reason')?.value,
      submissionTime: this.commonService.formatDateTime()
    };
    
    this.jobsHttpRequestsService.failJob(this.job.id, payload).subscribe({
      next: () => {
        this.showCustomerFeedbackPrompt();
      },
      error: (error) => {
        this.isStepLoading = false;
        console.error('Error failing job:', error);
        // TODO: Add error handling UI feedback
      }
    });
  }


  private showCustomerFeedbackPrompt(): void {
    Swal.fire({
      title: 'Do you want to complete the customer feedback survey?',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      allowOutsideClick: false,
      confirmButtonColor: 'rgb(60,76,128)',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadCustomerFeedbackSurvey();
      } else {
        this.activeModal?.close('failed');
      }
    });
  }
  
  loadCustomerFeedbackSurvey(): void {
    this.surveyHttpRequestsService.getCustomerFeedbackSurvey().subscribe({
      next: (data: Survey) => { 
        this.customerFeedackSurvey = data;
        this.isStepLoading = false;
        console.log('Customer feedback survey data:', data);
        this.activeTab = 5;
      },
      error: (error) => { 
        console.error('Error loading customer feedback survey:', error);
      }
    });
  }

}
