import { Component, OnDestroy, OnInit } from '@angular/core';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
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
import { AttributeJoinInterface } from '@models/Attribute';
import { VariantInterface } from '@models/Variant';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit, OnDestroy {

  faCheckCircle = faCheckCircle;

  loading = false;
  success = false;
  variantsLoading = false;
  loadingDelete = false;
  successDelete = false;
  edit = false;

  nameDanger: boolean;
  priceDanger: boolean;
  productTypeDanger: boolean;

  shopId: string;
  product: ProductInterface;
  variants: VariantInterface[] = [];
  productTypes: ProductTypeInterface[] = [];
  categories: CategoryInterface[] = [];
  collections: CollectionInterface[] = [];
  attributes: AttributeJoinInterface[] = [];

  productRoute = `/${ADMIN}/${CATALOG}/${PRODUCT}`;
  selectedCollections: string[] | null = [];
  productForm: FormGroup;

  displayedColumns: string[] = [];
  variantsSource: MatTableDataSource<VariantInterface>;

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
      price: ['', Validators.required],
      productType: [null, Validators.required],
      attributes: new FormArray([]),
      category: [null],
      visibility: ['active'],
      tax: [false],
    });
  }

  setAttributeForm(event: ProductTypeInterface, patch = false) {
    this.productFormControls.attributes.reset();
    if (event) {
      const { productTypeId } = event;
      this.attributeSubscription = this.getAttributes(productTypeId).subscribe(attributes => {
        this.attributes = attributes;
        this.attributes.forEach(attr => {
          let defaultValue = '';
          if (patch && this.product && this.product.attributeValueId) {
            defaultValue = this.product.attributeValueId.find(id => id === attr.attributeValueId.find(vId => vId === id));
          }
          this.attributeForm.push(this.formbuilder.group({
            attributeValueId: [defaultValue]
          }));
        });
      });
    }
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
    if (this.variantSubscription && !this.variantSubscription.closed) {
      this.variantSubscription.unsubscribe();
    }
    this.unsubscribeAttributes();
  }

  unsubscribeAttributes() {
    if (this.attributeSubscription && !this.attributeSubscription.closed) {
      this.attributeSubscription.unsubscribe();
    }
  }

  get productFormControls() { return this.productForm.controls; }
  get attributeForm() { return this.productFormControls.attributes as FormArray; }

  async onSubmit() {
    const { name, price, description, category, productType, tax, visibility } = this.productFormControls;
    const attributeFormControls = this.attributeForm.controls;
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
    const attributeValueId = attributeFormControls.map((formGroup: FormGroup) => {
      return formGroup.controls.attributeValueId.value as string;
    }).filter(e => e);
    this.loading = true;
    const setData = {
      name: name.value,
      description: description.value,
      price: price.value,
      categoryId: category.value,
      collectionId: this.selectedCollections,
      productTypeId: productType.value,
      attributeValueId,
      chargeTax: tax.value,
      status: visibility.value
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
      this.nameDanger = false;
      this.productTypeDanger = false;
      this.priceDanger = false;
      this.success = true;
      setTimeout(() => this.success = false, 2000);
    } catch (err) {
      this.success = false;
      console.log(err);
    }
    this.loading = false;
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

  getProductTypes() {
    this.categorySubscription = this.shopService.getProductTypesByShopId(this.shopId)
      .subscribe(productTypes => this.productTypes = productTypes);
  }

  getAttributes(productTypeId: string) {
    this.unsubscribeAttributes();
    return this.shopService.getAttributesByShopIdAndProductTypeId(this.shopId, productTypeId);
  }

  getVariants(productId: string) {
    this.variantSubscription = this.shopService.getVariantsByProductId(productId)
      .subscribe(variants => this.variants = variants);
  }

  getCategories() {
    this.categorySubscription = this.shopService.getCategoriesByShopId(this.shopId)
      .subscribe(categories => this.categories = categories);
  }

  getCollections() {
    this.collectionSubscription = this.shopService.getCollectionsByShopId(this.shopId)
      .subscribe(collections => this.collections = collections);
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
    const { name, description, price, productTypeId, categoryId, collectionId, status, chargeTax } = this.product;
    this.productForm.patchValue({
      name, description, price,
      productType: productTypeId,
      category: categoryId,
      visibility: status,
      tax: chargeTax
    });
    this.selectedCollections = collectionId;
    if (productTypeId) {
      this.setAttributeForm({ productTypeId }, true);
    }
  }

  toAddVariant() {
    this.router.navigate(['variant'], { relativeTo: this.route });
  }

}
