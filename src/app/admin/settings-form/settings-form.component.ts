import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@services/alert/alert.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { setTimeout } from '@utils/setTimeout';
import { ShopService } from '@services/shop/shop.service';
import { GeneralSettings } from '@models/GeneralSettings';
import { AdminService } from '@services/admin/admin.service';
import { ContentStorage, ContentType, PaymentGateway, WeightUnit } from '@models/Common';
import { countryCurrencyMap } from '@utils/currencyList';
import { StorageService } from '@services/storage/storage.service';
import { IMAGE_SM } from '@constants/imageSize';
import { blobToBase64 } from '@utils/media';

@Component({
  selector: 'app-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.css']
})
export class SettingsFormComponent implements OnInit, OnDestroy {

  loading = false;
  success = false;

  fileLogo: File;
  fileTypeLogo: ContentType;
  thumbnailsLogo: ContentStorage[] = [];
  uploadProgressLogo = 0;

  fileLogoLong: File;
  fileTypeLogoLong: ContentType;
  thumbnailsLogoLong: ContentStorage[] = [];
  uploadProgressLogoLong = 0;

  fileLogoMd: File;
  fileTypeLogoMd: ContentType;
  thumbnailsLogoMd: ContentStorage[] = [];
  uploadProgressLogoMd = 0;

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
              private alert: AlertService, private cdr: ChangeDetectorRef, private storage: StorageService) { }

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
        const { images } = settings;
        if (images && images.length > 0) {
          const logo = images.find(i => i.id === 'logo');
          const longLogo = images.find(i => i.id === 'longLogo');
          const logoMd = images.find(i => i.id === 'logoMd');
          if (logo) {
            this.thumbnailsLogo = [logo.thumbnails.find(thumb => thumb.dimension === IMAGE_SM)];
          }
          if (longLogo) {
            this.thumbnailsLogoLong = [longLogo.thumbnails.find(thumb => thumb.dimension === IMAGE_SM)];
          }
          if (logoMd) {
            this.thumbnailsLogoMd = [logoMd.thumbnails.find(thumb => thumb.dimension === IMAGE_SM)];
          }
        }
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
      accentColor, facebook, instagram, twitter, cod
    });
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

  async deleteLogo($event) {}
  async deleteLogoLong($event) {}
  async deleteLogoMd($event) {}

  onFileDropped($event: File) {
    this.fileLogo = $event;
    this.processLogoFile();
  }

  onFileDroppedLogoMd($event: File) {
    this.fileLogoMd = $event;
    this.processLogoMdFile();
  }

  onFileDroppedLogoLong($event: File) {
    this.fileLogoLong = $event;
    this.processLogoLongFile();
  }

  processLogoFile() {
    this.storage.upload(this.fileLogo, 'image', {
      id: 'logo',
      type: 'settings'
    });
    this.storage.getUploadProgress().subscribe(progress =>
      this.uploadProgressLogo = progress,
      () => { },
      async () => {
        this.uploadProgressLogo = 0;
        const base64Image = await blobToBase64(this.fileLogo) as string;
        this.thumbnailsLogo.push({
          path: '', url: base64Image
        });
    });
  }

  processLogoLongFile() {
    this.storage.upload(this.fileLogoLong, 'image', {
      id: 'longLogo',
      type: 'settings'
    });
    this.storage.getUploadProgress().subscribe(progress =>
      this.uploadProgressLogoLong = progress,
      () => { },
      async () => {
        this.uploadProgressLogoLong = 0;
        const base64Image = await blobToBase64(this.fileLogoLong) as string;
        this.thumbnailsLogoLong.push({
          path: '', url: base64Image
        });
    });
  }

  processLogoMdFile() {
    this.storage.upload(this.fileLogoMd, 'image', {
      id: 'logoMd',
      type: 'settings'
    });
    this.storage.getUploadProgress().subscribe(progress =>
      this.uploadProgressLogoMd = progress,
      () => { },
      async () => {
        this.uploadProgressLogoMd = 0;
        const base64Image = await blobToBase64(this.fileLogoMd) as string;
        this.thumbnailsLogoMd.push({
          path: '', url: base64Image
        });
    });
  }

  handleError(err: any) {
    this.alert.alert({ message: err.message || err });
  }

}
