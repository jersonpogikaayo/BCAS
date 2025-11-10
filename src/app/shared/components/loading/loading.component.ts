import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/core/services/common/loading.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit, OnDestroy {
  displayMessage: string = 'Loading Please wait...';
  private messageSubscription?: Subscription;
  
  constructor(private loadingService: LoadingService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.messageSubscription = this.loadingService.message$.subscribe(
      message => {
        this.displayMessage = message;
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy() {
    this.messageSubscription?.unsubscribe();
  }
}
