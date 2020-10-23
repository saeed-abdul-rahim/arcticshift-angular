import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons/faShoppingBag';
import { ShopNavService } from '@services/shop-nav.service';
import { OrderInterface } from '@models/Order';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  faShoppingBag = faShoppingBag;
  faHeart = faHeart;
  faSearch = faSearch;

  showMenu = false;

  draft: OrderInterface;
  draftSubscription: Subscription;

  constructor(private shopNav: ShopNavService) { }

  ngOnInit(): void {
    this.draftSubscription = this.shopNav.getDraft().subscribe(draft => this.draft = draft);
  }

  ngOnDestroy(): void {
    if (this.draftSubscription && !this.draftSubscription.closed) {
      this.draftSubscription.unsubscribe();
    }
    this.shopNav.destroy();
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

}
