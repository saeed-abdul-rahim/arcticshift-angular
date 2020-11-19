import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductInterface } from '@models/Product';

import { UserInterface } from '@models/User';
import { AuthService } from '@services/auth/auth.service';
import { Subscription } from 'rxjs';
import { shopProductRoute } from '@constants/routes';
import { ShopService } from '@services/shop/shop.service';
import { setSaleDiscountForProduct } from '@utils/productUtils';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { IMAGE_L } from '@constants/imageSize';
import { setThumbnails } from '@utils/media';
import { ValueType } from '@models/Common';




@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit, OnDestroy {

  showSearch = false;

  saleDiscounts: SaleDiscountInterface[];
  user: UserInterface;
  wishlistSubscription: Subscription;
  products: ProductInterface & SaleDiscountInterface[] = [];


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
    this.wishlistSubscription = this.auth.getCurrentUserDocument().subscribe(user => {
      this.user = user; console.log(user);
      if (this.user) {
        const { wishlist } = this.user;
        console.log(wishlist);
        this.shop.getProductbyIds(wishlist).subscribe(products => {
          this.products = products.filter(p => p);
          console.log(this.products);
        },
          error => console.log(error)
        );
        if (wishlist.length > 0) {
          return console.log(wishlist);
        }
      }
    }
    );
  }

  setProducts(products?: ProductInterface[]) {
      this.products = products.map(product => {
        if (!product) { return; }
        const { id, images, price, name } = product;
        const thumbnails = setThumbnails(images, name, IMAGE_L);
        let discountValue: number;
        let discountType: ValueType;
        if (this.saleDiscounts) {
          const productDiscount = setSaleDiscountForProduct(this.saleDiscounts, product);
          discountType = productDiscount.discountType;
          discountValue = productDiscount.discountValue;
        }
        return {
          id, price, name,
          images: thumbnails,
          value: discountValue,
          valueType: discountType
        };
      }).filter(e => e);
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
