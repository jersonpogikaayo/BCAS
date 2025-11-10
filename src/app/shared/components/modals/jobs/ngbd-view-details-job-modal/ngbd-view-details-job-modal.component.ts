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
import { GridItem } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { JobsDetailsComponent } from '../../../jobs/jobs-details/jobs-details.component';
import { JobsAttachmentsComponent } from '../../../jobs/jobs-attachments/jobs-attachments.component';

@Component({
  selector: 'app-ngbd-view-details-job-modal',
  templateUrl: './ngbd-view-details-job-modal.component.html',
  styleUrls: ['./ngbd-view-details-job-modal.component.scss']
})
export class NgbdViewDetailsJobModalComponent implements OnInit {
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
  
  customerFeedackSurvey!: Survey;


  //Linked Jobs
  currentPage: number = 0;
  pageSize: number = 10;
  loading: boolean = false;
  cols: any[] = 
    [
      {
        prettyName: 'Id',
        technicalName: 'id',
        visible: true
      }, {
        prettyName: 'Title',
        technicalName: 'title',
        visible: true
      }, {
        prettyName: 'Asset Number',
        technicalName: 'assetNumber',
        visible: true
      }, {
        prettyName: 'Serial Number',
        technicalName: 'serialNumber',
        visible: true
      }, {
        prettyName: 'Due Date',
        technicalName: 'dueDate',
        visible: true
      }
  ];
  gridItems: GridItem[] = [];

  @ViewChild('jobsDetails') jobsDetailsComponent!: JobsDetailsComponent;
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
    this.loadCustomerFeedbackSurvey();
    this.getLinkedJobs();
  }

  close() {
    this.activeModal.close({
      success: false,
      action: 'close'
    });
  }

  changeTab(index: number) {
    this.activeTab = index;
    this.cdr.detectChanges();
  }

  handleNextClick(): void {
    this.surveyProcessComponent.proceedToNext();
  }

  surveyBack(): void {
    this.surveyProcessComponent.goToPreviousStep();
  }

  onSurveyStepChanged(event: any): void {
    this.surveyActiveTab = (event.currentStep);
    this.isLastStep = event.isLastStep;
  }

  async onSurveyCompleted(surveyData: any) {
    if(this.activeTab === 0) {
      this.activeTab = 1;
    } else {
      this.activeTab = 3;
    }   
  }

  loadCustomerFeedbackSurvey(): void {
    this.surveyHttpRequestsService.getCustomerFeedbackSurvey().subscribe({
      next: (data: Survey) => { 
        this.customerFeedackSurvey = data;
        this.isStepLoading = false;
      },
      error: (error) => { 
        console.error('Error loading customer feedback survey:', error);
      }
    });
  }

  getLinkedJobs() {
    this.loading = true;
    this.jobsHttpRequestsService.getLinkedJobs(this.job.id).subscribe({
      next: (data: GridItem[]) => { 
        this.loading = false;
        this.gridItems = data;
        console.log('Linked jobs:', data);
      },
      error: (error) => { 
        this.loading = false;
        console.error('Error loading linked jobs:', error);}
    });
  }

  addNote() {
    Swal.fire({
      title: 'Add Note',
      input: 'textarea',
      inputPlaceholder: 'Enter your note here...',
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      preConfirm: (note) => {
        if (!note || !note.trim()) {
          Swal.showValidationMessage('Note cannot be empty');
          return false;
        }
        
        const payload = {
          Note: note.trim(),
          Date: this.commonService.formatDateTime()
        };

        return new Promise((resolve, reject) => {
          this.jobsHttpRequestsService.addJobNotes(this.job.id, payload).subscribe({
            next: (response) => {
              console.log('Note saved successfully:', response);
              this.jobsDetailsComponent.loadNotes();
              resolve(response);
            },
            error: (error) => {
              console.error('Error adding note:', error);
              Swal.showValidationMessage('Failed to save note. Please try again.');
              reject(error);
            }
          });
        });
      },
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Success!',
          text: 'Note added successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

}
