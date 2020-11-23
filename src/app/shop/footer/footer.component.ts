import { Component, OnDestroy, OnInit } from '@angular/core';
import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram';
import { faFacebook } from '@fortawesome/free-brands-svg-icons/faFacebook';
import { faTwitter } from '@fortawesome/free-brands-svg-icons/faTwitter';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { GeneralSettings } from '@models/GeneralSettings';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {

  faInstagram = faInstagram;
  faFacebook = faFacebook;
  faTwitter = faTwitter;
  year = new Date().getFullYear();

  settings: GeneralSettings;
  private settingsSubscription: Subscription;

  constructor(private shop: ShopService) { }

  ngOnInit(): void {
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(settings => this.settings = settings);
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription && !this.settingsSubscription.closed) {
      this.settingsSubscription.unsubscribe();
    }
  }

}
