import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Subject } from 'rxjs';

import { ColumnHeaderModel, GridItem } from 'src/app/core/models/common-datagrid/common-data-grid.model';

import { CommonDatagridService } from 'src/app/core/services/common/datagrid-common.service';
import { CommonDataGridHttpRequestsService } from 'src/app/core/services/http-requests/common-datagrid-http-requests.service';

import { NgbdGridFilterModal } from 'src/app/shared/components/modals/grid-filter/grid-filter.modal.component';
import { NgbdColumnArrangementModal } from 'src/app/shared/components/modals/column-arrangement/column-arrangement-modal.component';
// import { NgbdStartJobModal } from 'src/app/shared/components/modals/start-job/start-job.modal.component';
import { DownloadService } from 'src/app/core/services/common/download.service';
import { CommonDatagridComponent } from 'src/app/shared/components/common-datagrid/common-datagrid.component';
import { NgbdJobsModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-jobs-modal/ngbd-jobs-modal.component';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';
import { JobDetail } from 'src/app/core/models/jobs/jobs.model';
import { SiteHttpRequestsService } from 'src/app/core/services/http-requests/site-http.requests.service';
import { Site } from 'src/app/core/models/site/site.model';
import { EquipmentChecksHttpService } from 'src/app/core/services/http-requests/equipment-checks-http-requests.service';
import { ConditionScale } from 'src/app/core/models/equipment-checks/equipment-checks.model';
import { SurveyHttpRequestsService } from 'src/app/core/services/http-requests/survey-http-requests.service';
import { NgbdFailJobModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-fail-job-modal/ngbd-fail-job-modal.component';
import { AnswerService } from 'src/app/core/services/http-requests/answer-http-requests.service';
import { NgbdPauseJobModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-pause-job-modal/ngbd-pause-job-modal.component';
import { NgbdViewDetailsJobModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-view-details-job-modal/ngbd-view-details-job-modal.component';
import Swal from 'sweetalert2';
import { UsersHttpRequestsService } from 'src/app/core/services/http-requests/users-http-requests.service';
import { NgbdAssignAndBookJobModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-assign-and-book-job-modal/ngbd-assign-and-book-job-modal.component';
import { UserService } from 'src/app/core/services/common/user.service';
import { NgbdCannotLocateJobModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-cannot-locate-job-modal/ngbd-cannot-locate-job-modal.component';

@Component({
  selector: 'app-common-datagrid-widget',
  templateUrl: './common-datagrid-widget.component.html',
  styleUrls: ['./common-datagrid-widget.component.scss']
})
export class CommonDatagridWidgetComponent implements OnInit, OnDestroy {
  @ViewChild(CommonDatagridComponent) datagridComponent!: CommonDatagridComponent;

  private destroy$ = new Subject<void>();
  
  // Route data
  queryParams: any = {};
  
  // Grid data and configuration
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  filterString: string = '';
  gridItems: GridItem[] = [];
  loading: boolean = false;
  columnHeader: ColumnHeaderModel[] = [];
  
  // Search and filter parameters
  searchParams: any = {};
  appliedFilters: any = {};
  

  activeModal?: NgbModalRef;
  isEngineer: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private commonDatagridService: CommonDatagridService,
    private downloadService: DownloadService,
    private httpRequest: CommonDataGridHttpRequestsService,
    private modalService: NgbModal,
    private jobsHttpService: JobsHttpRequestsService,
    private siteHttpService: SiteHttpRequestsService,
    private equipmentChecksService: EquipmentChecksHttpService,
    private surveyHttpService: SurveyHttpRequestsService,
    private usersHttpRequestsService: UsersHttpRequestsService,
    private answerService: AnswerService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Initialize column headers first
    this.initializeColumns();
    this.isEngineer = this.checkIfUserIsEngineer();
    
   this.route.queryParams.subscribe(params => {
      this.filterString = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&&');
      this.loadData(params);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Check if the current user is an engineer based on localStorage
   */
  private checkIfUserIsEngineer(): boolean {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        // Check if the user has an Engineer role
        if (user.role && Array.isArray(user.role)) {
          return user.role.includes('Engineer');
        }
        // If role is a string instead of array
        if (typeof user.role === 'string') {
          return user.role === 'Engineer';
        }
      }
      return false; // Default to false if no user or role found
    } catch (error) {
      console.error('Error checking user role:', error);
      return false; // Default to false on error
    }
  }

  /**
   * Initialize column headers from localStorage or set defaults
   */
  private initializeColumns(): void {
    this.columnHeader = this.commonDatagridService.getColsLocalStorage();
    console.log('Loaded column headers:', this.columnHeader);
  }

 
  loadData(params: any) {
    console.log(params)
    this.loading = true;
    
    const paginationParams = {
      ...params,
      PageNumber: this.currentPage - 1,
      PageSize: this.pageSize
    };

    const countParams = { ...params };
    delete countParams.PageNumber;
    delete countParams.PageSize;

    const data$ = this.httpRequest.getGridData(paginationParams, true, this.isEngineer);
    const count$ = this.httpRequest.getGridDataCount(countParams, true, this.isEngineer);

    // Use forkJoin to execute both requests simultaneously
    forkJoin({
      data: data$,
      count: count$
    }).subscribe({
      next: (response) => {
        this.gridItems = response.data.items || response.data;
        this.totalItems = response.count;
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading grid data:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Handle search event from the dumb component
   */
  onSearch(searchData: any): void {
    this.currentPage = 1;
    this.loadData(searchData);
  }

  /**
   * Handle action events from the dumb component
   */
  onActionSelected(event: {action: string, item: any}) {
    this.isEngineer
    ? this.selectActionEngineer(event.action, event.item)
    : this.selectActionManager(event.action, event.item);
  }

  onBulkActionSelected(event: {action: string, items: any[]}) {
    console.log('Bulk action selected:', event.action, 'for items:', event.items);
    this.selectActionManager(event.action, event.items, true);
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
        }

        if (action === 'Sign Off Jobs') {
          await this.openSignOffModal(job);
          // Reset loading for non-download actions
          this.datagridComponent.resetActionLoading(job.id);
          return;
        }

        if (action === 'Start Job' || action === 'Resume Job') {
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
        }

        if (action === 'Download Excel') {
          // Don't manually reset loading here - the download service subscription will handle it
          this.downloadService.downloadExcel(job).subscribe({
            next: () => {
              console.log('✅ Excel download completed');
              // Loading will be automatically cleared by the subscription in common-datagrid component
            },
            error: () => {
              console.error('❌ Excel download failed');
              // Manually clear loading on error
              this.datagridComponent.resetActionLoading(job.id);
            }
          });
          return;
        }

        if (action === 'Download PDF') {
          // Don't manually reset loading here - the download service subscription will handle it
          this.downloadService.downloadPDF(job).subscribe({
            next: () => {
              console.log('✅ PDF download completed');
              // Loading will be automatically cleared by the subscription in common-datagrid component
            },
            error: () => {
              console.error('❌ PDF download failed');
              // Manually clear loading on error
              this.datagridComponent.resetActionLoading(job.id);
            }
          });
          return;
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

  /**
   * Handle page change events
   */
  onPageChanged(event: any): void {
    this.currentPage = event.page; 
    this.pageSize = event.pageSize;
    this.loadData(this.route.snapshot.queryParams);
  }

  /**
   * Handle page size change events
   */
   onPageSizeChanged(size: number) {
    this.pageSize = size;
    this.currentPage = 1; 
    this.loadData(this.route.snapshot.queryParams);
  }


  /**
   * Get visible columns for the dumb component
   */
  getVisibleColumns(): ColumnHeaderModel[] {
    return this.columnHeader.filter(col => col.visible);
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

  private async openSignOffModal(job: any) {
    // try {
    //   const modalRef = this.modalService.open(NgbdModalSignPendingJob, { 
    //     centered: true, 
    //     size: 'xl' 
    //   });
      
    //   modalRef.componentInstance.jobs = [job.id];
      
    //   modalRef.result.then((result: any) => {
    //     console.log('Sign Off modal result:', result);
    //     this.loadData(this.route.snapshot.queryParams);
    //   }).catch(() => {
    //     console.log('Sign Off modal dismissed');
    //   });

    // } catch (err) {
    //   console.error('Error opening Sign Off modal:', err);
    // }
  }

  /**
   * Open Start Job modal with all required data fetching
   */
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

                  if(result === 'manual fail') {
                    console.warn('⚠️ Job start was manually failed');
                    resolve({ success: false, message: 'Job start was manually failed' });
                  } else if (result === 'manual pause') {
                    console.warn('⚠️ Job start was manually paused');
                    resolve({ success: false, message: 'Job start was manually paused' });
                  } else  {
                    this.loadData(this.route.snapshot.queryParams);
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
        this.loadData(this.route.snapshot.queryParams);
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

  /**
   * Handle manual fail triggered from within the job modal
   */
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


  // Manager actions
  selectActionManager(action: string, job: any, isBatch: boolean = false) {
    console.log('Action selected:', action, job);
    
    const processAction = async () => {
      try {
        if (action === 'View Detail') {
          await this.openViewDetailModal(job);

          this.datagridComponent.resetActionLoading(job.id);
          return;
        } else if (action === 'Assign (and book)' || action === 'Reassign (and book)') {
            await isBatch ? this.openAssignAndBookModal(job): this.openAssignAndBookModal([job]);

            this.datagridComponent.resetActionLoading(job.id);
            return;
        } else if (action === 'Cancel') {
            await isBatch ? this.cancelJob(job): this.cancelJob([job]);

            this.datagridComponent.resetActionLoading(job.id);
            return;
        } else if(action === 'Cannot Locate') {
          await isBatch ? this.openCannotLocateModal(job): this.openCannotLocateModal([job]);

          return;

        } else if (action === 'Unassign') {
            await isBatch ? this.unAssignJob(job): this.unAssignJob([job]);

            this.datagridComponent.resetActionLoading(job.id);
            return;
        } else if(action === 'Sign Off') {
          this.openSignOffModal(job);
        } else if (action === 'Download Excel') {
          this.downloadService.downloadExcel(job).subscribe({
            next: () => {
              console.log('✅ Excel download completed');
              // Loading will be automatically cleared by the subscription in common-datagrid component
            },
            error: () => {
              console.error('❌ Excel download failed');
              // Manually clear loading on error
              this.datagridComponent.resetActionLoading(job.id);
            }
          });
          return;
        } else if (action === 'Download PDF') {
          // Don't manually reset loading here - the download service subscription will handle it
          this.downloadService.downloadPDF(job).subscribe({
            next: () => {
              console.log('✅ PDF download completed');
              // Loading will be automatically cleared by the subscription in common-datagrid component
            },
            error: () => {
              console.error('❌ PDF download failed');
              // Manually clear loading on error
              this.datagridComponent.resetActionLoading(job.id);
            }
          });
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

  private async openAssignAndBookModal(job: JobDetail[]) {
    console.log('Opening Assign and Book modal for job:', job);
    
    // const equipmentIds = job.map(j => j.equipmentId).join(',');
    const equipmentIds = job.map(job => `equipmentIds=${job.id}`).join('&');
    const queryString = `${equipmentIds}`;
    const jobIds = job.map(j => j.id);

    console.log('Fetching users with query:', queryString);

    try {
      const users = await this.usersHttpRequestsService.getManagersUsers(queryString).toPromise();
      
      this.activeModal = this.modalService.open(NgbdAssignAndBookJobModalComponent, { 
        centered: true,
        size: 'lg',
        backdrop: 'static',
        keyboard: false
      });
      
      this.activeModal.componentInstance.selectedJobIds = jobIds;
      this.activeModal.componentInstance.users = this.userService.transformUsersForModal(users);
      this.activeModal.componentInstance.type = 'assignAndBook';
      
      this.activeModal.result.then((result: any) => {
        this.loadData(this.route.snapshot.queryParams);
      }).catch((error: any) => {
        console.error('Error in Assign and Book modal:', error);
      });

    } catch (error) {
      console.error('❌ Error opening Assign and Book modal:', error);
    }
  }
  
  cancelJob(job: JobDetail[]) {
    const jobIds = job.map(j => j.id);
    const payload = {
      jobIds,
      cancelStatusId: 0,
      reasonForCancellation: ""
    }
    this.jobsHttpService.cancelJob(payload).subscribe({
      next: (response) => {
        console.log('Job cancellation successful:', response);
        Swal.fire({
          title: 'Success',
          text: 'Job cancelled successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: 'rgb(60,76,128)',
        }).then(() => {
          this.loadData(this.route.snapshot.queryParams);
        });
      }
      ,
      error: (error) => {
        console.error('Error cancelling job:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to cancel the job. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: 'rgb(60,76,128)',
        });
      }
    });
  }
  
  private openCannotLocateModal(job: JobDetail[]): void {
    const modalRef = this.modalService.open(NgbdCannotLocateJobModalComponent, {
      size: 'fullscreen',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.jobData = job;

    modalRef.result.then((result) => {
      if (result) {
        this.loadData(this.route.snapshot.queryParams);
      }
    }).catch((error) => {
      console.log('❌ Cannot locate job cancelled or failed:', error);
    });
  }
  
  unAssignJob(job: JobDetail[]) {
    const jobIds = job.map(j => j.id);
    this.jobsHttpService.unAssignJob(jobIds).subscribe({
      next: (response) => {
        console.log('Job unassign successful:', response);
        Swal.fire({
          title: 'Success',
          text: 'Unassigned the job successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: 'rgb(60,76,128)',
        }).then(() => {
          this.loadData(this.route.snapshot.queryParams);
        });
      }
      ,
      error: (error) => {
        console.error('Error unassigning job:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to unassign the job. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: 'rgb(60,76,128)',
        });
      }
    });
  }

}
