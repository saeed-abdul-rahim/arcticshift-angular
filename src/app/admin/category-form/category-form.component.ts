import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ADMIN, CATALOG, CATEGORY } from '@constants/routes';
import { IMAGE_SM } from '@constants/imageSize';
import { CategoryInterface } from '@models/Category';
import { ContentStorage, ContentType } from '@models/Common';
import { AdminService } from '@services/admin/admin.service';
import { Thumbnail } from '@services/media/Thumbnail';
import { ShopService } from '@services/shop/shop.service';
import { StorageService } from '@services/storage/storage.service';
import { editorConfig } from '@settings/editorConfig';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, OnDestroy {

  loading = false;
  success = false;
  loadingDelete = false;
  successDelete = false;
  edit = false;

  nameDanger: boolean;

  categoryRoute = `/${ADMIN}/${CATALOG}/${CATEGORY}`;
  category: CategoryInterface;
  addCategoryForm: FormGroup;

  file: File;
  fileType: ContentType;
  previewUrl: string | ArrayBuffer | null;
  previewBlob: Blob | null;
  generatedThumbnails: Thumbnail[];
  thumbnails: ContentStorage[] = [];
  invalidFile = false;
  isUploaded = false;
  uploadProgress = 0;

  categorySubscription: Subscription;

  editorConfig = {
    ...editorConfig,
    placeholder: 'Description',
  };

constructor(private formbuilder: FormBuilder, private storageService: StorageService,
            private adminService: AdminService, private router: Router, private shopService: ShopService) {
    const categoryId = this.router.url.split('/').pop();
    if (categoryId !== 'add') {
      this.edit = true;
      this.categorySubscription = this.shopService.getCategoryById(categoryId).subscribe(category => {
        if (!category) { return; }
        this.category = category;
        const { name, description } = category;
        this.addCategoryForm.patchValue({
          name,
          description
        });
      });
    }
  }

  ngOnInit(): void {
    this.addCategoryForm = this.formbuilder.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnDestroy(): void {
    if (this.categorySubscription && !this.categorySubscription.closed) {
      this.categorySubscription.unsubscribe();
    }
  }

  get addCategoryFormControls() { return this.addCategoryForm.controls; }

  async onSubmit() {
    const { name } = this.addCategoryFormControls;
    if (this.addCategoryForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }

    this.loading = true;
    try {
      if (this.edit) {
        await this.adminService.updateCategory({
          name: name.value,

        });
      } else {
        const data = await this.adminService.createCategory({
          name: name.value,

        });
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${ADMIN}/${CATALOG}/${CATEGORY}/${id}`);
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

  async deleteCategory() {
    if (!this.category) { return; }
    this.loadingDelete = true;
    try {
      const { categoryId } = this.category;
      await this.adminService.deleteCategory(categoryId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.categoryRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
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
        id: this.category.categoryId,
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

  async deleteCategoryImage(path: string) {
    try {
      const { category } = this;
      const { categoryId, images } = category;
      const image = images.find(img => img.thumbnails.find(thumb => thumb.path === path));
      await this.adminService.deleteCategoryImage(categoryId, image.content.path);
    } catch (_) { }
  }

  getPreviewImages() {
    const { category } = this;
    if (category.images) {
      const { images } = category;
      this.thumbnails = images.map(img => {
        if (img.thumbnails) {
          const { thumbnails } = img;
          return thumbnails.find(thumb => thumb.dimension === IMAGE_SM);
        }
      });
    }
  }



}


