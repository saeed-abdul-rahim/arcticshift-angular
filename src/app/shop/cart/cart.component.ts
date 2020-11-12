import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faTicketAlt } from '@fortawesome/free-solid-svg-icons/faTicketAlt';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons/faMapMarkerAlt';

import { CHECKOUT } from '@constants/routes';
import { IMAGE_XS } from '@constants/imageSize';
import { GeneralSettings } from '@models/GeneralSettings';
import { Content } from '@models/Common';
import { OrderInterface, VariantQuantity } from '@models/Order';
import { VariantInterface } from '@models/Variant';
import { CartService } from '@services/cart/cart.service';
import { ShopService } from '@services/shop/shop.service';
import { AlertService } from '@services/alert/alert.service';
import { countryAlphaList } from '@utils/countryAlphaList';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SaleDiscountInterface } from '@models/SaleDiscount';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {

  faMapMarkerAlt = faMapMarkerAlt;
  faTicketAlt = faTicketAlt;
  faChevronDown = faChevronDown;
  faTimes = faTimes;
  countryAlphaList = countryAlphaList;

  checkoutRoute = `/${CHECKOUT}`;
  imageSize = IMAGE_XS;
  showCoupon = false;
  variantsLoading = false;
  voucherLoading = false;
  voucherSuccess = false;
  draftLoading = false;
  totalLoading = false;
  updateLoading = false;
  updateSuccess = false;

  settings: GeneralSettings;
  draft: OrderInterface;
  variants: VariantInterface[] = [];
  saleDiscounts: SaleDiscountInterface[] = [];
  variantForm: FormGroup;

  private draftSubscription: Subscription;
  private variantsSubscription: Subscription;
  private settingsSubscription: Subscription;
  private saleDiscountSubscription: Subscription;

  constructor(private cart: CartService, private shop: ShopService, private router: Router,
              private alert: AlertService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.cart.getProductsFromDraft().subscribe(data => {
      if (data) {
        const { draft, variants } = data;
        this.draft = draft;
        this.variants = variants;
        if (this.variantForm) {
          this.variantForm.reset();
        }
        let variantFormControls = variants.map(variant => {
          return { [variant.id]: [variant.quantity] };
        });
        variantFormControls = Object.assign({}, ...variantFormControls);
        this.variantForm = this.formBuilder.group({
          ...variantFormControls
        });
      } else {
        this.variants = [];
      }
    });
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(settings => this.settings = settings);
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription && !this.settingsSubscription.closed) {
      this.settingsSubscription.unsubscribe();
    }
    if (this.draftSubscription && !this.draftSubscription.closed) {
      this.draftSubscription.unsubscribe();
    }
    if (this.variantsSubscription && !this.variantsSubscription.closed) {
      this.variantsSubscription.unsubscribe();
    }
    if (this.saleDiscountSubscription && !this.saleDiscountSubscription.closed) {
      this.saleDiscountSubscription.unsubscribe();
    }
  }

  getSaleDiscounts() {
    this.saleDiscountSubscription = this.shop.getSaleDiscounts().subscribe(saleDiscounts => this.saleDiscounts = saleDiscounts);
  }

  async addVoucher(code: string) {
    const { orderId } = this.draft;
    this.voucherLoading = true;
    try {
      await this.shop.addVoucher(orderId, code);
      this.voucherSuccess = true;
      setInterval(() => this.voucherSuccess = false, 2000);
    } catch (err) {
      this.handleError(err);
    }
    this.voucherLoading = false;
  }

  async removeVariant(id: string) {
    const { orderId } = this.draft;
    this.totalLoading = true;
    try {
      await this.shop.removeVariantFromCart(orderId, id);
    } catch (err) {
      this.handleError(err);
    }
    this.totalLoading = false;
  }

  async updateCart() {
    const variantControls = this.variantForm.controls;
    const variants: VariantQuantity[] = Object.keys(variantControls).map(key => {
      return {
        variantId: key,
        quantity: variantControls[key].value
      };
    });
    if (variants && variants.length > 0) {
      const { orderId } = this.draft;
      this.updateLoading = true;
      try {
        await this.shop.updateCartVariants(orderId, { variants });
        this.updateSuccess = true;
        setInterval(() => this.updateSuccess = false, 2000);
      } catch (err) {
        this.handleError(err);
      }
      this.updateLoading = false;
    }
  }

  trackByFn(index: number, item: VariantInterface) {
    return item.id;
  }

  getImage(images: Content[]) {
    if (!images || images.length === 0) { return; }
    const image = images[0];
    const { thumbnails } = image;
    const thumbnail = thumbnails.find(thumb => thumb.dimension === this.imageSize);
    return thumbnail.url;
  }

  toggleCoupon() {
    this.showCoupon = !this.showCoupon;
  }

  navigateToCheckout() {
    this.router.navigateByUrl(this.checkoutRoute);
  }

  handleError(err: any) {
    this.alert.alert({ message: err });
  }

}
