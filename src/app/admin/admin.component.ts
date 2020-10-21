import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ADMIN, LOGIN } from '@constants/routes';
import { AdminNavService } from '@services/admin-nav/admin-nav.service';
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

  constructor(private auth: AuthService, private router: Router, private adminNavService: AdminNavService) {
  }

  ngOnInit(): void {
    this.getRoute();
  }

  ngOnDestroy(): void {
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
    this.adminNavService.destroy();
  }

  async getRoute() {
    this.loading = true;
    try {
      await this.auth.getUser().then(user$ => {
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
    } catch (_) {
      this.toLogin();
    }
  }

  toLogin() {
    this.router.navigateByUrl(`${ADMIN}/${LOGIN}`);
  }

}
