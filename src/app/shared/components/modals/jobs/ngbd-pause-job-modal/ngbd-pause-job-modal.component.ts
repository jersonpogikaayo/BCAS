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
  selector: 'app-ngbd-pause-job-modal',
  templateUrl: './ngbd-pause-job-modal.component.html',
  styleUrls: ['./ngbd-pause-job-modal.component.scss']
})
export class NgbdPauseJobModalComponent implements OnInit {
  @Input() survey!: Survey;
  @Input() job!: JobDetail;
  @Input() currentAnswers!: any;
  @Input() pauseCategories!: any;
  @Input() isCompleted: boolean = false;

  @ViewChild('surveyProcess') surveyProcessComponent!: SurveyProcessComponent;
  
  activeTab = 1;
  isStepLoading: boolean = false;

  // Form properties
  pauseJobForm!: FormGroup;
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
    this.initializePauseJobForm();
    this.surveyCopy = JSON.parse(JSON.stringify(this.survey));
  }

  private initializePauseJobForm(): void {
    this.pauseJobForm = this.formBuilder.group({
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


  get f() {
    return this.pauseJobForm.controls;
  }

  get s() {
    return this.signatureForm.controls;
  }

  next() {
    if(this.activeTab == 1) {
      this.submitted = true;
      this.isStepLoading = true;
      if (this.pauseJobForm.invalid) {
        console.log('Form is invalid');
        this.isStepLoading = false;
        return;
      } else {
        this.isStepLoading = false;
        this.activeTab++;
      }
    } else if(this.activeTab == 4) {
      this.handleSubmitPauseJob('submit');
    } else {
      this.activeTab++;
      this.isStepLoading = false;
    }

  }

  submitPauseJob(): void {
    this.submitted = true;

    if (this.pauseJobForm.invalid) {
      console.log('Form is invalid');
      return;
    }

  }

  onTestEquipmentSelected(selectedEquipments: TestEquipmentDisplay[]): void {
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

  onSignatureCaptured(event: any) {
    this.signatureForm.patchValue({
      signature: event});
  }

  handleSubmitPauseJob(type: string = 'sign_off_later'): void {
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

    if (this.pauseJobForm.invalid || this.signatureForm.invalid) {
      this.isStepLoading = false;
      console.log('Form validation failed');
      return;
    }
    
    const payload = {
      image: this.commonService.removeBase64Prefix(this.signatureForm.get('signature')?.value),
      fileExtension: "png",
      name: this.signatureForm.get('name')?.value,
      detail: this.pauseJobForm.get('additionalNotes')?.value,
      jobStatusId: this.pauseJobForm.get('reason')?.value,
      submissionTime: this.commonService.formatDateTime()
    };
    
    this.jobsHttpRequestsService.pauseJob(this.job.id, payload).subscribe({
      next: () => {
        this.activeModal?.close('failed');
      },
      error: (error) => {
        this.isStepLoading = false;
        console.error('Error failing job:', error);
      }
    });
  }

}
