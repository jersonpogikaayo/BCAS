import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { ColumnHeaderModel, GridItem } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { Equipment } from 'src/app/core/models/equipment/equipment.model';
import { EquipmentDatagridService } from 'src/app/core/services/common/equipment-datagrid.service';
import { EquipmentsHttpRequestsService } from 'src/app/core/services/http-requests/equipment-http-requests.service';
import { NgbdViewEquipmentDetailsModalComponent } from 'src/app/shared/components/modals/equipments/ngbd-view-equipment-details-modal/ngbd-view-equipment-details-modal.component';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss']
})
export class EquipmentComponent implements OnInit {
  
  gridItems: GridItem[] = [];
  columnHeader: ColumnHeaderModel[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  gridParameter = { };

  equipment!: Equipment;
  
  constructor(
    private equipmentDatagridService: EquipmentDatagridService,
    private httpRequest: EquipmentsHttpRequestsService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initializeColumns();
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
