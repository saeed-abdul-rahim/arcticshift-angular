import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IMAGE_L, IMAGE_SM, IMAGE_XL } from '@constants/imageSize';
import { AttributeJoinInterface } from '@models/Attribute';
import { Content, ObjNumber, ObjString } from '@models/Common';
import { ProductInterface } from '@models/Product';
import { VariantInterface } from '@models/Variant';
import { SeoService } from '@services/seo/seo.service';
import { CartService } from '@services/cart/cart.service';
import { ShopService } from '@services/shop/shop.service';
import { percentIncrease } from '@utils/calculation';
import { Subscription } from 'rxjs/internal/Subscription';
import { AlertService } from '@services/alert/alert.service';
import { getIds } from '@utils/arrUtils';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { getProductDiscount, getSaleDiscountForProduct } from '@utils/saleDiscount';
import { isColorAttribute, isProductAvailable, setProducts } from '@utils/productUtils';
import { setTimeout } from '@utils/setTimeout';
import { shopProductRoute } from '@constants/routes';

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
  cartLoading = false;
  cartSuccess = false;
  available = false;
  variantInDraft = false;
  isColorAttribute = isColorAttribute;

  limit = 8;

  quantity = 1;
  price: number;
  strikePrice: number;
  discountPercentage: number;

  selectedAttribute: ObjString;
  selectedImage = '';
  selectedThumbnail = '';
  carouselImages: any[] = [];
  selectedImageSize = IMAGE_XL;
  carouselImageSize = IMAGE_SM;

  draftVariantQuantity: ObjNumber;
  product: ProductInterface;
  variants: VariantInterface[] = [];
  variant: VariantInterface;
  attributes: AttributeJoinInterface[] = [];
  saleDiscounts: SaleDiscountInterface[] = [];
  filteredAttributes: AttributeJoinInterface[] = [];
  availableAttributes: string[] = [];

  categoryProducts: ProductInterface & SaleDiscountInterface[];
  collectionProducts: ProductInterface & SaleDiscountInterface[];
  filteredProductIds: string[] = [];

  private draftSubscription: Subscription;
  private productSubscription: Subscription;
  private categorySubscription: Subscription;
  private collectionSubscription: Subscription;
  private variantSubscription: Subscription;
  private productTypeSubscription: Subscription;
  private attributeSubscription: Subscription;
  private saleDiscountSubscription: Subscription;
  private settingsSubscription: Subscription;
  private routeSubscription: Subscription;

  constructor(private route: ActivatedRoute, private seo: SeoService, private shop: ShopService, private router: Router,
              private cart: CartService, private alert: AlertService, private ref: ChangeDetectorRef) {
    this.innerWidth = window.innerWidth;
    this.routeSubscription = this.route.params.subscribe(par => {
      this.initialize();
    });
  }

  ngOnInit(): void {
    this.getSaleDiscounts();
    this.getDraft();
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(generalSettings => {
      if (generalSettings) {
        const { currency, accentColor } = generalSettings;
        this.currency = currency;
        this.accentColor = accentColor;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.draftSubscription && !this.draftSubscription.closed) {
      this.draftSubscription.unsubscribe();
    }
    if (this.saleDiscountSubscription && !this.saleDiscountSubscription.closed) {
      this.saleDiscountSubscription.unsubscribe();
    }
    if (this.routeSubscription && !this.routeSubscription.closed) {
      this.routeSubscription.unsubscribe();
    }
    if (this.settingsSubscription && !this.settingsSubscription.closed) {
      this.settingsSubscription.unsubscribe();
    }
  }

  initialize() {
    this.variant = null;
    this.quantity = 1;
    this.unsubscribeProducts();
    const params = this.route.snapshot.paramMap;
    const title = params.get('title');
    const id = params.get('id');
    this.seo.updateTitle(title);
    this.seo.updateOgUrl(this.route.snapshot.url.join('/'));
    this.getProduct(id);
  }

  unsubscribeProducts() {
    if (this.productSubscription && !this.productSubscription.closed) {
      this.productSubscription.unsubscribe();
    }
    if (this.productTypeSubscription && !this.productTypeSubscription.closed) {
      this.productTypeSubscription.unsubscribe();
    }
    if (this.variantSubscription && !this.variantSubscription.closed) {
      this.variantSubscription.unsubscribe();
    }
    if (this.attributeSubscription && !this.attributeSubscription.closed) {
      this.attributeSubscription.unsubscribe();
    }
    if (this.categorySubscription && !this.categorySubscription.closed) {
      this.categorySubscription.unsubscribe();
    }
    if (this.collectionSubscription && !this.collectionSubscription.closed) {
      this.collectionSubscription.unsubscribe();
    }
  }

  getSaleDiscounts() {
    this.saleDiscountSubscription = this.shop.getSaleDiscounts().subscribe(saleDiscounts => this.saleDiscounts = saleDiscounts);
  }

  async addToCart() {
    const { variant, quantity, shop } = this;
    if (!variant || !quantity) {
      return;
    }
    const { warehouseQuantity, variantId, shopId, trackInventory } = variant;
    let maxQuantity = 0;
    maxQuantity = Object.keys(warehouseQuantity)
      .map(key => warehouseQuantity[key])
      .reduce((prev, curr) => prev > curr ? prev : curr);
    if (maxQuantity < 1 && trackInventory) {
      this.handleError('Out of stock');
    }
    this.cartLoading = true;
    try {
      await shop.addToCart({
        shopId,
        variants: [{
          variantId,
          quantity
        }]
      });
      this.cartSuccess = true;
      setTimeout(() => {
        this.cartSuccess = false;
        this.ref.detectChanges();
      }, 2000);
      this.hasVariantInDraft();
    } catch (err) {
      this.handleError(err);
    }
    this.cartLoading = false;
  }

  getDraft() {
    this.draftSubscription = this.cart.getDraft().subscribe(draft => {
      if (draft) {
        const { variants } = draft;
        const draftVariantQuantity = {};
        variants.forEach(variant => {
          Object.assign(draftVariantQuantity, {
            [variant.variantId]: variant.quantity
          });
        });
        if (Object.keys(draftVariantQuantity).length > 0 && this.variant) {
          this.draftVariantQuantity = draftVariantQuantity;
          if (this.draftVariantQuantity[this.variant.id]) {
            this.quantity = this.draftVariantQuantity[this.variant.id];
          }
        }
        this.hasVariantInDraft();
      }
    });
  }

  getProduct(id: string) {
    this.productLoading = true;
    this.productSubscription = this.shop.getProductById(id).subscribe(product => {
      this.productLoading = false;
      if (product) {
        const { productId, productTypeId, description, name, images, collectionId, categoryId } = product;
        this.product = product;
        this.getProductType(productTypeId);
        if (images && images.length > 0) {
          this.setCarouselImages(images);
          this.setSelectedImage(images[0]);
        }
        this.seo.updateTitle(name);
        this.seo.updateDescription(description);
        this.getVariantsByProduct(productId);
        this.getProductsByCollectionId(collectionId);
        this.getProductsByCategoryId(categoryId);
      }
    }, error => this.handleError(error.message));
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
      if (variants) {
        this.variants = variants;
        this.isAttributeAvailable();
        const variantAttributeValueIds = variants.map(variant => {
          if (variant.attributes) {
            return Object.keys(variant.attributes).map(attributeId => variant.attributes[attributeId]);
          } else {
            return undefined;
          }
        }).filter(e => e);
        this.availableAttributes = [].concat(...variantAttributeValueIds);
        if (!this.variant || this.variant.id === variants[0].id) {
          this.setVariant(variants[0]);
        }
      }
    }, error => this.handleError(error.message));
  }

  setVariant(variant: VariantInterface) {
    this.variant = variant;
    const { price, prices, attributes, images } = variant;
    const strikePrice = prices.find(prs => prs.name === 'strike');
    if (strikePrice) {
      this.strikePrice = strikePrice.value;
      this.price = price;
      this.discountPercentage = percentIncrease(price, this.strikePrice);
    }
    if (this.saleDiscounts && this.saleDiscounts.length > 0) {
      const saleDiscount = getSaleDiscountForProduct(this.saleDiscounts, this.product);
      if (saleDiscount) {
        const discount = getProductDiscount(saleDiscount, price);
        this.strikePrice = price;
        this.price = discount.price;
        this.discountPercentage = discount.discount;
      }
    }
    if (attributes) {
      Object.keys(attributes).forEach(attributeId => {
        this.selectedAttribute = {
          ...this.selectedAttribute,
          [attributeId]: attributes[attributeId]
        };
      });
    }
    this.available = isProductAvailable(this.variant);
    if (images && images.length > 0) {
      this.setSelectedImage(images[0]);
      this.setCarouselImages(images);
    }
    if (this.draftVariantQuantity && this.draftVariantQuantity[this.variant.id]) {
      this.quantity = this.draftVariantQuantity[this.variant.id];
    }
  }

  getAttributes(attributeIds: string[]) {
    this.attributesLoading = true;
    this.attributeSubscription = this.shop.getAttributeAndValuesByIds(attributeIds).subscribe(attributes => {
      this.attributesLoading = false;
      this.attributes = attributes;
      this.isAttributeAvailable();
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
    }, error => this.handleError(error.message));
  }

  isAttributeAvailable() {
    this.filteredAttributes = this.attributes.map(attribute => {
      const { attributeValues } = attribute;
      attribute.attributeValues = attributeValues.map(value => {
        if (!this.availableAttributes.includes(value.id)) {
          value.disabled = true;
          return value;
        }
        return value;
      }).filter(e => e);
      return attribute;
    });
  }

  changeAttribute(attributeId: string, valueId: string) {
    const variant = this.variants.find(v => v.attributes?.[attributeId] === valueId);
    console.log(variant);
    if (variant) {
      this.setVariant(variant);
    }
  }

  getProductsByCollectionId(id: string[]) {
    const { limit } = this;
    this.collectionSubscription = this.shop.getProductsByCollectionIds(id, limit).subscribe(products => {
      const filteredProducts = products.filter(p => p.productId !== this.product.id);
      this.collectionProducts = setProducts(filteredProducts, IMAGE_L, this.saleDiscounts);
      this.productsInCollection(this.collectionProducts);
    });
  }

  getProductsByCategoryId(id: string) {
    const { limit } = this;
    this.categorySubscription = this.shop.getProductsByCategoryId(id, limit).subscribe(products => {
      const filteredProducts = products.filter(p => !this.filteredProductIds.includes(p.id));
      this.categoryProducts = setProducts(filteredProducts, IMAGE_L, this.saleDiscounts);
    });
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

  hasVariantInDraft() {
    const { variant, draftVariantQuantity } = this;
    if (variant && draftVariantQuantity) {
      const variantIds = Object.keys(draftVariantQuantity).map(key => key);
      if (draftVariantQuantity[variant.id] && variantIds.includes(variant.id)) {
        this.variantInDraft = true;
      }
    }
    this.variantInDraft = false;
  }

  productsInCollection(productsInCollection: ProductInterface & SaleDiscountInterface[]) {
    this.filteredProductIds = [this.product.id, ...getIds(productsInCollection)];
  }

  navigateToVariant(title: string, id: string) {
    const routeTitle = encodeURIComponent(title.split(' ').join('-'));
    this.router.navigateByUrl(`${shopProductRoute}/${routeTitle}/${id}`);
    const scrollElem = document.querySelector('#productView');
    scrollElem.scrollIntoView();
  }

  trackByFn(index: number, item: ProductInterface) {
    return item.id;
  }

  handleError(err: any) {
    this.alert.alert(err);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.innerWidth = window.innerWidth;
  }

}
