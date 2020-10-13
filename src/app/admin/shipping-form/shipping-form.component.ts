import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ADD, ADMIN, SHIPPING } from '@constants/adminRoutes';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { Rate, RateType, ShippingInterface } from '@models/Shipping';
import { ShopInterface } from '@models/Shop';
import { WarehouseInterface } from '@models/Warehouse';
import { AdminService } from '@services/admin/admin.service';
import { CountryAlphaList, countryAlphaList } from '@utils/countryAlphaList';
import { toTitle } from '@utils/strUtils';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-shipping-form',
  templateUrl: './shipping-form.component.html',
  styleUrls: ['./shipping-form.component.css']
})
export class ShippingFormComponent implements OnInit, OnDestroy {

  faTrash = faTrash;
  shippingRoute = `/${ADMIN}/${SHIPPING}`;

  edit = false;
  showCountryModal = false;
  showRateModal = false;
  showDeleteModal = false;
  showCountries = false;
  showZip = false;
  noValueLimit = false;
  freeShipping = false;
  loading = false;
  success = false;
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
  priceBasedRateSource: MatTableDataSource<Rate>;
  weightBasedRateSource: MatTableDataSource<Rate>;
  countryAlphaList = countryAlphaList;

  shop: ShopInterface;
  shipping: ShippingInterface;
  warehouses: WarehouseInterface[];
  shippingForm: FormGroup;
  rateForm: FormGroup;

  shippingSubscription: Subscription;
  warehouseSubscription: Subscription;
  shopSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private router: Router, private cdr: ChangeDetectorRef,
              private adminService: AdminService) {
    const shippingId = this.router.url.split('/').pop();
    this.countriesSource = new MatTableDataSource(countryAlphaList);
    this.shopSubscription = this.adminService.getCurrentShop().subscribe(shop => this.shop = shop);
    this.warehouseSubscription = this.adminService.getWarehousesByShopId()
      .subscribe(warehouses => this.warehouses = warehouses);
    if (shippingId !== ADD) {
      this.edit = true;
      this.loading = true;
      this.warehouseSubscription = this.adminService.getShippingById(shippingId).subscribe(shipping => {
        this.loading = false;
        this.shipping = shipping;
        if (!shipping) {
          return;
        }
        const { name, radius, warehouseId, countries, zipCode, weightBased, priceBased } = this.shipping;
        this.shippingForm.patchValue({
          name, radius
        });
        this.selectedWarehouses = warehouseId;
        this.selectedCountries = countries;
        this.selectedZipCodes = zipCode;
        this.setSelectedCountriesTable(countries);
        this.setSelectedZipCodeTable(zipCode);
        this.setPriceBasedTable(priceBased);
        this.setWeightBasedTable(weightBased);
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
    if (this.warehouseSubscription && !this.warehouseSubscription.closed) {
      this.warehouseSubscription.unsubscribe();
    }
    if (this.shopSubscription && !this.shopSubscription.closed) {
      this.shopSubscription.unsubscribe();
    }
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
        await this.adminService.updateShipping({
          ...setData,
          shippingId: this.shipping.shippingId
        });
      }
      else {
        const data = await this.adminService.createShipping(setData);
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${this.shippingRoute}/${id}`);
        }
      }
      this.success = true;
      setTimeout(() => this.success = false, 2000);
    } catch (err) {
      this.success = false;
      console.log(err);
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
      const shippingData = this.shipping;
      const setData: Rate = {
        name: name.value,
        noValueLimit: noValueLimit.value,
        freeShipping: freeShipping.value,
        minValue: minValue.value,
        maxValue: maxValue.value,
        price: price.value
      };
      if (this.rateModalType === 'price') {
        shippingData.priceBased.push(setData);
      } else {
        shippingData.weightBased.push(setData);
      }
      console.log(this.shipping);
      await this.adminService.updateShipping(shippingData);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.showRateModal = false;
      this.resetRateForm();
    } catch (err) {
      console.log(err);
      this.success = false;
    }
    this.loading = false;
  }

  async deleteShipping() {
    this.loadingDelete = true;
    try {
      const { shippingId } = this.shipping;
      await this.adminService.deleteShipping(shippingId);
      this.successDelete = true;
      setTimeout(() => this.successDelete = false, 2000);
      this.router.navigateByUrl(this.shippingRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

  async saveCountries() {
    this.loading = true;
    try {
      await this.adminService.updateShipping({
        countries: this.selectedCountries,
        shippingId: this.shipping.shippingId
      });
      this.showCountryModal = false;
    } catch (err) { }
    this.loading = false;
  }

  async deleteCountry(alpha3: string) {
    this.loading = true;
    try {
      await this.adminService.updateShipping({
        countries: this.selectedCountries.filter(country => country !== alpha3),
        shippingId: this.shipping.shippingId
      });
    } catch (err) {}
    this.loading = false;
  }

  editRate(type: RateType, rateName: string) {
    this.resetRateForm();
    this.showRateModal = true;
    this.rateModalType = type;
    const rate = this.findRate(type, rateName);
    const { name, price, freeShipping, noValueLimit, minValue, maxValue } = rate;
    this.rateForm.patchValue({
      name, price, freeShipping, noValueLimit, minValue, maxValue
    });
  }

  deleteModal(type: RateType, rateName: string) {
    this.selectedRateName = rateName;
    this.rateModalType = type;
    this.deleteModalTitle = `Delete ${toTitle(type)} Rate?`;
    this.deleteModalBody = `Are you sure you want to delete ${rateName}`;
    this.showDeleteModal = true;
  }

  async deleteRate() {
    this.loadingDeleteModal = true;
    try {
      if (this.rateModalType === 'price') {
        await this.deletePriceRate();
      } else {
        this.deleteWeightRate();
      }
      this.showDeleteModal = false;
    } catch (err) {}
    this.loadingDeleteModal = false;
  }

  async deletePriceRate() {
    let { priceBased } = this.shipping;
    try {
      priceBased = priceBased.filter(r => r.name !== this.selectedRateName);
      await this.adminService.updateShipping({
        priceBased,
        shippingId: this.shipping.shippingId
      });
    } catch (err) {
      throw err;
    }
  }

  async deleteWeightRate() {
    let { weightBased } = this.shipping;
    try {
      weightBased = weightBased.filter(r => r.name !== this.selectedRateName);
      await this.adminService.updateShipping({
        weightBased,
        shippingId: this.shipping.shippingId
      });
    } catch (err) {
      throw err;
    }
  }

  findRate(type: RateType, rateName: string) {
    const { priceBased, weightBased } = this.shipping;
    const allRates = type === 'price' ? priceBased : weightBased;
    return allRates.find(r => r.name === rateName);
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

  setPriceBasedTable(priceBased: Rate[]) {
    this.priceBasedRateSource = new MatTableDataSource(priceBased);
    this.cdr.detectChanges();
  }

  setWeightBasedTable(weightBased: Rate[]) {
    this.weightBasedRateSource = new MatTableDataSource(weightBased);
    this.cdr.detectChanges();
  }

  showRateModalFn(type: RateType) {
    this.rateModalType = type;
    this.showRateModal = true;
    if (type === 'price') {
    } else {}
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
}
