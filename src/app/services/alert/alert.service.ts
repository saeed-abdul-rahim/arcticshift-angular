import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { Alert } from './Alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private subject = new Subject<Alert>();

  onAlert(): Observable<Alert> {
      return this.subject.asObservable();
  }

  alert(alert: Alert) {
      this.subject.next({ ...alert, show: true });
  }

  removeAlert() {
    this.subject.next({ show: false });
  }

}
