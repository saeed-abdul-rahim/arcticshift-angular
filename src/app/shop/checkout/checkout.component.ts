import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from '@services/auth/auth.service';
import { CartService } from '@services/cart/cart.service';
import { ShopService } from '@services/shop/shop.service';
import { RazorpayOptions } from '@models/RazorpayOptions';
import { OrderInterface } from '@models/Order';
import { VariantExtended } from '@models/Variant';
import { GeneralSettings } from '@models/GeneralSettings';
import { Content } from '@models/Common';
import { Address, User } from '@models/User';
import { homeRoute } from '@constants/routes';
import { IMAGE_SS } from '@constants/imageSize';
import { countryList, CountryListType, CountryStateType } from '@utils/countryList';
import { AlertService } from '@services/alert/alert.service';
import { environment } from '@environment';
import { isProductAvailable } from '@utils/productUtils';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  countryList = countryList;
  billingStates: CountryStateType[] = [];
  shippingStates: CountryStateType[] = [];

  shippingAddressCheck = false;
  isAnonymous = true;
  payButtonLabel = 'Sign In & Pay';

  invalidBillingForm = false;
  invalidShippingForm = false;
  billingForm: FormGroup;
  shippingForm: FormGroup;
  addressFormGroup = {
    line1: ['', Validators.required],
    line2: [''],
    state: [null, Validators.required],
    city: ['', Validators.required],
    zip: ['', Validators.required],
    country: [null, Validators.required]
  };

  user: User;
  settings: GeneralSettings;
  draft: OrderInterface;
  variants: VariantExtended[];
  imageSize = IMAGE_SS;
  draftLoading = false;
  variantsLoading = false;
  showSignInModal = false;
  available = false;

  private razorpayKey: string;
  private draftSubscription: Subscription;
  private variantsSubscription: Subscription;
  private settingsSubscription: Subscription;
  private userSubscription: Subscription;

  constructor(private formBuilder: FormBuilder, private cart: CartService, private shop: ShopService,
              private auth: AuthService, private router: Router, private alert: AlertService) { }

  ngOnInit(): void {
    const { razorPay } = environment;
    this.razorpayKey = razorPay.key;
    this.billingForm = this.formBuilder.group({
      ...this.addressFormGroup,
      name: ['', Validators.required]
    });
    this.shippingForm = this.formBuilder.group(this.addressFormGroup);
    this.clearShippingAddressValidators();
    this.getProducts();
    this.userSubscription = this.auth.getCurrentUserStream().subscribe(user => {
      if (user) {
        if (this.user && user.uid !== this.user.uid) {
          this.router.navigateByUrl(homeRoute);
        }
        this.user = user;
        const { isAnonymous } = user;
        this.isAnonymous = isAnonymous;
        if (isAnonymous) {
          this.payButtonLabel = 'Sign In & Pay';
        } else {
          this.payButtonLabel = 'Pay';
        }
      }
    });
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
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
  }

  get shippingFormControls() {
    return this.shippingForm.controls;
  }

  get billingFormControls() {
    return this.billingForm.controls;
  }

  setShippingAddressValidators() {
    Object.keys(this.shippingFormControls).forEach(key => {
      if (key !== 'line2') {
        this.shippingForm.get(key).setValidators([Validators.required]);
        this.shippingForm.get(key).updateValueAndValidity();
      }
    });
  }

  clearShippingAddressValidators() {
    Object.keys(this.shippingFormControls).forEach(key => {
      if (key !== 'line2') {
        this.shippingForm.get(key).clearValidators();
        this.shippingForm.get(key).updateValueAndValidity();
      }
    });
  }

  toggleShippingAddressCheck() {
    if (this.shippingAddressCheck) {
      this.setShippingAddressValidators();
    } else {
      this.clearShippingAddressValidators();
    }
  }

  setBillingState(country: CountryListType) {
    this.billingFormControls.state.patchValue(null);
    this.billingStates = country.states;
  }

  setShippingState(country: CountryListType) {
    this.shippingFormControls.state.patchValue(null);
    this.shippingStates = country.states;
  }

  async onSubmit() {}

  getProducts() {
    this.draftSubscription = this.cart.getProductsFromDraft().subscribe(data => {
      if (data) {
        const { draft, variants } = data;
        this.draft = draft;
        this.variants = variants.map(variant => {
          const available = isProductAvailable(variant);
          return { ...variant, available };
        });
        const allAvailable = this.variants.map(variant => variant.available);
        if (allAvailable.includes(false)) {
          this.available = false;
        } else {
          this.available = true;
        }
      }
    });
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(settings => this.settings = settings);
  }

  getImage(images: Content[]) {
    if (!images || images.length === 0) { return; }
    const image = images[0];
    const { thumbnails } = image;
    const thumbnail = thumbnails.find(thumb => thumb.dimension === this.imageSize);
    return thumbnail.url;
  }

  async pay() {
    if (this.isAnonymous) {
      this.showSignInModal = true;
      return;
    }
    if (this.billingForm.invalid) {
      this.invalidBillingForm = true;
      return;
    }
    if (this.shippingForm.invalid) {
      this.invalidShippingForm = true;
      return;
    }
    try {
      const { user, draft, billingFormControls } = this;
      const { orderId } = draft;
      const { phone } = user;
      const { name } = billingFormControls;
      const billingAddress = this.getAddress(this.billingForm);
      billingAddress.name = name.value;
      let shippingAddress: Address = null;
      if (this.shippingAddressCheck) {
        shippingAddress = this.getAddress(this.shippingForm);
        shippingAddress.name = name.value;
      }
      const data: OrderInterface = {
        orderId,
        phone,
        billingAddress,
        shippingAddress
      };
      const gatewayOrderDetails = await this.shop.finalizeCart(data);
      const { amount, currency, id } = gatewayOrderDetails;
      const options: RazorpayOptions = {
        key: this.razorpayKey,
        amount,
        currency,
        order_id: id,
        prefill: {
          contact: user.phone
        },
        handler: this.razorpayResponseHandler
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      this.handleError(err);
    }
  }

  afterSignIn(isSignedIn: boolean) {
    if (isSignedIn) {
      this.pay();
    }
  }

  getAddress(address: FormGroup): Address {
    try {
      const { phone } = this.user;
      const { controls } = address;
      const { line1, line2, state, city, zip, country } = controls;
      return {
        phone,
        line1: line1.value,
        line2: line2.value,
        area: state.value,
        city: city.value,
        zip: zip.value,
        country: country.value,
        company: '',
        email: '',
      };
    } catch (err) {
      throw err;
    }
  }

  razorpayResponseHandler(response: any) {
    this.router.navigateByUrl('/');
  }

  handleError(err: any) {
    this.alert.alert({ message: err });
  }

}
