import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ADMIN, CATALOG, WAREHOUSE } from '@constants/adminRoutes';
import { WarehouseInterface } from '@models/Warehouse';
import { AdminService } from '@services/admin/admin.service';
import { MediaService } from '@services/media/media.service';
import { ShopService } from '@services/shop/shop.service';
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

  nameDanger: boolean;

  warehouseRoute = `/${ADMIN}/${CATALOG}/${WAREHOUSE}`;
  warehouse: WarehouseInterface;
  addWarehouseForm: FormGroup;

  warehouseSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private mediaService: MediaService, private adminService: AdminService,
              private router: Router, private route: ActivatedRoute, private shopService: ShopService) {
    const warehousenId = this.router.url.split('/').pop();
    if (warehousenId !== 'add') {
      this.edit = true;
      this.warehouseSubscription = this.shopService.getCollectionById(warehousenId).subscribe(warehouse => {
        const { name } = warehouse;
        this.addWarehouseForm.patchValue({
          name,

        });
      });
    }
  }


  ngOnInit(): void {
    this.addWarehouseForm = this.formbuilder.group({
      name: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    if (this.warehouseSubscription && !this.warehouseSubscription.closed) {
      this.warehouseSubscription.unsubscribe();
    }
  }

  get addWarehouseFormControls() { return this.addWarehouseForm.controls; }

  async onSubmit() {
    const { name } = this.addWarehouseFormControls;
    if (this.addWarehouseForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      if (this.edit) {
        await this.adminService.updateWarehouse({
          name: name.value,

        });
      } else {
        const data =  await this.adminService.createWarehouse({
          name: name.value,
        });
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${ADMIN}/${CATALOG}/${WAREHOUSE}/${id}`);
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
      await this.adminService.deleteVoucher(warehouseId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.warehouseRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

}
