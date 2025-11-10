import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConditionScale } from 'src/app/core/models/equipment-checks/equipment-checks.model';
import { JobDetail, JobProcessPayload } from 'src/app/core/models/jobs/jobs.model';
import { Site } from 'src/app/core/models/site/site.model';
import { EquipmentChecksComponent } from '../../../jobs/equipment-checks/equipment-checks.component';
import { EquipmentChecksService } from 'src/app/core/services/common/equipment-checks.service';
import { EquipmentChecksHttpService } from 'src/app/core/services/http-requests/equipment-checks-http-requests.service';
import { forkJoin } from 'rxjs';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';
import { Survey } from 'src/app/core/models/survey/survey.model';
import { SurveyProcessComponent } from 'src/app/shared/components/survey-process/survey-process.component';
import { TestEquipmentDisplay } from 'src/app/core/models/test-equipments/test-equipments.model';
import { TestEquipmentService } from 'src/app/core/services/http-requests/test-equipment-requests.service';
import { JobSummaryData } from '../../../jobs/jobs-summary/jobs-summary.component';
import { AnswerService } from 'src/app/core/services/http-requests/answer-http-requests.service';
import Swal from 'sweetalert2';
import { CommonService } from 'src/app/core/services/common/common.service';
import { SurveyHttpRequestsService } from 'src/app/core/services/http-requests/survey-http-requests.service';

@Component({
  selector: 'app-ngbd-jobs-modal',
  templateUrl: './ngbd-jobs-modal.component.html',
  styleUrls: ['./ngbd-jobs-modal.component.scss']
})
export class NgbdJobsModalComponent implements OnInit {
  @Input() job!: JobDetail;
  @Input() sites: Site[] = [];
  @Input() conditionScale: ConditionScale[] = [];
  @Input() survey!: Survey;
  @Input() jobReference: string = '';
  @Input() isCompleted: boolean = false;
  @Output() intermediateResult = new EventEmitter<string>();
  
  @ViewChild(EquipmentChecksComponent) equipmentChecksComponent!: EquipmentChecksComponent;
  @ViewChild('surveyProcess') surveyProcessComponent!: SurveyProcessComponent;

  activeTab = 0;
  surveyActiveTab = 0;
  isLastStep = false;

  firstStep = 'Survey Process';
  isLoading = false;
  isLoadingSignOffLater = false;
  submitted = false;

  signatureForm: FormGroup;
  surveyData: any = null;
  currentAnswers: any = null;
  // Store form data for each step
  private stepFormData: { [key: number]: any } = {};
  private equipmentFormData: any = null;
  private selectedTestEquipments: TestEquipmentDisplay[] = [];

  customerFeedackSurvey!: Survey;
  
  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private equipmentChecksService: EquipmentChecksService,
    private equipmentChecksHttpService: EquipmentChecksHttpService,
    private jobsHttpService: JobsHttpRequestsService,
    private testEquipmentService: TestEquipmentService,
    private answerService: AnswerService,
    private commonService: CommonService,
    private surveyHttpRequestsService: SurveyHttpRequestsService
  ) {
    this.signatureForm = this.formBuilder.group({
      name: ['', Validators.required],
      signature: ['', Validators.required],
    });
  }

  ngOnInit() {
    console.log('🚀 Jobs modal initialized with:', {
      job: this.job,
      sitesCount: this.sites.length,
      conditionScaleCount: this.conditionScale.length,
      surveyLoaded: !!this.survey
    });
  }

  get f() {
    return this.signatureForm.controls;
  }

  previousStep() {
    this.saveCurrentStepData();
    
    if (this.activeTab > 0) {
      this.activeTab--;
      
      // Restore data for the step we're going back to
      setTimeout(() => {
        this.restoreStepData(this.activeTab);
      }, 100);
    }
  }

  /**
   * Handle survey step changes
   */
  onSurveyStepChanged(event: any): void {
    console.log('Survey step changed:', event);
    this.surveyActiveTab = (event.currentStep);
    this.isLastStep = event.isLastStep;
  }

  /**
   * Handle survey back button
   */
  surveyBack(): void {
    this.surveyProcessComponent.goToPreviousStep();
  }

  /**
   * Handle next button
   */
  handleNextClick(): void {
    this.surveyProcessComponent.proceedToNext();
  }

  /**
   * Handle survey completion
   */
  async onSurveyCompleted(surveyData: any) {
    // Move to next tab or close modal
    try {
      if(this.activeTab === 1) {
        this.loadExistingAnswersIntoForm();
        this.surveyData = surveyData;
        this.activeTab = 2;
      } else if(this.activeTab === 5) {
       this.activeModal?.close('finished');
      }
      
    } catch (error) {
      console.error('Error processing equipment checks:', error);
      this.isLoading = false;
    }
    
  }

  async submitEquipmentPreCheck() {
    if (!this.equipmentChecksComponent) {
      console.error('Equipment checks component not found');
      return;
    }

    // Get form data from child component
    const equipmentData = this.equipmentChecksComponent.getFormData();
    

    // Validate the form
    if (!this.equipmentChecksComponent.validateForm()) {
      this.equipmentChecksComponent.markAllFieldsAsTouched();
      return;
    }

    // Store the form data before moving to next step
    this.stepFormData[0] = equipmentData.formValue;
    this.equipmentFormData = equipmentData.formValue;

    // Form is valid, proceed with submission
    this.isLoading = true;
    
    try {
      // Process the form data
      await this.processEquipmentChecks(equipmentData.formValue);
      
      // Wait for existing answers to load before proceeding
      await this.loadExistingAnswersIntoForm();
      
      // Move to next tab only after both operations complete
      this.activeTab = 1;
      this.isLoading = false;
    } catch (error) {
      console.error('Error processing equipment checks:', error);
      this.isLoading = false;
    }
  }

  /**
   * Simplified equipment processing - no need to load survey
   */
  private async processEquipmentChecks(formValue: any): Promise<void> {
    try {
      console.log('🔄 Processing equipment checks:', formValue);

      // Create equipment payloads and execute API calls
      const payloads = this.equipmentChecksService.createEquipmentPayloads(formValue);
      
      const requests = forkJoin({
        integrity: this.equipmentChecksHttpService.updateEquipmentIntegrity(payloads.equipment),
        clinicalDesc: this.equipmentChecksHttpService.updateClinicalDescription(payloads.clinical),
        conditionScale: this.equipmentChecksHttpService.updateConditionScale(payloads.condition)
      });

      await requests.toPromise();
      console.log('✅ Equipment updates completed');

      // Start job process
      await this.startJobProcess();
      
      console.log('✅ Job started successfully, survey already loaded');
      
    } catch (error) {
      console.error('❌ Error in processEquipmentChecks:', error);
      throw error;
    }
  }

  /**
   * Simplified start job process - no survey loading needed
   */
  private async startJobProcess(): Promise<void> {
    try {
      const jobProcessPayload: JobProcessPayload = {
        name: `Equipment checks completed for ${this.job.title || 'Job'}`,
        detail: 'Equipment integrity checks have been completed successfully',
        jobStatusId: 0,
        submissionTime:''
      };

      const startJobResponse = await this.jobsHttpService.startJob(this.job.id, jobProcessPayload).toPromise();
      
      if (!startJobResponse) {
        throw new Error(startJobResponse || 'Failed to start job');
      }

      console.log('✅ Job started successfully');

    } catch (error) {
      console.error('❌ Error starting job:', error);
      throw error;
    }
  }

  private async loadExistingAnswersIntoForm(): Promise<void> {
    console.log('Loading existing answers for job:', this.job.id);

    try {
      const response = await this.answerService.getAnswers(this.job.id).toPromise();
      console.log('Existing answers loaded:', response);
      this.currentAnswers = response;
    } catch (error) {
      console.error('Failed to load existing answers:', error);
      // Continue without existing answers - this is not a blocking error
    }
  }

  submitSignOff(type: string) {
    this.submitted = true;
    const payload = {
      image: this.commonService.removeBase64Prefix(this.signatureForm.get('signature')?.value),
      fileExtension: "png",
      name: this.signatureForm.get('name')?.value,
      detail: "",
      jobStatusId: 0,
      submissionTime: this.commonService.formatDateTime()
    };

    if (type === 'signOffLater') {
      this.isLoadingSignOffLater = true;

      this.jobsHttpService.pendingReviewJob(this.job.id, '').subscribe({
        next: () => {
          this.isLoadingSignOffLater = false;
          this.activeModal?.close('signOffLater');
        },
        error: (error) => {
          console.error('Error setting job to pending review:', error);
          this.isLoadingSignOffLater = false;
          Swal.fire({
            title: 'Error',
            text: 'Failed to process the job. Please try again.',
            icon: 'error',
            confirmButtonText: 'Okay',
            confirmButtonColor: 'rgb(60,76,128)',
          });
        }
      });
    } else {
       if (this.signatureForm.invalid) {
        Swal.fire({
          title: 'Warning',
          text: 'Name and signature is required.',
          icon: 'warning',
          confirmButtonText: 'Okay',
          confirmButtonColor: 'rgb(60,76,128)',
        });
        return;
      }

      this.isLoading = true;
      this.jobsHttpService.pendingReviewJob(this.job.id, '').subscribe({
        next: () => {
          this.jobsHttpService.completeJob(this.job.id, payload).subscribe({
            next: (response) => {
              console.log('Job completed successfully:', response);
              this.isLoading = false;
              Swal.fire({
                title: 'Do you want to complete the customer feedback survey?',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                allowOutsideClick: false,
                confirmButtonColor: 'rgb(60,76,128)',
              }).then((result) => {
                if(result.isConfirmed) {
                  this.surveyHttpRequestsService.getCustomerFeedbackSurvey().subscribe({
                    next: (data: Survey) => { 
                      this.customerFeedackSurvey = data;
                      console.log('Customer feedback survey data:', data);
                      this.surveyActiveTab = 0;
                      this.isLastStep = false;
                      this.nextStep();
                    }
                  }
                )
                } else {
                  // this.commonService.reloadComponent();
                  this.activeModal?.close('finished');
                }
              }) 
            },
            error: (error) => {
              console.error('Error completing job:', error);
              this.isLoading = false;
              Swal.fire({
                title: 'Error',
                text: 'Failed to complete the job. Please try again.',
                icon: 'error',
                confirmButtonText: 'Okay',
                confirmButtonColor: 'rgb(60,76,128)',
              });
            }
          });
        },
        error: (error) => {
          console.error('Error setting job to pending review:', error);
          this.isLoading = false;
          Swal.fire({
            title: 'Error',
            text: 'Failed to process the job. Please try again.',
            icon: 'error',
            confirmButtonText: 'Okay',
            confirmButtonColor: 'rgb(60,76,128)',
          });
        }
      });
    }
   
  }

  manualFail() {
    console.log('Manual fail clicked');
    Swal.fire({
      title: 'Warning',
      html:
        'This would fail the survey' +
        '<br><br>If you wish to proceed please click continue.',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Continue and Fail',
      confirmButtonColor: 'rgb(60,76,128)',
    }).then((result: any) => {
      if(result.isConfirmed) {
        console.log('Proceeding with manual fail');
        this.intermediateResult.emit('manual fail');
        // this.activeModal?.close('manual fail');
      }
    });
  }

  pauseJob() {
    console.log('Pause job clicked');
    Swal.fire({
      title: 'Warning',
      html:
        'This would pause the survey' +
        '<br><br>If you wish to proceed please click continue.',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Continue and pause',
      confirmButtonColor: 'rgb(60,76,128)',
    }).then((result: any) => {
      if(result.isConfirmed) {
        console.log('Proceeding with pause fail');
        this.activeModal?.close('manual pause');
      }
    });
  }

  cannotLocateJob() {
    Swal.fire({
      title: 'Warning',
      html:
        'Are you sure you want to mark this job as cannot locate?' +
        '<br><br>If you wish to proceed please click continue.',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Continue and mark as cannot locate',
      confirmButtonColor: 'rgb(60,76,128)',
    }).then((result: any) => {
      if(result.isConfirmed) {
        console.log('Proceeding with cannot locate');
        this.activeModal?.close('cannot locate');
      }
    });
  }

  surveyFailed(event: any) {
    this.intermediateResult.emit('manual fail');
    // this.activeModal?.close('manual fail');
  }

  close() {
    this.activeModal.close({
      success: false,
      action: 'close'
    });
  }

  /**
   * Handle back from equipment
   */
  isBackFromEquipment(): void {
    this.activeTab = 1;
  }


  // Method to restore equipment data
  private restoreEquipmentData(): void {
    if (this.equipmentChecksComponent && this.equipmentFormData) {
      console.log('🔄 Restoring equipment data:', this.equipmentFormData);
      this.equipmentChecksComponent.restoreFormData(this.equipmentFormData);
    }
  }

  // Method to restore data for any step
  private restoreStepData(stepIndex: number): void {
    switch (stepIndex) {
      case 0: // Equipment checks
        this.restoreEquipmentData();
        break;
      case 1: // Survey
        // Restore survey data if needed
        break;
      // Add other cases
    }
  }

  onTestEquipmentSelected(selectedEquipments: TestEquipmentDisplay[]): void {
    console.log('Test equipments selected in modal:', selectedEquipments);
    this.selectedTestEquipments = selectedEquipments;
    
    // Optionally save immediately when selection changes
    // this.saveTestEquipmentSelection();
  }


  private saveCurrentStepData(): void {
    if (this.activeTab === 0 && this.equipmentChecksComponent) {
      try {
        const equipmentData = this.equipmentChecksComponent.getFormData();
        this.stepFormData[0] = equipmentData.formValue;
        this.equipmentFormData = equipmentData.formValue;
      } catch (error) {
        console.error('Error saving equipment data:', error);
      }
    }
    
    // Save test equipment selection when leaving test equipment step (tab 2)
    if (this.activeTab === 2) {
      console.log('Leaving test equipment tab, saving selection...');
      this.saveTestEquipmentSelection();
    }
  }


  /**
   * Override nextStep to save test equipment when leaving that tab
   */
  async nextStep() {
    console.log('🔄 Next step clicked, current tab:', this.activeTab);
    
    try {
      // Save current step data first
      await this.saveCurrentStepDataAsync();
      
      // Move to next tab only after successful save
      if (this.activeTab < 5) {
        this.activeTab++;
        console.log('📍 Moved to tab:', this.activeTab);
      }
    } catch (error) {
      console.error('❌ Error saving step data, not proceeding to next step:', error);
      // Optionally show user-friendly error message
      // this.showErrorMessage('Failed to save data. Please try again.');
    }
  }

    /**
   * Async version of saveCurrentStepData
   */
  private async saveCurrentStepDataAsync(): Promise<void> {
    console.log('💾 Saving current step data for tab:', this.activeTab);
    
    switch (this.activeTab) {
      case 0: // Equipment checks
        await this.saveEquipmentChecksData();
        break;
        
      case 2: // Test equipment
        await this.saveTestEquipmentSelection();
        break;
        
      case 3: // Any other step
        // Add other step saving logic here
        break;
        
      default:
        console.log('No save logic for tab:', this.activeTab);
    }
  }

    /**
   * Save equipment checks data
   */
  private async saveEquipmentChecksData(): Promise<void> {
    if (!this.equipmentChecksComponent) {
      console.log('No equipment checks component to save');
      return;
    }

    try {
      const equipmentData = this.equipmentChecksComponent.getFormData();
      
      // Validate before saving
      if (!this.equipmentChecksComponent.validateForm()) {
        throw new Error('Equipment checks form is invalid');
      }
      
      // Store locally
      this.stepFormData[0] = equipmentData.formValue;
      this.equipmentFormData = equipmentData.formValue;
      
      // Save to backend
      await this.processEquipmentChecks(equipmentData.formValue);
      
      console.log('✅ Equipment checks data saved successfully');
    } catch (error) {
      console.error('❌ Error saving equipment checks:', error);
      throw error;
    }
  }

  /**
   * Enhanced test equipment save with better error handling
   */
  private async saveTestEquipmentSelection(): Promise<void> {
    console.log('💾 Attempting to save test equipment selection...');
    console.log('Selected equipments:', this.selectedTestEquipments);
    
    if (!this.selectedTestEquipments || this.selectedTestEquipments.length === 0) {
      console.log('ℹ️ No test equipment selected, skipping submission');
      return; // Not an error, just nothing to save
    }

    if (!this.job?.id) {
      throw new Error('No job ID available for test equipment submission');
    }

    try {
      console.log('🔄 Saving test equipment selection...');
      
      // Create payload with test equipment IDs
      const testEquipmentIds = this.selectedTestEquipments.map(equipment => equipment.id);
      
      console.log('📦 Payload - Job ID:', this.job.id);
      console.log('📦 Payload - Test equipment IDs:', testEquipmentIds);
      
      // Call the API
      const response = await this.testEquipmentService.submitTestEquipment(this.job.id, testEquipmentIds).toPromise();
      
      console.log('📨 API Response:', response);
      
      if (response?.success || response) {
        console.log('✅ Test equipment selection saved successfully');
      } else {
        throw new Error('Test equipment submission failed');
      }
      
    } catch (error) {
      console.error('❌ Error saving test equipment selection:', error);
    }
  }

  getSummaryData(): JobSummaryData {
    console.log(
      {
      equipmentChecks: this.equipmentFormData,
      surveyData: this.surveyData,
      testEquipments: this.selectedTestEquipments,
      jobDetails: this.job
    }
    );
    return {
      equipmentChecks: this.equipmentFormData,
      surveyData: this.surveyData,
      testEquipments: this.selectedTestEquipments,
      jobDetails: this.job
    };
  }

  onSignatureCaptured(event: any) {
    this.signatureForm.patchValue({
      signature: event});
      console.log(this.signatureForm.value)
  }
  
}
