import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthenticatedUser } from 'src/app/core/models/auth-user.model';
import { DashboardService, DashboardCounts } from 'src/app/core/services/http-requests/dashboard-http-requests.service';

@Component({
  selector: 'app-engineer-dashboard',
  templateUrl: './engineer-dashboard.component.html',
  styleUrls: ['./engineer-dashboard.component.scss']
})
export class EngineerDashboardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() user!: AuthenticatedUser;
  
  private destroy$ = new Subject<void>();
  
  // Loading state
  isLoading = true;
  
  // Dashboard counts from API
  jobsTodayCount: number = 0;
  jobsOverdueCount: number = 0;
  jobsBookedCount: number = 0;
  jobsDueCount: number = 0;
  jobsAssignedCount: number = 0;
  jobsCompletedCount: number = 0;
  jobsNotPresentedCount: number = 0;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    if (this.user) {
      this.loadDashboardData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue) {
      this.loadDashboardData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    if (!this.user) return;

    this.isLoading = true;
    console.log('Loading engineer dashboard for:', this.user.firstName);
    
    this.dashboardService.getAllDashboardCounts(true)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data: DashboardCounts) => {
          this.jobsTodayCount = data.jobsTodayCount;
          this.jobsOverdueCount = data.jobsOverdueCount;
          this.jobsBookedCount = data.jobsBookedCount;
          this.jobsDueCount = data.jobsDueCount;
          this.jobsAssignedCount = data.jobsAssignedCount;
          this.jobsCompletedCount = data.jobsCompletedCount;
          this.jobsNotPresentedCount = data.jobsNotPresentedCount;
        },
        error: (error: Error) => {
          console.error('Error loading dashboard data:', error);
          this.setDefaultValues();
        }
      });
  }

  private setDefaultValues(): void {
    this.jobsTodayCount = 0;
    this.jobsOverdueCount = 0;
    this.jobsBookedCount = 0;
    this.jobsDueCount = 0;
    this.jobsAssignedCount = 0;
    this.jobsCompletedCount = 0;
    this.jobsNotPresentedCount = 0;
  }

  // Helper methods for query parameters
  getTodayJobsQueryParams(): any {
    return this.dashboardService.getTodayJobsQueryParams();
  }

  getOverdueJobsQueryParams(): any {
    return this.dashboardService.getOverdueJobsQueryParams();
  }

  getBookedJobsQueryParams(): any {
    return { 'status': 'booked' };
  }

  getDueJobsQueryParams(): any {
    return this.dashboardService.getDueJobsQueryParams();
  }

  getAssignedJobsQueryParams(): any {
    return { 'status': 'assigned' };
  }

  getCompletedJobsQueryParams(): any {
    return { 'status': 'complete' };
  }

  getNotPresentedJobsQueryParams(): any {
    return { 'status': 'CannotLocate' };
  }

  // Refresh data method
  refreshData(): void {
    this.loadDashboardData();
  }
}