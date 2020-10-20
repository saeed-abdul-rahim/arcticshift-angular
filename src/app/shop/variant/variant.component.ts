import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IMAGE_SM, IMAGE_XL } from '@constants/imageSize';
import { AttributeJoinInterface } from '@models/Attribute';
import { Content, ObjString } from '@models/Common';
import { ProductInterface } from '@models/Product';
import { VariantInterface } from '@models/Variant';
import { SeoService } from '@services/seo/seo.service';
import { ShopService } from '@services/shop/shop.service';
import { percentDecrease } from '@utils/percentDecrease';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-variant',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.css']
})
export class VariantComponent implements OnInit, OnDestroy {

  innerWidth: any;
  currency: string;
  accentColor: string;

  productLoading = false;
  variantLoading = false;
  attributesLoading = false;
  available = false;

  price: number;
  strikePrice: number;
  discountPercentage: string;
  selectedAttribute: ObjString;
  selectedImage = '';
  selectedThumbnail = '';
  carouselImages: any[] = [];
  selectedImageSize = IMAGE_XL;
  carouselImageSize = IMAGE_SM;

  product: ProductInterface;
  variants: VariantInterface[] = [];
  variant: VariantInterface;
  attributes: AttributeJoinInterface[];

  productSubscription: Subscription;
  variantSubscription: Subscription;
  productTypeSubscription: Subscription;
  attributeSubscription: Subscription;

  constructor(private route: ActivatedRoute, private seo: SeoService, private shop: ShopService) {
    const params = this.route.snapshot.paramMap;
    const title = params.get('title');
    const id = params.get('id');
    this.seo.updateTitle(title);
    this.seo.updateOgUrl(this.route.snapshot.url.join('/'));
    this.getProduct(id);
    this.shop.getGeneralSettings().subscribe(generalSettings => {
      if (generalSettings) {
        const { currency, accentColor } = generalSettings;
        this.currency = currency;
        this.accentColor = accentColor;
      }
    });
  }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
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
        const { productId, productTypeId, description, name, images } = product;
        this.product = product;
        this.getProductType(productTypeId);
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

  getProductType(id: string) {
    this.productTypeSubscription = this.shop.getProductTypeById(id).subscribe(productType => {
      const { variantAttributeId } = productType;
      this.getAttributes(variantAttributeId);
    });
  }

  getVariantsByProduct(id: string) {
    this.variantLoading = true;
    this.variantSubscription = this.shop.getVariantsByProductId(id).subscribe(variants => {
      this.variantLoading = false;
      if (variants && variants.length > 0) {
        this.variants = variants;
        this.variant = variants[0];
        this.setVariant(this.variant);
      }
    }, error => console.log(error));
  }

  setVariant(variant: VariantInterface) {
    const { price, prices, attributes } = variant;
    const strikePrice = prices.find(prs => prs.name === 'strike');
    if (strikePrice) {
      this.strikePrice = strikePrice.value;
      this.price = price;
      this.discountPercentage = percentDecrease(price, this.strikePrice);
    }
    if (attributes) {
      Object.keys(attributes).forEach(attributeId => {
        this.selectedAttribute = {
          ...this.selectedAttribute,
          [attributeId]: attributes[attributeId]
        };
      });
    }
    const { warehouseQuantity, bookedQuantity, trackInventory, images } = variant;
    if (trackInventory && warehouseQuantity && bookedQuantity) {
      let availableQuantity = 0;
      availableQuantity = Object.keys(warehouseQuantity).map(key => {
        return warehouseQuantity[key];
      }).reduce((acc, curr) => acc + curr);
      availableQuantity = availableQuantity - bookedQuantity;
      this.available = availableQuantity > 0 ? true : false;
    }
    if (images && images.length > 0) {
      this.setSelectedImage(images[0]);
      this.setCarouselImages(images);
    }
  }

  getAttributes(attributeIds: string[]) {
    this.attributesLoading = true;
    this.attributeSubscription = this.shop.getAttributeAndValuesByIds(attributeIds).subscribe(attributes => {
      this.attributesLoading = false;
      this.attributes = attributes;
      const attributeOptions = attributes
        .map(attribute => attribute.id)
        .reduce((m, v) => {
          m[v] = '';
          return m;
        }, {});
      this.selectedAttribute = {
        ...attributeOptions,
        ...this.selectedAttribute
      };
    }, error => console.log(error));
  }

  changeAttribute(attributeId: string, valueId: string) {
    const variant = this.variants.find(v => v.attributes?.[attributeId] === valueId);
    this.setVariant(variant);
  }

  setCarouselImages(images: Content[]) {
    let thumbnails: any[] = images.map(image => {
      const thumbnail = image.thumbnails.find(thumb => thumb.dimension === this.carouselImageSize);
      return { ...thumbnail, image };
    });
    const { name } = this.product;
    thumbnails = thumbnails.map(thumbnail => {
      thumbnail.name = name;
      return thumbnail;
    });
    this.carouselImages = thumbnails;
  }

  setSelectedImage(image: Content) {
    const { thumbnails, content } = image;
    const thumbnail = thumbnails.find(thumb => thumb.dimension === this.selectedImageSize);
    this.selectedImage = content.url;
    this.selectedThumbnail = thumbnail.url;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.innerWidth = window.innerWidth;
  }

}
