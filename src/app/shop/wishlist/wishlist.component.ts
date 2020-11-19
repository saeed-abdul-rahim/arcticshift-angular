import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductInterface } from '@models/Product';
import { UserInterface } from '@models/User';
import { AuthService } from '@services/auth/auth.service';
import { Subscription } from 'rxjs';
import { shopProductRoute } from '@constants/routes';
import { ShopService } from '@services/shop/shop.service';




@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit, OnDestroy {

  showSearch = false;

  user: UserInterface;
  wishlistSubscription: Subscription;
  products: ProductInterface[] = [];


  constructor(private auth: AuthService, private router: Router, private shop: ShopService) { }


  ngOnInit(): void {
   this.getWishlist();
  }

  ngOnDestroy(): void {
    if (this.wishlistSubscription && !this.wishlistSubscription.closed) {
      this.wishlistSubscription.unsubscribe();
    }
  }
  getWishlist() {
    this.wishlistSubscription = this.auth.getCurrentUserDocument().subscribe(user => this.user = user);
    if (this.user){
    const { wishlist } = this.user;
    this.shop.getProductbyIds(wishlist).subscribe(product => this.products = product);

    }
  }

  closeSearch() {
    this.showSearch = false;
  }

  navigateToVariant(title: string, id: string) {
    const routeTitle = encodeURIComponent(title.split(' ').join('-'));
    this.router.navigateByUrl(`${shopProductRoute}/${routeTitle}/${id}`);
    this.closeSearch();
  }

  trackByFn(index: number, item: ProductInterface) {
    return item.id;
  }
}
