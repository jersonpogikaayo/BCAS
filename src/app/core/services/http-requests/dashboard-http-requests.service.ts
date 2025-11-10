import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CommonService } from '../common/common.service';
import { CacheService } from '../cache/cache.service';
import { catchError, tap } from 'rxjs/operators';

export interface DashboardCounts {
  jobsTodayCount: number;
  jobsOverdueCount: number;
  jobsBookedCount: number;
  jobsDueCount: number;
  jobsAssignedCount: number;
  jobsCompletedCount: number;
  jobsNotPresentedCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.api;

  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    private cacheService: CacheService
  ) {}

  getAllDashboardCounts(forceRefresh = false): Observable<DashboardCounts> {
    const cacheKey = '/api/dashboard/counts';
    
    return this.cacheService.get<DashboardCounts>(cacheKey, {
      forceRefresh,
      cacheTime: 2 * 60 * 1000, 
      skipCache: false
    }).pipe(
      catchError(() => this.fetchAllDashboardCounts())
    );
  }

  private fetchAllDashboardCounts(): Observable<DashboardCounts> {
    console.log('🔄 Fetching fresh dashboard counts...');
    
    return forkJoin({
      jobsTodayCount: this.getTodayJobsCount(),
      jobsOverdueCount: this.getOverdueJobsCount(),
      jobsBookedCount: this.getBookedJobsCount(),
      jobsDueCount: this.getDueJobsCount(),
      jobsAssignedCount: this.getAssignedJobsCount(),
      jobsCompletedCount: this.getCompletedJobsCount(),
      jobsNotPresentedCount: this.getNotPresentedJobsCount()
    }).pipe(
      tap(counts => {
        this.cacheService.setCachedData('/api/dashboard/counts', counts, 2 * 60 * 1000);
        console.log('✅ Dashboard counts cached', counts);
      })
    );
  }

  getTodayJobsCount(): Observable<number> {
    const dateToday = this.commonService.getDates().dateToday;
    return this.http.get<number>(`${this.apiUrl}job/find/count/user?BookedDate=${dateToday}`);
  }

  getOverdueJobsCount(): Observable<number> {
    const endDateLastMonth = this.commonService.getDates().endDateLastMonth;
    return this.http.get<number>(`${this.apiUrl}job/find/count/user?EndDueDate=${endDateLastMonth}&JobStatusTypes=1&JobStatusTypes=2&JobStatusTypes=3&JobStatusTypes=4&JobStatusTypes=5&JobStatusTypes=6&JobStatusTypes=7&JobStatusTypes=8`);
  }

  getBookedJobsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}job/find/count/user?Status=booked`);
  }

  getDueJobsCount(): Observable<number> {
    const firstDateCurrentMonth = this.commonService.getDates().firstDateCurrentMonth;
    const lastDateCurrentMonth = this.commonService.getDates().lastDateCurrentMonth;
    return this.http.get<number>(`${this.apiUrl}job/find/count/user?StartDueDate=${firstDateCurrentMonth}&EndDueDate=${lastDateCurrentMonth}`);
  }

  getAssignedJobsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}job/find/count/user?Status=assigned`);
  }

  getCompletedJobsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}job/find/count/user?Status=complete`);
  }

  getNotPresentedJobsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}job/find/count/user?Status=CannotLocate`);
  }

  getOverdueJobsQueryParams(): any {
  const endDateLastMonth = this.commonService.getDates().endDateLastMonth;
  
  const params: any = {
    'EndDueDate': endDateLastMonth
  };
  
  const statusTypes = [1, 2, 3, 4, 5, 6, 7, 8];
  statusTypes.forEach((statusType, index) => {
    params[`JobStatusTypes[${index}]`] = statusType;
  });
  
  return params;
}

  getDueJobsQueryParams(): any {
    return {
      'StartDueDate': this.commonService.getDates().firstDateCurrentMonth,
      'EndDueDate': this.commonService.getDates().lastDateCurrentMonth
    };
  }

  getTodayJobsQueryParams(): any {
    const dateToday = this.commonService.getDates().dateToday;
    return {
      'bookedDate': dateToday
    };
  }
  
  getSummaryStatus() {
    return this.http.get<any>(`${this.apiUrl}job/dashboard/summary`);
  }

  getEngineerSummary(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}job/dashboard/summary/myusers`);
  }
}