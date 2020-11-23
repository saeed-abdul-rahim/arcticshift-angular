import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons/faCheckCircle';

import { IMAGE_L } from '@constants/imageSize';
import { shopProductRoute } from '@constants/routes';
import { ProductInterface } from '@models/Product';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { ProductService } from '@services/product/product.service';
import { ShopService } from '@services/shop/shop.service';
import { setProducts } from '@utils/productUtils';
import { filter } from 'rxjs/internal/operators/filter';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  faCheckCircle = faCheckCircle;

  saleDiscounts: SaleDiscountInterface[];
  products: ProductInterface & SaleDiscountInterface[] = [];
  loading = false;
  done = false;
  error = '';
  orderCompleted = false;

  private productListSubscription: Subscription;
  private productsLoadingSubscription: Subscription;
  private productsErrorSubscription: Subscription;
  private productsDoneSubscription: Subscription;
  private saleDiscountSubscription: Subscription;
  private routeSubscription: Subscription;

  constructor(private productService: ProductService, private shop: ShopService, private router: Router) {
    this.routeSubscription = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const navigation  = this.router.getCurrentNavigation();
        this.orderCompleted = navigation.extras.state ? navigation.extras.state.orderCompleted : false;
    });
  }

  ngOnInit(): void {
    this.getSaleDiscounts();
    this.getProductList();
    this.getProductsLoading();
    this.getProductsDone();
  }

  ngOnDestroy(): void {
    if (this.productsLoadingSubscription && this.productsLoadingSubscription.closed) {
      this.productsLoadingSubscription.unsubscribe();
    }
    if (this.productsErrorSubscription && this.productsErrorSubscription.closed) {
      this.productsErrorSubscription.unsubscribe();
    }
    if (this.productsDoneSubscription && !this.productsDoneSubscription.closed) {
      this.productsDoneSubscription.unsubscribe();
    }
    if (this.saleDiscountSubscription && !this.saleDiscountSubscription.closed) {
      this.saleDiscountSubscription.unsubscribe();
    }
    if (this.routeSubscription && !this.routeSubscription.closed) {
      this.routeSubscription.unsubscribe();
    }
  }

  unsubscribeProductList() {
    if (this.productListSubscription && this.productListSubscription.closed) {
      this.productListSubscription.unsubscribe();
    }
  }

  getSaleDiscounts() {
    this.saleDiscountSubscription = this.shop.getSaleDiscounts().subscribe(saleDiscounts => this.saleDiscounts = saleDiscounts);
  }

  getProductList() {
    this.unsubscribeProductList();
    this.productListSubscription = this.productService.getProductList()
      .subscribe(products => this.products = setProducts(products, IMAGE_L, this.saleDiscounts));
  }

  moreProducts() {
    if (!this.done) {
      this.productService.loadMoreProducts();
    }
  }

  getProductsDone() {
    this.productsDoneSubscription = this.productService.isProductsDone().subscribe(done => this.done = done);
  }

  getProductsLoading() {
    this.productsLoadingSubscription = this.productService.isProductsLoading().subscribe(loading => this.loading = loading);
  }

  trackByFn(index: number, item: ProductInterface) {
    return item.id;
  }

  navigateToVariant(title: string, id: string) {
    const routeTitle = encodeURIComponent(title.split(' ').join('-'));
    this.router.navigateByUrl(`${shopProductRoute}/${routeTitle}/${id}`);
  }

}
