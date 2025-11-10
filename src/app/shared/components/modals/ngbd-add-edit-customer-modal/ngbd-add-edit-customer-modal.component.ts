import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, throwError } from 'rxjs';
import { ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { Contact, CoverLevel, Customer, CustomerType } from 'src/app/core/models/customer/customer.model';
import { ContactHttpRequestsService } from 'src/app/core/services/http-requests/contact-http-requests.service';
import { NgbdAddEditContactsModalComponent } from '../ngbd-add-edit-contacts-modal/ngbd-add-edit-contacts-modal.component';
import { SiteHttpRequestsService } from 'src/app/core/services/http-requests/site-http.requests.service';
import { NgbdAddEditSitesModalComponent } from '../ngbd-add-edit-sites-modal/ngbd-add-edit-sites-modal.component';
import { CustomerHttpRequestsService } from 'src/app/core/services/http-requests/customer-http-requests.service';
import Swal from 'sweetalert2';
import { Site } from 'src/app/core/models/site/site.model';
import { catchError } from 'rxjs/operators';
import { LoadingService } from 'src/app/core/services/common/loading.service';

@Component({
  selector: 'app-ngbd-add-edit-customer-modal',
  templateUrl: './ngbd-add-edit-customer-modal.component.html',
  styleUrls: ['./ngbd-add-edit-customer-modal.component.scss']
})
export class NgbdAddEditCustomerModalComponent implements OnInit {
  @Input() public customer: Customer = {} as Customer;
  @Input() public customerType: CustomerType[] = [];
  @Input() public customerParent: Customer[] = [];
  @Input() public coverLevel: CoverLevel[] = [];
  @Input() public contact: Contact[] = [];


  activeTab: number = 0;
  customerForm!: FormGroup;
  addCustomerLoading: boolean = false;

  siteGridItems: any[] = [];
  siteTotalItems: number = 0;
  siteCurrentPage: number = 1;
  sitePageSize: number = 10;
  siteLoading: boolean = false;
  siteGridParameter = {};
  siteColumnHeader: ColumnHeaderModel[] = [
      { prettyName: 'ID', technicalName: 'id', visible: true },
      { prettyName: 'Name', technicalName: 'name', visible: true },
      { prettyName: 'Email', technicalName: 'email', visible: true },
      { prettyName: 'Phone', technicalName: 'phone', visible: true },
      { prettyName: 'Post Code', technicalName: 'postCode', visible: true },
  ];

  selectedSites: Site[] = [];
  saveSitesLoading: boolean = false;
  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private sitesHttpRequest: SiteHttpRequestsService,
    private customerHttpRequest: CustomerHttpRequestsService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    if(this.customer.id) {
      this.siteGridParameter = {
        customerId: this.customer.id || null,
      };
    }
    this.initForm();
  }

  private initForm(): void {
    this.customerForm = this.formBuilder.group({
      id: [this.customer?.id || null],
      customerTypeId: [this.customer?.customerTypeId || null, Validators.required],
      name: [this.customer?.name || '', [Validators.required]],
      contract: [this.customer?.contract ?? true],
      notes: [this.customer?.notes || ''],
      parentId: [this.customer?.parentId || null],
      siteId: [this.customer?.siteId || null],
      contactId: [this.customer?.contactId || null],
      coverLevelId: [this.customer?.coverLevelId || null],
      sites: [this.customer?.sites || null],
      contacts: [this.customer?.contacts || []],
    });
  }

  close() {
    this.activeModal.close(true);
  }

  next() {
    if(this.activeTab == 0) {
      if (this.customerForm.valid) {
        console.log(this.customerForm.value);
        this.activeTab++;
      } else {
        this.customerForm.markAllAsTouched();
      }
    }
  }


  // Site Data Grid Methods
  loadSiteData(params: any, forceRefresh: boolean = true) {
      this.siteLoading = true;

      const paginationParams = {
        ...params,
        PageNumber: this.siteCurrentPage - 1,
        PageSize: this.sitePageSize
      };

      const countParams = { ...params };
      delete countParams.PageNumber;
      delete countParams.PageSize;

      const data$ = this.sitesHttpRequest.getGridData(paginationParams, forceRefresh);
      const count$ = this.sitesHttpRequest.getGridDataCount(countParams, forceRefresh);

      forkJoin({
        data: data$,
        count: count$
      }).subscribe({
        next: (response) => {
          this.siteGridItems = response.data.items || response.data;
          this.siteTotalItems = response.count;
          this.siteLoading = false;
        },
        error: (error: Error) => {
          console.error('Error loading grid data:', error);
          this.siteLoading = false;
        }
      });
    }

  onPageSiteSizeChanged(size: number) {
    this.sitePageSize = size;
    this.siteCurrentPage = 1;
    this.loadSiteData(this.siteGridParameter, false);
  }

  onSiteSearch(searchData: any): void {
    this.siteCurrentPage = 1;
    const searchParams = {
      ...this.siteGridParameter,
      ...searchData
    };
    this.loadSiteData(searchParams, true);
  }

  onSitePageChanged(event: any): void {
    this.siteCurrentPage = event.page;
    this.sitePageSize = event.pageSize;
    this.loadSiteData(this.siteGridParameter, false);
  }

  addNewSite() {
    const modalRef = this.modalService.open(NgbdAddEditSitesModalComponent,{ 
      centered: false,
      size: 'fullscreen',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.contact = this.contact;
    modalRef.componentInstance.site = {} as Site;
    modalRef.componentInstance.customer = this.customer;

    modalRef.result.then((resp: any) => {
      console.log('New site added:', resp);
      this.loadSiteData(this.siteGridParameter, true);
    });
  }

  saveCustomer() {
    this.loadingService.show(this.customer?.id ? 'Updating customer...' : 'Adding customer...');
    this.addCustomerLoading = true;
    
    if (this.customerForm.valid) {
     
     const formValue = this.customerForm.value;

      const customerData: Customer = this.customer?.id
        ? formValue
        : (({ id, ...rest }) => rest)(formValue);

      const operation = this.customer?.id
        ? this.customerHttpRequest.editCustomer(customerData)
        : this.customerHttpRequest.addCustomer(customerData);
      
      operation.subscribe({
        next: (response: Customer) => {
          if (response) {
            this.customer = response;
            this.initForm();
            this.siteGridParameter = {
              customerId: this.customer.id || null,
            };
            this.next();
          }
          this.loadingService.hide();
          this.addCustomerLoading = false;
        },
        error: (error: Error) => {
          console.error('Error processing customer:', error);
          this.loadingService.hide();
          this.addCustomerLoading = false;
        }
      });
    } else {
      this.customerForm.markAllAsTouched();
      this.addCustomerLoading = false;
    }
  }

  onSelectionChangedSites(selectedItems: any[]): void {
    this.selectedSites = selectedItems;
  }

  removeSite(sites: Site[]) {
    const siteIdsToRemove = new Set(sites.map(site => site.id));
    const originalCount = this.selectedSites.length;
    this.selectedSites = this.selectedSites.filter(s => !siteIdsToRemove.has(s.id));
    const removedCount = originalCount - this.selectedSites.length;
  }

  onEditSite(site: Site): void {
    const modalRef = this.modalService.open(NgbdAddEditSitesModalComponent, { 
      size: 'fullscreen', 
      backdrop: 'static', 
      keyboard: false 
    });
    modalRef.componentInstance.contact = this.contact;
    modalRef.componentInstance.site = site;
    modalRef.componentInstance.customer = this.customer;

    modalRef.result.then((updatedSite: Site) => {
      this.loadSiteData(this.siteGridParameter, true);
    });
  }
}

