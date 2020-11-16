import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faTicketAlt } from '@fortawesome/free-solid-svg-icons/faTicketAlt';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons/faMapMarkerAlt';

import { CART } from '@constants/routes';
import { IMAGE_XS } from '@constants/imageSize';
import { GeneralSettings } from '@models/GeneralSettings';
import { Content } from '@models/Common';
import { OrderInterface } from '@models/Order';
import { VariantExtended, VariantInterface } from '@models/Variant';
import { CartService } from '@services/cart/cart.service';
import { ShopService } from '@services/shop/shop.service';
import { AlertService } from '@services/alert/alert.service';
import { countryAlphaList } from '@utils/countryAlphaList';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { isProductAvailable } from '@utils/isProductAvailable';
import { AuthService } from '@services/auth/auth.service';
import { UserInterface } from '@models/User';




@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit, OnDestroy {


  faMapMarkerAlt = faMapMarkerAlt;
  faTicketAlt = faTicketAlt;
  faChevronDown = faChevronDown;
  faTimes = faTimes;
  countryAlphaList = countryAlphaList;

  cartRoute = `/${CART}`;
  imageSize = IMAGE_XS;
  showCoupon = false;
  variantsLoading = false;
  voucherLoading = false;
  voucherSuccess = false;
  draftLoading = false;
  totalLoading = false;
  updateLoading = false;
  updateSuccess = false;
  available = false;

  settings: GeneralSettings;
  draft: OrderInterface;
  user: UserInterface;
  variants: VariantExtended[] = [];
  saleDiscounts: SaleDiscountInterface[] = [];
  variantForm: FormGroup;

  private draftSubscription: Subscription;
  private variantsSubscription: Subscription;
  private settingsSubscription: Subscription;
  private saleDiscountSubscription: Subscription;

  constructor(private cart: CartService, private shop: ShopService, private router: Router,
              private auth: AuthService, private alert: AlertService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
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

getwishlist(){
  this.auth.getCurrentUserDocument().subscribe(user => this.user = user);
  
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


  navigateToCart() {
    this.router.navigateByUrl(this.cartRoute);
  }

  handleError(err: any) {
    this.alert.alert({ message: err });
  }

}

