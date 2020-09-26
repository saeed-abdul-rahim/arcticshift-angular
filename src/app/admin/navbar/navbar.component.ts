import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { AdminNavService } from '@services/admin-nav/admin-nav.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  heading: string;

  urlSubscription: Subscription;

  constructor(private adminNavService: AdminNavService, private router: Router) {
    this.urlSubscription = this.adminNavService.getCurrentUrl().subscribe(url => {
      const { split } = url;
      const routeStr = this.adminNavService.getNavRoutes().find(r => split.includes(r));
      this.heading = routeStr;
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.urlSubscription && !this.urlSubscription.closed) {
      this.urlSubscription.unsubscribe();
    }
  }

  navigate(type: string) {
    const path = this.adminNavService.getRoute(type);
    this.router.navigateByUrl(path);
  }

}
