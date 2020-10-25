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

  checkoutRoute = `/${CHECKOUT}`;
  imageSize = IMAGE_XS;
  showCoupon = false;
  showAddress = false;
  variantsLoading = false;
  draftLoading = false;

  settings: GeneralSettings;
  draft: OrderInterface;
  variants: VariantInterface[] = [];

  draftSubscription: Subscription;
  variantsSubscription: Subscription;
  settingsSubscription: Subscription;

  constructor(private cart: CartService, private shop: ShopService, private router: Router) { }

  ngOnInit(): void {
    this.draftLoading = true;
    this.draftSubscription = this.cart.getDraft().subscribe(draft => {
      if (!draft) { return; }
      this.draft = draft;
      const { variants } = draft;
      const variantIds = variants.map(variant => variant.variantId);
      this.variantsLoading = true;
      this.variantsSubscription = this.shop.getVariantByIds(variantIds).subscribe(vars => {
        if (!vars) { return; }
        this.variants = vars.map(v => {
          const variantQuantity = variants.find(vq => vq.variantId === v.id);
          v.quantity = variantQuantity.quantity;
          return v;
        });
        this.variantsLoading = false;
      }, _ => this.variantsLoading = false);
      this.draftLoading = false;
    }, _ => this.draftLoading = false);
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(settings => this.settings = settings);
  }

  ngOnDestroy(): void {
    if (this.draftSubscription && !this.draftSubscription.closed) {
      this.draftSubscription.unsubscribe();
    }
    if (this.variantsSubscription && !this.variantsSubscription.closed) {
      this.variantsSubscription.unsubscribe();
    }
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

  toggleAddress() {
    this.showAddress = !this.showAddress;
  }

  navigateToCheckout() {
    this.router.navigateByUrl(this.checkoutRoute);
  }

}
