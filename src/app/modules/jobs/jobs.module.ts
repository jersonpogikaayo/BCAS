import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyJobsComponent } from './components/engineer-components/my-jobs/my-jobs.component';
import { LayoutsModule } from '../layouts/layouts.module';
import { JobsRoutingModule } from './jobs-routing.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { MyAssignedJobsComponent } from './components/engineer-components/my-assigned-jobs/my-assigned-jobs.component';
import { MyBookedJobsComponent } from './components/engineer-components/my-booked-jobs/my-booked-jobs.component';
import { MyInProgressJobsComponent } from './components/engineer-components/my-in-progress-jobs/my-in-progress-jobs.component';
import { MyPausedJobsComponent } from './components/engineer-components/my-paused-jobs/my-paused-jobs.component';
import { MyCompletedJobsComponent } from './components/engineer-components/my-completed-jobs/my-completed-jobs.component';
import { MyPendingReviewJobsComponent } from './components/engineer-components/my-pending-review-jobs/my-pending-review-jobs.component';
import { MyFailedJobsComponent } from './components/engineer-components/my-failed-jobs/my-failed-jobs.component';
import { MyNotPresentedJobsComponent } from './components/engineer-components/my-not-presented-jobs/my-not-presented-jobs.component';
import { RaiseJobComponent } from './components/engineer-components/raise-job/raise-job.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { JobsComponent } from './components/manager-components/jobs/jobs.component';
import { AllJobsComponent } from './components/manager-components/all-jobs/all-jobs.component';
import { UnassignedJobsComponent } from './components/manager-components/unassigned-jobs/unassigned-jobs.component';
import { AssignedJobsComponent } from './components/manager-components/assigned-jobs/assigned-jobs.component';
import { BookedJobsComponent } from './components/manager-components/booked-jobs/booked-jobs.component';
import { InProgressJobsComponent } from './components/manager-components/in-progress-jobs/in-progress-jobs.component';
import { PausedJobsComponent } from './components/manager-components/paused-jobs/paused-jobs.component';
import { PendingJobsComponent } from './components/manager-components/pending-jobs/pending-jobs.component';
import { FailedJobsComponent } from './components/manager-components/failed-jobs/failed-jobs.component';
import { CompletedJobsComponent } from './components/manager-components/completed-jobs/completed-jobs.component';
import { ManagerCreateJobsComponent } from './components/manager-components/manager-create-jobs/manager-create-jobs.component';



@NgModule({
  declarations: [
    MyJobsComponent,
    MyAssignedJobsComponent,
    MyBookedJobsComponent,
    MyInProgressJobsComponent,
    MyPausedJobsComponent,
    MyCompletedJobsComponent,
    MyPendingReviewJobsComponent,
    MyFailedJobsComponent,
    MyNotPresentedJobsComponent,
    RaiseJobComponent,
    JobsComponent,
    AllJobsComponent,
    UnassignedJobsComponent,
    AssignedJobsComponent,
    BookedJobsComponent,
    InProgressJobsComponent,
    PausedJobsComponent,
    PendingJobsComponent,
    FailedJobsComponent,
    CompletedJobsComponent,
    ManagerCreateJobsComponent,
  ],
  imports: [
    JobsRoutingModule,
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    LayoutsModule,
    NgSelectModule
  ]
})
export class JobsModule { }
