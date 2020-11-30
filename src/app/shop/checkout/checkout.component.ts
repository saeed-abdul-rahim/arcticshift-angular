import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from '@services/auth/auth.service';
import { CartService } from '@services/cart/cart.service';
import { ShopService } from '@services/shop/shop.service';
import { OrderInterface } from '@models/Order';
import { VariantExtended, VariantInterface } from '@models/Variant';
import { GeneralSettings } from '@models/GeneralSettings';
import { Content } from '@models/Common';
import { Address, User } from '@models/User';
import { homeRoute } from '@constants/routes';
import { IMAGE_SS } from '@constants/imageSize';
import { countryList, CountryListType, CountryStateType } from '@utils/countryList';
import { AlertService } from '@services/alert/alert.service';
import { isProductAvailable } from '@utils/productUtils';
import { ShippingRateInterface } from '@models/Shipping';
import { countryCallCodes } from '@utils/countryCallCodes';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  countryList = countryList;
  countryCallCodes = countryCallCodes;
  billingStates: CountryStateType[] = [];
  shippingStates: CountryStateType[] = [];

  shippingAddressCheck = false;
  isAnonymous = true;
  checkZipCode = false;
  zipCode = '';

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
  miscForm: FormGroup;

  user: User;
  settings: GeneralSettings;
  draft: OrderInterface;
  variants: VariantExtended[];
  shippingRates: ShippingRateInterface[] = [];
  imageSize = IMAGE_SS;
  loading = false;
  draftLoading = false;
  variantsLoading = false;
  available = false;
  countryAlpha: string;

  private draftSubscription: Subscription;
  private variantsSubscription: Subscription;
  private settingsSubscription: Subscription;
  private userSubscription: Subscription;

  constructor(private formBuilder: FormBuilder, private cart: CartService, private shop: ShopService,
              private auth: AuthService, private router: Router, private alert: AlertService) { }

  ngOnInit(): void {
    this.miscForm = this.formBuilder.group({
      notes: ['']
    });
    this.billingForm = this.formBuilder.group({
      ...this.addressFormGroup,
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      phoneCode: [null, Validators.required]
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

  get miscFormControls() {
    return this.miscForm.controls;
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
    if (!country) {
      this.billingStates = [];
      this.countryAlpha = '';
      return;
    }
    this.billingStates = country.states;
    if (!this.shippingAddressCheck) {
      this.countryAlpha = country.alpha3;
    }
  }

  setShippingState(country: CountryListType) {
    this.shippingFormControls.state.patchValue(null);
    if (!country) {
      this.billingStates = [];
      this.countryAlpha = '';
      return;
    }
    this.shippingStates = country.states;
    this.countryAlpha = country.alpha3;
  }

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
    if (!this.available) { return; }
    if (this.billingForm.invalid) {
      this.invalidBillingForm = true;
      return;
    }
    if (this.shippingForm.invalid) {
      this.invalidShippingForm = true;
      return;
    }
    this.loading = true;
    try {
      const { draft, billingFormControls, miscForm } = this;
      const { orderId } = draft;
      const { firstName, lastName, email, phone, phoneCode } = billingFormControls;
      const name = firstName.value + ' ' + lastName.value;
      const billingAddress = this.getAddress(this.billingForm);
      billingAddress.name = name;
      billingAddress.firstName = firstName.value;
      billingAddress.lastName = lastName.value;
      let shippingAddress: Address = null;
      if (this.shippingAddressCheck) {
        shippingAddress = this.getAddress(this.shippingForm);
        shippingAddress.name = name;
        shippingAddress.firstName = firstName.value;
        shippingAddress.lastName = lastName.value;
      }
      const data: OrderInterface = {
        orderId,
        phone: phoneCode.value + phone.value,
        email: email.value,
        billingAddress,
        shippingAddress,
        notes: miscForm.controls.notes.value
      };
      await this.cart.pay(data, email.value, phoneCode.value + phone.value);
    } catch (err) {
      this.handleError(err);
    }
    this.loading = false;
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

  billingZipCodeChange($event: any) {
    const zip = $event.target.value;
    if (!this.shippingAddressCheck) {
      this.zipCode = zip;
      this.checkZipCode = true;
    }
  }

  shippingZipCodeChange($event: any) {
    const zip = $event.target.value;
    this.zipCode = zip;
    this.checkZipCode = true;
  }

  trackByFn(index: number, item: VariantInterface) {
    return item.id;
  }

  handleError(err: any) {
    this.alert.alert({ message: err });
  }

}
