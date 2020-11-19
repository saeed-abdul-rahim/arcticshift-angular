import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ADD, VARIANT } from '@constants/routes';
import { AttributeJoinInterface } from '@models/Attribute';
import { ContentStorage, ContentType } from '@models/Common';
import { ProductInterface } from '@models/Product';
import { VariantInterface } from '@models/Variant';
import { WarehouseInterface } from '@models/Warehouse';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
import { StorageService } from '@services/storage/storage.service';
import { getFormGroupArrayValues } from '@utils/formUtils';
import { Subscription } from 'rxjs/internal/Subscription';
import { checkImage, getSmallestThumbnail, getUploadPreviewImages } from '@utils/media';
import { AlertService } from '@services/alert/alert.service';
import { setTimeout } from '@utils/setTimeout';

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
  uploadProgress = 0;

  variantRoute: string;
  variantForm: FormGroup;

  displayedColumns = ['image', 'name'];
  variantsSource: MatTableDataSource<VariantInterface>;
  getSmallestThumbnail = getSmallestThumbnail;

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

  constructor(private formbuilder: FormBuilder, private admin: AdminService, private shop: ShopService,
              private storage: StorageService, private router: Router, private cdr: ChangeDetectorRef,
              private route: ActivatedRoute, private alert: AlertService) {
    this.route.params.subscribe(() => this.initialize());
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

  initialize() {
    this.ngOnDestroy();
    const { url } = this.router;
    const urlSplit = url.split('/');
    const productId = urlSplit[urlSplit.indexOf(VARIANT) - 1];
    const variantId = urlSplit.pop();
    this.variantRoute = urlSplit.join('/');
    this.warehouseSubscription = this.admin.getWarehousesByShopId().subscribe(warehouses => {
      this.warehouses = warehouses;
      this.setWarehouseForm();
    });
    this.productSubscription = this.shop.getProductById(productId).subscribe(product => {
      this.product = product;
      const { productTypeId } = product;
      this.productTypeSubscription = this.shop.getProductTypeById(productTypeId)
        .subscribe(productType => {
          const { variantAttributeId } = productType;
          this.attributeSubscription = this.shop.getAttributeAndValuesByIds(variantAttributeId)
            .subscribe(attributes => {
              this.attributes = attributes;
              this.setAttributeForm();
              if (variantId !== ADD) {
                this.edit = true;
                this.variantSubscription = this.shop.getVariantById(variantId).subscribe(variant => {
                  this.variant = variant;
                  const { images } = variant;
                  this.setVariantForm();
                  this.patchAttributeForm();
                  this.patchWarehouseForm();
                  this.thumbnails = getUploadPreviewImages(images);
                });
              }
            });
        });
    });
    this.getVariants(productId);
  }

  getVariants(productId: string) {
    this.variantsSubscription = this.shop.getVariantsByProductId(productId)
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
        await this.admin.updateVariant({
          ...setData,
          variantId: this.variant.variantId
        });
      } else {
        const data = await this.admin.createVariant(setData);
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${this.variantRoute}/${id}`);
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

  async deleteVariant() {
    this.loadingDelete = true;
    try {
      const { variantId } = this.variant;
      await this.admin.deleteVariant(variantId);
      this.success = true;
      setTimeout(() => {
        this.success = false;
        this.cdr.detectChanges();
      }, 2000);
      this.router.navigateByUrl(this.variantRoute);
    } catch (err) {
      this.handleError(err);
    }
    this.loadingDelete = false;
  }

  async deleteVariantImage(path: string) {
    try {
      const { variant } = this;
      const { variantId, images } = variant;
      const image = images.find(img => img.thumbnails.find(thumb => thumb.path === path));
      await this.admin.deleteVariantImage(variantId, image.content.path);
    } catch (err) {
      this.handleError(err);
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
    this.fileType = checkImage(this.file);
    if (this.fileType){
      this.storage.upload(this.file, this.fileType, {
        id: this.variant.variantId,
        type: 'variant'
      });
      this.storage.getUploadProgress().subscribe(progress =>
        this.uploadProgress = progress,
        () => {},
        () => this.uploadProgress = 0);
    } else {
      this.removeFile();
    }
  }

  removeFile() {
    this.file = null;
    this.fileType = null;
  }

  navigateToVariant(id?: string) {
    const path = id ? id : ADD;
    this.router.navigateByUrl(`${this.variantRoute}/${path}`);
  }

  handleError(err: any) {
    this.alert.alert({ message: err });
  }

}
