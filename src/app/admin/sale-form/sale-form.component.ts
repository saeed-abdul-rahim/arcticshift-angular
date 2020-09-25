import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '@services/admin/admin.service';
import { MediaService } from '@services/media/media.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.css']
})
export class SaleFormComponent implements OnInit {

  loading: boolean;
  success: boolean;
  edit=true;

  nameDanger: boolean;

  addSaleForm: FormGroup;

  
  saleSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private mediaService: MediaService, private adminService: AdminService,
    private router: Router, private route: ActivatedRoute, private shopService: ShopService)
   {
    const saleId = this.router.url.split('/').pop();
    if (saleId !== 'add') {
      this.saleSubscription = this.shopService.getSaleById(saleId).subscribe(sale => {
        const { name, value } = sale;
        this.addSaleForm.patchValue({
          name, value
        
        });
      });
    }
  }

  ngOnInit(): void {
    this.addSaleForm = this.formbuilder.group({
      name: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    if (this.saleSubscription && !this.saleSubscription.closed) {
      this.saleSubscription.unsubscribe();
    }
  }

  get addSaleFormControls() { return this.addSaleForm.controls; }

  async onSubmit() {
    const { name } = this.addSaleFormControls;
    if (this.addSaleForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      if(this.edit=true){
        await this.adminService.updateSale({
          name: name.value, 
        });
      }
      else{
        await this.adminService.createSale({
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
