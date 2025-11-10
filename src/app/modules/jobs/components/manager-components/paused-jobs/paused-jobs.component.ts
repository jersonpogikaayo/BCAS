import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { User } from 'src/app/core/models/auth-user.model';
import { GridItem, ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { JobDetail } from 'src/app/core/models/jobs/jobs.model';
import { CommonDatagridService } from 'src/app/core/services/common/datagrid-common.service';
import { DownloadService } from 'src/app/core/services/common/download.service';
import { UserService } from 'src/app/core/services/common/user.service';
import { AnswerService } from 'src/app/core/services/http-requests/answer-http-requests.service';
import { CommonDataGridHttpRequestsService } from 'src/app/core/services/http-requests/common-datagrid-http-requests.service';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';
import { SurveyHttpRequestsService } from 'src/app/core/services/http-requests/survey-http-requests.service';
import { UsersHttpRequestsService } from 'src/app/core/services/http-requests/users-http-requests.service';
import { CommonDatagridComponent } from 'src/app/shared/components/common-datagrid/common-datagrid.component';
import { NgbdAssignAndBookJobModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-assign-and-book-job-modal/ngbd-assign-and-book-job-modal.component';
import { NgbdCannotLocateJobModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-cannot-locate-job-modal/ngbd-cannot-locate-job-modal.component';
import { NgbdViewDetailsJobModalComponent } from 'src/app/shared/components/modals/jobs/ngbd-view-details-job-modal/ngbd-view-details-job-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-paused-jobs',
  templateUrl: './paused-jobs.component.html',
  styleUrls: ['./paused-jobs.component.scss']
})
export class PausedJobsComponent implements OnInit {
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
    jobStatusType: 8, // Paused jobs
  }

  availableUsers: User[] = [];
  selectedItems: any[] = [];
  constructor(
    private commonDatagridService: CommonDatagridService,
    private httpRequest: CommonDataGridHttpRequestsService,
    private surveyHttpService: SurveyHttpRequestsService,
    private jobsHttpService: JobsHttpRequestsService,
    private usersHttpRequestsService: UsersHttpRequestsService,
    private downloadService: DownloadService,
    private answerService: AnswerService,
    private userService: UserService,
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

  loadData(params: any, forceRefresh: boolean = true) {
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

    const data$ = this.httpRequest.getGridData(paginationParams, forceRefresh, false);
    const count$ = this.httpRequest.getGridDataCount(countParams, forceRefresh, false);

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
      this.loadData(searchParams, true);
      this.cdr.detectChanges();
    }
  
onFilterPopupRequested() {
    this.activeModal?.close();
    
    // const modalRef = this.modalService.open(NgbdGridFilterModal, { 
    //   centered: true, 
    //   size: 'md' 
    // });
    
    // modalRef.componentInstance.selectedColumn = this.columnHeader;
    
    // modalRef.result.then((result: any) => {
    //   if (result) {
    //     this.columnHeader = result;
    //     this.commonDatagridService.setColsLocalStorage(result);
    //     console.log('Selected columns:', this.columnHeader);
    //   }
    // }).catch(() => {});
  }
    
  showColumnArrangementPopup() {
    this.activeModal?.close();
    
    // const modalRef = this.modalService.open(NgbdColumnArrangementModal, { 
    //   centered: true, 
    //   size: 'fullscreen',
    //   backdrop: 'static', // Prevent closing by clicking outside
    //   keyboard: false     // Prevent closing with ESC key
    // });
    
    // modalRef.componentInstance.column = [...this.columnHeader]; // Pass a copy to prevent direct mutation
    
    // modalRef.result.then((result: ColumnHeaderModel[]) => {
    //   if (result && result.length > 0) {
    //     this.columnHeader = result;
    //     this.commonDatagridService.setColsLocalStorage(result);
        
    //   }
    // }).catch(() => {
    //   // Modal dismissed - no action needed
    // });
  }
  
  onActionSelected(event: {action: string, item: any}) {
    console.log('Action selected:', event.action, 'for item:', event.item);
    this.selectActionManager(event.action, event.item);
  }

  onBulkActionSelected(event: {action: string, items: any[]}) {
    console.log('Bulk action selected:', event.action, 'for items:', event.items);
    this.selectActionManager(event.action, event.items, true);
  }

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
        if (result) {
          this.loadData(this.gridParameter, false);
          this.updateCount.emit(true);
        }
      }).catch((error: any) => {
        console.error('Error in Assign and Book modal:', error);
      });

    } catch (error) {
      console.error('❌ Error opening Assign and Book modal:', error);
    }
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
          this.loadData(this.gridParameter, true);
          this.updateCount.emit(true);
        }
      }).catch((error) => {
        console.log('❌ Cannot locate job cancelled or failed:', error);
      });
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
          this.loadData(this.gridParameter, false);
          this.updateCount.emit(true);
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
          this.loadData(this.gridParameter, false);
          this.updateCount.emit(true);
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
