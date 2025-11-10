import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineStatusService {
  private onlineStatusSubject = new BehaviorSubject<boolean>(navigator.onLine);
  onlineStatus$ = this.onlineStatusSubject.asObservable();

  constructor() {
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
  }

  private updateOnlineStatus(isOnline: boolean) {
    this.onlineStatusSubject.next(isOnline);
  }

  checkOnlineStatus(): boolean {
    return navigator.onLine;
  }
}
