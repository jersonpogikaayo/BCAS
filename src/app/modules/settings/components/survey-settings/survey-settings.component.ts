import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { ExcelTemplatesHttpRequestsService } from 'src/app/core/services/http-requests/excel-templates-http-requests.service';
import { SurveyHttpRequestsService } from 'src/app/core/services/http-requests/survey-http-requests.service';
import { NgbdAddEditExcelTemplateComponent } from 'src/app/shared/components/modals/ngbd-add-edit-excel-template/ngbd-add-edit-excel-template.component';
import { NgbdAddEditSurveyComponent } from 'src/app/shared/components/modals/ngbd-add-edit-survey/ngbd-add-edit-survey.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-survey-settings',
  templateUrl: './survey-settings.component.html',
  styleUrls: ['./survey-settings.component.scss']
})
export class SurveySettingsComponent implements OnInit {
  gridItems: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  gridParameter = { };
  columnHeader: ColumnHeaderModel[] = [
      { prettyName: 'Id', technicalName: 'id', visible: true },
      { prettyName: 'Name', technicalName: 'name', visible: true },
      { prettyName: 'Actions', technicalName: 'actions', visible: true },
    ];
  constructor(
    private httpRequest: SurveyHttpRequestsService,
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
    console.log('Action:', action, 'Item:', item);
    if(action == 'add') {
      this.createSurvey();
    }
  }

  createSurvey() {
    let modalRef = this.modalService.open(NgbdAddEditSurveyComponent, { size: 'fullscreen', backdrop : 'static', keyboard : false });
    modalRef.componentInstance.isEdit = true;
    modalRef.componentInstance.isCopy = true;
    modalRef.result.then((result: any) => {
      if (result) {
        this.loadData(this.gridParameter, true);
      }
    });
  }

}
