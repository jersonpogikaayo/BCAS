import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BUILD_INFO } from 'src/app/build-info';
import { OnlineStatusService } from 'src/app/core/services/offline/online-status.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  private ngUnsubscribe = new Subject<void>();
  isOffline!: boolean;
  // set the currenr year
  year: number = new Date().getFullYear();
  readonly BUILD_INFO = BUILD_INFO;

  cacheProgress: any;

  userRole: any;

  constructor(
    private onlineStatusService: OnlineStatusService,
  ) {
   
  }

  ngOnInit(): void {
    this.onlineStatusService.onlineStatus$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(isOnline => {
        this.isOffline = !isOnline;
      });
  }

  getCurrentDateTime(): string {
    const now = new Date();

    const hours = this.padZero(now.getHours());
    const minutes = this.padZero(now.getMinutes());
    const seconds = this.padZero(now.getSeconds());

    const day = this.padZero(now.getDate());
    const month = this.padZero(now.getMonth() + 1);
    const year = now.getFullYear();

    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  }

  private padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  refresh() {
    window.location.reload();
  }
}
