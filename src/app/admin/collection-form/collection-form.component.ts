import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ADMIN, CATALOG, COLLECTION } from '@constants/adminRoutes';
import { IMAGE_SM } from '@constants/imageSize';
import { CollectionInterface } from '@models/Collection';
import { ContentStorage, ContentType } from '@models/Common';
import { AdminService } from '@services/admin/admin.service';
import { MediaService } from '@services/media/media.service';
import Thumbnail from '@services/media/Thumbnail';
import { ShopService } from '@services/shop/shop.service';
import { StorageService } from '@services/storage/storage.service';
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

  collection: CollectionInterface;
  addCollectionForm: FormGroup;

  file: File;
  fileType: ContentType;
  previewUrl: string | ArrayBuffer | null;
  previewBlob: Blob | null;
  generatedThumbnails: Thumbnail[];
  thumbnails: ContentStorage[] = [];
  invalidFile = false;
  isUploaded = false;
  uploadProgress = 0;

  collectionSubscription: Subscription;


  editorConfig = {
    ...editorConfig,
    placeholder: 'Description',
  };

constructor(private formbuilder: FormBuilder, private adminService: AdminService, private storageService: StorageService,
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
        const data = await this.adminService.createCollection({
          name: name.value,
        });
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${ADMIN}/${CATALOG}/${COLLECTION}/${id}`);
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

  onFileDropped($event: Event) {
    this.file = $event[0];
    this.processFile();
  }

  onFileClicked(fileInput: Event){
    this.file = (fileInput.target as HTMLInputElement).files[0];
    this.processFile();
  }

  async processFile() {
    this.fileType = this.checkFileType(this.file);
    if (this.fileType === 'image'){
      this.storageService.upload(this.file, this.fileType, {
        id: this.collection.collectionId,
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

  async deleteCollectionImage(path: string) {
    try {
      const { collection } = this;
      const { collectionId, images } = collection;
      const image = images.find(img => img.thumbnails.find(thumb => thumb.path === path));
      await this.adminService.deleteCollectionImage(collectionId, image.content.path);
    } catch (_) { }
  }

  getPreviewImages() {
    const { collection } = this;
    if (collection.images) {
      const { images } = collection;
      this.thumbnails = images.map(img => {
        if (img.thumbnails) {
          const { thumbnails } = img;
          return thumbnails.find(thumb => thumb.dimension === IMAGE_SM);
        }
      });
    }
  }


}
