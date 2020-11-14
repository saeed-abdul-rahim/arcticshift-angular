import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ADMIN, LOGIN } from '@constants/routes';
import { AdminNavService } from '@services/admin-nav/admin-nav.service';
import { AuthService } from '@services/auth/auth.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  loading = false;

  userSubscription: Subscription;

  constructor(private auth: AuthService, private router: Router, private adminNavService: AdminNavService, private shop: ShopService) {}

  ngOnInit(): void {
    this.getRoute();
    this.shop.getGeneralSettingsFromDb();
  }

  ngOnDestroy(): void {
    this.unsubscribeUser();
    this.adminNavService.destroy();
    this.shop.destroy();
  }

  unsubscribeUser() {
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
  }

  async getRoute() {
    this.loading = true;
    try {
      await this.auth.getUser().then(user$ => {
        if (!user$) {
          this.toLogin();
        } else {
          this.unsubscribeUser();
          this.userSubscription = user$.subscribe(user => {
            if (!user) {
              this.toLogin();
            } else if (user.isAnonymous) {
              this.auth.signOut();
              this.toLogin();
            } else if (user.role !== 'admin' && user.role !== 'staff') {
              this.toLogin();
            } else {
              this.loading = false;
            }
          });
        }
      });
    } catch (err) {
      this.toLogin();
    }
  }

  toLogin() {
    this.shop.destroy();
    this.router.navigateByUrl(`/${ADMIN}/${LOGIN}`);
  }

}
