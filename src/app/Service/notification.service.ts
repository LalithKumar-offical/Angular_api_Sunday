import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private watchlistUpdateSubject = new Subject<void>();
  
  watchlistUpdate$ = this.watchlistUpdateSubject.asObservable();
  
  notifyWatchlistUpdate() {
    this.watchlistUpdateSubject.next();
  }
}