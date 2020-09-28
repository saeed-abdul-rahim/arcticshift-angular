import { Component, OnDestroy, OnInit } from '@angular/core';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';

import { ContentType } from '@models/Common';
import Thumbnail from '@services/media/Thumbnail';
import { MediaService } from '@services/media/media.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
import { editorConfig } from '@settings/editorConfig';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit, OnDestroy {

  faCheckCircle = faCheckCircle;

  loading = false;
  success = false;
  edit = false;

  nameDanger: boolean;
  priceDanger: boolean;

  addProductForm: FormGroup;

  file: File;
  fileType: ContentType;
  previewUrl: string | ArrayBuffer | null;
  previewBlob: Blob | null;
  invalidFile = false;
  isUploaded = false;

  productSubscription: Subscription;

  editorConfig = {
    ...editorConfig,
    placeholder: 'Description',
  };

  constructor(private formbuilder: FormBuilder, private mediaService: MediaService, private adminService: AdminService,
              private router: Router, private route: ActivatedRoute, private shopService: ShopService) {
    const productId = this.router.url.split('/').pop();
    if (productId !== 'add') {
      this.edit = true;
      this.productSubscription = this.shopService.getProductById(productId).subscribe(product => {
        const { name, description, price, productTypeId, categoryId, collectionId, status, tax } = product;
        this.addProductForm.patchValue({
          name, description, price,
          productType: productTypeId,
          category: categoryId,
          collection: collectionId,
          hidden: status && status === 'active' ? true : false,
          tax: tax ? true : false
        });
      });
    }
  }

  ngOnInit(): void {
    this.addProductForm = this.formbuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: [''],
      price: ['', Validators.required],
      productType: [''],
      category: [''],
      collection: [''],
      hidden: [false],
      tax: [false],
    });
  }

  ngOnDestroy(): void {
    if (this.productSubscription && !this.productSubscription.closed) {
      this.productSubscription.unsubscribe();
    }
  }

  get addProductFormControls() { return this.addProductForm.controls; }

  async onSubmit() {
    const { name, price } = this.addProductFormControls;
    if (this.addProductForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      if (price.errors) {
        this.priceDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      if (this.edit) {
        await this.adminService.updateProduct({
          name: name.value,
          price: price.value
        });
      }
      else {
        await this.adminService.createProduct({
          name: name.value,
          price: price.value
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

  getData() {

  }

  async onFileDropped($event) {
    this.file = $event[0];
    this.fileType = this.checkFileType(this.file);
    await this.generateThumbnail(this.file, this.fileType);
  }

  checkFileType(file: File) {
    const fileTypes = ['image/png', 'image/jpeg'];
    if (!fileTypes.includes(file.type)) {
      this.invalidFile = true;
      this.removeFile();
      return null;
    } else {
      this.invalidFile = false;
      let fileType = file.type.split('/')[0];
      fileType = fileType === 'application' ? 'document' : fileType;
      return fileType as ContentType;
    }
  }

  async generateThumbnail(file: File, fileType: ContentType) {
    let preview: Thumbnail;
    try {
      if (fileType === 'image') {
        preview = await this.mediaService.generateImageThumbnail(file);
      } else {
        preview = { url: null, blob: null };
      }
      this.previewUrl = preview.url;
      this.previewBlob = preview.blob;
    } catch (_) {
      this.invalidFile = true;
    }
  }

  removeFile() {
    this.file = null;
    this.fileType = null;
    this.isUploaded = false;
    this.invalidFile = true;
  }

  toAddVariant() {
    // TEMPORARY
    this.router.navigateByUrl('admin/catalog/product/detail/id/variant', { relativeTo: this.route });
  }

}
