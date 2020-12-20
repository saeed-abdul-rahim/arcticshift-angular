import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { faGoogle } from '@fortawesome/free-brands-svg-icons/faGoogle';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';

import { AlertService } from '@services/alert/alert.service';
import { AuthService } from '@services/auth/auth.service';
import { ShopService } from '@services/shop/shop.service';
import { countryCallCodes } from '@utils/countryCallCodes';
import { otpConfig } from '@settings/otpConfig';
import { ModalService } from '@services/modal/modal.service';
import { inOutWidth } from '@animations/inOut';
import { GeneralSettings } from '@models/GeneralSettings';
import { auth } from 'firebase/app';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  animations: [inOutWidth]
})
export class SignInComponent implements OnInit, OnDestroy {

  @Input() showModal = true;
  @Output() showModalChange = new EventEmitter<boolean>();
  @Output() signedIn = new EventEmitter<boolean>();

  faGoogle = faGoogle;
  faChevronLeft = faChevronLeft;
  countryCallCodes = countryCallCodes;
  selectedCallCode: string;
  otp: string;
  emailPhone: string;
  mainButtonLabel = 'Sign In';
  loading = false;
  showOtp = false;
  showPassword = false;
  newPassword = false;
  newUser = false;
  isPhone = false;
  validInput = true;
  validPassword = true;
  passwordResetLoading = false;
  otpConfig = otpConfig;

  recaptchaVerifier: any;

  generalSettings: GeneralSettings;

  private locationSubscription: Subscription;
  private modalSubscription: Subscription;
  private settingsSubscription: Subscription;

  constructor(private shop: ShopService, private authService: AuthService, private alert: AlertService,
              private modal: ModalService) { }

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
    this.recaptchaVerifier = new auth.RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: () => {}
    });
    this.modalSubscription = this.modal.getShowSignInModal().subscribe(show => this.showModal = show);
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(generalSettings => this.generalSettings = generalSettings);
  }

  ngOnDestroy(): void {
    if (this.locationSubscription && !this.locationSubscription.closed) {
      this.locationSubscription.unsubscribe();
    }
    if (this.modalSubscription && !this.modalSubscription.closed) {
      this.modalSubscription.unsubscribe();
    }
    if (this.settingsSubscription && !this.settingsSubscription.closed) {
      this.settingsSubscription.unsubscribe();
    }
    this.showOtp = false;
    this.showPassword = false;
    this.newUser = false;
  }

  initSignIn() {
    if (this.isPhone) {
      this.getUserByPhone();
    } else if (this.validInput) {
      this.fetchEmail();
    }
  }

  async signInWithGoogle() {
    try {
      await this.authService.signInWithGoogle();
      this.signedIn.emit(true);
      this.closeModal();
    } catch (err) {
      this.handleError(err);
    }
  }

  async fetchEmail() {
    this.loading = true;
    try {
      const signInMethods = await this.authService.fetchEmail(this.emailPhone);
      if (signInMethods.length === 0 || !signInMethods.includes('password')) {
        this.showPassword = true;
        this.newPassword = true;
        this.mainButtonLabel = 'Sign Up';
      } else if (signInMethods.includes('password')) {
        this.showPassword = true;
        this.newPassword = false;
      }
    } catch (err) {
      this.handleError(err);
    }
    this.loading = false;
  }

  async getUserByPhone() {
    this.loading = true;
    try {
      const { selectedCallCode, emailPhone } = this;
      const phone = selectedCallCode + emailPhone;
      const user = await this.authService.getUserByPhone(phone);
      if (user) {
        this.newUser = false;
        await this.authService.signInWithPhone(phone, this.recaptchaVerifier);
      }
      else {
        this.newUser = true;
        await this.authService.linkUserToPhone(phone, this.recaptchaVerifier);
      }
      this.showOtp = true;
    } catch (err) {
      this.handleError(err);
    }
    this.loading = false;
  }

  async verifySignIn(password: string, confirmPassword?: string) {
    this.loading = true;
    try {
      if (this.newPassword) {
        if (!confirmPassword || confirmPassword !== password) {
          return;
        }
        await this.authService.linkUserToEmail(this.emailPhone, password);
        await this.authService.createEmailUser();
      } else {
        await this.authService.signIn(this.emailPhone, password);
        await this.authService.getUser();
      }
      this.signedIn.emit(true);
      this.closeModal();
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
      await this.authService.verifyOtp(otp);
      if (newUser) {
        await this.authService.createPhoneUser();
      }
      await this.authService.getUser();
      this.signedIn.emit(true);
      this.closeModal();
    } catch (err) {
      this.handleError(err);
      this.signedIn.emit(false);
    }
    this.showOtp = false;
    this.loading = false;
  }

  async passwordReset() {
    this.passwordResetLoading = true;
    try {
      await this.authService.passwordReset(this.emailPhone);
      this.alert.alert({ message: 'Password reset request has been sent to your email.' });
    } catch (err) {
      this.handleError(err);
    }
    this.passwordResetLoading = false;
  }

  closeModal() {
    this.showModal = false;
    this.showModalChange.emit(this.showModal);
    this.modal.setShowSignInModal(false);
  }

  onModalChange($event: boolean) {
    this.showModalChange.emit($event);
    this.modal.setShowSignInModal($event);
  }

  onOtpChange($event: string) {
    this.otp = $event;
    if (this.otp && this.otp.length === otpConfig.length) {
      this.verify();
    }
  }

  onInputChange($event: any) {
    const { value } = $event.target;
    this.emailPhone = value;
    if (value.match(/^\d{10}$/)) {
      this.validInput = true;
      this.isPhone = true;
      this.mainButtonLabel = 'Get OTP';
      return;
    } else {
      this.isPhone = false;
    }
    if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      this.validInput = false;
      this.mainButtonLabel = 'Sign In';
      return;
    }
    this.mainButtonLabel = 'Sign In';
    this.validInput = true;
  }

  onInputPassChange($event: any) {
    const { value } = $event.target;
    this.validPassword = this.validatePassword(value);
  }

  validatePassword(password: string) {
    if (password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/)) {
      return true;
    }
    return false;
  }

  goToMain() {
    this.showOtp = false;
    this.showPassword = false;
  }

  handleError(err: any) {
    const message = typeof err !== 'string' ? err.message || err : err;
    this.alert.alert({ message });
  }

}
