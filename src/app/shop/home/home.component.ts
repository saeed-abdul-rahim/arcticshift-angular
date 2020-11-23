import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons/faCheckCircle';

import { IMAGE_L } from '@constants/imageSize';
import { shopProductRoute } from '@constants/routes';
import { ProductCondition, ProductInterface } from '@models/Product';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { ProductService } from '@services/product/product.service';
import { ShopService } from '@services/shop/shop.service';
import { filterProductsByCategoryCollection, setProducts } from '@utils/productUtils';
import { filter } from 'rxjs/internal/operators/filter';
import { Subscription } from 'rxjs/internal/Subscription';
import { SeoService } from '@services/seo/seo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  faCheckCircle = faCheckCircle;

  productFilters: ProductCondition[] = [];
  saleDiscounts: SaleDiscountInterface[];
  products: ProductInterface & SaleDiscountInterface[] = [];
  loading = false;
  done = false;
  error = '';
  orderCompleted = false;

  private productFilterSubscription: Subscription;
  private productListSubscription: Subscription;
  private productsLoadingSubscription: Subscription;
  private productsErrorSubscription: Subscription;
  private productsDoneSubscription: Subscription;
  private saleDiscountSubscription: Subscription;
  private routeSubscription: Subscription;

  constructor(private productService: ProductService, private shop: ShopService, private seo: SeoService,
              private router: Router, private route: ActivatedRoute) {
    this.routeSubscription = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const navigation  = this.router.getCurrentNavigation();
        this.orderCompleted = navigation.extras.state ? navigation.extras.state.orderCompleted : false;
    });
    this.getProductFilters();
    this.routeSubscription = this.route.params.subscribe(par => this.ngOnInit());
  }

  ngOnInit(): void {
    this.getSaleDiscounts();
    this.getProductList();
    this.getProductsLoading();
    this.getProductsDone();
    const params = this.route.snapshot.paramMap;
    const title = params.get('title');
    const id = params.get('id');
    if (title && id) {
      this.seo.updateTitle(title);
      this.seo.updateOgUrl(this.route.snapshot.url.join('/'));
      const type = this.router.url.split('/')[1] as 'category' | 'collection';
      const nxtFilters = filterProductsByCategoryCollection(id, this.productFilters, type);
      this.productService.setProductFilters(nxtFilters);
    }
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
    if (this.productFilterSubscription && !this.productFilterSubscription.closed) {
      this.productFilterSubscription.unsubscribe();
    }
    this.unsubscribeProductList();
  }

  unsubscribeProductList() {
    if (this.productListSubscription && this.productListSubscription.closed) {
      this.productListSubscription.unsubscribe();
    }
  }

  getProductFilters() {
    this.productFilterSubscription = this.productService.getProductFilters().subscribe(filters => this.productFilters = filters);
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
