import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MyJobsHttpRequestsService } from 'src/app/core/services/http-requests/my-jobs-http-requests.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-my-jobs',
  templateUrl: './my-jobs.component.html',
  styleUrls: ['./my-jobs.component.scss']
})
export class MyJobsComponent implements OnInit {
  activeTab: number = 0;
  
  // Job count properties
  jobsAssignedCount: number = 0;
  bookedJobsCount: number = 0;
  inProgressJobsCount: number = 0;
  pausedJobsCount: number = 0;
  pendingJobsCount: number = 0;
  failedJobsCount: number = 0;
  notPresentedJobsCount: number = 0;
  completedJobsCount: number = 0;
  
  // Loading states
  isLoadingCounts: boolean = false;
  countsLoadError: string | null = null;

  constructor(
    private myJobsHttpRequestsService: MyJobsHttpRequestsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadAllJobCounts();
  }

  /**
   * Load all job counts simultaneously using forkJoin
   */
  loadAllJobCounts(forceRefresh: boolean = true): void {
    this.isLoadingCounts = true;
    this.countsLoadError = null;

    // Execute all count requests in parallel
    forkJoin({
      assigned: this.myJobsHttpRequestsService.getJobsAssignedCounts(forceRefresh),
      booked: this.myJobsHttpRequestsService.getBookedJobsCounts(forceRefresh),
      inProgress: this.myJobsHttpRequestsService.getInProgressJobsCounts(forceRefresh),
      paused: this.myJobsHttpRequestsService.getPausedJobsCounts(forceRefresh),
      pending: this.myJobsHttpRequestsService.getPendingJobsCounts(forceRefresh),
      failed: this.myJobsHttpRequestsService.getFailedJobsCounts(forceRefresh),
      notPresented: this.myJobsHttpRequestsService.getNotPresentedJobsCounts(forceRefresh),
      completed: this.myJobsHttpRequestsService.getCompletedJobsCounts(forceRefresh)
    }).subscribe({
      next: (counts) => {
        // Assign all counts at once
        this.jobsAssignedCount = counts.assigned;
        this.bookedJobsCount = counts.booked;
        this.inProgressJobsCount = counts.inProgress;
        this.pausedJobsCount = counts.paused;
        this.pendingJobsCount = counts.pending;
        this.failedJobsCount = counts.failed;
        this.notPresentedJobsCount = counts.notPresented;
        this.completedJobsCount = counts.completed;
        
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

  updateCount(event: any): void {
    this.resetAllCounts();
    this.refreshCounts();
    this.loadAllJobCounts(true);
  }

  /**
   * Load individual job count methods (backup/fallback methods)
   */
  loadJobsAssignedCount(): void {
    this.myJobsHttpRequestsService.getJobsAssignedCounts().subscribe({
      next: (response: number) => {
        this.jobsAssignedCount = response;
      },
      error: (error) => {
        console.error('Error fetching jobs assigned count:', error);
      }
    });
  }

  loadBookedJobsCount(): void {
    this.myJobsHttpRequestsService.getBookedJobsCounts().subscribe({
      next: (response: number) => {
        this.bookedJobsCount = response;
      },
      error: (error) => {
        console.error('Error fetching booked jobs count:', error);
      }
    });
  }

  loadInProgressJobsCount(): void {
    this.myJobsHttpRequestsService.getInProgressJobsCounts().subscribe({
      next: (response: number) => {
        this.inProgressJobsCount = response;
      },
      error: (error) => {
        console.error('Error fetching in progress jobs count:', error);
      }
    });
  }

  loadPausedJobsCount(): void {
    this.myJobsHttpRequestsService.getPausedJobsCounts().subscribe({
      next: (response: number) => {
        this.pausedJobsCount = response;
      },
      error: (error) => {
        console.error('Error fetching paused jobs count:', error);
      }
    });
  }

  loadPendingJobsCount(): void {
    this.myJobsHttpRequestsService.getPendingJobsCounts().subscribe({
      next: (response: number) => {
        this.pendingJobsCount = response;
      },
      error: (error) => {
        console.error('Error fetching pending jobs count:', error);
      }
    });
  }

  loadFailedJobsCount(): void {
    this.myJobsHttpRequestsService.getFailedJobsCounts().subscribe({
      next: (response: number) => {
        this.failedJobsCount = response;
      },
      error: (error) => {
        console.error('Error fetching failed jobs count:', error);
      }
    });
  }

  loadNotPresentedJobsCount(): void {
    this.myJobsHttpRequestsService.getNotPresentedJobsCounts().subscribe({
      next: (response: number) => {
        this.notPresentedJobsCount = response;
      },
      error: (error) => {
        console.error('Error fetching not presented jobs count:', error);
      }
    });
  }

  loadCompletedJobsCount(): void {
    this.myJobsHttpRequestsService.getCompletedJobsCounts().subscribe({
      next: (response: number) => {
        this.completedJobsCount = response;
      },
      error: (error) => {
        console.error('Error fetching completed jobs count:', error);
      }
    });
  }

  /**
   * Reset all counts to 0
   */
  private resetAllCounts(): void {
    this.jobsAssignedCount = 0;
    this.bookedJobsCount = 0;
    this.inProgressJobsCount = 0;
    this.pausedJobsCount = 0;
    this.pendingJobsCount = 0;
    this.failedJobsCount = 0;
    this.notPresentedJobsCount = 0;
    this.completedJobsCount = 0;
  }

  /**
   * Refresh all counts
   */
  refreshCounts(): void {
    this.loadAllJobCounts();
  }

}
