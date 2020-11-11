import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

import { IMAGE_L } from '@constants/imageSize';
import { PRODUCT } from '@constants/routes';
import { Content } from '@models/Common';
import { ProductInterface } from '@models/Product';
import { ProductService } from '@services/product/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {

  productUrl = `/${PRODUCT}`;

  products: ProductInterface[] = [];
  loading = false;
  done = false;
  error = '';

  productListSubscription: Subscription;
  productsLoadingSubscription: Subscription;
  productsErrorSubscription: Subscription;
  productsDoneSubscription: Subscription;

  constructor(private productService: ProductService, private router: Router) { }

  ngOnInit(): void {
    this.getProductList();
    this.getProductsLoading();
    this.getProductsDone();
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
  }

  getProductList() {
    this.productService.getProductList().subscribe(products => this.setProducts(products));
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
        const { id, images, price, name } = product;
        const thumbnails = this.setThumbnails(images, name);
        return {
          id, price, name,
          images: thumbnails
        };
      }).filter(e => e);
    }
  }

  setThumbnails(images: Content[], name: string) {
    let allThumbnails = [];
    if (images && images.length > 0) {
      const filteredImages = images.slice(0, 2);
      allThumbnails = filteredImages.map(image => {
        const { thumbnails } = image;
        const thumbnail = thumbnails.find(thumb => thumb.dimension === IMAGE_L);
        return {
          title: name,
          url: thumbnail.url
        };
      });
    }
    return allThumbnails;
  }

  trackByFn(index: number, item: ProductInterface) {
    return item.id;
  }

  navigateToVariant(title: string, id: string) {
    const routeTitle = encodeURIComponent(title.split(' ').join('-'));
    this.router.navigateByUrl(`${this.productUrl}/${routeTitle}/${id}`);
  }

}
