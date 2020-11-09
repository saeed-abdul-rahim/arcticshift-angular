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
import { OrderInterface } from '@models/Order';
import { VariantInterface } from '@models/Variant';
import { CartService } from '@services/cart/cart.service';
import { ShopService } from '@services/shop/shop.service';
import { AlertService } from '@services/alert/alert.service';
import { countryAlphaList } from '@utils/countryAlphaList';

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

  settings: GeneralSettings;
  draft: OrderInterface;
  variants: VariantInterface[] = [];

  private draftSubscription: Subscription;
  private variantsSubscription: Subscription;
  private settingsSubscription: Subscription;

  constructor(private cart: CartService, private shop: ShopService, private router: Router, private alert: AlertService) { }

  ngOnInit(): void {
    this.cart.getProductsFromDraft().subscribe(data => {
      if (data) {
        const { draft, variants } = data;
        this.draft = draft;
        this.variants = variants;
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
