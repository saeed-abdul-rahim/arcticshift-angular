import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '@services/admin/admin.service';
import { MediaService } from '@services/media/media.service';
import { ShopService } from '@services/shop/shop.service';
import { editorConfig } from '@settings/editorConfig';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-collection-form',
  templateUrl: './collection-form.component.html',
  styleUrls: ['./collection-form.component.css']
})
export class CollectionFormComponent implements OnInit, OnDestroy {

  loading = false;
  success = false;
  edit = false;

  nameDanger: boolean;

  addCollectionForm: FormGroup;
  collectionSubscription: Subscription;

  editorConfig = {
    ...editorConfig,
    placeholder: 'Description',
  };

  constructor(private formbuilder: FormBuilder, private mediaService: MediaService, private adminService: AdminService,
              private router: Router, private route: ActivatedRoute, private shopService: ShopService) {
    const collectionId = this.router.url.split('/').pop();
    if (collectionId !== 'add') {
      this.edit = true;
      this.collectionSubscription = this.shopService.getCollectionById(collectionId).subscribe(collection => {
        const { name } = collection;
        this.addCollectionForm.patchValue({
          name,
        });
      });
    }
  }

  ngOnInit(): void {
    this.addCollectionForm = this.formbuilder.group({
      name: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    if (this.collectionSubscription && !this.collectionSubscription.closed) {
      this.collectionSubscription.unsubscribe();
    }
  }

  get addCollectionFormControls() { return this.addCollectionForm.controls; }

  async onSubmit() {
    const { name } = this.addCollectionFormControls;
    if (this.addCollectionForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }

    this.loading = true;
    try {
      if (this.edit) {
        await this.adminService.updateCollection({
          name: name.value,
        });
      }
      else {
        await this.adminService.createCollection({
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
