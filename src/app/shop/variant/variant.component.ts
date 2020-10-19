import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IMAGE_SM, IMAGE_XL } from '@constants/imageSize';
import { AttributeJoinInterface } from '@models/Attribute';
import { Content, ContentStorage } from '@models/Common';
import { ProductInterface } from '@models/Product';
import { VariantInterface } from '@models/Variant';
import { SeoService } from '@services/seo/seo.service';
import { ShopService } from '@services/shop/shop.service';
import { uniqueArr } from '@utils/arrUtils';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-variant',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.css']
})
export class VariantComponent implements OnInit, OnDestroy {

  productLoading = false;
  variantLoading = false;
  attributesLoading = false;

  selectedImage = '';
  selectedThumbnail = '';
  carouselImages: ContentStorage[] = [];

  product: ProductInterface;
  variants: VariantInterface[] = [];
  selectedVariant: VariantInterface;
  attributes: AttributeJoinInterface[];

  productSubscription: Subscription;
  variantSubscription: Subscription;
  attributeSubscription: Subscription;

  constructor(private route: ActivatedRoute, private seo: SeoService, private shop: ShopService) {
    const params = this.route.snapshot.paramMap;
    const title = params.get('title');
    const id = params.get('id');
    this.seo.updateTitle(title);
    this.seo.updateOgUrl(this.route.snapshot.url.join('/'));
    this.getProduct(id);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.productSubscription && !this.productSubscription.closed) {
      this.productSubscription.unsubscribe();
    }
    if (this.variantSubscription && !this.variantSubscription.closed) {
      this.variantSubscription.unsubscribe();
    }
    if (this.attributeSubscription && !this.attributeSubscription.closed) {
      this.attributeSubscription.unsubscribe();
    }
  }

  getProduct(id: string) {
    this.productLoading = true;
    this.productSubscription = this.shop.getProductById(id).subscribe(product => {
      this.productLoading = false;
      if (product) {
        const { productId, description, name, images } = product;
        this.product = product;
        if (images && images.length > 0) {
          this.setCarouselImages(images);
          this.setSelectedImage(images[0]);
        }
        this.seo.updateTitle(name);
        this.seo.updateDescription(description);
        this.getVariantsByProduct(productId);
      }
    }, error => console.log(error));
  }

  getVariantsByProduct(id: string) {
    this.variantLoading = true;
    this.variantSubscription = this.shop.getVariantsByProductId(id).subscribe(variants => {
      this.variantLoading = false;
      if (variants && variants.length > 0) {
        this.variants = variants;
        this.selectedVariant = variants[0];
        const { images } = this.selectedVariant;
        if (images && images.length > 0) {
          this.setSelectedImage(images[0]);
          this.setCarouselImages(images);
        }
        let attrKeys = variants.map(variant => {
          const { attributes } = variant;
          return Object.keys(attributes);
        }).reduce((acc, key) => [...acc, ...key], []);
        attrKeys = uniqueArr(attrKeys);
        this.getAttributes(attrKeys);
      }
    }, error => console.log(error));
  }

  getAttributes(attributeIds: string[]) {
    this.attributesLoading = true;
    this.attributeSubscription = this.shop.getAttributeAndValuesByIds(attributeIds).subscribe(attributes => {
      this.attributesLoading = false;
      this.attributes = attributes;
    }, error => console.log(error));
  }

  setCarouselImages(images: Content[]) {
    let thumbnails = images.map(image => image.thumbnails.find(thumbnail => thumbnail.dimension === IMAGE_SM));
    const { name } = this.product;
    thumbnails = thumbnails.map(thumbnail => {
      thumbnail.name = name;
      return thumbnail;
    });
    this.carouselImages = thumbnails;
  }

  setSelectedImage(image: Content) {
    const { thumbnails, content } = image;
    const thumbnail = thumbnails.find(thumb => thumb.dimension === IMAGE_XL);
    this.selectedImage = content.url;
    this.selectedThumbnail = thumbnail.url;
  }

}
