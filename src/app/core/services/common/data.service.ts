import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private createUpdateSection = new Subject<any>();
  private cachingProgressPercent = new BehaviorSubject<number>(0);
  
  // Observable stream
  data$ = this.createUpdateSection.asObservable();
  cachePercent$: Observable<number> = this.cachingProgressPercent.asObservable();

  constructor() { }

  // Method to call to update data
  updateCreateUpdateSection(data: any) {
    this.createUpdateSection.next(data);
  }

  updateDataCachePercent(newData: number) {
    this.cachingProgressPercent.next(newData);
  }

  // Method to get the current value of the caching progress percent
  getCurrentDataCachePercent(): number {
    return this.cachingProgressPercent.getValue();
  }
}
