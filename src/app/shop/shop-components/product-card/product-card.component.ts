import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { faHeart as faHeartR } from '@fortawesome/free-regular-svg-icons/faHeart';
import { faHeart as faHeartS } from '@fortawesome/free-solid-svg-icons/faHeart';
import { inOut } from '@animations/inOut';
import { slideInOut } from '@animations/slideInOut';
import { ShopService } from '@services/shop/shop.service';
import { GeneralSettings } from '@models/GeneralSettings';

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
  @Input() strikePrice: string;
  @Input() price: string;

  @Output() heartCallback = new EventEmitter<string>();

  hover = false;
  faHeartR = faHeartR;
  faHeartS = faHeartS;

  settings: GeneralSettings;
  settingsSubscription: Subscription;

  constructor(private shop: ShopService) { }

  ngOnInit(): void {
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(settings => this.settings = settings);
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription && !this.settingsSubscription.closed) {
      this.settingsSubscription.unsubscribe();
    }
  }

  toggleHover() {
    this.hover = !this.hover;
  }

  heartClick() {
    this.heartCallback.emit(this.id);
  }

}
