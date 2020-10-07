import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ADD, ADMIN, PRODUCTATTRIBUTE } from '@constants/adminRoutes';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { AttributeInterface, AttributeValueInterface } from '@models/Attribute';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-attribute',
  templateUrl: './attribute-form.component.html',
  styleUrls: ['./attribute-form.component.css']
})
export class AttributeFormComponent implements OnInit, OnDestroy {

  faTrash = faTrash;

  loading = false;
  success = false;
  loadingDelete = false;
  successDelete = false;
  attributeValueLoading = false;
  attributeModalLoading = false;
  attributeModalSuccess = false;

  edit = false;
  editValue = false;
  showModal = false;
  showDeleteModal = false;
  nameDanger: boolean;

  displayedColumns: string[];
  dataSource: MatTableDataSource<any>;

  attributeRoute = `/${ADMIN}/${PRODUCTATTRIBUTE}`;
  selectedAttributeValueId: string;
  attribute: AttributeInterface;
  attributeValue: AttributeValueInterface;
  attributeForm: FormGroup;
  attributeValueForm: FormGroup;
  attributeSubscription: Subscription;
  attributeValueSubscription: Subscription;
  attributeValuesSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService,
              private router: Router, private cdr: ChangeDetectorRef, private shopService: ShopService) {
    const attributeId = this.router.url.split('/').pop();
    if (attributeId !== ADD) {
      this.edit = true;
      this.getAttribute(attributeId);
      this.getAttributeValues(attributeId);
    }
  }

  ngOnInit(): void {
    this.attributeForm = this.formbuilder.group({
      name: ['', Validators.required],
    });
    this.attributeValueForm = this.formbuilder.group({
      name: ['', Validators.required],
    });
  }

  ngOnDestroy(): void {
    if (this.attributeSubscription && !this.attributeSubscription.closed) {
      this.attributeSubscription.unsubscribe();
    }
    if (this.attributeValuesSubscription && !this.attributeValuesSubscription.closed) {
      this.attributeValuesSubscription.unsubscribe();
    }
    this.unsubscribeAttributeValue();
  }

  get attributeFormControls() { return this.attributeForm.controls; }
  get attributeValueFormControls() { return this.attributeValueForm.controls; }

  async onSubmit() {
    const { name } = this.attributeFormControls;
    if (this.attributeForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    const setData = {
      name: name.value
    };
    try {
      if (this.edit) {
        await this.adminService.updateAttribute({
          ...setData,
          attributeId: this.attribute.attributeId
        });
      }
      else {
        const data = await this.adminService.createAttribute(setData);
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${this.attributeRoute}/${id}`);
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

  async attributeValueSubmit() {
    const { name } = this.attributeValueFormControls;
    if (this.attributeValueForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.attributeValueLoading = true;
    const setData = {
      name: name.value,
      attributeId: this.attribute.attributeId
    };
    try {
      if (this.editValue) {
        await this.adminService.updateAttributeValue({
          ...setData,
          attributeValueId: this.selectedAttributeValueId
        });
      }
      else {
        await this.adminService.createAttributeValue(setData);
      }
      this.attributeModalSuccess = true;
      this.showModal = false;
      setTimeout(() => this.attributeModalSuccess = false, 2000);
    } catch (err) {
      this.attributeModalSuccess = false;
      console.log(err);
    }
    this.attributeValueLoading = false;
  }

  async deleteAttribute() {
    this.loadingDelete = true;
    try {
      const { attributeId } = this.attribute;
      await this.adminService.deleteAttribute(attributeId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.attributeRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

  async deleteAttributeValue() {
    this.attributeModalLoading = true;
    try {
      const { attributeId } = this.attribute;
      await this.adminService.deleteAttributeValue(attributeId, this.selectedAttributeValueId);
      this.attributeModalSuccess = true;
      this.showDeleteModal = false;
      setTimeout(() => this.attributeModalSuccess = false, 2000);
    } catch (err) {
      console.log(err);
    }
    this.attributeModalLoading = false;
  }

  unsubscribeAttributeValue() {
    if (this.attributeValueSubscription && !this.attributeValueSubscription.closed) {
      this.attributeValueSubscription.unsubscribe();
    }
  }

  getAttribute(attributeId: string) {
    this.attributeSubscription = this.shopService.getAttributeById(attributeId).subscribe(attribute => {
      if (attribute) {
        this.attribute = attribute;
        const { name } = attribute;
        this.attributeForm.patchValue({ name });
      }
    });
  }

  getAttributeValue(attributeValueId: string) {
    this.unsubscribeAttributeValue();
    this.attributeValueSubscription = this.shopService.getAttributeValueById(attributeValueId).subscribe(attributeValue => {
      this.attributeValue = attributeValue;
      const { name } = attributeValue;
      this.attributeValueForm.patchValue({ name });
    });
  }

  getAttributeValues(attributeId: string) {
    this.attributeValuesSubscription = this.shopService.getAttributeValuesByAttributeId(attributeId).subscribe(attribute => {
      this.displayedColumns = [ 'Value' ];
      this.fillTable(attribute);
    });
  }

  showAttributeModal(attributeValueId?: string) {
    this.showModal = true;
    if (attributeValueId) {
      this.editValue = true;
      this.selectedAttributeValueId = attributeValueId;
      this.getAttributeValue(attributeValueId);
    } else {
      this.editValue = false;
    }
  }

  showAttributeValueDeleteModal(attributeValueId?: string) {
    this.showDeleteModal = true;
    this.selectedAttributeValueId = attributeValueId;
  }

  fillTable(data: any[]) {
    try {
      this.dataSource = new MatTableDataSource(data);
      this.cdr.detectChanges();
    } catch (err) { }
  }

}
