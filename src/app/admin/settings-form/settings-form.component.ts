import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@services/alert/alert.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { setTimeout } from '@utils/setTimeout';
import { ShopService } from '@services/shop/shop.service';
import { GeneralSettings } from '@models/GeneralSettings';
import { AdminService } from '@services/admin/admin.service';
import { PaymentGateway, WeightUnit } from '@models/Common';
import { countryCurrencyMap } from '@utils/currencyList';

@Component({
  selector: 'app-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.css']
})
export class SettingsFormComponent implements OnInit, OnDestroy {

  loading = false;
  success = false;

  settings: GeneralSettings;
  settingsForm: FormGroup;
  settingsSubscription: Subscription;

  currencies = Object.values(countryCurrencyMap);

  payments: { id: PaymentGateway, label: string }[] = [
    { id: 'razorpay', label: 'Razorpay' }
  ];

  weights: { id: WeightUnit, label: string }[] = [
    { id: 'g', label: 'G' },
    { id: 'kg', label: 'KG' },
    { id: 'lb', label: 'LB' },
    { id: 'oz', label: 'OZ' }
  ];

  constructor(private formBuilder: FormBuilder, private shop: ShopService, private admin: AdminService,
              private alert: AlertService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.settingsForm = this.formBuilder.group({
      name: ['', Validators.required],
      weightUnit: [null, Validators.required],
      currency: [null, Validators.required],
      paymentGateway: [null, Validators.required],
      cod: [false],
      accentColor: [''],
      facebook: [''],
      instagram: [''],
      twitter: ['']
    });
    this.getSettings();
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription && !this.settingsSubscription.closed) {
      this.settingsSubscription.unsubscribe();
    }
  }

  getSettings() {
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(settings => {
      this.settings = settings;
      if (settings) {
        this.setForm();
      }
    });
  }

  setForm() {
    const { name, weightUnit, currency, paymentGateway, accentColor, facebook, instagram, twitter, cod } = this.settings;
    this.settingsForm.patchValue({
      name,
      weightUnit: weightUnit || null,
      currency: currency || null,
      paymentGateway: paymentGateway || null,
      accentColor, facebook, instagram, twitter, cod });
  }

  async onSubmit() {
    this.loading = true;
    try {
      const { name, weightUnit, currency, paymentGateway, accentColor, facebook, instagram, twitter, cod } = this.settingsForm.controls;
      await this.admin.updateSettings({
        name: name.value,
        weightUnit: weightUnit.value,
        currency: currency.value,
        paymentGateway: paymentGateway.value,
        accentColor: accentColor.value,
        facebook: facebook.value,
        instagram: instagram.value,
        twitter: twitter.value,
        cod: cod.value,
      });
      this.success = true;
      setTimeout(() => {
        this.success = false;
        this.cdr.detectChanges();
      }, 2000);
    } catch (err) {
      this.handleError(err);
    }
    this.loading = false;
  }

  handleError(err: any) {
    this.alert.alert({ message: err.message || err });
  }

}
