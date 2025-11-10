import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '../layouts/layout.component';
import { MyJobsComponent } from './components/engineer-components/my-jobs/my-jobs.component';
import { RaiseJobComponent } from './components/engineer-components/raise-job/raise-job.component';
import { JobsComponent } from './components/manager-components/jobs/jobs.component';
import { ManagerCreateJobsComponent } from './components/manager-components/manager-create-jobs/manager-create-jobs.component';
import { CommonDatagridWidgetComponent } from '../dashboard/common-datagrid-widget/common-datagrid-widget.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'my-jobs',
        component: MyJobsComponent
      },
      {
        path: 'raise-jobs',
        component: RaiseJobComponent
      },
      {
        path: 'manager-jobs',
        component: JobsComponent
      },
      {
        path: 'create-jobs',
        component: ManagerCreateJobsComponent
      },
      {
        path: 'search',
        component: CommonDatagridWidgetComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobsRoutingModule { }
