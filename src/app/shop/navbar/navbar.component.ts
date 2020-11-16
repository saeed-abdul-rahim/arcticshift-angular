import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons/faShoppingBag';
import { CartService } from '@services/cart/cart.service';
import { OrderInterface } from '@models/Order';
import { CART, shopProductRoute } from '@constants/routes';
import { User } from '@models/User';
import { NavbarService } from '@services/navbar/navbar.service';
import { ShopService } from '@services/shop/shop.service';
import { ProductInterface } from '@models/Product';
import { getSmallestThumbnail } from '@utils/media';
import { Router } from '@angular/router';

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

  innerWidth: number;
  isMobile = false;
  showMenu = false;
  showSearch = false;
  sidebarOpened: boolean;
  getSmallestThumbnail = getSmallestThumbnail;

  user: User;
  draft: OrderInterface;
  products: ProductInterface[];

  @ViewChild('search') private search: ElementRef;

  private draftSubscription: Subscription;
  private sidebarOpenedSubscription: Subscription;
  private productsSubscription: Subscription;

  constructor(private cart: CartService, private shop: ShopService, private nav: NavbarService, private router: Router) { }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.setView();
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
    this.unsubscribeProducts();
  }

  unsubscribeProducts() {
    if (this.productsSubscription && !this.productsSubscription.closed) {
      this.productsSubscription.unsubscribe();
    }
  }

  searchProducts(input: string) {
    this.unsubscribeProducts();
    console.log(input);
    this.productsSubscription = this.shop.getProductsByKeyword(input).subscribe(products => this.products = products);
  }

  toggleMenu() {
    this.nav.setSidebarOpened(!this.sidebarOpened);
  }

  closeSearch() {
    this.showSearch = false;
  }

  openSearch($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.showSearch = true;
    setTimeout(() => {
      this.search.nativeElement.focus();
    }, 0);
  }

  setView() {
    if (this.innerWidth <= 640) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  navigateToVariant(title: string, id: string) {
    const routeTitle = encodeURIComponent(title.split(' ').join('-'));
    this.router.navigateByUrl(`${shopProductRoute}/${routeTitle}/${id}`);
    this.closeSearch();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.innerWidth = window.innerWidth;
    this.setView();
  }

}
