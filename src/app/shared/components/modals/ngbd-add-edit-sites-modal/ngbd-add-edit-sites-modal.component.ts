import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { Site } from 'src/app/core/models/site/site.model';
import { DepartmentHttpRequestsService } from 'src/app/core/services/http-requests/department-http-requests.service';
import { NgbdAddEditDeparmentsModalComponent } from '../ngbd-add-edit-deparments-modal/ngbd-add-edit-deparments-modal.component';
import { SiteHttpRequestsService } from 'src/app/core/services/http-requests/site-http.requests.service';
import { Department } from 'src/app/core/models/department/department-datagrid.model';
import { Customer } from 'src/app/core/models/customer/customer.model';

@Component({
  selector: 'app-ngbd-add-edit-sites-modal',
  templateUrl: './ngbd-add-edit-sites-modal.component.html',
  styleUrls: ['./ngbd-add-edit-sites-modal.component.scss']
})
export class NgbdAddEditSitesModalComponent implements OnInit {
  @Input() public customer: Customer = {} as Customer;
  @Input() public site: Site = {} as Site;


  siteForm!: FormGroup;
  activeTab: number = 0;
  department: Department[] = [];
  selectedCheckedData: any[] = [];
  saveSiteLoading: boolean = false;

  // Department Grid Data Properties
  departmentGridItems: Department[] = [];
  departmentTotalItems: number = 0;
  departmentCurrentPage: number = 1;
  departmentPageSize: number = 10;
  departmentLoading: boolean = false;
  departmentGridParameter: any = { };
  departmentColumnHeader: ColumnHeaderModel[] = [
    { prettyName: 'Id', technicalName: 'id', visible: true },
    { prettyName: 'Name', technicalName: 'name', visible: true },
    { prettyName: 'Notes', technicalName: 'notes', visible: true },
  ];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private departmentHttpRequest: DepartmentHttpRequestsService,
    private siteHttpRequest: SiteHttpRequestsService
  ) { }

  ngOnInit(): void {
    console.log('Site:', this.site);
    console.log('Customer:', this.customer);
    this.departmentGridParameter = {
      siteId: this.site.id || null,
    };
    this.initForm();
  }

  close() {
    this.activeModal.close(true);
  }

  private initForm(): void {
    this.siteForm = this.fb.group({
      id: [this.site.id || null],
      name: [this.site.name || null, Validators.required],
      email: [this.site.email || null, Validators.required],
      postCode: [this.site.postCode || null, Validators.required],
      address1: [this.site.address1 || null, Validators.required],
      address2: [this.site.address2 || null],
      address3: [this.site.address3 || null],
      phone: [this.site.phone || null],
      customerId: [this.customer.id || null, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.siteForm.valid) {
    }
  }

  addEditDepartment(department: Department | null): void {
    let modalRef = this.modalService.open(NgbdAddEditDeparmentsModalComponent, { size: 'fullscreen', backdrop : 'static', keyboard : false });
    if(department) {
      modalRef.componentInstance.department = department;
    }
    modalRef.componentInstance.site = this.site;
    modalRef.componentInstance.customer = this.customer;
    modalRef.result.then((department: Department) => {
      this.loadDepartmentData(this.departmentGridParameter, true);
    })
  }

  saveSite() {
    if(!this.siteForm.valid) {
      console.error('Form is invalid');
      return;
    }
    this.saveSiteLoading = true;
    this.site = this.siteForm.value;
    const formValue = this.siteForm.value;

    // Remove id for add operations, keep it for edit operations
    const siteData: Site = this.site?.id
      ? formValue // Remove id for add
      : (({ id, ...rest }) => rest)(formValue);

    const operation = this.site.id ?
      this.siteHttpRequest.editSite(siteData) :
      this.siteHttpRequest.addSite(siteData);

    operation.subscribe({
      next: (response: Site) => {
        this.site = response;
        this.saveSiteLoading = false;
        this.departmentGridParameter.siteId = this.site.id || null;
        this.activeTab = 1;
      },
      error: (error) => {
        console.error('Error adding site:', error);
        this.saveSiteLoading = false;
      }
    });
    // this.activeModal.close(this.site);
  }

  // Department Grid Methods
  loadDepartmentData(params: any, forceRefresh: boolean = false) {
    this.departmentLoading = true;

    const paginationParams = {
      ...params,
      PageNumber: this.departmentCurrentPage - 1,
      PageSize: this.departmentPageSize
    };

    const countParams = { ...params };
    delete countParams.PageNumber;
    delete countParams.PageSize;

    const data$ = this.departmentHttpRequest.getGridData(paginationParams, forceRefresh);
    const count$ = this.departmentHttpRequest.getGridDataCount(countParams, forceRefresh);

    // Use forkJoin to execute both requests simultaneously
    forkJoin({
      data: data$,
      count: count$
    }).subscribe({
      next: (response) => {
        this.departmentGridItems = response.data.items || response.data;
        this.departmentTotalItems = response.count;
        this.departmentLoading = false;
      },
      error: (error: Error) => {
        console.error('Error loading grid data:', error);
        this.departmentLoading = false;
      }
    });
  }

  onSearchDepartment(searchData: any): void {
    this.departmentCurrentPage = 1;
    const searchParams = {
      ...this.departmentGridParameter,
      ...searchData
    };
    this.loadDepartmentData(searchParams, true);
  }

  onPageChangedDepartment(event: any): void {
    this.departmentCurrentPage = event.page;
    this.departmentPageSize = event.pageSize;
    this.loadDepartmentData(this.departmentGridParameter, false);
  }

  onPageSizeChangedDepartment(size: number) {
    this.departmentPageSize = size;
    this.departmentCurrentPage = 1;
    this.loadDepartmentData(this.departmentGridParameter, false);
  }

  next() {
   this.activeTab += 1;
  }

}
