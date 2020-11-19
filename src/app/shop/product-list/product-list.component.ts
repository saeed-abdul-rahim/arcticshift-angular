import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

import { ProductService } from '@services/product/product.service';
import { ShopService } from '@services/shop/shop.service';
import { IMAGE_L } from '@constants/imageSize';
import { shopProductRoute } from '@constants/routes';
import { ValueType } from '@models/Common';
import { ProductInterface } from '@models/Product';
import { CatalogType } from '@models/Metadata';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { setThumbnails } from '@utils/media';
import { setSaleDiscountForProduct } from '@utils/productUtils';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {

  @Input() id: string | string[];
  @Input() type: CatalogType | 'wishlist' = 'product';
  @Input() limit = 8;
  @Input() filterProducts: string[] = []; // Product Ids
  @Output() allProducts = new EventEmitter<ProductInterface & SaleDiscountInterface[]>();

  saleDiscounts: SaleDiscountInterface[];
  products: ProductInterface & SaleDiscountInterface[] = [];
  loading = false;
  done = false;
  error = '';

  productListSubscription: Subscription;
  productsLoadingSubscription: Subscription;
  productsErrorSubscription: Subscription;
  productsDoneSubscription: Subscription;
  saleDiscountSubscription: Subscription;

  constructor(private productService: ProductService, private shop: ShopService, private router: Router) { }

  ngOnInit(): void {
    this.getSaleDiscounts();
    if (this.type === 'product') {
      this.getProductList();
      this.getProductsLoading();
      this.getProductsDone();
    } else if (this.type === 'collection' && this.id && this.id.length > 0) {
      this.getProductsByCollectionId();
    } else if (this.type === 'category' && this.id && this.id.length > 0) {
      this.getProductsByCategoryId();
    }
  }

  ngOnDestroy(): void {
    if (this.productListSubscription && this.productListSubscription.closed) {
      this.productListSubscription.unsubscribe();
    }
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
  }

  getSaleDiscounts() {
    this.saleDiscountSubscription = this.shop.getSaleDiscounts().subscribe(saleDiscounts => this.saleDiscounts = saleDiscounts);
  }

  getProductsByCollectionId() {
    const { id, limit } = this;
    if (typeof id === 'string') { return; }
    this.productListSubscription = this.shop.getProductsByCollectionIds(id, limit).subscribe(products => this.setProducts(products));
  }

  getProductsByCategoryId() {
    const { id, limit } = this;
    if (Array.isArray(id)) { return; }
    this.productListSubscription = this.shop.getProductsByCategoryId(id, limit).subscribe(products => this.setProducts(products));
  }

  getProductList() {
    this.productListSubscription = this.productService.getProductList().subscribe(products => this.setProducts(products));
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
    this.productService.isProductsLoading().subscribe(loading => this.loading = loading);
  }

  setProducts(products?: ProductInterface[]) {
    if (!products || products.length === 0) {
      this.products = [];
    } else if (products.length > 0) {
      this.products = products.map(product => {
        if (!product) { return; }
        if (this.filterProducts.includes(product.id)) {
          return;
        }
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
    this.allProducts.emit(this.products);
  }

  trackByFn(index: number, item: ProductInterface) {
    return item.id;
  }

  navigateToVariant(title: string, id: string) {
    const routeTitle = encodeURIComponent(title.split(' ').join('-'));
    this.router.navigateByUrl(`${shopProductRoute}/${routeTitle}/${id}`);
  }

}
