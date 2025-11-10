import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { ColumnHeaderModel, GridItem } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { CommonDatagridService } from 'src/app/core/services/common/datagrid-common.service';
import { CommonDataGridHttpRequestsService } from 'src/app/core/services/http-requests/common-datagrid-http-requests.service';
import { CommonDatagridComponent } from '../../../common-datagrid/common-datagrid.component';
import { DownloadService } from 'src/app/core/services/common/download.service';
import { JobDetail } from 'src/app/core/models/jobs/jobs.model';
import { UserService } from 'src/app/core/services/common/user.service';
import { AnswerService } from 'src/app/core/services/http-requests/answer-http-requests.service';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';
import { SurveyHttpRequestsService } from 'src/app/core/services/http-requests/survey-http-requests.service';
import { UsersHttpRequestsService } from 'src/app/core/services/http-requests/users-http-requests.service';
import Swal from 'sweetalert2';
import { NgbdAssignAndBookJobModalComponent } from '../ngbd-assign-and-book-job-modal/ngbd-assign-and-book-job-modal.component';
import { NgbdCannotLocateJobModalComponent } from '../ngbd-cannot-locate-job-modal/ngbd-cannot-locate-job-modal.component';
import { NgbdSignOffJobModalComponent } from '../ngbd-sign-off-job-modal/ngbd-sign-off-job-modal.component';
import { NgbdViewDetailsJobModalComponent } from '../ngbd-view-details-job-modal/ngbd-view-details-job-modal.component';

@Component({
  selector: 'app-ngbd-view-jobs-data-grid-modal',
  templateUrl: './ngbd-view-jobs-data-grid-modal.component.html',
  styleUrls: ['./ngbd-view-jobs-data-grid-modal.component.scss']
})
export class NgbdViewJobsDataGridModalComponent implements OnInit {
  
  @Input() parameter: any;

  @ViewChild(CommonDatagridComponent) datagridComponent!: CommonDatagridComponent;
  
  gridItems: GridItem[] = [];
  columnHeader: ColumnHeaderModel[] = [];

  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading: boolean = false;


  gridParameter = { }
  
  constructor(
    public activeModal: NgbActiveModal,
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
    this.gridParameter = this.parameter;
    this.initializeColumns();
  }

  close() {
    this.activeModal?.close();
  }

  private initializeColumns(): void {
      this.columnHeader = this.commonDatagridService.getColsLocalStorage();
    }
  
  loadData(params: any, forceRefresh: boolean = true) {
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

    forkJoin({
      data: data$,
      count: count$
    }).subscribe({
      next: (response) => {
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

  onActionSelected(event: {action: string, item: any}) {
    this.selectActionManager(event.action, event.item);
  }

  onBulkActionSelected(event: {action: string, items: any[]}) {
    this.selectActionManager(event.action, event.items, true);
  }

  selectActionManager(action: string, job: any, isBatch: boolean = false) {
      
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
              },
              error: () => {
                console.error('❌ Excel download failed');
                this.datagridComponent.resetActionLoading(job.id);
              }
            });
            return;
          } else if (action === 'Download PDF') {
            this.downloadService.downloadPDF(job).subscribe({
              next: () => {
              },
              error: () => {
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
      
      const equipmentIds = job.map(job => `equipmentIds=${job.id}`).join('&');
      const queryString = `${equipmentIds}`;
      const jobIds = job.map(j => j.id);
  
  
      try {
        const users = await this.usersHttpRequestsService.getManagersUsers(queryString).toPromise();

        const modalRef = this.modalService.open(NgbdAssignAndBookJobModalComponent, {
          centered: true,
          size: 'fullscreen',
          backdrop: 'static',
          keyboard: false
        });
        
        modalRef.componentInstance.selectedJobIds = jobIds;
        modalRef.componentInstance.users = this.userService.transformUsersForModal(users);
        modalRef.componentInstance.type = 'assignAndBook';
        
        modalRef.result.then((result: any) => {
          if (result) {
            this.loadData(this.gridParameter, false);
          }
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
          Swal.fire({
            title: 'Success',
            text: 'Job cancelled successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: 'rgb(60,76,128)',
          }).then(() => {
            this.loadData(this.gridParameter, false);
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
          this.loadData(this.gridParameter, true);
        }
      }).catch((error) => {
      });
    }
  
    unAssignJob(job: JobDetail[]) {
      const jobIds = job.map(j => j.id);
      this.jobsHttpService.unAssignJob(jobIds).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Success',
            text: 'Unassigned the job successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: 'rgb(60,76,128)',
          }).then(() => {
            this.loadData(this.gridParameter, false);
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
  
    openSignOffModal(job: JobDetail): void {
      const modalRef = this.modalService.open(NgbdSignOffJobModalComponent, {
        size: 'fullscreen',
        centered: true,
        backdrop: 'static'
      });
  
      modalRef.componentInstance.jobData = job;
  
      modalRef.result.then((result) => {
        if (result) {
          this.loadData(this.gridParameter, true);
        }
      }).catch((error) => {
      });
    }

}
