import { Component, OnDestroy, OnInit } from '@angular/core';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';

import { ContentStorage, ContentType } from '@models/Common';
import { ProductInterface } from '@models/Product';
import { CategoryInterface } from '@models/Category';
import { CollectionInterface } from '@models/Collection';

import { Thumbnail } from '@services/media/Thumbnail';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
import { editorConfig } from '@settings/editorConfig';
import { ADD, ADMIN, CATALOG, PRODUCT } from '@constants/adminRoutes';
import { IMAGE_SM } from '@constants/imageSize';
import { StorageService } from '@services/storage/storage.service';
import { AuthService } from '@services/auth/auth.service';
import { ProductTypeInterface } from '@models/ProductType';

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
  productTypeDanger: boolean;

  shopId: string;
  productTypes: ProductTypeInterface[];
  categories: CategoryInterface[];
  collections: CollectionInterface[];

  productRoute = `/${ADMIN}/${CATALOG}/${PRODUCT}`;
  product: ProductInterface;
  productForm: FormGroup;
  selectedProductType: ProductTypeInterface;

  file: File;
  fileType: ContentType;
  previewUrl: string | ArrayBuffer | null;
  previewBlob: Blob | null;
  generatedThumbnails: Thumbnail[];
  thumbnails: ContentStorage[] = [];
  invalidFile = false;
  isUploaded = false;
  uploadProgress = 0;

  userSubscription: Subscription;
  productSubscription: Subscription;
  productTypeSubscription: Subscription;
  categorySubscription: Subscription;
  collectionSubscription: Subscription;
  variantSubscription: Subscription;
  attributeSubscription: Subscription;

  editorConfig = {
    ...editorConfig,
    placeholder: 'Description',
  };

  constructor(private formbuilder: FormBuilder, private storageService: StorageService,
              private authService: AuthService, private adminService: AdminService, private shopService: ShopService,
              private router: Router, private route: ActivatedRoute) {
    this.userSubscription = this.authService.getCurrentUserStream().subscribe(user => {
      if (user) {
        const { shopId } = user;
        this.shopId = shopId;
        this.getProductTypes();
        this.getCategories();
        this.getCollections();
      }
    });
    const productId = this.router.url.split('/').pop();
    if (productId !== ADD) {
      this.edit = true;
      this.productSubscription = this.shopService.getProductById(productId).subscribe(product => {
        if (product) {
          this.product = product;
          this.getPreviewImages();
          this.setFormValue();
        }
      });
    }
  }

  ngOnInit(): void {
    this.productForm = this.formbuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: [''],
      price: [0, Validators.required],
      productType: ['', Validators.required],
      category: [''],
      collection: [''],
      hidden: [false],
      tax: [false],
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
    if (this.productSubscription && !this.productSubscription.closed) {
      this.productSubscription.unsubscribe();
    }
    if (this.productTypeSubscription && !this.productTypeSubscription.closed) {
      this.productTypeSubscription.unsubscribe();
    }
    if (this.categorySubscription && !this.categorySubscription.closed) {
      this.categorySubscription.unsubscribe();
    }
    if (this.collectionSubscription && !this.collectionSubscription.closed) {
      this.collectionSubscription.unsubscribe();
    }
  }

  get productFormControls() { return this.productForm.controls; }

  async onSubmit() {
    const { name, price, description, category, collection, productType } = this.productFormControls;
    if (this.productForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      if (price.errors) {
        this.priceDanger = true;
      }
      if (productType.errors) {
        this.productTypeDanger = true;
      }
      return;
    }
    this.loading = true;
    const setData = {
      name: name.value,
      description: description.value,
      price: price.value,
      categoryId: category.value,
      collectionId: [...collection.value],
      productTypeId: productType.value
    };
    try {
      if (this.edit) {
        await this.adminService.updateProduct({
          ...setData,
          productId: this.product.productId
        });
      }
      else {
        const data = await this.adminService.createProduct(setData);
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

  getProductTypes() {
    this.categorySubscription = this.shopService.getAllProductTypesByShopId(this.shopId).subscribe(productTypes => {
      this.productTypes = productTypes;
    });
  }

  getCategories() {
    this.categorySubscription = this.shopService.getAllCategoriesByShopId(this.shopId).subscribe(categories => {
      this.categories = categories;
    });
  }

  getCollections() {
    this.collectionSubscription = this.shopService.getAllCollectionsByShopId(this.shopId).subscribe(collections => {
      this.collections = collections;
    });
  }

  async deleteProduct() {
    this.loadingDelete = true;
    try {
      const { productId } = this.product;
      await this.adminService.deleteProduct(productId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.productRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

  async deleteProductImage(path: string) {
    try {
      const { product } = this;
      const { productId, images } = product;
      const image = images.find(img => img.thumbnails.find(thumb => thumb.path === path));
      await this.adminService.deleteProductImage(productId, image.content.path);
    } catch (_) { }
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
    this.productForm.patchValue({
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
