import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CacheService } from './core/services/cache/cache.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'web-client';

  private ngUnsubscribe = new Subject<void>();
  isOffline!: boolean;
  queuedRequests: any[] = [];
  constructor(
    private cacheService: CacheService
  ) { }    

  ngOnInit() {
 
  }


}
