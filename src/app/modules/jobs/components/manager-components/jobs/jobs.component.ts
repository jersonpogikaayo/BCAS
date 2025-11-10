import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ManagerJobsHttpRequestsService } from 'src/app/core/services/http-requests/manager-jobs-http-requests.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {

  activeTab: number = 0;
  allJobsCount: number = 0;
  unAssignedJobsCount: number = 0;
  assignedJobsCount: number = 0;
  bookedJobsCount: number = 0;
  inProgressJobsCount: number = 0;
  pausedJobsCount: number = 0;
  pendingReviewJobsCount: number = 0;
  failedJobsCount: number = 0;
  completedJobsCount: number = 0;

  // Loading states
  isLoadingCounts: boolean = false;
  countsLoadError: string | null = null;

  constructor(
    private managerJobsHttpRequestsService: ManagerJobsHttpRequestsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadJobsCount();
  }

  loadJobsCount(forceRefresh: boolean = true) {
    this.isLoadingCounts = true;
    this.countsLoadError = null;

    // Execute all count requests in parallel
    forkJoin({
      allJobsCount: this.managerJobsHttpRequestsService.getAllJobsCount(forceRefresh),
      unAssignedJobsCount: this.managerJobsHttpRequestsService.getUnassignedJobsCount(forceRefresh),
      assignedJobsCount: this.managerJobsHttpRequestsService.getAssignedJobsCount(forceRefresh),
      bookedJobsCount: this.managerJobsHttpRequestsService.getBookedJobsCount(forceRefresh),
      inProgressJobsCount: this.managerJobsHttpRequestsService.getInProgressJobsCount(forceRefresh),
      pausedJobsCount: this.managerJobsHttpRequestsService.getPausedJobsCount(forceRefresh),
      pendingReviewJobsCount: this.managerJobsHttpRequestsService.getPendingReviewJobsCount(forceRefresh),
      failedJobsCount: this.managerJobsHttpRequestsService.getFailedJobsCount(forceRefresh),
      completedJobsCount: this.managerJobsHttpRequestsService.getCompletedJobsCount(forceRefresh),
    }).subscribe({
      next: (counts) => {
        // Assign all counts at once
        this.allJobsCount = counts.allJobsCount;
        this.unAssignedJobsCount = counts.unAssignedJobsCount;
        this.assignedJobsCount = counts.assignedJobsCount;
        this.bookedJobsCount = counts.bookedJobsCount;
        this.inProgressJobsCount = counts.inProgressJobsCount;
        this.pausedJobsCount = counts.pausedJobsCount;
        this.pendingReviewJobsCount = counts.pendingReviewJobsCount;
        this.failedJobsCount = counts.failedJobsCount;
        this.completedJobsCount = counts.completedJobsCount;
        
        console.log('✅ All job counts loaded successfully:', counts);
        this.isLoadingCounts = false;
        this.cdr.detectChanges();

      },
      error: (error) => {
        console.error('❌ Error loading job counts:', error);
        this.countsLoadError = 'Failed to load job counts. Please try again.';
        this.isLoadingCounts = false;
        
        // Set all counts to 0 on error
        this.resetAllCounts();
      }
    });
  }

   /**
   * Reset all counts to 0
   */
  private resetAllCounts(): void {
    this.allJobsCount = 0;
    this.unAssignedJobsCount = 0;
    this.assignedJobsCount = 0;
    this.bookedJobsCount = 0;
    this.inProgressJobsCount = 0;
    this.pausedJobsCount = 0;
    this.pendingReviewJobsCount = 0;
    this.failedJobsCount = 0;
    this.completedJobsCount = 0;
  }

  updateCount(event: any): void {
    this.resetAllCounts();
    this.refreshCounts();
    this.loadJobsCount(true);
  }

   refreshCounts(): void {
    this.loadJobsCount();
  }

}
