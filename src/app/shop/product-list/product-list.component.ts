import { Component, OnInit } from '@angular/core';
import { IMAGE_XL } from '@constants/imageSize';
import { ProductInterface } from '@models/Product';
import { ShopService } from '@services/shop/shop.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: ProductInterface[] = [];

  constructor(private shopService: ShopService) { }

  ngOnInit(): void {
    this.shopService.getProductsByShopId('arctic').subscribe(products => {
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
        console.log(allThumbnails);
        return {
          id, price, name,
          images: allThumbnails
        };
      });
    });
  }

}
