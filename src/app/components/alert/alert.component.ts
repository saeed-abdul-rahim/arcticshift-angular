import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { inOut } from '@animations/inOut';
import { Alert } from '@services/alert/Alert';
import { AlertService } from '@services/alert/alert.service';
import { setTimeout } from '@utils/setTimeout';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  animations: [inOut]
})
export class AlertComponent implements OnInit, OnDestroy {

  alert: Alert;
  alertSubscription: Subscription;

  constructor(private alertService: AlertService, private ref: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.alertSubscription = this.alertService.onAlert().subscribe(alt => {
      this.alert = alt;
      setTimeout(() => {
        this.removeAlert();
        this.ref.detectChanges();
      }, 3000);
    });
  }

  ngOnDestroy(): void {
    this.alertSubscription.unsubscribe();
  }

  removeAlert(): void {
    this.alertService.removeAlert();
  }

}
