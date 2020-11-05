import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ShopService } from '@services/shop/shop.service';
import { countryCallCodes } from '@utils/countryCallCodes';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit, OnDestroy {

  @Input() showModal = true;
  @Output() showModalChange = new EventEmitter<boolean>();

  countryCallCodes = countryCallCodes;
  selectedCallCode: string;

  locationSubscription: Subscription;

  constructor(private shop: ShopService) { }

  ngOnInit(): void {
    this.locationSubscription = this.shop.getCurrentLocation().subscribe(location => {
      if (location) {
        const countryCode = location.country_code;
        const countryCallCode = this.countryCallCodes.find(cc => cc.code === countryCode);
        if (countryCallCode) {
          const { callCode } = countryCallCode;
          this.selectedCallCode = callCode;
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.locationSubscription && !this.locationSubscription.closed) {
      this.locationSubscription.unsubscribe();
    }
  }

  async getUserByPhone(phone: string) {
    console.log(phone);
    const users = await this.shop.getUserByPhone(phone);
    const user = users[0];
    console.log(user);
  }

}
