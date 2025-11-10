import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { OperationalReportsComponent } from './components/operational-reports/operational-reports.component';
import { NotPresentedReportsComponent } from './components/not-presented-reports/not-presented-reports.component';
import { FormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgSelectModule } from '@ng-select/ng-select';



@NgModule({
  declarations: [
    OperationalReportsComponent,
    NotPresentedReportsComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    ReportsRoutingModule,
    FormsModule,
    NgxDaterangepickerMd.forRoot()
  ]
})
export class ReportsModule { }
