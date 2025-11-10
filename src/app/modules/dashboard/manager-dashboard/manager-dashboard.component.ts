import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticatedUser } from 'src/app/core/models/auth-user.model';
import { SummaryStatusResponse, SummaryStatusItem, DashboardSummary } from 'src/app/core/models/dashboard.model';
import { DashboardService } from 'src/app/core/services/http-requests/dashboard-http-requests.service';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.scss']
})
export class ManagerDashboardComponent implements OnInit, OnChanges {
  @Input() user!: AuthenticatedUser;
  @Input() userRole: string = '';
  
  summaryStatus: SummaryStatusResponse = [];
  dashboardSummary: DashboardSummary | null = null;
  engineerSummary: any[] = [];

  constructor(
    private dashboardHttpService: DashboardService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSummaryStatus();
    this.loadEngineerSummary();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue) {
      this.loadManagerData();
    }
  }

  loadSummaryStatus(): void {
    this.dashboardHttpService.getSummaryStatus().subscribe({
      next: (data: SummaryStatusResponse) => {
        this.summaryStatus = data;
      },
      error: (error) => {
        console.error('Error loading manager dashboard summary status:', error);
      }
    });
  }

  loadEngineerSummary(): void {
    // Replace with your actual service call
    this.dashboardHttpService.getEngineerSummary().subscribe({
      next: (data: any[]) => {
        this.engineerSummary = data;
      },
      error: (error) => {
        console.error('Error loading engineer summary:', error);
      }
    });
  }

  redirectToJobsStatus(statusType: string) {
    this.router.navigate(['/dashboard/datagrid'], {
      queryParams: this.getJobsStatusQueryParams(statusType)
    });
  }

  redirectToAllJobsStatus() {
    this.router.navigate(['/dashboard/datagrid'], {
      queryParams: this.getAllJobsStatusQueryParams()
    });
  }

  // Helper methods
  getTotalJobs(): number {
    return this.summaryStatus.reduce((sum, item) => sum + item.count, 0);
  }

  getEngineerTotal(): number {
    return this.engineerSummary.reduce((sum, item) => sum + item.count, 0);
  }

  // For loading placeholders
  iterateArray(count: number): number[] {
    return Array(count).fill(0).map((x, i) => i);
  }

  private loadManagerData(): void {
    if (this.user?.firstName) {
      // Reload data when user changes
      this.loadSummaryStatus();
      this.loadEngineerSummary();
    }
  }

  getJobsStatusQueryParams(statusType: string): { [key: string]: string } {
    return { 'status': statusType };
  }

  getAllJobsStatusQueryParams() {
    return { 'status': ''}
  }

  getJobsUserQueryParams(userName: string): { [key: string]: string } {
    return { 'userName': userName };
  }
}