import { Component, Input, OnInit } from '@angular/core';
import { JobDetail, JobHistoryItem } from 'src/app/core/models/jobs/jobs.model';
import { DownloadService } from 'src/app/core/services/common/download.service';
import { JobsHttpRequestsService } from 'src/app/core/services/http-requests/jobs-http-requests.service';

@Component({
  selector: 'app-jobs-history',
  templateUrl: './jobs-history.component.html',
  styleUrls: ['./jobs-history.component.scss']
})
export class JobsHistoryComponent implements OnInit {
  @Input() job!: JobDetail;

  jobHistory: JobHistoryItem[] = [];
  loading = false;
  isLoadingPDF = false;
  isLoadingExcel = false;
  
  constructor(
    private jobsHttpRequestsService: JobsHttpRequestsService,
    private downloadService: DownloadService
  ) { }

  ngOnInit(): void {
    console.log('Job History:', this.job);
    this.loadFullHistory(this.job.id);
  }

  loadFullHistory(jobId: number): void {
    this.loading = true;

    this.jobsHttpRequestsService.getJobHistory(jobId).subscribe({
      next: (response: JobHistoryItem[]) => {
        this.jobHistory = response;
      },
      error: (error) => {
        this.loading = false;
        console.error('Job history error:', error);
      }
    });
  }

  getOverdue(job: JobDetail): number {
    const dueDate = job?.dueDate ? new Date(job.dueDate) : null;
    const compareDate = job?.completionDate ? new Date(job.completionDate) : new Date();
    
    return dueDate ? Math.floor((compareDate.getTime() - dueDate.getTime()) / 86400000) : 0;
  }

  getAbsoluteOverdue(job: JobDetail): number {
    return Math.abs(this.getOverdue(job));
  }

  trackByHistoryId(index: number, history: any): number {
    return history.id;
  }

  getStatusBadgeClass(): string {
    return 'badge bg-primary';
  }

  downloadPDF(): void {
    if (this.isLoadingPDF) return;
    
    this.isLoadingPDF = true;
    
    this.downloadService.downloadPDF(this.job).subscribe({
      next: () => {
        console.log('✅ PDF download completed');
        this.isLoadingPDF = false;
      },
      error: () => {
        this.isLoadingPDF = false;
        console.error('❌ PDF download failed');
      }
    });

  }

  downloadExcel(): void {
    if (this.isLoadingExcel) return;
    
    this.isLoadingExcel = true;
    
    this.downloadService.downloadExcel(this.job).subscribe({
      next: () => {
        console.log('✅ Excel download completed');
        this.isLoadingExcel = false;
      },
      error: () => {
        this.isLoadingExcel = false;
        console.error('❌ Excel download failed');
      }
    });

  }

}
