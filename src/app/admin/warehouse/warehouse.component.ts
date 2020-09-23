import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '@services/admin/admin.service';
import { MediaService } from '@services/media/media.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.css']
})
export class WarehouseComponent implements OnInit {

  loading: boolean;
  success: boolean;
  nameDanger: boolean;

  addWarehouseForm: FormGroup;
  warehouseSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private mediaService: MediaService, private adminService: AdminService,
    private router: Router, private route: ActivatedRoute, private shopService: ShopService)
   {
    const warehousenId = this.router.url.split('/').pop();
    if (warehousenId !== 'add') {
      this.warehouseSubscription = this.shopService.getCollectionById(warehousenId).subscribe(warehouse => {
        const { name } = warehouse;
        this. addWarehouseForm.patchValue({
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
    if (this. warehouseSubscription && !this.warehouseSubscription.closed) {
      this. warehouseSubscription.unsubscribe();
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
      await this.adminService.createWarehouse({
        name: name.value,

      });
      this.success = true;
      setTimeout(() => this.success = false, 2000);
    } catch (err) {
      this.success = false;
      console.log(err);
    }
    this.loading = false;
  }

}
