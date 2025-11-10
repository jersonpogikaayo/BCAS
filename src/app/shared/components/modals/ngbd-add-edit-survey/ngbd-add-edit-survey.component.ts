import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { ColumnHeaderModel, GridItem } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { Equipment } from 'src/app/core/models/equipment/equipment.model';
import { JobType } from 'src/app/core/models/jobs/jobs.model';
import { Survey, SurveySection } from 'src/app/core/models/survey/survey.model';
import { EquipmentsHttpRequestsService } from 'src/app/core/services/http-requests/equipment-http-requests.service';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';
import Swal from 'sweetalert2';
import { NgbdViewEquipmentDetailsModalComponent } from '../equipments/ngbd-view-equipment-details-modal/ngbd-view-equipment-details-modal.component';
import { EquipmentDatagridService } from 'src/app/core/services/common/equipment-datagrid.service';
import { EquipmentsModelHttpRequestsService } from 'src/app/core/services/http-requests/equipment-model-http-requests.service';
import { EquipmentTypeHttpRequestsService } from 'src/app/core/services/http-requests/equipment-type-http-requests.service';
import { SectionData } from 'src/app/core/models/survey/survey-section-questions.model';
import { ExcelTemplatesHttpRequestsService } from 'src/app/core/services/http-requests/excel-templates-http-requests.service';
import { SurveyHttpRequestsService } from 'src/app/core/services/http-requests/survey-http-requests.service';

@Component({
  selector: 'app-ngbd-add-edit-survey',
  templateUrl: './ngbd-add-edit-survey.component.html',
  styleUrls: ['./ngbd-add-edit-survey.component.scss']
})
export class NgbdAddEditSurveyComponent implements OnInit {
  activeTab: number = 0;
  surveyDetailsForm!: FormGroup;
  submitted: boolean = false;

  @Input() public surveyData!: Survey;
  @Input() public isEdit: boolean = false;
  @Input() public isCopy: boolean = false;

  sections: SurveySection[] = []; 
  jobTypes: JobType[] = [];
  selectedJobType!: JobType;
  surveyRestrictions: number = 0;

  //Equipments Datagrid
  gridItems: GridItem[] = [];
  columnHeader: ColumnHeaderModel[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  gridParameter = { };
  equipment!: Equipment;
  selectedSurveyRestrictions: any[] = [];
  selectedExcelTemplates: any = null;
  constructor(
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private jobsHttpRequestsService: JobsHttpRequestsService,
    private httpRequest: EquipmentsHttpRequestsService,
    private equipmentsModelHttpRequests: EquipmentsModelHttpRequestsService,
    private equipmentTypeHttpRequests: EquipmentTypeHttpRequestsService,
    private equipmentDatagridService: EquipmentDatagridService,
    private excelTemplatesHttpRequests: ExcelTemplatesHttpRequestsService,
    private surveyHttpRequests: SurveyHttpRequestsService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getJobTypes();
    this.initializeColumns();
  }

  initForm() {
    const { title = '', name = '', description = '', failThreshold = 0 } = this.surveyData || {};
    this.surveyDetailsForm = this.formBuilder.group({
      title: [title, Validators.required],
      name: [name, Validators.required],
      description: [description, Validators.required],
      failThreshold: [failThreshold, Validators.required],
      active: [true]
    });
  }

  get f() { return this.surveyDetailsForm.controls; }

  close() {
    if(this.surveyDetailsForm.dirty) {
      Swal.fire({
        title: 'Warning',
        text: 'Are you sure you want to exit the wizard? All progress will be lost.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        confirmButtonColor: 'rgb(60,76,128)',
      }).then((result) => {
        if(result.isConfirmed) {
          this.activeModal?.close();
        } else {

        }
      });
    } else {
      this.activeModal?.close();
    }
  }

  isSurveyDetailsValid() {
    this.submitted = true;
    if (this.surveyDetailsForm.invalid) {
      return false;
    }
    return true;
  }

  back() {
    if(this.activeTab > 0) {
      this.activeTab--;
    }
  }

  next() {
    switch(this.activeTab) {
      case 0:
        if(this.isSurveyDetailsValid()) {
          this.activeTab++;
        }
        break;
      case 1:
        if(this.selectedJobType) {
          this.activeTab++;
        } else {
          Swal.fire({
            title: 'Warning',
            text: 'Please select a job type.',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: 'rgb(60,76,128)',
          });
        }
        break;
      case 2:
        this.activeTab++;
        break;
      case 3:
        if(this.sections.length > 0) {
          this.showExcelTemplates();
          this.activeTab++;
        } else {
          Swal.fire({
            title: 'Warning',
            text: 'Please add at least one section.',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: 'rgb(60,76,128)',
          });
        }
        break;
      case 4:
        if(this.selectedExcelTemplates.length > 0) {
          this.activeTab++;
        } else {
          Swal.fire({
            title: 'Warning',
            text: 'Please select at least one Excel template.',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: 'rgb(60,76,128)',
          });
        }
        break;
      case 5:
        this.handleSubmitSurvey();
        // this.activeTab++;
        break;
    }
  }

  activeIdChange(event: any) {
    console.log('Active tab changed to:', event);
    this.activeTab = event;
    if(event === 4) {
      this.showExcelTemplates();
    }
  }

  getJobTypes() {
    this.jobsHttpRequestsService.getJobTypes().subscribe({
      next: (data: JobType[]) => {
        this.jobTypes = data;
      },
      error: (error) => {
        console.error('Error fetching job types:', error);
      }
    });
  }

  selectJobType(event: any) {
    this.selectedJobType = event;
  }

  selectRestriction(event: any) {
    if(event.target.checked) {
      this.surveyRestrictions = Number(event.target.value);
      switch(this.surveyRestrictions) {
        case 0:
          this.showExcelTemplates();
          break;
        case 1:
          this.showEquipmentsDataGrid();
          break;
        case 2:
          this.showEquipmentModelTypeDataGrid();
          break;
        case 3:
          this.showEquipmentModelTypeDataGrid();
          break;
        default:
          this.showExcelTemplates();
      }
    }
  }

  showEquipmentsDataGrid() {
    this.gridItems = [];
    this.totalItems = 0;
    this.currentPage = 1;
    this.pageSize = 10;
    this.loading = false;
    this.gridParameter = {};
    this.initializeColumns();
  }

  showEquipmentModelTypeDataGrid() {
    this.gridItems = [];
    this.totalItems = 0;
    this.currentPage = 1;
    this.pageSize = 10;
    this.loading = false;
    this.gridParameter = {};
    this.columnHeader = [
      { prettyName: 'Id', technicalName: 'id', visible: true },
      { prettyName: 'Name', technicalName: 'name', visible: true },
    ];
  }

  showExcelTemplates() {
    this.gridItems = [];
    this.totalItems = 0;
    this.currentPage = 1;
    this.pageSize = 10;
    this.loading = false;
    this.gridParameter = {};
    this.columnHeader = [
      { prettyName: 'Id', technicalName: 'id', visible: true },
      { prettyName: 'Title', technicalName: 'title', visible: true },
    ];
  }

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

    let dataRequest;
    let countRequest;
    console.log('Active Tab:', this.activeTab);
    if(this.activeTab === 4) {
      console.log('in')
      dataRequest = this.excelTemplatesHttpRequests.getGridData(paginationParams, forceRefresh);
      countRequest = this.excelTemplatesHttpRequests.getGridDataCount(countParams, forceRefresh);
    } else {
      if(this.surveyRestrictions == 1) {
        dataRequest = this.httpRequest.getGridData(paginationParams, forceRefresh);
        countRequest = this.httpRequest.getGridDataCount(countParams, forceRefresh);
      } else if(this.surveyRestrictions == 2) {
        dataRequest = this.equipmentsModelHttpRequests.getGridData(paginationParams, forceRefresh);
        countRequest = this.equipmentsModelHttpRequests.getGridDataCount(countParams, forceRefresh);
      } else if(this.surveyRestrictions == 3) {
        dataRequest = this.equipmentTypeHttpRequests.getGridData(paginationParams, forceRefresh);
        countRequest = this.equipmentTypeHttpRequests.getGridDataCount(countParams, forceRefresh);
      }
    }
    
    const data$ = dataRequest;
    const count$ = countRequest;

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

  async getEquipmentDetails(equipmentId: number): Promise<any> {
    try {
      const response = await this.httpRequest.getEquipmentDetails(equipmentId).toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching equipment details:', error);
      throw error;
    }
  }

  onEquipmentSelectionChanged(selectedItems: any[]): void {
    this.selectedSurveyRestrictions = selectedItems;
    // STILL NOT INCLUDED IN THE PAYLOAD YET, PLEASE CONFIRM WITH MATT
  }

  getSection(section: any) {
    this.sections = section;
  }

  onExcelTemplateSelectionChanged(selectedItems: any[]): void {
    this.selectedExcelTemplates = selectedItems;
  }

  handleSubmitSurvey() {
    const payload: Survey = {
      title: this.surveyDetailsForm.value.title,
      name: this.surveyDetailsForm.value.name,
      description: this.surveyDetailsForm.value.description,
      failThreshold: this.surveyDetailsForm.value.failThreshold,
      active: this.surveyDetailsForm.value.active,
      jobTypeId: this.selectedJobType.id,
      sections: this.sections,
      excelTemplateId: this.selectedExcelTemplates[0].id,
    };

    this.surveyHttpRequests.createSurvey(payload).subscribe({
      next: (response) => {
        console.log('Survey created successfully:', response);
        this.activeModal.close(true);
      },
      error: (error) => {
        console.error('Error creating survey:', error);
      }
    });
  }


}
