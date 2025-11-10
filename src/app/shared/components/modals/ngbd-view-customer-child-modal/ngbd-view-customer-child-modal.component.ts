import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { CoverLevel, Customer, CustomerType } from 'src/app/core/models/customer/customer.model';
import { NgbdAddEditCustomerModalComponent } from '../ngbd-add-edit-customer-modal/ngbd-add-edit-customer-modal.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { CustomerHttpRequestsService } from 'src/app/core/services/http-requests/customer-http-requests.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ngbd-view-customer-child-modal',
  templateUrl: './ngbd-view-customer-child-modal.component.html',
  styleUrls: ['./ngbd-view-customer-child-modal.component.scss']
})
export class NgbdViewCustomerChildModalComponent implements OnInit {
  @Input() customer!: Customer;

  gridItems: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  gridParameter = { };
  columnHeader: ColumnHeaderModel[] = [
      { prettyName: 'ID', technicalName: 'id', visible: true },
      { prettyName: 'Name', technicalName: 'name', visible: true },
      { prettyName: 'Actions', technicalName: 'actions', visible: true },
    ];
  
  customerType: CustomerType[] = [];
  coverLevel: CoverLevel[] = [];
  constructor(
      private httpRequest: CustomerHttpRequestsService,
      private modalService: NgbModal,
      private cdr: ChangeDetectorRef,
      private activeTab: NgbActiveModal
    ) { 
      
    }
    
  
    ngOnInit(): void {
      this.gridParameter = {
        parentId: this.customer.id,
      }
      this.getCustomerTypes();
      this.getCoverLevels();
    }
  
    addCustomer() {
      const modalRef = this.modalService.open(NgbdAddEditCustomerModalComponent, { 
        centered: false,
        size: 'fullscreen',
        backdrop: 'static',
        keyboard: false
      });
      modalRef.componentInstance.customerType = this.customerType;
      modalRef.componentInstance.customerParent = this.gridItems; // Assuming you want to pass an empty array for now
      modalRef.componentInstance.coverLevel = this.coverLevel;
      modalRef.result.then((result) => {
        if (result) {
          this.loadData(this.gridParameter, true);
        }
      });
    }

    close() {
      this.activeTab.close();
    }

    resetDrillDown() {
      const openModalCount = document.querySelectorAll('.modal').length;
      
      if (openModalCount > 1) {
        Swal.fire({
          title: 'Reset All Windows',
          text: `This will close all ${openModalCount} open windows. Continue?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, Close All',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#3c4e80',
        }).then((result) => {
          if (result.isConfirmed) {
            this.modalService.dismissAll('reset-confirmed');
          }
        });
      } else {
        this.activeTab.dismiss('reset-single-modal');
      }
    }

    getCustomerTypes() {
      this.httpRequest.getCustomerType().subscribe({
        next: (response: CustomerType[]) => {
          this.customerType = response;
        },
        error: (error: Error) => {
          console.error('Error loading customer types:', error);
        }
      });
    }
  
    getCoverLevels() {
      this.httpRequest.getCoverLevels().subscribe({
        next: (response: CoverLevel[]) => {
          this.coverLevel = response;
        },
        error: (error: Error) => {
          console.error('Error loading cover levels:', error);
        }
      });
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
  
    onPageChanged(event: any): void {
      this.currentPage = event.page;
      this.pageSize = event.pageSize;
      this.loadData(this.gridParameter, false);
    }
    
    handleAction(action: string, item: any) {
      if (action === 'edit') {
        const modalRef = this.modalService.open(NgbdAddEditCustomerModalComponent, { 
          centered: false,
          size: 'fullscreen',
          backdrop: 'static',
          keyboard: false
        });
        modalRef.componentInstance.customerType = this.customerType;
        modalRef.componentInstance.customerParent = this.gridItems; // Assuming you want to pass the current grid items
        modalRef.componentInstance.coverLevel = this.coverLevel;
        modalRef.componentInstance.customer = item; // Pass the selected item for editing
        modalRef.result.then((result) => {
        if (result) {
          this.loadData(this.gridParameter, true);
        }
      });
      } else if (action === 'delete') {
        console.log('Delete action triggered for item:', item);
        // Implement delete functionality here
      } else if (action === 'view child') {
        console.log('View child action triggered for item:', item);
        const modalRef = this.modalService.open(NgbdViewCustomerChildModalComponent, { 
          centered: false,
          size: 'fullscreen',
          backdrop: 'static',
          keyboard: false
        });
        modalRef.componentInstance.customer = item;
      } else {
        console.warn('Unknown action:', action);  
      }
    }

}
