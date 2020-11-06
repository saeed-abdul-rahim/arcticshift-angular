import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@services/auth/auth.service';
import { CartService } from '@services/cart/cart.service';
import { ShopService } from '@services/shop/shop.service';
import { OrderInterface } from '@models/Order';
import { VariantInterface } from '@models/Variant';
import { GeneralSettings } from '@models/GeneralSettings';
import { Content } from '@models/Common';
import { IMAGE_SS } from '@constants/imageSize';
import { countryList, CountryListType, CountryStateType } from '@utils/countryList';
import { User } from '@models/User';

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

  billingForm: FormGroup;
  shippingForm: FormGroup;
  addressFormGroup = {
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
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
  variants: VariantInterface[];
  imageSize = IMAGE_SS;
  draftLoading = false;
  variantsLoading = false;

  private draftSubscription: Subscription;
  private variantsSubscription: Subscription;
  private settingsSubscription: Subscription;

  constructor(private formBuilder: FormBuilder, private cart: CartService, private shop: ShopService, private auth: AuthService) { }

  ngOnInit(): void {
    this.billingForm = this.formBuilder.group({
      ...this.addressFormGroup,
      email: ['', Validators.required],
      phone: [null, Validators.required],
    });
    this.shippingForm = this.formBuilder.group(this.addressFormGroup);
    this.clearShippingAddressValidators();
    this.getProducts();
    this.auth.getCurrentUserStream().subscribe(user => {
      if (user) {
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
  }

  get shippingFormControls() {
    return this.shippingForm.controls;
  }

  get billingFormControls() {
    return this.billingForm.controls;
  }

  setShippingAddressValidators() {
    Object.keys(this.addressFormGroup).forEach(key => {
      if (key !== 'line2') {
        this.shippingForm.get(key).setValidators([Validators.required]);
      }
    });
  }

  clearShippingAddressValidators() {
    this.shippingForm.clearValidators();
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
    this.cart.getProductsFromDraft().subscribe(data => {
      if (data) {
        const { draft, variants } = data;
        this.draft = draft;
        this.variants = variants;
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

  pay() {}

}
