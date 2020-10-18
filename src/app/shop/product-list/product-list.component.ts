import { Component, OnDestroy, OnInit } from '@angular/core';
import { IMAGE_XL } from '@constants/imageSize';
import { ProductInterface } from '@models/Product';
import { ProductService } from '@services/product/product.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {

  products: ProductInterface[] = [];
  loading = false;
  error = '';

  productListSubscription: Subscription;
  productsLoadingSubscription: Subscription;
  productsErrorSubscription: Subscription;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.getProductList();
    this.getProductsLoading();
    this.getProductsError();
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
  }

  getProductList() {
    this.productService.getProductList().subscribe(products => {
      this.products = products.map(product => {
        if (!product) { return; }
        const { id, images, price, name } = product;
        let allThumbnails = [];
        if (images && images.length > 0) {
          const filteredImages = images.slice(0, 2);
          allThumbnails = filteredImages.map(image => {
            const { thumbnails } = image;
            const thumbnail = thumbnails.find(thumb => thumb.dimension === IMAGE_XL);
            return {
              title: name,
              url: thumbnail.url
            };
          });
        }
        return {
          id, price, name,
          images: allThumbnails
        };
      });
    });
  }

  getProductsLoading() {
    this.productService.getProductsLoading().subscribe(loading => this.loading = loading);
  }

  getProductsError() {
    this.productService.getProductsError().subscribe(error => this.error = error);
  }

}
