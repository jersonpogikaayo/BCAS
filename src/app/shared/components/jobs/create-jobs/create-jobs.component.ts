import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Equipment } from 'src/app/core/models/equipment/equipment.model';
import { JobDetail } from 'src/app/core/models/jobs/jobs.model';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';
import { JobsDetailsComponent } from '../jobs-details/jobs-details.component';
import { SurveyHttpRequestsService } from 'src/app/core/services/http-requests/survey-http-requests.service';
import { Survey, SurveySelectionEquipment } from 'src/app/core/models/survey/survey.model';
import { User } from 'src/app/core/models/auth-user.model';
import { ColumnHeaderModel, GridItem } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { EquipmentsHttpRequestsService } from 'src/app/core/services/http-requests/equipment-http-requests.service';
import { forkJoin } from 'rxjs';
import { EquipmentDatagridService } from 'src/app/core/services/common/equipment-datagrid.service';
import { UsersHttpRequestsService } from 'src/app/core/services/http-requests/users-http-requests.service';
import { UserService } from 'src/app/core/services/common/user.service';
import { SimpleUser } from 'src/app/core/models/user/user.model';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdViewEquipmentDetailsModalComponent } from '../../modals/equipments/ngbd-view-equipment-details-modal/ngbd-view-equipment-details-modal.component';

@Component({
  selector: 'app-create-jobs',
  templateUrl: './create-jobs.component.html',
  styleUrls: ['./create-jobs.component.scss']
})
export class CreateJobsComponent implements OnInit {
  @Input() isRaisedJob: boolean = true;
  @Input() equipment: Equipment[] = [];
  @Output() createJobFinished = new EventEmitter<boolean>();
  
  @ViewChild(JobsDetailsComponent) jobDetailsComponent!: JobsDetailsComponent;
  
  activeTab: number = 0;

  jobTypes: any[] = [];

  selectedJobType: any = null;
  jobDetails!: JobDetail;
  currentJobDetails: any = null;
  surveys: SurveySelectionEquipment[] = [];
  selectedEquipmentSurvey: any[] = [];
  selectedUser: any = JSON.parse(localStorage.getItem('currentUser') || '{}');

  // Manager variables - Is not Raised Job
  gridItems: GridItem[] = [];
  columnHeader: ColumnHeaderModel[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  gridParameter = { };
  selectedEquipment: any[] = [];
  isLoading: boolean = false;
  qualifiedUsers: SimpleUser[] = [];
  bookedDate: string = '';
  constructor(
    private httpRequest: EquipmentsHttpRequestsService,
    private equipmentDatagridService: EquipmentDatagridService,
    private jobsHttpRequestsService: JobsHttpRequestsService,
    private surveyHttpRequestsService: SurveyHttpRequestsService,
    private usersHttpRequestsService: UsersHttpRequestsService,
    private userService: UserService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getJobTypes();
    if (!this.isRaisedJob) {
      this.initializeColumns();
    }
  }

  getJobTypes() {
    this.jobsHttpRequestsService.getJobTypes().subscribe({
      next: (data: any[]) => {
        this.jobTypes = data;
      },
      error: (error) => {
        console.error('Error fetching job types:', error);
      }
    });
  }

  close() {
    
  }

  selectJobType(event: any) {
    this.selectedJobType = event;
  }

  getJobDetails(jobDetails: any) {
    this.jobDetails = jobDetails;
    // Handle the job details as needed
  }

  async next() {
    if(this.isRaisedJob) {
      if(this.activeTab == 0) {
        
        try {
          // Wait for the survey data to be fetched
          await this.getSurveyByJobTypeIdEquipmentId(this.selectedJobType.id, this.equipment[0].id);
        } catch (error) {
          console.error('Error fetching survey data:', error);
          return; // Don't proceed if there's an error
        }
      } 
      
      if(this.activeTab == 1) {
        if(!this.isJobDetailsFormValid()) {
          console.error('Job details are not valid');
          return;
        }
      }
      
      this.activeTab += 1;
      this.cdr.detectChanges();

    } else {
      if(this.activeTab == 0) {
        if(this.selectedEquipment.length === 0) {
          console.error('No equipment selected');
          return;
        } else {
          await this.getQualifiedUsers();
          this.activeTab += 1;
          this.cdr.detectChanges();

        }
      } else if(this.activeTab == 1) {
        if(this.selectedJobType === null || this.selectedJobType === undefined) {
          console.error('No job type selected');
          return;
        } else {
           try {
            // Wait for the survey data to be fetched
              const equipmentIds = this.selectedEquipment.map(equipment => `equipmentIds=${equipment.id}`).join('&');
              await this.getSurveyByJobTypeIdEquipmentId(this.selectedJobType.id, equipmentIds);
            } catch (error) {
              console.error('Error fetching survey data:', error);
              return; // Don't proceed if there's an error
            }
          this.activeTab += 1;
          this.cdr.detectChanges();

        }
      } else if(this.activeTab == 2) {
        if(!this.isJobDetailsFormValid()) {
          console.error('Job details are not valid');
          return;
        }
        this.activeTab += 1;
        this.cdr.detectChanges();
      } else {
        this.activeTab += 1;
        this.cdr.detectChanges();
      }
    }
  }

  isValid() {
    return this.selectedJobType !== null && this.selectedJobType !== undefined;
  }

  // Alternative method using Angular form validation
  isJobDetailsFormValid(): boolean {
    return this.jobDetailsComponent ? this.jobDetailsComponent.isFormValid() : false;
  }

  // Method to get job details data
  getJobDetailsData(): any {
    return this.jobDetailsComponent ? this.jobDetailsComponent.getJobDetailsData() : null;
  }

  // Method to validate form before proceeding
  validateJobDetails(): boolean {
    return this.jobDetailsComponent ? this.jobDetailsComponent.validateForm() : false;
  }

  // Handle job details changes
  onJobDetailsChanged(jobDetails: any): void {
    this.currentJobDetails = jobDetails;
  }

  getSurveyByJobTypeIdEquipmentId(jobTypeId: number, equipmentId: any, isRaisedJob = this.isRaisedJob): Promise<SurveySelectionEquipment[]> {
    return new Promise((resolve, reject) => {
      this.surveyHttpRequestsService.getSurveyByJobTypeIdEquipmentId(jobTypeId, equipmentId, isRaisedJob).subscribe({
        next: (data: SurveySelectionEquipment[]) => {
          this.surveys = data;
          resolve(data);
        },
        error: (error) => {
          console.error('Error fetching survey:', error);
          reject(error);
        }
      });
    });
  }

  getEquipmentSurvey(event: any) {
    event.forEach((selectedEquipment: any, index: number) => {
      selectedEquipment.surveys.forEach((survey: any, i: number) => {
          if(survey.selected) {
              this.selectedEquipmentSurvey.push(survey)
          }
      })
    })
  }

  validateSurvey(): boolean {
    // Check if selectedEquipmentSurvey exists and has at least one survey selected
    return this.selectedEquipmentSurvey && this.selectedEquipmentSurvey.length > 0;
  }

  createJob() {
    const jobDetailsData = this.currentJobDetails;
    
    if (!jobDetailsData) {
      console.error('Job details are required');
      return;
    }

    if (!this.validateSurvey()) {
      console.error('At least one survey must be selected');
      return;
    }

    // Create payload for each selected survey
    const jobPayloads = this.selectedEquipmentSurvey.map(survey => {
      const payload = {
        'UserId': this.selectedUser.id,
        'JobTypeId': this.selectedJobType.id,
        'EquipmentId': survey.equipmentId,
        'SurveyId': survey.id,
        'Reference': '',
        'DueDate': jobDetailsData.DueDate,
        'NextDueDate': jobDetailsData.NextDueDate || null,
        'Title': jobDetailsData.Title,
        'Recurring': jobDetailsData.Recurring,
        'jobLifespan': jobDetailsData.jobLifespan || null,
        'SpecialRequirements': jobDetailsData.SpecialRequirements || null // Optional field
      };

      return payload;
    });

    this.createJobRequests(jobPayloads);
  }

  private createJobRequests(payloads: any[]): void {
    const jobCreationPromises = payloads.map(payload => 
      this.jobsHttpRequestsService.createJob(payload).toPromise()
    );

    Promise.all(jobCreationPromises)
      .then(results => {
        this.createJobFinished.emit(true);
        if (!this.isRaisedJob) {
          Swal.fire({
            title: 'Success',
            text: 'Jobs created successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#405189',
          }).then(() => {
            this.activeTab = 0; // Reset to the first tab
            this.selectedEquipmentSurvey = []; // Clear selected surveys
            this.selectedEquipment = []; // Clear selected equipment
            this.cdr.detectChanges();
          });
        }
      })
      .catch(error => {
        console.error('Error creating jobs:', error);
      });
  }

  // Manager - Is not Raised Job Methods
  private initializeColumns(): void {
    this.columnHeader = this.equipmentDatagridService.getColsLocalStorage();
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

    const data$ = this.httpRequest.getGridData(paginationParams, forceRefresh);
    const count$ = this.httpRequest.getGridDataCount(countParams, forceRefresh);

    // Use forkJoin to execute both requests simultaneously
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

  onActionSelected(action: { action: string, item: GridItem }): void {
    // Handle the action selected event

    const processAction = async () => {
      try {
        if (action.action === 'View Detail') {
          await this.openViewDetailModal(action.item);
        }
      }
      catch (error) {
        console.error('Error processing action:', error);
      }
    };
    processAction();
  }

  async openViewDetailModal(equipment: any) {
    console.log('Opening view detail modal for equipment:', equipment);
    this.equipment = await this.getEquipmentDetails(equipment.id);
    const modalRef = this.modalService.open(NgbdViewEquipmentDetailsModalComponent, { 
      centered: true,
      size: 'fullscreen',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.equipment = this.equipment;
    modalRef.result.then(
      () => {
        console.log('Modal closed successfully');
        this.loadData(this.gridParameter, true);
      }
    ).catch((error) => {
      console.error('Error closing modal:', error);
    }
    );
  }

  onSelectionChanged(selectedItems: any[]) {
    this.selectedEquipment = selectedItems;
  }

  back() {
    if (this.activeTab > 0) {
      this.activeTab -= 1;
    } else {
      this.createJobFinished.emit(false);
    }
    this.cdr.detectChanges();
  }

  private async getQualifiedUsers() {
    const equipmentIds = this.selectedEquipment.map(equipment => `equipmentIds=${equipment.id}`).join('&');
    const queryString = `${equipmentIds}`;

    try {
      const users = await this.usersHttpRequestsService.getManagersUsers(queryString).toPromise();
      this.qualifiedUsers = this.userService.transformUsersForModal(users);
    } catch (error) {
      console.error('Error fetching qualified users:', error);
      return;
    }
  }

  selectUser(event: any, user: any) {
    if (event.target.checked) {
      this.selectedUser = user;
    }
  }
  
  async getEquipmentDetails(equipmentId: number): Promise<any> {
    try {
      const response = await this.httpRequest.getEquipmentDetails(equipmentId).toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching equipment details:', error);
      throw error;
    }
  }
}


