import { Component, OnDestroy, OnInit } from '@angular/core';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';

import { ContentStorage, ContentType } from '@models/Common';
import { ProductInterface } from '@models/Product';
import Thumbnail from '@services/media/Thumbnail';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
import { editorConfig } from '@settings/editorConfig';
import { ADMIN, CATALOG, PRODUCT } from '@constants/adminRoutes';
import { IMAGE_SM } from '@constants/imageSize';
import { StorageService } from '@services/storage/storage.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit, OnDestroy {

  faCheckCircle = faCheckCircle;

  loading = false;
  success = false;
  loadingDelete = false;
  successDelete = false;
  edit = false;

  nameDanger: boolean;
  priceDanger: boolean;

  productRoute = `/${ADMIN}/${CATALOG}/${PRODUCT}`;
  product: ProductInterface;
  addProductForm: FormGroup;

  file: File;
  fileType: ContentType;
  previewUrl: string | ArrayBuffer | null;
  previewBlob: Blob | null;
  generatedThumbnails: Thumbnail[];
  thumbnails: ContentStorage[] = [];
  invalidFile = false;
  isUploaded = false;
  uploadProgress = 0;

  productSubscription: Subscription;

  editorConfig = {
    ...editorConfig,
    placeholder: 'Description',
  };

  constructor(private formbuilder: FormBuilder, private storageService: StorageService, private adminService: AdminService,
              private router: Router, private route: ActivatedRoute, private shopService: ShopService) {
    const productId = this.router.url.split('/').pop();
    if (productId !== 'add') {
      this.edit = true;
      this.productSubscription = this.shopService.getProductById(productId).subscribe(product => {
        this.product = product;
        this.getPreviewImages();
        this.setFormValue();
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
          productId: this.product.productId,
          name: name.value,
          price: price.value
        });
      }
      else {
        const data = await this.adminService.createProduct({
          name: name.value,
          price: price.value
        });
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${this.productRoute}/${id}`);
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

  async deleteProduct(id: string) {
    try {
      await this.adminService.deleteProduct(id);
      this.router.navigateByUrl(this.productRoute);
    } catch (err) {
      console.log(err);
    }
  }

  onFileDropped($event: Event) {
    this.file = $event[0];
    this.processFile();
  }

  onFileClicked(fileInput: Event) {
    this.file = (fileInput.target as HTMLInputElement).files[0];
    this.processFile();
  }

  async processFile() {
    this.fileType = this.checkFileType(this.file);
    if (this.fileType === 'image'){
      this.storageService.upload(this.file, this.fileType, {
        id: this.product.productId,
        type: 'product'
      });
      this.storageService.getUploadProgress().subscribe(progress =>
        this.uploadProgress = progress,
        () => {},
        () => this.uploadProgress = 0);
    } else {
      this.removeFile();
    }
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

  removeFile() {
    this.file = null;
    this.fileType = null;
    this.isUploaded = false;
    this.invalidFile = true;
  }

  async deleteProductImage(path: string) {
    try {
      const { product } = this;
      const { productId, images } = product;
      const image = images.find(img => img.thumbnails.find(thumb => thumb.path === path));
      await this.adminService.deleteProductImage(productId, image.content.path);
    } catch (_) { }
  }

  getPreviewImages() {
    const { product } = this;
    if (product.images) {
      const { images } = product;
      this.thumbnails = images.map(img => {
        if (img.thumbnails) {
          const { thumbnails } = img;
          return thumbnails.find(thumb => thumb.dimension === IMAGE_SM);
        }
      });
    }
  }

  setFormValue() {
    const { name, description, price, productTypeId, categoryId, collectionId, status, tax } = this.product;
    this.addProductForm.patchValue({
      name, description, price,
      productType: productTypeId,
      category: categoryId,
      collection: collectionId,
      hidden: status && status === 'active' ? true : false,
      tax: tax ? true : false
    });
  }

  toAddVariant() {
    this.router.navigate(['variant'], { relativeTo: this.route });
  }

}
