import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ADD, ADMIN, CATALOG, COLLECTION, collectionRoute } from '@constants/routes';
import { CollectionInterface } from '@models/Collection';
import { ContentStorage, ContentType } from '@models/Common';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
import { StorageService } from '@services/storage/storage.service';
import { editorConfig } from '@settings/editorConfig';
import { Subscription } from 'rxjs/internal/Subscription';
import { ProductInterface } from '@models/Product';
import { checkImage, getSmallestThumbnail, getUploadPreviewImages } from '@utils/media';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from '@services/alert/alert.service';
import { AddCatalogEvent } from '@models/Event';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { inOut } from '@animations/inOut';
import { setTimeout } from '@utils/setTimeout';

@Component({
  selector: 'app-collection-form',
  templateUrl: './collection-form.component.html',
  styleUrls: ['./collection-form.component.css'],
  animations: [inOut]
})
export class CollectionFormComponent implements OnInit, OnDestroy {

  loading = false;
  success = false;
  productsLoading = false;
  modalLoading = false;
  modalSuccess = false;
  loadingDelete = false;
  successDelete = false;
  removeLoading = false;
  showModal = false;
  edit = false;

  collection: CollectionInterface;
  collectionForm: FormGroup;

  productDeleteId: string;
  existingIds: string[] = [];
  productColumns = ['image', 'name'];
  products: ProductInterface[];
  productsSource: MatTableDataSource<ProductInterface>;

  faTrash = faTrash;
  file: File;
  fileType: ContentType;
  previewUrl: string | ArrayBuffer | null;
  previewBlob: Blob | null;
  thumbnails: ContentStorage[] = [];
  uploadProgress = 0;
  getSmallestThumbnail = getSmallestThumbnail;

  collectionSubscription: Subscription;
  productsSubscription: Subscription;

  editorConfig = {
    ...editorConfig,
    placeholder: 'Description',
  };

  constructor(private formbuilder: FormBuilder, private admin: AdminService, private storageService: StorageService,
              private router: Router, private shop: ShopService, private alert: AlertService, private cdr: ChangeDetectorRef) {
    const collectionId = this.router.url.split('/').pop();
    if (collectionId !== ADD) {
      this.edit = true;
      this.productsSource = new MatTableDataSource([]);
      this.collectionSubscription = this.shop.getCollectionById(collectionId).subscribe(collection => {
        if (collection) {
          const { images } = collection;
          this.collection = collection;
          this.thumbnails = getUploadPreviewImages(images);
          this.setFormValue();
          this.getProducts();
        }
      });
    }
  }

  ngOnInit(): void {
    this.collectionForm = this.formbuilder.group({
      name: ['', Validators.required],
      description: [''],
      status: ['active'],
      featureOnHomePage: [false]
    });
  }

  ngOnDestroy(): void {
    if (this.collectionSubscription && !this.collectionSubscription.closed) {
      this.collectionSubscription.unsubscribe();
    }
    if (this.productsSubscription && !this.productsSubscription.closed) {
      this.productsSubscription.unsubscribe();
    }
  }

  getProducts() {
    const { id } = this.collection;
    this.productsSubscription = this.admin.getProductsByCollectionId(id).subscribe(products => {
      this.products = products;
      this.existingIds = products.map(product => product.id);
      this.productsSource.data = products;
      this.cdr.detectChanges();
    });
  }

  setFormValue() {
    const { name, description, status, featureOnHomePage } = this.collection;
    this.collectionForm.patchValue({
      name,
      description,
      status,
      featureOnHomePage
    });
  }

  get collectionFormControls() { return this.collectionForm.controls; }

  async onSubmit() {
    const { name, description, status, featureOnHomePage } = this.collectionFormControls;
    if (this.collectionForm.invalid) {
      return;
    }

    this.loading = true;
    try {
      const setData: CollectionInterface = {
        name: name.value,
        description: description.value,
        status: status.value,
        featureOnHomePage: featureOnHomePage.value
      };
      if (this.edit) {
        await this.admin.updateCollection({
          ...setData,
          collectionId: this.collection.collectionId
        });
      }
      else {
        const data = await this.admin.createCollection(setData);
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${ADMIN}/${CATALOG}/${COLLECTION}/${id}`);
        }
      }

      this.success = true;
      setTimeout(() => {
        this.success = false;
        this.cdr.detectChanges();
      }, 2000);
    } catch (err) {
      this.success = false;
      console.log(err);
    }
    this.loading = false;
  }

  async addProduct($event: AddCatalogEvent) {
    this.modalLoading = true;
    try {
      const { collectionId } = this.collection;
      const { ids } = $event;
      await this.admin.addProductToCollection(collectionId, ids);
      this.modalSuccess = true;
      setTimeout(() => {
        this.modalSuccess = false;
        this.cdr.detectChanges();
      }, 2000);
      this.modalLoading = false;
      this.showModal = false;
    } catch (err) {
      this.modalLoading = false;
      this.handleError(err);
    }
  }

  async removeProduct(id: string) {
    this.productDeleteId = id;
    this.removeLoading = true;
    try {
      const { collectionId } = this.collection;
      await this.admin.removeProductFromCollection(collectionId, id);
    } catch (err) {
      this.handleError(err);
    }
    this.removeLoading = false;
  }

  async deleteCollection() {
    this.loadingDelete = true;
    try {
      const { collectionId } = this.collection;
      await this.admin.deleteCollection(collectionId);
      this.success = true;
      setTimeout(() => {
        this.success = false;
        this.cdr.detectChanges();
      }, 2000);
      this.router.navigateByUrl(collectionRoute);
    } catch (err) {
      this.handleError(err);
    }
    this.loadingDelete = false;
  }

  async deleteCollectionImage(path: string) {
    try {
      const { collection } = this;
      const { collectionId, images } = collection;
      const image = images.find(img => img.thumbnails.find(thumb => thumb.path === path));
      await this.admin.deleteCollectionImage(collectionId, image.content.path);
    } catch (_) { }
  }

  async processFile() {
    this.fileType = checkImage(this.file);
    if (this.fileType) {
      this.storageService.upload(this.file, this.fileType, {
        id: this.collection.collectionId,
        type: 'collection'
      });
      this.storageService.getUploadProgress().subscribe(progress =>
        this.uploadProgress = progress,
        () => { },
        () => this.uploadProgress = 0);
    } else {
      this.removeFile();
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

  removeFile() {
    this.file = null;
    this.fileType = null;
  }

  toggleShowModal() {
    this.showModal = true;
  }

  navigateToProduct(id?: string) {
    const path = id ? id : ADD;
    this.router.navigateByUrl(`${collectionRoute}/${path}`);
  }

  handleError(err: any) {
    this.alert.alert({ message: err });
  }

}
