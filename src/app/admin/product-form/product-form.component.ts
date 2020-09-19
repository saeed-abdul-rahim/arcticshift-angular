import { Component, OnInit } from '@angular/core';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { inOut } from '@animations/inOut';
import { ContentType } from '@models/Common';
import Thumbnail from '@services/media/Thumbnail';
import { MediaService } from '@services/media/media.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '@services/admin/admin.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
  animations: [inOut]
})
export class ProductFormComponent implements OnInit {

  faCheckCircle = faCheckCircle;

  loading: boolean;
  success: boolean;
  nameDanger: boolean;
  priceDanger: boolean;

  addProductForm: FormGroup;

  file: File;
  fileType: ContentType;
  previewUrl: string | ArrayBuffer | null;
  previewBlob: Blob | null;
  invalidFile = false;
  isUploaded = false;

  constructor(private formbuilder: FormBuilder, private mediaService: MediaService, private adminService: AdminService,
              private router: Router, private route: ActivatedRoute) { }

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
    await this.adminService.createProduct({
      name: name.value,
      price: price.value
    });
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

