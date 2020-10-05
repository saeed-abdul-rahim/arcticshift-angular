import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ADMIN, CATALOG } from '@constants/adminRoutes';
import { AdminService } from '@services/admin/admin.service';
import { MediaService } from '@services/media/media.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-attribute',
  templateUrl: './attribute-form.component.html',
  styleUrls: ['./attribute-form.component.css']
})
export class AttributeFormComponent implements OnInit, OnDestroy {

  loading: boolean;
  success: boolean;
  edit = false;
  nameDanger: boolean;
  codeDanger: boolean;

  addAttributeForm: FormGroup;
  attributeSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private mediaService: MediaService, private adminService: AdminService,
              private router: Router, private route: ActivatedRoute, private shopService: ShopService) {
    const attributeId = this.router.url.split('/').pop();
    if (attributeId !== 'add') {
      this.edit = true;
      this.attributeSubscription = this.shopService.getAttributeById(attributeId).subscribe(category => {
        const { name } = category;
        this.addAttributeForm.patchValue({
          name,
        });
      });
    }
  }

  ngOnInit(): void {
    this.addAttributeForm = this.formbuilder.group({
      name: ['', Validators.required],
    });
  }

  ngOnDestroy(): void {
    if (this.attributeSubscription && !this.attributeSubscription.closed) {
      this.attributeSubscription.unsubscribe();
    }
  }

  get addAttributeFormControls() { return this.addAttributeForm.controls; }

  async onSubmit() {
    const { name } = this.addAttributeFormControls;
    if (this.addAttributeForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      if (this.edit) {
        await this.adminService.updateAttribute({
          name: name.value,
        });
      }
      else {
        const data = await this.adminService.createAttribute({
          name: name.value,
        });
        if (data.id) {
          const { id } = data;
          // this.router.navigateByUrl(`/${ADMIN}/${CATALOG}/${ATTRIBUTE}/${id}`);
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
}
