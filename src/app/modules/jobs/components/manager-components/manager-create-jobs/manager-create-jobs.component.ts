import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { User } from 'src/app/core/models/auth-user.model';
import { GridItem, ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { EquipmentDatagridService } from 'src/app/core/services/common/equipment-datagrid.service';
import { AnswerService } from 'src/app/core/services/http-requests/answer-http-requests.service';
import { EquipmentsHttpRequestsService } from 'src/app/core/services/http-requests/equipment-http-requests.service';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';
import { SurveyHttpRequestsService } from 'src/app/core/services/http-requests/survey-http-requests.service';
import { EquipmentsDataGridComponent } from 'src/app/shared/components/data-grids/equipments-data-grid/equipments-data-grid.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manager-create-jobs',
  templateUrl: './manager-create-jobs.component.html',
  styleUrls: ['./manager-create-jobs.component.scss']
})
export class ManagerCreateJobsComponent implements OnInit {
    
    constructor(

    ) { }
  
    ngOnInit(): void {
    }
  

}
