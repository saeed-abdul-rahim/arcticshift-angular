import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  loading = false;

  userSubscription: Subscription;

  constructor(private auth: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.getRoute();
  }

  getRoute() {
    this.loading = true;
    this.auth.getUser().then(user$ => {
      if (!user$) {
        this.toLogin();
      } else {
        this.userSubscription = user$.subscribe(user => {
          if (!user) {
            this.toLogin();
          } else if (user.role !== 'admin' && user.role !== 'staff') {
            this.toLogin();
          } else {
            this.loading = false;
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
  }

  toLogin() {
    this.router.navigateByUrl('admin/login');
  }

}
