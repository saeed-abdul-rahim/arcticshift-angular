import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons/faMapMarkerAlt';
import { GeneralSettings } from '@models/GeneralSettings';
import { OrderInterface } from '@models/Order';
import { AlertService } from '@services/alert/alert.service';
import { CartService } from '@services/cart/cart.service';
import { ShopService } from '@services/shop/shop.service';
import { countryList } from '@utils/countryList';

@Component({
  selector: 'app-cart-total',
  templateUrl: './cart-total.component.html',
  styleUrls: ['./cart-total.component.css']
})
export class CartTotalComponent implements OnInit, OnDestroy {

  @Input() loading = true;
  @Input() disableAddress = true;

  faMapMarkerAlt = faMapMarkerAlt;
  faChevronDown = faChevronDown;
  countryList = countryList;

  initCartTotalLoad = false;
  showAddress = false;

  settings: GeneralSettings;
  draft: OrderInterface;

  private draftSubscription: Subscription;
  private settingsSubscription: Subscription;

  constructor(private cart: CartService, private shop: ShopService, private alert: AlertService) { }

  ngOnInit(): void {
    this.loading = true;
    this.draftSubscription = this.cart.getDraft().subscribe(draft => {
      this.loading = false;
      if (!draft) { return; }
      this.draft = draft;
    });
    if (!this.initCartTotalLoad) {
      this.getCartTotal();
      this.initCartTotalLoad = true;
    }
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(settings => this.settings = settings);
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription && !this.settingsSubscription.closed) {
      this.settingsSubscription.unsubscribe();
    }
    if (this.draftSubscription && !this.draftSubscription.closed) {
      this.draftSubscription.unsubscribe();
    }
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

  private handleError(err: any) {
    this.alert.alert({ message: err });
  }

}
