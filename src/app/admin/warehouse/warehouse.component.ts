import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ADD, ADMIN, SHIPPING, WAREHOUSE } from '@constants/adminRoutes';
import { ShippingInterface } from '@models/Shipping';
import { WarehouseInterface } from '@models/Warehouse';
import { AdminService } from '@services/admin/admin.service';
import { countryAlphaList } from '@utils/countryAlphaList';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.css']
})
export class WarehouseComponent implements OnInit, OnDestroy {

  loading: boolean;
  success: boolean;
  loadingDelete = false;
  successDelete = false;
  edit = false;

  warehouseRoute = `/${ADMIN}/${WAREHOUSE}`;
  shippingRoute = `/${ADMIN}/${SHIPPING}`;
  warehouse: WarehouseInterface;
  shippings: ShippingInterface[];
  warehouseForm: FormGroup;

  displayedColumns = ['name'];
  shippingSource: MatTableDataSource<ShippingInterface>;

  countryAlphaList = countryAlphaList;

  warehouseSubscription: Subscription;
  shippingSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService,
              private router: Router, private cdr: ChangeDetectorRef) {
    const warehouseId = this.router.url.split('/').pop();
    if (warehouseId !== ADD) {
      this.edit = true;
      this.warehouseSubscription = this.adminService.getWarehouseById(warehouseId).subscribe(warehouse => {
        this.warehouse = warehouse;
        if (!warehouse) {
          return;
        }
        const { name, address, pointLocation } = warehouse;
        const { company, line1, line2, city, area, zip, country, phone } = address;
        const { lat, lon } = pointLocation;
        this.warehouseForm.patchValue({
          name, company, line1, line2, city, area, zip, country, phone, lat, lon
        });
      });
      this.shippingSubscription = this.adminService.getShippingByWarehouseId(warehouseId).subscribe(shipping => {
        this.shippings = shipping;
        this.shippingSource = new MatTableDataSource(shipping);
        this.cdr.detectChanges();
      });
    }
  }


  ngOnInit(): void {
    this.warehouseForm = this.formbuilder.group({
      name: ['', Validators.required],
      company: ['', Validators.required],
      line1: ['', Validators.required],
      line2: [''],
      city: ['', Validators.required],
      area: ['', Validators.required],
      zip: ['', Validators.required],
      country: [null, Validators.required],
      phone: [''],
      lat: [null],
      lon: [null]
    });
  }

  ngOnDestroy(): void {
    if (this.warehouseSubscription && !this.warehouseSubscription.closed) {
      this.warehouseSubscription.unsubscribe();
    }
    if (this.shippingSubscription && !this.shippingSubscription.closed) {
      this.shippingSubscription.unsubscribe();
    }
  }

  get warehouseFormControls() { return this.warehouseForm.controls; }

  async onSubmit() {
    const { name, company, line1, line2, city, area, zip, country, phone, lat, lon } = this.warehouseFormControls;
    if (this.warehouseForm.invalid) {
      return;
    }
    if ((lat.value && !lon.value) || (!lat.value && lon.value)) {
      return;
    }
    this.loading = true;
    try {
      const setData: WarehouseInterface = {
        name: name.value,
        address: {
          company: company.value,
          line1: line1.value,
          line2: line2.value,
          city: city.value,
          area: area.value,
          zip: zip.value,
          country: country.value,
          phone: phone.value
        },
        pointLocation: {
          lat: lat.value,
          lon: lon.value
        }
      };
      if (this.edit) {
        await this.adminService.updateWarehouse({
          ...setData,
          warehouseId: this.warehouse.warehouseId

        });
      } else {
        const data =  await this.adminService.createWarehouse(setData);
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${this.warehouseRoute}/${id}`);
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

  async deleteWarehouse() {
    this.loadingDelete = true;
    try {
      const { warehouseId } = this.warehouse;
      await this.adminService.deleteWarehouse(warehouseId);
      this.successDelete = true;
      setTimeout(() => this.successDelete = false, 2000);
      this.router.navigateByUrl(this.warehouseRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

  navigateToShipping(id: string) {
    this.router.navigateByUrl(`${this.shippingRoute}/${id}`);
  }

}
