import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { faHeart as faHeartR } from '@fortawesome/free-regular-svg-icons/faHeart';
import { faHeart as faHeartS } from '@fortawesome/free-solid-svg-icons/faHeart';
import { inOut } from '@animations/inOut';
import { slideInOut } from '@animations/slideInOut';
import { ShopService } from '@services/shop/shop.service';
import { GeneralSettings } from '@models/GeneralSettings';
import { ValueType } from '@models/Common';
import { getDiscountPrice, percentDecrease } from '@utils/calculation';

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
  @Input() heart = false;
  @Input() title: string;
  @Input() strikePrice: number;
  @Input() price: number;
  @Input() discountType: ValueType;
  @Input() discountValue: number;

  @Output() heartCallback = new EventEmitter<string>();

  discount: number;
  hover = false;
  faHeartR = faHeartR;
  faHeartS = faHeartS;
  accentText: string;

  settings: GeneralSettings;
  settingsSubscription: Subscription;

  constructor(private shop: ShopService) { }

  ngOnInit(): void {
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
  }

  toggleHover() {
    this.hover = !this.hover;
  }

  async heartClick() {
    this.heartCallback.emit(this.id);
    try{
      await this.shop.addToWishlist(this.id);
    }
    catch (err){}
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
        this.discount = percentDecrease(this.price, this.discountValue);
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

}
