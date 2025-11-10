import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { MyUsersHttpRequestsService } from 'src/app/core/services/http-requests/my-users-http-requests.service';
import { NgbdUpdateServiceDateModalComponent } from 'src/app/shared/components/modals/ngbd-update-service-date-modal/ngbd-update-service-date-modal.component';

@Component({
  selector: 'app-my-users-test-equipments',
  templateUrl: './my-users-test-equipments.component.html',
  styleUrls: ['./my-users-test-equipments.component.scss']
})
export class MyUsersTestEquipmentsComponent implements OnInit {
  gridItems: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  gridParameter = { };
  columnHeader: ColumnHeaderModel[] = [
     { prettyName: 'Type', technicalName: 'equipmentType', visible: true },
     { prettyName: 'Asset Number', technicalName: 'assetNumber', visible: true },
     { prettyName: 'Serial Number', technicalName: 'serialNumber', visible: true },
     { prettyName: 'Manufacturer', technicalName: 'manufacturer', visible: true },
     { prettyName: 'Model', technicalName: 'model', visible: true },
     { prettyName: 'First Name', technicalName: 'firstName', visible: true },
     { prettyName: 'Last Name', technicalName: 'lastName', visible: true },
     { prettyName: 'Username', technicalName: 'username', visible: true },
     { prettyName: 'Service Date', technicalName: 'serviceDate', visible: true },
     { prettyName: 'Actions', technicalName: 'actions', visible: true },
   ];
  

  constructor(
    private httpRequest: MyUsersHttpRequestsService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    
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

    const data$ = this.httpRequest.getTestEquipmentGridData(paginationParams, forceRefresh);
    const count$ = this.httpRequest.getTestEquipmentGridDataCount(countParams, forceRefresh);

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
    console.log(action);
    console.log(item);
    if (action === 'Update Service Date') {
      const modalRef = this.modalService.open(NgbdUpdateServiceDateModalComponent, {
        centered: true,
        size: 'lg',
        backdrop: 'static',
        keyboard: false
      });
      modalRef.componentInstance.testEquipment = item;
      modalRef.result.then((resp: boolean) => {
        this.loadData(this.gridParameter, true);
      })
    }
  }

}
