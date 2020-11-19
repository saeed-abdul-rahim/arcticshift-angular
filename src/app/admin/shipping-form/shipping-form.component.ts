import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ADD, shippingRoute } from '@constants/routes';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { RateType, ShippingInterface, ShippingRateInterface } from '@models/Shipping';
import { ShopInterface } from '@models/Shop';
import { WarehouseInterface } from '@models/Warehouse';
import { AdminService } from '@services/admin/admin.service';
import { AlertService } from '@services/alert/alert.service';
import { ShopService } from '@services/shop/shop.service';
import { CountryAlphaList, countryAlphaList } from '@utils/countryAlphaList';
import { toTitle } from '@utils/strUtils';
import { Subscription } from 'rxjs/internal/Subscription';
import { setTimeout } from '@utils/setTimeout';

@Component({
  selector: 'app-shipping-form',
  templateUrl: './shipping-form.component.html',
  styleUrls: ['./shipping-form.component.css']
})
export class ShippingFormComponent implements OnInit, OnDestroy {

  faTrash = faTrash;

  edit = false;
  isEditRate = false;
  showCountryModal = false;
  showRateModal = false;
  showDeleteModal = false;
  showCountries = false;
  showZip = false;
  noValueLimit = false;
  freeShipping = false;
  loading = false;
  success = false;
  shippingRateLoading = false;
  loadingDelete = false;
  successDelete = false;
  loadingDeleteModal = false;
  successDeleteModal = false;
  deleteModalTitle: string;
  deleteModalBody: string;
  selectedRateName: string;
  selectedWarehouses: string[];
  rateModalType: RateType;

  displayedCountries = ['name'];
  displayedAllCountries = ['select', ...this.displayedCountries];
  displayedRates = ['name', 'range', 'price'];
  selectedCountries: string[] = [];
  selectedZipCodes: string[] = [];
  countriesSource: MatTableDataSource<CountryAlphaList>;
  selectedCountriesSource: MatTableDataSource<CountryAlphaList>;
  selectedZipCodeSource: MatTableDataSource<any>;
  priceBasedRateSource: MatTableDataSource<ShippingRateInterface>;
  weightBasedRateSource: MatTableDataSource<ShippingRateInterface>;
  countryAlphaList = countryAlphaList;

  shopData: ShopInterface;
  shipping: ShippingInterface;
  shippingRate: ShippingRateInterface;
  shippingRates: ShippingRateInterface[] = [];
  priceBased: ShippingRateInterface[] = [];
  weightBased: ShippingRateInterface[] = [];
  warehouses: WarehouseInterface[] = [];
  shippingForm: FormGroup;
  rateForm: FormGroup;

  shippingSubscription: Subscription;
  shippingRateSubscription: Subscription;
  warehouseSubscription: Subscription;
  shopSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private router: Router, private cdr: ChangeDetectorRef,
              private admin: AdminService, private shop: ShopService, private alert: AlertService) {
    const shippingId = this.router.url.split('/').pop();
    this.countriesSource = new MatTableDataSource(countryAlphaList);
    this.shopSubscription = this.admin.getCurrentShop().subscribe(shopData => this.shopData = shopData);
    this.warehouseSubscription = this.admin.getWarehousesByShopId()
      .subscribe(warehouses => this.warehouses = warehouses);
    if (shippingId !== ADD) {
      this.edit = true;
      this.loading = true;
      this.shippingRateLoading = true;
      this.shippingSubscription = this.admin.getShippingById(shippingId).subscribe(shipping => {
        this.loading = false;
        this.shipping = shipping;
        if (!shipping) {
          return;
        }
        this.setShippingForm();
      });
      this.shippingRateSubscription = this.shop.getShippingRateByShippingId(shippingId).subscribe(shippingRates => {
        this.shippingRateLoading = false;
        if (!shippingRates) {
          return;
        }
        this.shippingRates = shippingRates;
        this.priceBased = shippingRates.filter(sR => sR.type === 'price');
        this.weightBased = shippingRates.filter(sR => sR.type === 'weight');
        this.setPriceBasedTable(this.priceBased);
        this.setWeightBasedTable(this.weightBased);
      });
    }
  }

  ngOnInit(): void {
    this.shippingForm = this.formbuilder.group({
      name: ['', Validators.required],
      radius: [null],
      zipCodes: [null]
    });
    this.rateForm = this.formbuilder.group({
      name: ['', Validators.required],
      noValueLimit: [false],
      freeShipping: [false],
      minValue: [null],
      maxValue: [null],
      price: [null]
    });
  }

  ngOnDestroy(): void {
    if (this.shippingSubscription && !this.shippingSubscription.closed) {
      this.shippingSubscription.unsubscribe();
    }
    if (this.shippingRateSubscription && !this.shippingRateSubscription.closed) {
      this.shippingRateSubscription.unsubscribe();
    }
    if (this.warehouseSubscription && !this.warehouseSubscription.closed) {
      this.warehouseSubscription.unsubscribe();
    }
    if (this.shopSubscription && !this.shopSubscription.closed) {
      this.shopSubscription.unsubscribe();
    }
  }

  setShippingForm() {
    const { name, radius, warehouseId, countries, zipCode } = this.shipping;
    this.shippingForm.patchValue({
      name, radius
    });
    this.selectedWarehouses = warehouseId;
    this.selectedCountries = countries;
    this.selectedZipCodes = zipCode;
    this.setSelectedCountriesTable(countries);
    this.setSelectedZipCodeTable(zipCode);
  }

  get shippingFormControls() { return this.shippingForm.controls; }
  get rateFormControls() { return this.rateForm.controls; }

  async onSubmit() {
    const { name, radius } = this.shippingFormControls;
    if (this.shippingForm.invalid) {
      return;
    }

    this.loading = true;
    try {
      const setData: ShippingInterface = {
        name: name.value,
        radius: radius.value,
        zipCode: this.selectedZipCodes,
        countries: this.selectedCountries,
        warehouseId: this.selectedWarehouses,
      };
      if (this.edit) {
        await this.admin.updateShipping({
          ...setData,
          shippingId: this.shipping.shippingId
        });
      }
      else {
        const data = await this.admin.createShipping(setData);
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${shippingRoute}/${id}`);
        }
      }
      this.success = true;
      setTimeout(() => {
        this.success = false;
        this.cdr.detectChanges();
      }, 2000);
    } catch (err) {
      this.success = false;
      this.handleError(err);
    }
    this.loading = false;
  }

  async rateSubmit() {
    const { name, noValueLimit, freeShipping, minValue, maxValue, price } = this.rateFormControls;
    if (this.rateForm.invalid) {
      return;
    }
    this.loading = true;
    try {
      const setData: ShippingRateInterface = {
        shippingId: this.shipping.shippingId,
        type: this.rateModalType,
        name: name.value,
        noValueLimit: noValueLimit.value,
        freeShipping: freeShipping.value,
        minValue: minValue.value,
        maxValue: maxValue.value,
        price: price.value
      };
      if (this.isEditRate) {
        await this.admin.updateShippingRate({
          ...setData,
          shippingRateId: this.shippingRate.shippingRateId
        });
      } else {
        await this.admin.createShippingRate(setData);
      }
      this.success = true;
      setTimeout(() => {
        this.success = false;
        this.cdr.detectChanges();
      }, 2000);
      this.showRateModal = false;
      this.resetRateForm();
    } catch (err) {
      this.handleError(err);
      this.success = false;
    }
    this.loading = false;
  }

  async deleteShipping() {
    this.loadingDelete = true;
    try {
      const { shippingId } = this.shipping;
      await this.admin.deleteShipping(shippingId);
      this.successDelete = true;
      setTimeout(() => {
        this.successDelete = false;
        this.cdr.detectChanges();
      }, 2000);
      this.router.navigateByUrl(shippingRoute);
    } catch (err) {
      this.handleError(err);
    }
    this.loadingDelete = false;
  }

  async saveCountries() {
    this.loading = true;
    try {
      await this.admin.updateShipping({
        countries: this.selectedCountries,
        shippingId: this.shipping.shippingId
      });
      this.showCountryModal = false;
    } catch (err) {
      this.handleError(err);
    }
    this.loading = false;
  }

  async deleteCountry(alpha3: string) {
    this.loading = true;
    try {
      await this.admin.updateShipping({
        countries: this.selectedCountries.filter(country => country !== alpha3),
        shippingId: this.shipping.shippingId
      });
    } catch (err) {
      this.handleError(err);
    }
    this.loading = false;
  }

  editRate(type: RateType, rateName: string) {
    this.resetRateForm();
    this.isEditRate = true;
    this.showRateModal = true;
    this.rateModalType = type;
    const rate = this.findRate(type, rateName);
    const { name, price, freeShipping, noValueLimit, minValue, maxValue } = rate;
    this.rateForm.patchValue({
      name,
      price: price >= 0 ? price : null,
      freeShipping,
      noValueLimit,
      minValue: minValue >= 0 ? minValue : null,
      maxValue: maxValue >= 0 ? maxValue : null
    });
    this.shippingRate = rate;
  }

  deleteModal(type: RateType, rateName: string, id: string) {
    this.shippingRate = this.shippingRates.find(s => s.id === id);
    this.selectedRateName = rateName;
    this.rateModalType = type;
    this.deleteModalTitle = `Delete ${toTitle(type)} Rate?`;
    this.deleteModalBody = `Are you sure you want to delete ${rateName}`;
    this.showDeleteModal = true;
  }

  async deleteRate() {
    const { shippingRateId } = this.shippingRate;
    this.loadingDeleteModal = true;
    try {
      await this.admin.deleteShippingRate(shippingRateId);
      this.showDeleteModal = false;
    } catch (err) {}
    this.loadingDeleteModal = false;
  }

  findRate(type: RateType, rateName: string) {
    try {
      return this.shippingRates.find(sR => sR.type === type && sR.name === rateName);
    } catch (err) {
      this.handleError(err);
    }
  }

  addZipcode(code: string) {
    this.selectedZipCodes.push(code);
    this.setSelectedZipCodeTable(this.selectedZipCodes);
  }

  async deleteZipcode(code: string) {
    this.selectedZipCodes = this.selectedZipCodes.filter(zipCode => zipCode !== code);
    this.setSelectedZipCodeTable(this.selectedZipCodes);
  }

  applyCountryListFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.countriesSource.filter = filterValue.trim().toLowerCase();
  }

  assignCountryCheckbox(event: Event, countryAlpha3: string) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedCountries.push(countryAlpha3);
    } else {
      this.selectedCountries = this.selectedCountries.filter(id => id !== countryAlpha3);
    }
  }

  setSelectedCountriesTable(countries: string[]) {
    const selectedCountries = this.countryAlphaList.filter(c => countries.includes(c.alpha3));
    this.selectedCountriesSource = new MatTableDataSource(selectedCountries);
    this.cdr.detectChanges();
  }

  setSelectedZipCodeTable(zipcodes: string[]) {
    this.selectedZipCodeSource = new MatTableDataSource(zipcodes);
    this.cdr.detectChanges();
  }

  setPriceBasedTable(priceBased: ShippingRateInterface[]) {
    this.priceBasedRateSource = new MatTableDataSource(priceBased);
    this.cdr.detectChanges();
  }

  setWeightBasedTable(weightBased: ShippingRateInterface[]) {
    this.weightBasedRateSource = new MatTableDataSource(weightBased);
    this.cdr.detectChanges();
  }

  showRateModalFn(type: RateType) {
    this.rateModalType = type;
    this.showRateModal = true;
    this.isEditRate = false;
  }

  toggleCountries() {
    this.showCountries = !this.showCountries;
  }

  toggleZip() {
    this.showZip = !this.showZip;
  }

  resetRateForm() {
    this.rateForm.reset();
    this.noValueLimit = false;
    this.freeShipping = false;
  }

  noValueLimitCheckbox(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.noValueLimit = true;
    } else {
      this.noValueLimit = false;
    }
  }

  freeShippingCheckbox(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.freeShipping = true;
    } else {
      this.freeShipping = false;
    }
  }

  handleError(err: any) {
    this.alert.alert({ message: err });
  }

}
