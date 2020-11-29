import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subscription } from 'rxjs/internal/Subscription';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';

import { AdminService } from '@services/admin/admin.service';
import { AlertService } from '@services/alert/alert.service';
import { ShopService } from '@services/shop/shop.service';
import { StorageService } from '@services/storage/storage.service';
import { CategoryInterface } from '@models/Category';
import { ContentStorage, ContentType } from '@models/Common';
import { ProductInterface } from '@models/Product';
import { CatalogType } from '@models/Metadata';
import { ADD, CATEGORY, categoryRoute, productRoute } from '@constants/routes';
import { editorConfig } from '@settings/editorConfig';
import { blobToBase64, checkImage, getSmallestThumbnail, getUploadPreviewImages } from '@utils/media';
import { isBothArrEqual } from '@utils/arrUtils';
import { inOut } from '@animations/inOut';
import { setTimeout } from '@utils/setTimeout';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css'],
  animations: [inOut]
})
export class CategoryFormComponent implements OnInit, OnDestroy {

  loading = false;
  success = false;
  loadingDelete = false;
  successDelete = false;
  edit = false;

  addRoute = ADD;
  addProductRoute = `${productRoute}/${ADD}`;

  faTrash = faTrash;
  catalogLoading = false;
  allCatalogLoading = false;
  openTab = 0;
  type: CatalogType;
  catalogDeleteId: string;
  getSmallestThumbnail = getSmallestThumbnail;

  parentCategoryId: string;
  products: ProductInterface[] = [];
  categories: CategoryInterface[] = [];
  category: CategoryInterface;
  categoryForm: FormGroup;
  catalogData = new BehaviorSubject<any[]>([]);
  catalog: MatTableDataSource<any>;
  catalogColumns: string[] = [];

  file: File;
  fileType: ContentType;
  previewUrl: string | ArrayBuffer | null;
  previewBlob: Blob | null;
  thumbnails: ContentStorage[] = [];
  uploadProgress = 0;

  editorConfig = {
    ...editorConfig,
    placeholder: 'Description',
  };

  private initData = false;
  private prevProductId: string[] = [];
  private prevSubCategoryId: string[] = [];

  private categorySubscription: Subscription;
  private categoriesSubscription: Subscription;
  private productsSubscription: Subscription;
  private catalogSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private storage: StorageService, private alert: AlertService, private route: ActivatedRoute,
              private admin: AdminService, private router: Router, private shop: ShopService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.route.params.subscribe(() => this.initialize());
  }

  initialize() {
    this.resetComponent();
    this.categoryForm = this.formbuilder.group({
      name: ['', Validators.required],
      description: ['']
    });
    const slug = this.router.url.split('/');
    const categoryId = slug.pop();

    const parentCategoryId = slug.pop();
    if (parentCategoryId !== CATEGORY) {
      this.parentCategoryId = parentCategoryId;
    }

    if (categoryId !== ADD) {
      this.edit = true;
      this.catalog = new MatTableDataSource([]);
      this.fillCatalogTable();
      this.categorySubscription = this.shop.getCategoryById(categoryId).subscribe(category => {
        if (!category) { return; }
        this.category = category;
        this.thumbnails = getUploadPreviewImages(category.images);
        if (!this.initData) {
          this.setCatalogData(0);
          this.initData = true;
        }
        else {
          const { productId, subCategoryId } = category;
          if (!isBothArrEqual(productId, this.prevProductId)) {
            this.getProductByIds(productId, true);
            this.prevProductId = productId;
          }
          if (!isBothArrEqual(subCategoryId, this.prevSubCategoryId)) {
            this.getCategoryByParentId();
            this.prevSubCategoryId = subCategoryId;
          }
        }
        this.setFormValue();
      });
    }
  }

  ngOnDestroy(): void {
    this.resetComponent();
  }

  unsubscribeCatalog() {
    if (this.catalogSubscription && !this.catalogSubscription.closed) {
      this.catalogSubscription.unsubscribe();
    }
  }

  unsubscribeCategory() {
    if (this.categorySubscription && !this.categorySubscription.closed) {
      this.categorySubscription.unsubscribe();
    }
  }

  unsubscribeProducts() {
    if (this.productsSubscription && !this.productsSubscription.closed) {
      this.productsSubscription.unsubscribe();
    }
  }

  unsubscribeCategories() {
    if (this.categoriesSubscription && !this.categoriesSubscription.closed) {
      this.categoriesSubscription.unsubscribe();
    }
  }

  resetComponent() {
    this.initData = false;
    this.catalogData.next([]);
    this.prevProductId = [];
    this.prevSubCategoryId = [];
    this.unsubscribeCatalog();
    this.unsubscribeCategory();
    this.unsubscribeProducts();
    this.unsubscribeCategories();
  }

  setFormValue() {
    const { name, description } = this.category;
    this.categoryForm.patchValue({
      name,
      description
    });
  }

  get categoryFormControls() { return this.categoryForm.controls; }

  async onSubmit() {
    const { name, description } = this.categoryFormControls;
    if (this.categoryForm.invalid) {
      return;
    }
    this.loading = true;
    try {
      const setData: CategoryInterface = {
        name: name.value,
        description: description.value,
        parentCategoryId: this.parentCategoryId
      };
      if (this.edit) {
        await this.admin.updateCategory({
          ...setData,
          categoryId: this.category.categoryId
        });
      } else {
        const data = await this.admin.createCategory(setData);
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`${categoryRoute}/${id}`);
        }
      }

      this.success = true;
      setTimeout(() => {
        this.success = false;
        this.cdr.detectChanges();
      }, 2000);
    } catch (err) {
      this.success = false;
      this.handleError(err);
    }
    this.loading = false;
  }

  async deleteCategory() {
    if (!this.category) { return; }
    this.loadingDelete = true;
    try {
      const { categoryId } = this.category;
      await this.admin.deleteCategory(categoryId);
      this.success = true;
      setTimeout(() => {
        this.success = false;
        this.cdr.detectChanges();
      }, 2000);
      this.router.navigateByUrl(categoryRoute);
    } catch (err) {
      this.handleError(err);
    }
    this.loadingDelete = false;
  }

  async deleteCategoryImage(path: string) {
    try {
      const { category } = this;
      const { categoryId, images } = category;
      const image = images.find(img => img.thumbnails.find(thumb => thumb.path === path));
      await this.admin.deleteCategoryImage(categoryId, image.content.path);
    } catch (err) {
      this.handleError(err);
    }
  }

  setCatalogData($event: number) {
    const { productId } = this.category;
    switch ($event) {
      // Category Tab
      case 0:
        this.type = 'category';
        this.catalogColumns = ['name', 'subCategory', 'product'];
        this.getCategoryByParentId();
        break;

      // Product Tab
      case 1:
        this.type = 'product';
        this.catalogColumns = ['image', 'name'];
        this.getProductByIds(productId);
        break;
    }
  }

  getProductByIds(ids: string[], change = false) {
    if (change) {
      this.unsubscribeProducts();
    }
    if (ids.length === 0) {
      this.products = [];
    }
    if ((!this.productsSubscription || this.productsSubscription.closed) && ids.length > 0) {
      this.catalogLoading = true;
      this.productsSubscription = this.shop.getProductbyIds(ids)
        .subscribe(products => {
          this.catalogLoading = false;
          this.products = products;
          if (this.type === 'product') {
            this.catalogData.next(products);
          }
        }, err => {
          this.catalogLoading = false;
          this.handleError(err);
        });
    } else {
      if (this.type === 'product') {
        this.catalogData.next(this.products);
      }
    }
  }

  getCategoryByParentId() {
    const { categoryId } = this.category;
    if (!this.categoriesSubscription || this.categoriesSubscription.closed) {
      this.catalogLoading = true;
      this.categoriesSubscription = this.shop.getCategoryByParentId(categoryId)
        .subscribe(categories => {
          this.catalogLoading = false;
          this.categories = categories;
          if (this.type === 'category') {
            this.catalogData.next(categories);
          }
        }, err => {
          this.catalogLoading = false;
          this.handleError(err);
        });
    } else {
      if (this.type === 'category') {
        this.catalogData.next(this.categories);
      }
    }
  }

  onFileDropped($event: File) {
    this.file = $event;
    this.processFile();
  }

  async processFile() {
    this.fileType = checkImage(this.file);
    if (this.fileType) {
      this.storage.upload(this.file, this.fileType, {
        id: this.category.categoryId,
        type: 'category'
      });
      this.storage.getUploadProgress().subscribe(progress =>
        this.uploadProgress = progress,
        () => { },
        async () => {
          this.uploadProgress = 0;
          const base64Image = await blobToBase64(this.file) as string;
          this.thumbnails.push({
            path: '', url: base64Image
          });
        });
    } else {
      this.removeFile();
    }
  }

  removeFile() {
    this.file = null;
    this.fileType = null;
  }

  fillCatalogTable() {
    this.catalogSubscription = this.catalogData.subscribe(data => {
      try {
        this.catalog.data = data;
        this.cdr.detectChanges();
      } catch (err) { }
    });
  }

  navigateById(id: string) {
    const { type } = this;
    if (type === 'product') {
      this.router.navigateByUrl(`${productRoute}/${id}`);
    } else if (type === 'category') {
      this.router.navigateByUrl(`${categoryRoute}/${id}`);
    }
  }

  handleError(err: any) {
    this.alert.alert({ message: err });
  }

}


