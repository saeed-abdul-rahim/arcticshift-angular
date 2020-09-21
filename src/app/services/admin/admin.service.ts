import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { RequestService } from '@services/request/request.service';
import { User } from '@models/User';
import { ProductInterface } from '@models/Product';
import { CollectionInterface } from '@models/Collection';
import { CategoryInterface } from '@models/Category';
import { VoucherInterface } from '@models/Voucher';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { VariantInterface } from '@models/Variant';
import { ProductTypeInterface } from '@models/productType';
import { AttributeInterface } from '@models/attribute';
import { WarehouseInterface } from '@models/warehouse';
import { WarehouseComponent } from 'app/admin/warehouse/warehouse.component';

@Injectable()
export class AdminService {

  apiProduct: string;
  apiCategory: string;
  apiCollection: string;
  apiSale: string;
  apiVariant: string;
  apiVoucher: string;
  apiProductType: string;
  apiAttribute: string;
  apiWarehouse: string;

  private user: User;

  constructor(private req: RequestService) {
    const { api } = environment;
    const { url, product, category, collection, sale, variant, voucher,productType,attribute,warehouse } = api;
    this.apiProduct = url + product;
    this.apiCategory = url + category;
    this.apiCollection = url + collection;
    this.apiSale = url + sale;
    this.apiVariant = url + variant;
    this.apiVoucher = url + voucher;
    this.apiProductType = url + productType;
    this.apiAttribute = url + attribute;
    this.apiWarehouse = url + warehouse;
  }

  async createProduct(data: ProductInterface) {
    const { apiProduct } = this;
    try {
      return await this.req.post(apiProduct, { data });
    } catch (err) {
      throw err;
    }
  }

  async createCollection(data: CollectionInterface) {
    const { apiCollection } = this;
    try {
      return await this.req.post(apiCollection, { data });
    } catch (err) {
      throw err;
    }
  }

  async createCategory(data: CategoryInterface) {
    const { apiCategory } = this;
    try {
      return await this.req.post(apiCategory, { data });
    } catch (err) {
      throw err;
    }
  }

  async createSale(data: SaleDiscountInterface) {
    const { apiSale } = this;
    try {
      return await this.req.post(apiSale, { data });
    } catch (err) {
      throw err;
    }
  }

  async createVariant(data: VariantInterface) {
    const { apiVariant } = this;
    try {
      return await this.req.post(apiVariant, { data });
    } catch (err) {
      throw err;
    }
  }

  async createVoucher(data: VoucherInterface) {
    const { apiVoucher } = this;
    try {
      return await this.req.post(apiVoucher, { data });
    } catch (err) {
      throw err;
    }
  }
  async createProductType(data: ProductTypeInterface) {
    const { apiProductType } = this;
    try {
      return await this.req.post(apiProductType, { data });
    } catch (err) {
      throw err;
    }
  }
  async createAttribute(data: AttributeInterface) {
    const { apiAttribute } = this;
    try {
      return await this.req.post(apiAttribute, { data });
    } catch (err) {
      throw err;
    }
  }
  async createWarehouse(data: WarehouseInterface) {
    const { apiWarehouse } = this;
    try {
      return await this.req.post(apiWarehouse, { data });
    } catch (err) {
      throw err;
    }
  }

}
