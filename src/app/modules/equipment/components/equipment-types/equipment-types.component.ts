import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { ColumnHeaderModel, GridItem } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { EquipmentType } from 'src/app/core/models/equipment/equipment.model';
import { EquipmentDatagridService } from 'src/app/core/services/common/equipment-datagrid.service';
import { EquipmentTypeHttpRequestsService } from 'src/app/core/services/http-requests/equipment-type-http-requests.service';
import { NgbdAddEditEquipmentTypeModalsComponent } from 'src/app/shared/components/modals/ngbd-add-edit-equipment-type-modals/ngbd-add-edit-equipment-type-modals.component';

@Component({
  selector: 'app-equipment-types',
  templateUrl: './equipment-types.component.html',
  styleUrls: ['./equipment-types.component.scss']
})
export class EquipmentTypesComponent implements OnInit {

  gridItems: GridItem[] = [];
  columnHeader: ColumnHeaderModel[] = [
     { prettyName: 'ID', technicalName: 'id', visible: true },
     { prettyName: 'Name', technicalName: 'name', visible: true },
  ];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  gridParameter = { };

  
  constructor(
    private equipmentDatagridService: EquipmentDatagridService,
    private httpRequest: EquipmentTypeHttpRequestsService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void { }

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

  createUpdateEquipmentType(equipmentType?: EquipmentType) {
    const defaultEquipmentType: EquipmentType = {
      id: 0,
      name: '',
      isArchived: false,
    };

    const equipmentTypeToEdit = equipmentType || defaultEquipmentType;

    this.openEquipmentTypeModal(equipmentTypeToEdit);
  }

  private openEquipmentTypeModal(equipmentType: EquipmentType): void {
    const modalRef = this.modalService.open(NgbdAddEditEquipmentTypeModalsComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.equipmentType = equipmentType;
    modalRef.componentInstance.isEditMode = equipmentType.id > 0;

    modalRef.result.then((result: any) => {
      this.loadData(this.gridParameter, true);
    }).catch((error: any) => {
      if (error !== 'cancel' && error !== 'backdrop-click') {
      }
    });
  }

  handleAction(action: string, item: any): void {
    switch (action) {
      case 'edit':
        this.openEquipmentTypeModal(item);
        break;
      // Handle other actions as needed
    }
  }

}
