import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons/faMapMarkerAlt';
import { GeneralSettings } from '@models/GeneralSettings';
import { OrderInterface } from '@models/Order';
import { AlertService } from '@services/alert/alert.service';
import { CartService } from '@services/cart/cart.service';
import { ShopService } from '@services/shop/shop.service';
import { countryList, getCountryName } from '@utils/countryList';
import { ShippingRateInterface } from '@models/Shipping';
import { AuthService } from '@services/auth/auth.service';
import { Address, UserInterface } from '@models/User';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-cart-total',
  templateUrl: './cart-total.component.html',
  styleUrls: ['./cart-total.component.css']
})
export class CartTotalComponent implements OnInit, OnChanges, OnDestroy {

  @Input() loading = true;
  @Input() disableAddress = true;
  @Input() shippingRates: ShippingRateInterface[] = [];
  @Input() countryAlpha: string;

  faMapMarkerAlt = faMapMarkerAlt;
  faChevronDown = faChevronDown;
  countryList = countryList;
  getCountryName = getCountryName;

  initCartTotalLoad = false;
  showAddress = false;
  freeShipping = false;

  settings: GeneralSettings;
  draft: OrderInterface;
  user: UserInterface;

  private draftSubscription: Subscription;
  private settingsSubscription: Subscription;
  private userSubscription: Subscription;

  constructor(private cart: CartService, private shop: ShopService, private alert: AlertService, private auth: AuthService) { }

  ngOnInit(): void {
    this.loading = true;
    this.draftSubscription = this.cart.getDraft().subscribe(draft => {
      this.loading = false;
      if (!draft) { return; }
      this.draft = draft;
      if (draft.data && draft.data.voucherData) {
        const { valueType } = draft.data.voucherData;
        if (valueType === 'shipping') {
          this.freeShipping = true;
        }
      }
    });
    if (!this.initCartTotalLoad) {
      this.getCartTotal();
      this.initCartTotalLoad = true;
    }
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
  }

  getUserAddress() {
    this.userSubscription = this.auth.getCurrentUserDocument().subscribe(user => {
      this.user = user;
      if (user.shippingAddress && !this.draft.shippingAddress) {
        this.getShippingByCountryAndUpdate(user.shippingAddress.country, user.shippingAddress, user.billingAddress);
      } else if (user.shippingAddress && this.shippingRates.length === 0) {
        this.getShippingByCountry(user.shippingAddress.country);
      }
    });
  }

  async getShippingByCountryAndUpdate(alpha3: string, shippingAddress?: Address, billingAddress?: Address, update = true) {
    this.shippingRates = [];
    const shippingData = await this.getShippingByCountry(alpha3);
    if (shippingData.shippingRates && shippingData.shippingRates.length === 1 && update) {
      try {
        await this.shop.updateCartShipping(this.draft.id, { shippingRateId: shippingData.rates[0], shippingAddress, billingAddress });
      } catch (err) {
        this.handleError(err);
      }
    } else if (shippingAddress && billingAddress && update) {
      try {
        await this.shop.updateCartShipping(this.draft.id, { shippingAddress, billingAddress });
      } catch (err) {
        this.handleError(err);
      }
    }
  }

  async getShippingByCountry(alpha3: string) {
    try {
      const shippings = await this.shop.getShippingByCountry(alpha3.toLowerCase()).pipe(take(1)).toPromise();
      if (shippings && shippings.length > 0) {
        const shippingData = shippings[0];
        this.shippingRates = shippingData.shippingRates;
        return shippingData;
      } else {
        this.shippingRates = [];
        return null;
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  async setShippingRate(shippingRateId: string) {
    this.loading = true;
    try {
      await this.shop.updateCartShipping(this.draft.id, { shippingRateId });
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
