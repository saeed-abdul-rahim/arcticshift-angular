import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, Query } from '@angular/fire/firestore';

import { RequestService } from '@services/request/request.service';
import { ProductInterface } from '@models/Product';
import { CollectionInterface } from '@models/Collection';
import { CategoryInterface } from '@models/Category';
import { VoucherInterface } from '@models/Voucher';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { VariantInterface } from '@models/Variant';
<<<<<<< HEAD
import { ProductTypeInterface } from '@models/ProductType';
import { AttributeInterface } from '@models/Attribute';
import { WarehouseInterface } from '@models/Warehouse';
=======
import {  getDataFromDocument } from '@utils/getFirestoreData';
import { AuthService } from '@services/auth/auth.service';
>>>>>>> 4b55895facfeae1303155c608651b8c25d909d9f

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

  private db: AngularFirestoreDocument;
  private dbAnalytics: AngularFirestoreCollection;

<<<<<<< HEAD
  constructor(private req: RequestService) {
    const { api } = environment;
    const { url,
      product,
      category,
      collection,
      sale,
      variant,
      voucher,
      productType,
      attribute,
      warehouse
    } = api;
=======
  constructor(private req: RequestService, private afs: AngularFirestore, private auth: AuthService) {
    const { api, db } = environment;
    const { url, product, category, collection, sale, variant, voucher } = api;
    const { version, name, products, analytics } = db;
>>>>>>> 4b55895facfeae1303155c608651b8c25d909d9f
    this.apiProduct = url + product;
    this.apiCategory = url + category;
    this.apiCollection = url + collection;
    this.apiSale = url + sale;
    this.apiVariant = url + variant;
    this.apiVoucher = url + voucher;
<<<<<<< HEAD
    this.apiProductType = url + productType;
    this.apiAttribute = url + attribute;
    this.apiWarehouse = url + warehouse;
=======
    this.db = this.afs.collection(version).doc(name);
    this.dbAnalytics = this.db.collection(analytics);
>>>>>>> 4b55895facfeae1303155c608651b8c25d909d9f
  }

  async createProduct(data: ProductInterface) {
    const { apiProduct } = this;
    try {
      return await this.req.post(apiProduct, { data });
    } catch (err) {
      throw err;
    }
  }

  async updateProduct(data: ProductInterface) {
    const { apiProduct } = this;
    try {
      return await this.req.patch(apiProduct, { data });
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

  async updateCollection(data: CollectionInterface) {
    const { apiCollection } = this;
    try {
      return await this.req.patch(apiCollection, { data });
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

  
  async updateCategory(data: CategoryInterface) {
    const { apiCategory } = this;
    try {
      return await this.req.patch(apiCategory, { data });
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

  
  async updateSale(data: SaleDiscountInterface) {
    const { apiSale } = this;
    try {
      return await this.req.patch(apiSale, { data });
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

  async updateVariant(data: VariantInterface) {
    const { apiVariant } = this;
    try {
      return await this.req.patch(apiVariant, { data });
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

<<<<<<< HEAD
  async updateVoucher(data: VoucherInterface) {
    const { apiVoucher } = this;
    try {
      return await this.req.patch(apiVoucher, { data });
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

  async updateProductType(data: ProductTypeInterface) {
    const { apiProductType } = this;
    try {
      return await this.req.patch(apiProductType, { data });
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

  async updateAttribute(data: AttributeInterface) {
    const { apiAttribute } = this;
    try {
      return await this.req.patch(apiAttribute, { data });
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

  async updateWarehouse(data: WarehouseInterface) {
    const { apiWarehouse } = this;
    try {
      return await this.req.patch(apiWarehouse, { data });
    } catch (err) {
      throw err;
    }
=======
  getCollectionAnalytics(path: string) {
    return getDataFromDocument(this.dbAnalytics.doc(path));
>>>>>>> 4b55895facfeae1303155c608651b8c25d909d9f
  }

}
