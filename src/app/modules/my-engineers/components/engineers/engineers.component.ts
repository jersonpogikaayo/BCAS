import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { User } from 'src/app/core/models/user/user.model';
import { MyUsersHttpRequestsService } from 'src/app/core/services/http-requests/my-users-http-requests.service';
import { NgbdAddEditMyUsersModalComponent } from 'src/app/shared/components/modals/ngbd-add-edit-my-users-modal/ngbd-add-edit-my-users-modal.component';

@Component({
  selector: 'app-engineers',
  templateUrl: './engineers.component.html',
  styleUrls: ['./engineers.component.scss']
})
export class EngineersComponent implements OnInit {
  gridItems: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  gridParameter = { };
  columnHeader: ColumnHeaderModel[] = [
     { prettyName: 'ID', technicalName: 'id', visible: true },
     { prettyName: 'First Name', technicalName: 'firstName', visible: true },
     { prettyName: 'Last Name', technicalName: 'lastName', visible: true },
     { prettyName: 'Email', technicalName: 'email', visible: true },
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
  
  createUpdateUser(user?: User) {
    const modalRef = this.modalService.open(NgbdAddEditMyUsersModalComponent, { 
      centered: false,
      size: 'fullscreen',
      backdrop: 'static',
      keyboard: false
    });
    if(user) {
      modalRef.componentInstance.user = user;
      modalRef.componentInstance.isEditMode = user.id > 0;
    } else {
      modalRef.componentInstance.isEditMode = false;
    }
    modalRef.componentInstance.userRole = 'Manager'; 
    modalRef.result.then((result) => {
      if (result) {
        this.loadData(this.gridParameter, true);
      }
    });

  }
  handleAction(action: string, item: any) {
    if (action === 'edit') {
      this.createUpdateUser(item);
    } 
  }
}
