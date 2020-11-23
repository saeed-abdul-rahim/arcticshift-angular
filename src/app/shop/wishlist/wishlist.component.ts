import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';

import { GeneralSettings } from '@models/GeneralSettings';
import { ShopService } from '@services/shop/shop.service';
import { AlertService } from '@services/alert/alert.service';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { AuthService } from '@services/auth/auth.service';
import { UserInterface } from '@models/User';
import { isBothArrEqual } from '@utils/arrUtils';
import { ProductInterface } from '@models/Product';
import { setProducts } from '@utils/productUtils';
import { IMAGE_L } from '@constants/imageSize';
import { Router } from '@angular/router';




@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit, OnDestroy {

  faTimes = faTimes;

  loading = false;
  settings: GeneralSettings;
  user: UserInterface;
  saleDiscounts: SaleDiscountInterface[] = [];
  products: ProductInterface & SaleDiscountInterface[] = [];
  wishlist: string[] = [];

  private userSubscription: Subscription;
  private settingsSubscription: Subscription;
  private productsSubscription: Subscription;
  private saleDiscountSubscription: Subscription;

  constructor(private shop: ShopService, private auth: AuthService, private alert: AlertService, private router: Router) { }

  ngOnInit(): void {
    this.getSaleDiscounts();
    this.userSubscription = this.auth.getCurrentUserDocument().subscribe(user => {
      if (user) {
        this.user = user;
        const { wishlist } = user;
        if (!isBothArrEqual(wishlist, this.wishlist)) {
          this.loading = true;
          this.productsSubscription = this.shop.getProductbyIds(wishlist).subscribe(products => {
            this.products = setProducts(products, IMAGE_L, this.saleDiscounts);
          });
        } else {
          this.products = [];
          this.router.navigateByUrl('/');
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
    if (this.settingsSubscription && !this.settingsSubscription.closed) {
      this.settingsSubscription.unsubscribe();
    }
    if (this.productsSubscription && !this.productsSubscription.closed) {
      this.productsSubscription.unsubscribe();
    }
    if (this.saleDiscountSubscription && !this.saleDiscountSubscription.closed) {
      this.saleDiscountSubscription.unsubscribe();
    }
  }

  getSaleDiscounts() {
    this.saleDiscountSubscription = this.shop.getSaleDiscounts().subscribe(saleDiscounts => this.saleDiscounts = saleDiscounts);
  }

  getWishlist(){
    this.auth.getCurrentUserDocument().subscribe(user => this.user = user);
  }

  handleError(err: any) {
    this.alert.alert({ message: err });
  }

}

