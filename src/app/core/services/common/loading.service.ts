import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private messageSubject = new BehaviorSubject<string>('Loading Please wait...');
  public message$ = this.messageSubject.asObservable();

  constructor(private spinner: NgxSpinnerService) {}

  show(message?: string) {
    const loadingMessage = message || 'Loading Please wait...';
    this.messageSubject.next(loadingMessage);
    
    // Hide first, then show with new message
    this.spinner.hide();
    setTimeout(() => {
      this.spinner.show();
    }, 50);
  }

  hide() {
    this.spinner.hide();
  }

  getCurrentMessage(): string {
    return this.messageSubject.value;
  }
}