import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { ADD, ADMIN, CATALOG, PRODUCTATTRIBUTE, PRODUCTTYPE } from '@constants/adminRoutes';
import { AttributeInterface } from '@models/Attribute';
import { ProductTypeInterface } from '@models/ProductType';
import { TaxInterface } from '@models/Tax';
import { AdminService } from '@services/admin/admin.service';
import { AuthService } from '@services/auth/auth.service';
import { ShopService } from '@services/shop/shop.service';

type ListType = 'product' | 'variant';

@Component({
  selector: 'app-product-type',
  templateUrl: './product-type-form.component.html',
  styleUrls: ['./product-type-form.component.css']
})
export class ProductTypeFormComponent implements OnInit, OnDestroy {

  shopId: string;

  faTrash = faTrash;

  loading: boolean;
  success: boolean;
  loadingDelete: boolean;
  successDelete: boolean;
  attributeLoading: boolean;
  productAttributeLoading: boolean;
  variantAttributeLoading: boolean;
  successAttributeModal: boolean;

  showModal = false;
  edit = false;
  nameDanger: boolean;
  selectedList: ListType;
  productTypeForm: FormGroup;

  displayedColumns = ['attribute'];
  displayedAllAttributeColumns = ['select', ...this.displayedColumns];
  productAttributesSource: MatTableDataSource<AttributeInterface>;
  variantAttributesSource: MatTableDataSource<AttributeInterface>;
  attributesSource: MatTableDataSource<AttributeInterface>;
  selectedAttributeIds: string[] = [];

  productTypeRoute = `/${ADMIN}/${CATALOG}/${PRODUCTTYPE}`;
  attributeRoute = `/${ADMIN}/${PRODUCTATTRIBUTE}`;

  productType: ProductTypeInterface;
  tax$: Observable<TaxInterface[]>;
  productAttributes: AttributeInterface[];
  variantAttributes: AttributeInterface[];
  attributes: AttributeInterface[];
  filteredAttributes: AttributeInterface[];

  userSubscription: Subscription;
  productTypeSubscription: Subscription;
  productAttributeSubscription: Subscription;
  variantAttributeSubscription: Subscription;
  attributeSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService, private authService: AuthService,
              private router: Router, private shopService: ShopService, private cdr: ChangeDetectorRef) {
    this.userSubscription = this.authService.getCurrentUserStream().subscribe(user => {
      if (user) {
        const { shopId } = user;
        this.shopId = shopId;
        this.tax$ = this.shopService.getAllTaxByShopIdAndType(shopId, 'product');
        this.getAllAttributes();
      }
    });
    const productTypeId = this.router.url.split('/').pop();
    if (productTypeId !== ADD) {
      this.edit = true;
      this.getProductType(productTypeId);
    }
  }

  ngOnInit(): void {
    this.productTypeForm = this.formbuilder.group({
      name: ['', Validators.required],
      tax: ['']
    });
  }

  ngOnDestroy(): void {
    if (this.productTypeSubscription && !this.productTypeSubscription.closed) {
      this.productTypeSubscription.unsubscribe();
    }
    if (this.attributeSubscription && !this.attributeSubscription.closed) {
      this.attributeSubscription.unsubscribe();
    }
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
    this.unsubscribeProductAttributes();
    this.unsubscribeVariantAttributes();

  }

  unsubscribeProductAttributes() {
    if (this.productAttributeSubscription && !this.productAttributeSubscription.closed) {
      this.productAttributeSubscription.unsubscribe();
    }
    this.productAttributes = [];
    this.productAttributesSource = new MatTableDataSource(this.productAttributes);
    this.cdr.detectChanges();
  }

  unsubscribeVariantAttributes() {
    if (this.variantAttributeSubscription && !this.variantAttributeSubscription.closed) {
      this.variantAttributeSubscription.unsubscribe();
    }
    this.variantAttributes = [];
    this.variantAttributesSource = new MatTableDataSource(this.variantAttributes);
    this.cdr.detectChanges();
  }

  get productTypeFormControls() { return this.productTypeForm.controls; }

  async onSubmit() {
    const { name, tax } = this.productTypeFormControls;
    if (this.productTypeForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      if (this.edit) {
        await this.adminService.updateProductType({
          name: name.value,
          taxId: tax.value,
          productTypeId: this.productType.productTypeId
        });
      } else {
        const data = await this.adminService.createProductType({
          name: name.value,
          taxId: tax.value
        });
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${this.productTypeRoute}/${id}`);
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

  async deleteProductType() {
    this.loadingDelete = true;
    try {
      const { productTypeId } = this.productType;
      await this.adminService.deleteProductType(productTypeId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.productTypeRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

  async saveAttributes() {
    this.attributeLoading = true;
    try {
      const setData = {
        productTypeId: this.productType.productTypeId
      };
      if (this.selectedList === 'product') {
        await this.adminService.updateProductType({
          ...setData,
          productAttributeId: this.selectedAttributeIds
        });
      } else if (this.selectedList === 'variant') {
        await this.adminService.updateProductType({
          ...setData,
          variantAttributeId: this.selectedAttributeIds
        });
      }
      this.showModal = false;
    } catch (err) {}
    this.attributeLoading = false;
  }

  async deleteAttribute(type: ListType, attributeId: string) {
    this.attributeLoading = true;
    const { productAttributeId, variantAttributeId } = this.productType;
    try {
      const setData = {
        productTypeId: this.productType.productTypeId
      };
      if (type === 'product') {
        await this.adminService.updateProductType({
          ...setData,
          productAttributeId: productAttributeId.filter(id => id !== attributeId)
        });
      } else if (type === 'variant') {
        await this.adminService.updateProductType({
          ...setData,
          variantAttributeId: variantAttributeId.filter(id => id !== attributeId)
        });
      }
      this.showModal = false;
    } catch (err) {}
    this.attributeLoading = false;
  }

  getProductType(productTypeId: string) {
    this.productTypeSubscription = this.shopService.getProductTypeById(productTypeId).subscribe(productType => {
      this.productType = productType;
      const { name, taxId, productAttributeId, variantAttributeId } = productType;
      this.unsubscribeProductAttributes();
      this.unsubscribeVariantAttributes();
      this.getProductAttributeByIds(productAttributeId);
      this.getVariantAttributeByIds(variantAttributeId);
      this.productTypeForm.patchValue({
        name,
        tax: taxId
      });
    });
  }

  getAllAttributes() {
    this.attributeSubscription = this.shopService.getAllAttributesByShopId(this.shopId).subscribe(attributes => {
      this.attributes = attributes;
    });
  }

  getProductAttributeByIds(attributeIds: string[]) {
    this.productAttributeSubscription = this.shopService.getAttributeByIds(attributeIds).subscribe(attributes => {
      this.productAttributes = attributes;
      this.productAttributesSource = new MatTableDataSource(this.productAttributes);
      this.cdr.detectChanges();
    });
  }

  getVariantAttributeByIds(attributeIds: string[]) {
    this.variantAttributeSubscription = this.shopService.getAttributeByIds(attributeIds).subscribe(attributes => {
      this.variantAttributes = attributes;
      this.variantAttributesSource = new MatTableDataSource(this.variantAttributes);
      this.cdr.detectChanges();
    });
  }

  showAttributeModal(type: ListType) {
    this.selectedList = type;
    this.showModal = true;
    if (!this.attributes && this.attributes.length === 0) {
      this.filteredAttributes = [];
    }
    else if (type === 'product' && this.productAttributes && this.productAttributes.length > 0) {
      const productAttributeIds = this.productAttributes.map(attribute => attribute.attributeId);
      this.filteredAttributes = this.attributes.filter(attribute => !productAttributeIds.includes(attribute.attributeId));
    } else if (type === 'variant' && this.variantAttributes && this.variantAttributes.length > 0) {
      const variantAttributeIds = this.variantAttributes.map(attribute => attribute.attributeId);
      this.filteredAttributes = this.attributes.filter(attribute => !variantAttributeIds.includes(attribute.attributeId));
    } else {
      this.filteredAttributes = this.attributes;
    }
    this.attributesSource = new MatTableDataSource(this.filteredAttributes);
    this.attributesSource.filterPredicate = (data: AttributeInterface, filter: string) => data.name.indexOf(filter) !== -1;
    this.cdr.detectChanges();
  }

  navigateToAttribute(attributeId: string) {
    this.router.navigateByUrl(`${this.attributeRoute}/${attributeId}`);
  }

  applyAttributeListFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.attributesSource.filter = filterValue.trim().toLowerCase();
  }

  assignAttributeCheckbox(event: Event, attributeId: string) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedAttributeIds.push(attributeId);
    } else {
      this.selectedAttributeIds = this.selectedAttributeIds.filter(id => id !== attributeId);
    }
  }

}
