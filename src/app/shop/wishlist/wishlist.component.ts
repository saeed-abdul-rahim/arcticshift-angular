import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductInterface } from '@models/Product';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { UserInterface } from '@models/User';
import { AuthService } from '@services/auth/auth.service';
import { Subscription } from 'rxjs';
import { shopProductRoute } from '@constants/routes';




@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit, OnDestroy {

  wishlist: UserInterface;
  showSearch = false;

  user: UserInterface;
  wishlistSubscription: Subscription;
  products: ProductInterface & SaleDiscountInterface[] = [];


  constructor(private auth: AuthService, private router: Router) { }


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
    const { wishlist } = this.user;
    if (wishlist.length > 0){
        return console.log(wishlist);
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
