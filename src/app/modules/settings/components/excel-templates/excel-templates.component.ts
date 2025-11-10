import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { ExcelTemplatesHttpRequestsService } from 'src/app/core/services/http-requests/excel-templates-http-requests.service';
import { NgbdAddEditExcelTemplateComponent } from 'src/app/shared/components/modals/ngbd-add-edit-excel-template/ngbd-add-edit-excel-template.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-excel-templates',
  templateUrl: './excel-templates.component.html',
  styleUrls: ['./excel-templates.component.scss']
})
export class ExcelTemplatesComponent implements OnInit {
  gridItems: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  gridParameter = { };
  columnHeader: ColumnHeaderModel[] = [
      { prettyName: 'Id', technicalName: 'id', visible: true },
      { prettyName: 'Title', technicalName: 'title', visible: true },
      { prettyName: 'Actions', technicalName: 'actions', visible: true },
    ];
  constructor(
    private httpRequest: ExcelTemplatesHttpRequestsService,
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

      const data$ = this.httpRequest.getGridData(paginationParams, forceRefresh);
      const count$ = this.httpRequest.getGridDataCount(countParams, forceRefresh);

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

  onPageSizeChanged(size: number): void {
    this.pageSize = size;
    this.currentPage = 1; 
    this.loadData(this.gridParameter, false);
  }

  handleAction(action: string, item: any): void {
    if(action === 'Delete Excel Template') {
      this.deleteData(item);
    }
  }

  deleteData(event: any) {
    Swal.fire({
        title: 'Warning',
        text: 'Are you sure you want to delete this data?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        confirmButtonColor: 'rgb(60,76,128)',
      }).then((result) => {
        if(result.isConfirmed) {
            this.httpRequest.deleteExcelTemplate(event.id).subscribe(data => {
              this.loadData(this.gridParameter, true);
              this.cdr.detectChanges();
            }, error => {
              Swal.fire({
                title: 'Error',
                text: 'Failed to delete data',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: 'rgb(60,76,128)',
              });
            })
        }
      })
  }

  createUpdateExcelTemplate(action: 'create' | 'update', template?: any) {
    if (action === 'create') {
      let modalRef = this.modalService.open(NgbdAddEditExcelTemplateComponent, { size: 'fullscreen', backdrop : 'static', keyboard : false });
      modalRef.componentInstance.modalFor = 'excel_template';
      modalRef.componentInstance.actionType = action;
      modalRef.result.then((result: any) => {
        this.loadData(this.gridParameter, true);
        this.cdr.detectChanges();
      })
    } else if (action === 'update' && template) {
      // Call update API
    }
  }

}
