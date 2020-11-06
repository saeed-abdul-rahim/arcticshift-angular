import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import * as firebase from 'firebase/app';

import { AlertService } from '@services/alert/alert.service';
import { AuthService } from '@services/auth/auth.service';
import { ShopService } from '@services/shop/shop.service';
import { countryCallCodes } from '@utils/countryCallCodes';
import { otpConfig } from '@settings/otpConfig';

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
  otp: string;
  loading = false;
  showOtp = false;
  newUser = false;
  otpConfig = otpConfig;

  locationSubscription: Subscription;

  constructor(private shop: ShopService, private auth: AuthService, private alert: AlertService) { }

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
    this.showOtp = false;
    this.newUser = false;
  }

  async getUserByPhone(phone: string) {
    this.loading = true;
    try {
      const user = await this.auth.getUserByPhone(phone);
      const recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      });
      if (user) {
        this.newUser = false;
        await this.auth.signInWithPhone(phone, recaptchaVerifier);
      }
      else {
        this.newUser = true;
        await this.auth.linkUserToPhone(phone, recaptchaVerifier);
      }
      this.showOtp = true;
    } catch (err) {
      this.handleError(err);
    }
    this.loading = false;
  }

  async verify() {
    this.loading = true;
    const { otp, newUser } = this;
    if (!otp || otp.length !== otpConfig.length) {
      this.handleError('Invalid OTP');
      return;
    }
    try {
      await this.auth.verifyOtp(otp);
      if (newUser) {
        await this.auth.createPhoneUser();
      }
      this.closeModal();
    } catch (err) {
      console.log(err);
      this.handleError(err);
    }
    this.loading = false;
  }

  closeModal() {
    this.showModal = false;
    this.showModalChange.emit(this.showModal);
  }

  onOtpChange($event: string) {
    this.otp = $event;
    if (this.otp && this.otp.length === otpConfig.length) {
      this.verify();
    }
  }

  handleError(err: any) {
    const message = typeof err !== 'string' ? err.message || err : err;
    this.alert.alert({ message });
  }

}
