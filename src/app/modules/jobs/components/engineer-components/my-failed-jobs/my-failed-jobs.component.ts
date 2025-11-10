import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { GridItem, ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { JobDetail } from 'src/app/core/models/jobs/jobs.model';
import { CommonDatagridService } from 'src/app/core/services/common/datagrid-common.service';
import { AnswerService } from 'src/app/core/services/http-requests/answer-http-requests.service';
import { CommonDataGridHttpRequestsService } from 'src/app/core/services/http-requests/common-datagrid-http-requests.service';
import { EquipmentChecksHttpService } from 'src/app/core/services/http-requests/equipment-checks-http-requests.service';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';
import { SiteHttpRequestsService } from 'src/app/core/services/http-requests/site-http.requests.service';
import { SurveyHttpRequestsService } from 'src/app/core/services/http-requests/survey-http-requests.service';
import { CommonDatagridComponent } from 'src/app/shared/components/common-datagrid/common-datagrid.component';
import { NgbdColumnArrangementModal } from 'src/app/shared/components/modals/column-arrangement/column-arrangement-modal.component';
import { NgbdGridFilterModal } from 'src/app/shared/components/modals/grid-filter/grid-filter.modal.component';
import { NgbdFailJobModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-fail-job-modal/ngbd-fail-job-modal.component';
import { NgbdJobsModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-jobs-modal/ngbd-jobs-modal.component';
import { NgbdPauseJobModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-pause-job-modal/ngbd-pause-job-modal.component';
import { NgbdViewDetailsJobModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-view-details-job-modal/ngbd-view-details-job-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-failed-jobs',
  templateUrl: './my-failed-jobs.component.html',
  styleUrls: ['./my-failed-jobs.component.scss']
})
export class MyFailedJobsComponent implements OnInit {
  @ViewChild(CommonDatagridComponent) datagridComponent!: CommonDatagridComponent;
  @Output() updateCount = new EventEmitter<boolean>();
  

  gridItems: GridItem[] = [];
  columnHeader: ColumnHeaderModel[] = [];

  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading: boolean = false;

  activeModal?: NgbModalRef;

  gridParameter = {
    jobStatusType: 9, // Failed jobs
  }

  
  constructor(
    private commonDatagridService: CommonDatagridService,
    private httpRequest: CommonDataGridHttpRequestsService,
    private surveyHttpService: SurveyHttpRequestsService,
    private jobsHttpService: JobsHttpRequestsService,
    private siteHttpService: SiteHttpRequestsService,
    private answerService: AnswerService,
    private equipmentChecksService: EquipmentChecksHttpService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
    
  ) { }

  ngOnInit(): void {
    this.initializeColumns();
  }

  private initializeColumns(): void {
    this.columnHeader = this.commonDatagridService.getColsLocalStorage();
    console.log('Loaded column headers:', this.columnHeader);
  }
  
  loadData(params: any, forceRefresh: boolean = false) {
    console.log('Loading data with parameters:', params);
    this.loading = true;
    
    const paginationParams = {
      ...params,
      PageNumber: this.currentPage - 1,
      PageSize: this.pageSize
    };

    const countParams = { ...params };
    delete countParams.PageNumber;
    delete countParams.PageSize;

    const data$ = this.httpRequest.getGridData(paginationParams, forceRefresh);
    const count$ = this.httpRequest.getGridDataCount(countParams, forceRefresh);

    // Use forkJoin to execute both requests simultaneously
    forkJoin({
      data: data$,
      count: count$
    }).subscribe({
      next: (response) => {
        console.log(response)
        this.gridItems = response.data.items || response.data;
        this.totalItems = response.count;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('Error loading grid data:', error);
        this.loading = false;
      }
    });
  }

  onPageChanged(event: any): void {
    this.currentPage = event.page; 
    this.pageSize = event.pageSize;
    this.loadData(this.gridParameter, false);
  }

  onPageSizeChanged(size: number) {
    this.pageSize = size;
    this.currentPage = 1; 
    this.loadData(this.gridParameter, false);
  }

  onSearch(searchData: any): void {
    this.currentPage = 1;
    const searchParams = {
      ...this.gridParameter,
      ...searchData
    };
    this.loadData(searchParams, true); // ← Normal loading
    this.cdr.detectChanges();
  }

  onFilterPopupRequested() {
      this.activeModal?.close();
      
      const modalRef = this.modalService.open(NgbdGridFilterModal, { 
        centered: true, 
        size: 'md' 
      });
      
      modalRef.componentInstance.selectedColumn = this.columnHeader;
      
      modalRef.result.then((result: any) => {
        if (result) {
          this.columnHeader = result;
          this.commonDatagridService.setColsLocalStorage(result);
          console.log('Selected columns:', this.columnHeader);
        }
      }).catch(() => {});
    }
  
    showColumnArrangementPopup() {
      this.activeModal?.close();
      
      const modalRef = this.modalService.open(NgbdColumnArrangementModal, { 
        centered: true, 
        size: 'fullscreen',
        backdrop: 'static', // Prevent closing by clicking outside
        keyboard: false     // Prevent closing with ESC key
      });
      
      modalRef.componentInstance.column = [...this.columnHeader]; // Pass a copy to prevent direct mutation
      
      modalRef.result.then((result: ColumnHeaderModel[]) => {
        if (result && result.length > 0) {
          this.columnHeader = result;
          this.commonDatagridService.setColsLocalStorage(result);
          
        }
      }).catch(() => {
        // Modal dismissed - no action needed
      });
    }

  onActionSelected(event: {action: string, item: any}) {
    console.log('Action selected:', event.action, 'for item:', event.item);
    this.selectActionEngineer(event.action, event.item);
  }

  selectActionEngineer(action: string, job: any) {
    console.log('Action selected:', action, job);
    
    const processAction = async () => {
      try {
        if (action === 'View Detail') {
          await this.openViewDetailModal(job);
          // Reset loading for non-download actions
          this.datagridComponent.resetActionLoading(job.id);
          return;
        } else if (action === 'Start Job' || action === 'Resume Job') {
          console.log('🚀 Starting job:', job.id);
          
          try {
            const result = await this.openStartJobModal(job);
            console.log(result);
            
            if (result && result.success) {
              console.log('✅ Job started successfully');
            } else {
              if(result.message === 'Job start was manually failed') {
                console.log('📝 Job start was failed');
                const failProcess = await this.handleManualFailPauseFromJobModal(job);
              } else if(result.message === 'Job start was manually paused') {
                console.log('📝 Job start was paused');
                const failProcess = await this.handleManualFailPauseFromJobModal(job, false);
              }
            }
            
          } catch (error) {
            console.error('❌ Failed to start job:', error);
            // Handle error - maybe show notification
          } finally {
            // Reset loading state
            this.datagridComponent.resetActionLoading(job.id);
          }
          return;
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Not implemented yet',
            text: 'This feature is not available at the moment.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#405189'
          }).then((result: any) => {
            return;
          });
        }

        // For other actions, reset loading manually
        this.datagridComponent.resetActionLoading(job.id);

      } catch (err) {
        console.error('Error processing action:', err);
        this.datagridComponent.resetActionLoading(job.id);
      }
    };

    processAction();
  }

  private async openViewDetailModal(job: any) {
    try {
      const [survey, jobDetails, currentAnswers] = await Promise.all([
        this.surveyHttpService.getSurveyById(job.surveyId).toPromise(),
        this.jobsHttpService.getJobById(job.id).toPromise(),
        this.answerService.getAnswers(job.id).toPromise(),
      ]);


      const modalRef = this.modalService.open(NgbdViewDetailsJobModalComponent, { 
        centered: true,
        size: 'fullscreen',
        backdrop: 'static',
        keyboard: false
      });
      
      modalRef.componentInstance.job = jobDetails;
      modalRef.componentInstance.survey = survey;
      modalRef.componentInstance.currentAnswers = currentAnswers;
      modalRef.componentInstance.isCompleted = true;

      modalRef.result.then((result: string) => {
        
      }).catch((error: any) => {

      });


    } catch (error) {
      console.error('❌ Error opening View Detail modal:', error);
    }
  }

  private async openStartJobModal(job: GridItem): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // Validate job data first
        if (!job || !job.id) {
          console.error('❌ Invalid job data for Start Job modal');
          reject(new Error('Invalid job data'));
          return;
        }

        console.log('🔄 Fetching all required data for job ID:', job.id);

        // Close any existing modal
        this.activeModal?.close();

        // Fetch job details first to get survey ID
        this.jobsHttpService.getJobById(job.id).subscribe({
          next: (jobDetails: JobDetail) => {
            console.log('✅ Job details fetched successfully:', jobDetails);
            console.log('✅ Job details fetched, survey ID:', jobDetails.surveyId);
            
            // Now fetch all remaining data including survey
            const dataRequests: any = {
              sites: this.siteHttpService.getAllSites(),
              conditionScale: this.equipmentChecksService.getConditionScale()
            };

            // Only fetch survey if surveyId exists
            if (jobDetails.surveyId !== null && jobDetails.surveyId >= 0) {
              dataRequests.survey = this.surveyHttpService.getSurveyById(jobDetails.surveyId);
            }

            forkJoin(dataRequests).subscribe({
              next: (response: any) => {
                console.log('✅ All data fetched successfully:', {
                  sitesCount: response.sites.length,
                  conditionScaleCount: response.conditionScale.length,
                  surveyLoaded: !!response.survey
                });
                
                // Open modal with complete data set
                const modalRef = this.modalService.open(NgbdJobsModalComponent, { 
                  centered: false,
                  size: 'fullscreen',
                  backdrop: 'static',
                  keyboard: false
                });
                
                // Pass all data to modal
                modalRef.componentInstance.job = jobDetails;
                modalRef.componentInstance.sites = response.sites;
                modalRef.componentInstance.conditionScale = response.conditionScale;
                modalRef.componentInstance.survey = response.survey || null; // Pass survey data
                modalRef.componentInstance.jobReference = jobDetails.reference || job.id.toString();
                
                this.activeModal = modalRef;
                
                modalRef.result.then((result: string) => {
                  console.log('✅ Start Job modal completed:', result);
                  this.loadData(this.gridParameter, true);
                  this.updateCount.emit(true);

                  if(result === 'manual fail') {
                    console.warn('⚠️ Job start was manually failed');
                    resolve({ success: false, message: 'Job start was manually failed' });
                  } else if (result === 'manual pause') {
                    console.warn('⚠️ Job start was manually paused');
                    resolve({ success: false, message: 'Job start was manually paused' });
                  } else  {
                    this.activeModal = undefined;
                    resolve(result);                
                  }
                  
                  
                }).catch((error: any) => {
                  console.log('Start Job modal dismissed:', error);
                  this.activeModal = undefined;
                  
                  if (error === 'cancel' || error === 'dismiss' || error === 0) {
                    resolve(undefined);
                  } else {
                    reject(error);
                  }
                });
              },
              error: (error: Error) => {
                console.error('❌ Failed to fetch required data:', error);
                reject(new Error(`Failed to load data: ${error.message}`));
              }
            });
          },
          error: (error: Error) => {
            console.error('❌ Failed to fetch job details:', error);
            reject(new Error(`Failed to load job details: ${error.message}`));
          }
        });

      } catch (err) {
        console.error('❌ Critical error opening Start Job modal:', err);
        reject(err);
      }
    });
  }

  private async openManualFailPauseModal(job: any, isFail: boolean = true): Promise<void> {
      try {
        const [categories, survey, jobDetails, currentAnswers] = await Promise.all([
          isFail 
            ? this.jobsHttpService.getJobFailureCategories().toPromise()
            : this.jobsHttpService.getJobPauseCategories().toPromise(),
          this.surveyHttpService.getSurveyById(job.surveyId).toPromise(),
          this.jobsHttpService.getJobById(job.id).toPromise(),
          this.answerService.getAnswers(job.id).toPromise(),
        ]);
  
        console.log('✅ Data fetched successfully');
  
        const modalComponent = isFail ? NgbdFailJobModalComponent : NgbdPauseJobModalComponent;
        const modalRef = this.modalService.open(modalComponent, { 
          centered: true,
          size: 'fullscreen',
          backdrop: 'static',
          keyboard: false
        });
        
        modalRef.componentInstance.job = jobDetails;
        modalRef.componentInstance.survey = survey;
        modalRef.componentInstance.currentAnswers = currentAnswers;
        if (isFail) {
          modalRef.componentInstance.failureCategories = categories;
        } else {
          modalRef.componentInstance.pauseCategories = categories;
        }
  
        modalRef.result.then((result: string) => {
          this.loadData(this.gridParameter, true);
          this.activeModal = undefined;
        }).catch((error: any) => {
          console.log('Fail/Pause Job modal dismissed:', error);
          this.activeModal = undefined;
        });
  
  
      } catch (error) {
        console.error('❌ Error opening Manual Fail modal:', error);
        throw new Error(`Failed to open manual fail modal: ${error}`);
      }
    }

  private async handleManualFailPauseFromJobModal(job: any, isFail: boolean = true): Promise<void> {
    try {
      if(isFail) {
        console.log('🔄 Handling manual fail from job modal for job ID:', job.id);
        await this.openManualFailPauseModal(job);
      } else {
        console.log('🔄 Handling manual fail from job modal for job ID:', job.id);
        await this.openManualFailPauseModal(job, false);
      }
     
    } catch (error) {
      console.error('❌ Error handling manual fail/pause from job modal:', error);
    }
  }

}
