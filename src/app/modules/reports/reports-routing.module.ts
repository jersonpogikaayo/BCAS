import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '../layouts/layout.component';
import { OperationalReportsComponent } from './components/operational-reports/operational-reports.component';
import { NotPresentedReportsComponent } from './components/not-presented-reports/not-presented-reports.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'operational',
        component: OperationalReportsComponent
      },
      {
        path: 'not-presented',
        component: NotPresentedReportsComponent
      }
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
