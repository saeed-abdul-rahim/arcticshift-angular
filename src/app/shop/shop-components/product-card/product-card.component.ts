import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { faHeart as faHeartR } from '@fortawesome/free-regular-svg-icons/faHeart';
import { faHeart as faHeartS } from '@fortawesome/free-solid-svg-icons/faHeart';
import { inOut } from '@animations/inOut';
import { slideInOut } from '@animations/slideInOut';
import { ShopService } from '@services/shop/shop.service';
import { GeneralSettings } from '@models/GeneralSettings';
import { ValueType } from '@models/Common';
import { getDiscountPrice, percentIncrease } from '@utils/calculation';
import { UserInterface } from '@models/User';
import { AuthService } from '@services/auth/auth.service';
import { AlertService } from '@services/alert/alert.service';

type Image = {
  url: string;
  title: string;
};

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  animations: [inOut, slideInOut]
})
export class ProductCardComponent implements OnInit, OnDestroy {

  @Input() id: string;
  @Input() url: string;
  @Input() images: Image[] = [];
  @Input() title: string;
  @Input() strikePrice: number;
  @Input() price: number;
  @Input() discountType: ValueType;
  @Input() discountValue: number;

  @Output() heartCallback = new EventEmitter<string>();

  heart = false;
  heartLoading = false;
  discount: number;
  hover = false;
  faHeartR = faHeartR;
  faHeartS = faHeartS;
  accentText: string;

  user: UserInterface;
  settings: GeneralSettings;
  private userSubscription: Subscription;
  private settingsSubscription: Subscription;

  constructor(private shop: ShopService, private auth: AuthService, private alert: AlertService) { }

  ngOnInit(): void {
    this.userSubscription = this.auth.getCurrentUserDocument().subscribe(user => {
      if (user) {
        this.user = user;
        if (user.wishlist.includes(this.id)) {
          this.heart = true;
        } else {
          this.heart = false;
        }
      }
    });
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(settings => {
      this.settings = settings;
      this.accentText = `text-${settings.accentColor}-500`;
    });
    this.setDiscount();
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription && !this.settingsSubscription.closed) {
      this.settingsSubscription.unsubscribe();
    }
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleHover() {
    this.hover = !this.hover;
  }

  async heartClick($event: Event) {
    $event.stopPropagation();
    this.heartLoading = true;
    this.heartCallback.emit(this.id);
    try {
      if (this.heart) {
        await this.shop.removeFromWishlist(this.id);
      } else {
        await this.shop.addToWishlist(this.id);
      }
    }
    catch (err){
      this.handleError(err);
    }
    this.heartLoading = false;
  }

  trackByFn(index: number, item: Image) {
    return item.url;
  }

  setDiscount() {
    if (!this.discountType) {
      return;
    }
    switch (this.discountType) {
      case 'fixed':
        this.discount = percentIncrease(this.price, this.discountValue);
        this.strikePrice = this.price;
        this.price -= this.discountValue;
        break;
      case 'percent':
        this.discount = this.discountValue;
        this.strikePrice = this.price;
        this.price = getDiscountPrice(this.price, this.discountValue);
        break;
    }
  }

  handleError(err: any) {
    this.alert.alert({ message: err });
  }

}
