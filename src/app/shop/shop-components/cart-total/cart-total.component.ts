import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons/faMapMarkerAlt';
import { GeneralSettings } from '@models/GeneralSettings';
import { OrderInterface } from '@models/Order';
import { AlertService } from '@services/alert/alert.service';
import { CartService } from '@services/cart/cart.service';
import { ShopService } from '@services/shop/shop.service';
import { countryList } from '@utils/countryList';
import { ShippingJoinInterface, ShippingRateInterface } from '@models/Shipping';
import { AuthService } from '@services/auth/auth.service';
import { Address, UserInterface } from '@models/User';
import { take } from 'rxjs/internal/operators/take';
import { Router } from '@angular/router';
import { CHECKOUT } from '@constants/routes';
import { VariantInterface } from '@models/Variant';

@Component({
  selector: 'app-cart-total',
  templateUrl: './cart-total.component.html',
  styleUrls: ['./cart-total.component.css']
})
export class CartTotalComponent implements OnInit, OnChanges, OnDestroy {

  @Input() loading = true;
  @Input() disableAddress = true;
  @Input() newZipCode = '';
  @Input() checkZipCode = true;
  @Input() shippingRates: ShippingRateInterface[] = [];
  @Input() countryAlpha: string;

  faMapMarkerAlt = faMapMarkerAlt;
  faChevronDown = faChevronDown;
  countryList = countryList;

  initCartTotalLoad = false;
  showAddress = false;
  freeShipping = false;
  isDeliverable = true;
  cod = false;
  selectedShippingRateId: string;

  settings: GeneralSettings;
  shipping: ShippingJoinInterface;
  draft: OrderInterface;
  variants: VariantInterface[] = [];
  user: UserInterface;

  private draftSubscription: Subscription;
  private draftProductsSubscription: Subscription;
  private codSubscription: Subscription;
  private settingsSubscription: Subscription;
  private userSubscription: Subscription;

  constructor(private cart: CartService, private shop: ShopService, private router: Router,
              private alert: AlertService, private auth: AuthService) { }

  ngOnInit(): void {
    this.loading = true;
    this.draftSubscription = this.cart.getDraft().subscribe(draft => {
      this.loading = false;
      if (!draft) { return; }
      this.draft = draft;
      this.selectedShippingRateId = draft.shippingRateId;
      if (draft.data && draft.data.voucherData) {
        const { valueType } = draft.data.voucherData;
        if (valueType === 'shipping') {
          this.freeShipping = true;
        }
      }
    });
    this.draftProductsSubscription = this.cart.getDraftProducts().subscribe(draftProducts => {
      if (draftProducts) {
        this.variants = draftProducts.variants;
        if (this.shipping) {
          this.checkDeliverable(this.shipping);
        }
      }
    });
    if (!this.initCartTotalLoad) {
      this.getCartTotal();
      this.initCartTotalLoad = true;
    }
    this.codSubscription = this.cart.getCod().subscribe(cod => this.cod = cod);
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(settings => this.settings = settings);
    if (!this.disableAddress) {
      this.getUserAddress();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.countryAlpha) {
      if (changes.countryAlpha.currentValue !== changes.countryAlpha.previousValue) {
        this.setShippingRate('');
      }
      this.getShippingByCountryAndUpdate(changes.countryAlpha.currentValue || '');
    }
    if (changes.checkZipCode && changes.checkZipCode.currentValue) {
      this.getShippingByCountryAndUpdate(this.countryAlpha || '');
    }
    if (changes.newZipCode && changes.newZipCode.currentValue) {
      this.getShippingByCountryAndUpdate(this.countryAlpha || '');
    }
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription && !this.settingsSubscription.closed) {
      this.settingsSubscription.unsubscribe();
    }
    if (this.draftSubscription && !this.draftSubscription.closed) {
      this.draftSubscription.unsubscribe();
    }
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
    if (this.draftProductsSubscription && !this.draftProductsSubscription.closed) {
      this.draftProductsSubscription.unsubscribe();
    }
    if (this.codSubscription && !this.codSubscription.closed) {
      this.codSubscription.unsubscribe();
    }
    this.cart.unsetShipping();
  }

  getUserAddress() {
    this.userSubscription = this.auth.getCurrentUserDocument().subscribe(async user => {
      this.user = user;
      if (user.shippingAddress && !this.draft.shippingAddress && this.draft) {
        this.getShippingByCountryAndUpdate(user.shippingAddress.country, user.shippingAddress, user.billingAddress);
      } else if (user.shippingAddress && this.shippingRates.length === 0 && this.draft) {
        this.getShippingByCountry(user.shippingAddress.country);
      }
    });
  }

  async getShippingByCountryAndUpdate(alpha3: string, shippingAddress?: Address, billingAddress?: Address) {
    this.loading = true;
    this.shippingRates = [];
    try {
      const shippingData = await this.getShippingByCountry(alpha3);
      if (shippingData && shippingData.shippingRates && shippingData.shippingRates.length === 1) {
          console.log('hi', this.draft.id);
          await this.shop.updateCartShipping(this.draft.id, {
            shippingId: shippingData.shippingId,
            shippingRateId: shippingData.rates[0],
            shippingAddress, billingAddress
          });
      } else if (shippingAddress && billingAddress) {
          console.log('hi2', this.draft.id);
          await this.shop.updateCartShipping(this.draft.id, { shippingAddress, billingAddress });
      }
    } catch (err) {
      this.handleError(err);
    }
    this.loading = false;
  }

  async getShippingByCountry(alpha3: string) {
    this.loading = true;
    try {
      const shippings = await this.shop.getShippingByCountry(alpha3.toLowerCase()).pipe(take(1)).toPromise();
      if (shippings && shippings.length > 0) {
        const shippingData = shippings[0];
        this.shipping = shippingData;
        this.checkDeliverable(shippingData);
        this.shippingRates = shippingData.shippingRates;
        this.cart.setShippingRateIds(this.shippingRates.map(s => s.id));
        return shippingData;
      } else {
        this.cart.setShippingRateIds([]);
        this.shippingRates = [];
        return null;
      }
    } catch (err) {
      this.handleError(err);
    }
    this.loading = false;
  }

  async setShippingRate(shippingRateId: string) {
    this.loading = true;
    try {
      await this.shop.updateCartShipping(this.draft.id, {
        shippingId: this.shipping.id,
        shippingRateId
      });
    } catch (err) {
      this.handleError(err);
    }
    this.loading = false;
  }

  async getCartTotal() {
    this.loading = true;
    try {
      await this.shop.getCartTotal();
    } catch (err) {
      this.handleError(err);
    }
    this.loading = false;
  }

  checkDeliverable(shipping: ShippingJoinInterface) {
    const { zipCode, warehouseId } = shipping;
    let deliverable = true;
    if (zipCode && zipCode.length > 0 && this.checkZipCode) {
      if (!this.newZipCode && this.draft.shippingAddress && !zipCode.includes(this.draft.shippingAddress.zip)) {
        deliverable = false;
      } else if (this.newZipCode && !zipCode.includes(this.newZipCode)) {
        deliverable = false;
      }
    }
    if (warehouseId && warehouseId.length > 0 && this.variants.length > 0) {
      const allDeliverable = this.variants.map(product => {
        if (product.warehouseQuantity && product.trackInventory) {
          const { warehouseQuantity } = product;
          const prodWarehouseIds = Object.keys(warehouseQuantity);
          if (warehouseId.some(id => !prodWarehouseIds.includes(id))) {
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      });
      if (allDeliverable.includes(false)) {
        deliverable = false;
      }
    }
    this.cart.setIsDeliverable(deliverable);
    this.isDeliverable = deliverable;
  }

  toggleCod() {
    this.cart.setCod(this.cod);
  }

  navigateToCheckout() {
    this.router.navigateByUrl(CHECKOUT);
  }

  toggleAddress() {
    this.showAddress = !this.showAddress;
  }

  trackByFn(index: number, item: ShippingRateInterface) {
    return item.id;
  }

  private handleError(err: any) {
    this.alert.alert({ message: err.message || err });
  }

}
