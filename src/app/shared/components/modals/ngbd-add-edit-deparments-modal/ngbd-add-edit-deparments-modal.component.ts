import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { Contact, Customer } from 'src/app/core/models/customer/customer.model';
import { Department } from 'src/app/core/models/equipment/equipment.model';
import { Site } from 'src/app/core/models/site/site.model';
import { ContactHttpRequestsService } from 'src/app/core/services/http-requests/contact-http-requests.service';
import { DepartmentHttpRequestsService } from 'src/app/core/services/http-requests/department-http-requests.service';
import { NgbdAddEditContactsModalComponent } from '../ngbd-add-edit-contacts-modal/ngbd-add-edit-contacts-modal.component';
import { LoadingService } from 'src/app/core/services/common/loading.service';

@Component({
  selector: 'app-ngbd-add-edit-deparments-modal',
  templateUrl: './ngbd-add-edit-deparments-modal.component.html',
  styleUrls: ['./ngbd-add-edit-deparments-modal.component.scss']
})
export class NgbdAddEditDeparmentsModalComponent implements OnInit {
  @Input() customer: Customer = {} as Customer;
  @Input() site: Site = {} as Site;
  @Input() department: Department = {} as Department;
  departmentForm!: FormGroup;

  activeTab: number = 0;
  saveDepartmentLoading: boolean = false;

  contactGridItems: Contact[] = [];
  contactTotalItems: number = 0;
  contactCurrentPage: number = 1;
  contactPageSize: number = 10;
  contactLoading: boolean = false;
  contactGridParameter: any = { };
  contactColumnHeader: ColumnHeaderModel[] = [
    { prettyName: 'First Name', technicalName: 'firstName', visible: true },
    { prettyName: 'Last Name', technicalName: 'surname', visible: true },
    { prettyName: 'Email', technicalName: 'email', visible: true },
    { prettyName: 'Mobile', technicalName: 'mobile', visible: true },
    { prettyName: 'Phone', technicalName: 'phone', visible: true },
    { prettyName: 'Main Contact', technicalName: 'mainContact', visible: true },
  ];
  constructor(
    public activeModal: NgbActiveModal,
    private departmentHttpRequest: DepartmentHttpRequestsService,
    private contactHttpRequest: ContactHttpRequestsService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    if(this.department) {
      this.contactGridParameter = {
        departmentId: this.department.id,
      };
    }
    this.initForm();
  }

  close() {
    this.activeModal?.close();
  }

  private initForm(): void {
    this.departmentForm = this.fb.group({
      siteId: [this.site.id || this.department.siteId, Validators.required],
      customerId: [this.customer.id || this.department.customerId, Validators.required],
      id: [this.department.id || null],
      name: [this.department.name || null, Validators.required],
      notes: [this.department.notes || null, Validators.required],
    });
  }

  addDepartment() {
    this.loadingService.show(this.department.id ? 'Updating department...' : 'Adding department...');
    if(!this.departmentForm.valid) {
      console.error('Form is invalid');
      return;
    }

    this.saveDepartmentLoading = true;
    this.department = this.departmentForm.value;
    const formValue = this.departmentForm.value;

    const departmentData: Department = this.department?.id
      ? formValue
      : (({ id, ...rest }) => rest)(formValue);


    const operation = this.department.id ?
      this.departmentHttpRequest.editDepartment(departmentData) :
      this.departmentHttpRequest.addDepartment(departmentData);

    operation.subscribe({
      next: (response) => {
        this.saveDepartmentLoading = false;
        this.department = response;
        this.contactGridParameter = {
          departmentId: this.department.id,
        };
        this.loadingService.hide();
        this.activeTab = 1;
      },
      error: (error) => {
        this.loadingService.hide();
        console.error('Error adding department:', error);
      }
    });
  }

  loadContactData(params: any, forceRefresh: boolean = true) {
    this.contactLoading = true;

    const paginationParams = {
      ...params,
      PageNumber: this.contactCurrentPage - 1,
      PageSize: this.contactPageSize
    };

    const countParams = { ...params };
    delete countParams.PageNumber;
    delete countParams.PageSize;

    const data$ = this.contactHttpRequest.getGridData(paginationParams, forceRefresh);
    const count$ = this.contactHttpRequest.getGridDataCount(countParams, forceRefresh);

    forkJoin({
      data: data$,
      count: count$
    }).subscribe({
      next: (response) => {
        this.contactGridItems = response.data.items || response.data;
        this.contactTotalItems = response.count;
        this.contactLoading = false;
      },
      error: (error: Error) => {
        console.error('Error loading grid data:', error);
        this.contactLoading = false;
      }
    });
  }

  onPageContactSizeChanged(size: number) {
    this.contactPageSize = size;
    this.contactCurrentPage = 1;
    this.loadContactData(this.contactGridParameter, false);
  }

  onContactSearch(searchData: any): void {
    this.contactCurrentPage = 1;
    const searchParams = {
      ...this.contactGridParameter,
      ...searchData
    };
    this.loadContactData(searchParams, true);
  }

  onContactPageChanged(event: any): void {
    this.contactCurrentPage = event.page;
    this.contactPageSize = event.pageSize;
    this.loadContactData(this.contactGridParameter, false);
  }

  addEditContact(contact: Contact | null): void {
    const modalRef = this.modalService.open(NgbdAddEditContactsModalComponent, {
      centered: false,
      size: 'fullscreen',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.customer = this.customer;
    modalRef.componentInstance.site = this.site;
    modalRef.componentInstance.department = this.department;
    if(contact) {
      modalRef.componentInstance.contact = contact;
    } 

    modalRef.result.then((contact: any) => {
      this.loadContactData(this.contactGridParameter, true);
    });
  }

}
