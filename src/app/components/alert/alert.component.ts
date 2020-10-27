import { Component, OnDestroy, OnInit } from '@angular/core';
import { inOut } from '@animations/inOut';
import { Alert } from '@services/alert/Alert';
import { AlertService } from '@services/alert/alert.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  animations: [inOut]
})
export class AlertComponent implements OnInit, OnDestroy {

  alert: Alert;
  alertSubscription: Subscription;

  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
    this.alertSubscription = this.alertService.onAlert().subscribe(alt => {
      this.alert = alt;
      setInterval(() => this.removeAlert(), 3000);
    });
  }

  ngOnDestroy(): void {
    this.alertSubscription.unsubscribe();
  }

  removeAlert(): void {
    this.alertService.removeAlert();
  }

}
