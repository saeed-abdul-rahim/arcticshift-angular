import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons/faShoppingBag';
import { CartService } from '@services/cart/cart.service';
import { OrderInterface } from '@models/Order';
import { CART } from '@constants/routes';
import { User } from '@models/User';
import { NavbarService } from '@services/navbar/navbar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  cartRoute = `/${CART}`;

  faShoppingBag = faShoppingBag;
  faHeart = faHeart;
  faSearch = faSearch;

  showMenu = false;
  sidebarOpened: boolean;

  user: User;
  draft: OrderInterface;

  private draftSubscription: Subscription;
  private sidebarOpenedSubscription: Subscription;

  constructor(private cart: CartService, private nav: NavbarService) { }

  ngOnInit(): void {
    this.draftSubscription = this.cart.getDraft().subscribe(draft => this.draft = draft);
    this.sidebarOpenedSubscription = this.nav.getSidebarOpened().subscribe(sidebarOpened => this.sidebarOpened = sidebarOpened);
  }

  ngOnDestroy(): void {
    if (this.draftSubscription && !this.draftSubscription.closed) {
      this.draftSubscription.unsubscribe();
    }
    if (this.sidebarOpenedSubscription && !this.sidebarOpenedSubscription.closed) {
      this.sidebarOpenedSubscription.unsubscribe();
    }
    this.cart.destroy();
  }

  toggleMenu() {
    this.nav.setSidebarOpened(!this.sidebarOpened);
  }

}
