import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons/faShoppingBag';
import { CartService } from '@services/cart/cart.service';
import { OrderInterface } from '@models/Order';
import { CART } from '@constants/routes';
import { AuthService } from '@services/auth/auth.service';
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
  showSignInModal = false;

  user: User;
  draft: OrderInterface;

  private draftSubscription: Subscription;
  private userSubscription: Subscription;

  constructor(private cart: CartService, private auth: AuthService, private nav: NavbarService) { }

  ngOnInit(): void {
    this.draftSubscription = this.cart.getDraft().subscribe(draft => this.draft = draft);
    this.userSubscription = this.auth.getCurrentUserStream().subscribe(user => this.user = user);
  }

  ngOnDestroy(): void {
    if (this.draftSubscription && !this.draftSubscription.closed) {
      this.draftSubscription.unsubscribe();
    }
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
    this.cart.destroy();
  }

  toggleMenu() {
    this.nav.setSidebarOpened(true);
  }

  toggleSignInModal() {
    this.showSignInModal = true;
  }

  signOut() {
    this.auth.signOut();
  }

}
