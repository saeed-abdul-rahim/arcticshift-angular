import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ADD, VARIANT } from '@constants/routes';
import { IMAGE_SM, IMAGE_SS } from '@constants/imageSize';
import { AttributeJoinInterface } from '@models/Attribute';
import { Content, ContentStorage, ContentType } from '@models/Common';
import { ProductInterface } from '@models/Product';
import { VariantInterface } from '@models/Variant';
import { WarehouseInterface } from '@models/Warehouse';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
import { StorageService } from '@services/storage/storage.service';
import { getFormGroupArrayValues } from '@utils/formUtils';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-variant-form',
  templateUrl: './variant-form.component.html',
  styleUrls: ['./variant-form.component.css']
})
export class VariantFormComponent implements OnInit, OnDestroy {

  loading: boolean;
  success: boolean;
  loadingDelete = false;
  successDelete = false;
  variantsLoading = false;
  edit = false;

  file: File;
  fileType: ContentType;
  thumbnails: ContentStorage[] = [];
  invalidFile = false;
  isUploaded = false;
  uploadProgress = 0;

  variantRoute: string;
  variantForm: FormGroup;

  displayedColumns = ['image', 'name'];
  variantsSource: MatTableDataSource<VariantInterface>;

  product: ProductInterface;
  variant: VariantInterface;
  variants: VariantInterface[] = [];
  attributes: AttributeJoinInterface[] = [];
  warehouses: WarehouseInterface[] = [];

  productSubscription: Subscription;
  variantSubscription: Subscription;
  variantsSubscription: Subscription;
  productTypeSubscription: Subscription;
  attributeSubscription: Subscription;
  warehouseSubscription: Subscription;
  inventorySubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService, private shopService: ShopService,
              private storageService: StorageService, private router: Router, private cdr: ChangeDetectorRef) {
    const { url } = this.router;
    const urlSplit = url.split('/');
    const productId = urlSplit[urlSplit.indexOf(VARIANT) - 1];
    const variantId = urlSplit.pop();
    this.variantRoute = urlSplit.join('/');
    this.warehouseSubscription = this.adminService.getWarehousesByShopId().subscribe(warehouses => {
      this.warehouses = warehouses;
      this.setWarehouseForm();
    });
    this.productSubscription = this.shopService.getProductById(productId).subscribe(product => {
      this.product = product;
      const { productTypeId } = product;
      this.productTypeSubscription = this.shopService.getProductTypeById(productTypeId)
        .subscribe(productType => {
          const { variantAttributeId } = productType;
          this.attributeSubscription = this.shopService.getAttributeAndValuesByIds(variantAttributeId)
            .subscribe(attributes => {
              this.attributes = attributes;
              this.setAttributeForm();
              if (variantId !== ADD) {
                this.edit = true;
                this.variantSubscription = this.shopService.getVariantById(variantId).subscribe(variant => {
                  this.variant = variant;
                  this.setVariantForm();
                  this.patchAttributeForm();
                  this.patchWarehouseForm();
                  this.getPreviewImages();
                });
              }
            });
        });
    });
    this.getVariants(productId);
  }

  ngOnInit(): void {
    this.variantForm = this.formbuilder.group({
      name: ['', Validators.required],
      attributes: new FormArray([]),
      price: [''],
      strikePrice: [''],
      sku: [''],
      trackInventory: [false],
      warehouses: new FormArray([])
    });
  }

  ngOnDestroy(): void {
    if (this.productSubscription && !this.productSubscription.closed) {
      this.productSubscription.unsubscribe();
    }
    if (this.variantSubscription && !this.variantSubscription.closed) {
      this.variantSubscription.unsubscribe();
    }
    if (this.variantsSubscription && !this.variantsSubscription.closed) {
      this.variantsSubscription.unsubscribe();
    }
    if (this.productTypeSubscription && !this.productTypeSubscription.closed) {
      this.productTypeSubscription.unsubscribe();
    }
    if (this.attributeSubscription && !this.attributeSubscription.closed) {
      this.attributeSubscription.unsubscribe();
    }
    if (this.warehouseSubscription && !this.warehouseSubscription.closed) {
      this.warehouseSubscription.unsubscribe();
    }
    if (this.inventorySubscription && !this.inventorySubscription.closed) {
      this.inventorySubscription.unsubscribe();
    }
  }

  getVariants(productId: string) {
    this.variantsSubscription = this.shopService.getVariantsByProductId(productId)
      .subscribe(variants => {
        this.variants = variants;
        this.variantsSource = new MatTableDataSource(variants);
        this.cdr.detectChanges();
      });
  }

  setVariantForm() {
    const { prices, trackInventory, sku, name } = this.variant;
    const price = prices.find(pr => pr.name === 'override');
    const strikePrice = prices.find(pr => pr.name === 'strike');
    this.variantForm.patchValue({
      name, trackInventory, sku,
      price: price?.value,
      strikePrice: strikePrice?.value
    });
  }

  setAttributeForm() {
    this.variantFormControls.attributes.reset();
    this.attributes.forEach(attr => {
      this.attributeForms.push(this.formbuilder.group({
        [attr.id]: [null]
      }));
    });
  }

  setWarehouseForm() {
    this.variantFormControls.warehouses.reset();
    this.warehouses.forEach(war => {
      this.warehouseForms.push(this.formbuilder.group({
        [war.id]: [null]
      }));
    });
  }

  patchAttributeForm() {
    this.attributes.forEach(attr => {
      this.attributeForms.controls.forEach((frmGrp: FormGroup) => {
        const attributeValueId = this.variant.attributes?.[attr.id];
        frmGrp.patchValue({
          [attr.id]: attributeValueId
        });
      });
    });
  }

  patchWarehouseForm() {
    this.warehouses.forEach(war => {
      this.warehouseForms.controls.forEach((frmGrp: FormGroup) => {
        const quantity = this.variant.warehouseQuantity?.[war.id];
        frmGrp.patchValue({
          [war.id]: quantity
        });
      });
    });
  }

  get variantFormControls() { return this.variantForm.controls; }
  get attributeForms() { return this.variantForm.controls.attributes as FormArray; }
  get warehouseForms() { return this.variantForm.controls.warehouses as FormArray; }

  async onSubmit() {
    const { name, price, strikePrice, sku, trackInventory } = this.variantFormControls;
    if (this.variantForm.invalid) {
      return;
    }
    const attributes = getFormGroupArrayValues(this.attributeForms);
    const warehouseQuantity = getFormGroupArrayValues(this.warehouseForms);

    this.loading = true;
    try {
      const setData: VariantInterface = {
        productId: this.product.productId,
        name: name.value,
        price: price.value,
        prices: [
          { name: 'override', value: price.value },
          { name: 'strike', value: strikePrice.value}
        ],
        sku: sku.value,
        trackInventory: trackInventory.value,
        attributes,
        warehouseQuantity
      };
      if (this.edit) {
        await this.adminService.updateVariant({
          ...setData,
          variantId: this.variant.variantId
        });
      } else {
        const data = await this.adminService.createVariant(setData);
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${this.variantRoute}/${id}`);
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

  async deleteVariant() {
    this.loadingDelete = true;
    try {
      const { variantId } = this.variant;
      await this.adminService.deleteVariant(variantId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.variantRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

  async deleteVariantImage(path: string) {
    try {
      const { variant } = this;
      const { variantId, images } = variant;
      const image = images.find(img => img.thumbnails.find(thumb => thumb.path === path));
      await this.adminService.deleteVariantImage(variantId, image.content.path);
    } catch (_) { }
  }

  getTableThumbnails(images: Content[]) {
    const image = images[0];
    const thumbnail = image.thumbnails.find(thumb => thumb.dimension === IMAGE_SS);
    return thumbnail.url;
  }

  getPreviewImages() {
    const { variant } = this;
    if (variant.images) {
      const { images } = variant;
      this.thumbnails = images.map(img => {
        if (img.thumbnails) {
          const { thumbnails } = img;
          return thumbnails.find(thumb => thumb.dimension === IMAGE_SM);
        }
      });
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
        id: this.variant.variantId,
        type: 'variant'
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
    if (!file) { return; }
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

  navigateToVariant(id?: string) {
    const path = id ? id : ADD;
    this.router.navigateByUrl(`${this.variantRoute}/${path}`);
  }

}
