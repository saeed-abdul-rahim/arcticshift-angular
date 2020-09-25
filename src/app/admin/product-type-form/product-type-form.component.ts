import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '@services/admin/admin.service';
import { MediaService } from '@services/media/media.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-type',
  templateUrl: './product-type-form.component.html',
  styleUrls: ['./product-type-form.component.css']
})
export class ProductTypeFormComponent implements OnInit {

  loading: boolean;
  success: boolean;
  edit = true;
  nameDanger: boolean;

  addProductTypeForm: FormGroup;
  productTypeSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private mediaService: MediaService, private adminService: AdminService,
    private router: Router, private route: ActivatedRoute, private shopService: ShopService)
   {
    const productTypeId = this.router.url.split('/').pop();
    if (productTypeId !== 'add') {
      this. productTypeSubscription = this.shopService.getCollectionById(productTypeId).subscribe(productType => {
        const { name } = productType;
        this. addProductTypeForm.patchValue({
          name, 
        
        });
      });
    }
  }

  ngOnInit(): void {
    this.addProductTypeForm = this.formbuilder.group({
      name: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    if (this.productTypeSubscription && !this.productTypeSubscription.closed) {
      this.productTypeSubscription.unsubscribe();
    }
  }

  get addProductTypeFormControls() { return this.addProductTypeForm.controls; }

  async onSubmit() {
    const { name } = this.addProductTypeFormControls;
    if (this.addProductTypeForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      if(this.edit=true){
        await this.adminService.updateProductType({
          name: name.value,
          
        });
      }else{
        await this.adminService.createProductType({
          name: name.value,
          
        });
      }
    
      this.success = true;
      setTimeout(() => this.success = false, 2000);
    } catch (err) {
      this.success = false;
      console.log(err);
    }
    this.loading = false;
  }
}
