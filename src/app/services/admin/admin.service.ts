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
import {  getDataFromDocument } from '@utils/getFirestoreData';
import { AuthService } from '@services/auth/auth.service';
import { WarehouseInterface } from '@models/Warehouse';
import { AttributeInterface } from '@models/Attribute';
import { ProductTypeInterface } from '@models/ProductType';

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

  constructor(private req: RequestService, private afs: AngularFirestore, private auth: AuthService) {
    const { api, db } = environment;
    const { url, product, category, collection, sale, variant, voucher } = api;
    const { version, name, products, analytics } = db;
    this.apiProduct = url + product;
    this.apiCategory = url + category;
    this.apiCollection = url + collection;
    this.apiSale = url + sale;
    this.apiVariant = url + variant;
    this.apiVoucher = url + voucher;
    this.db = this.afs.collection(version).doc(name);
    this.dbAnalytics = this.db.collection(analytics);
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

  async deleteProductImage(id: string, path: string) {
    const { apiProduct } = this;
    try {
      return await this.req.patch(`${apiProduct}/${id}/image`, { path });
    } catch (err) {
      throw err;
    }
  }

  async deleteProduct(id: string) {
    const { apiProduct } = this;
    try {
      return await this.req.delete(`${apiProduct}/${id}`);
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

  async deleteCollectionImage(id: string, path: string) {
    const { apiCollection } = this;
    try {
      return await this.req.patch(`${apiCollection}/${id}/image`, { path });
    } catch (err) {
      throw err;
    }
  }

  async deleteCollection(id: string) {
    const { apiCollection } = this;
    try {
      return await this.req.delete(`${apiCollection}/${id}`);
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

  
  async deleteCategoryImage(id: string, path: string) {
    const { apiCategory } = this;
    try {
      return await this.req.patch(`${apiCategory}/${id}/image`, { path });
    } catch (err) {
      throw err;
    }
  }

  async deleteCategory(id: string) {
    const { apiCategory } = this;
    try {
      return await this.req.delete(`${apiCategory}/${id}`);
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

  async deleteSale(id: string) {
    const { apiSale } = this;
    try {
      return await this.req.delete(`${apiSale}/${id}`);
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

  async deleteVariant(id: string) {
    const { apiVariant } = this;
    try {
      return await this.req.delete(`${apiVariant}/${id}`);
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

  async updateVoucher(data: VoucherInterface) {
    const { apiVoucher } = this;
    try {
      return await this.req.patch(apiVoucher, { data });
    } catch (err) {
      throw err;
    }
  }

  async deleteVoucher(id: string) {
    const { apiVoucher } = this;
    try {
      return await this.req.delete(`${apiVoucher}/${id}`);
    } catch (err) {
      throw err;
    }
  }

  async createWarehouse(data: WarehouseInterface) {
    const { apiVoucher } = this;
    try {
      return await this.req.post(apiVoucher, { data });
    } catch (err) {
      throw err;
    }
  }

  async updateWarehouse(data: WarehouseInterface) {
    const { apiVoucher } = this;
    try {
      return await this.req.patch(apiVoucher, { data });
    } catch (err) {
      throw err;
    }
  }
  async deleteWarehouse(id: string) {
    const { apiWarehouse } = this;
    try {
      return await this.req.delete(`${apiWarehouse}/${id}`);
    } catch (err) {
      throw err;
    }
  }

  async createAttribute(data: AttributeInterface) {
    const { apiVoucher } = this;
    try {
      return await this.req.post(apiVoucher, { data });
    } catch (err) {
      throw err;
    }
  }

  async updateAttribute(data: AttributeInterface) {
    const { apiVoucher } = this;
    try {
      return await this.req.patch(apiVoucher, { data });
    } catch (err) {
      throw err;
    }
  }

  async deleteAttribute(id: string) {
    const { apiAttribute } = this;
    try {
      return await this.req.delete(`${apiAttribute}/${id}`);
    } catch (err) {
      throw err;
    }
  }

  async createProductType(data: ProductTypeInterface) {
    const { apiVoucher } = this;
    try {
      return await this.req.post(apiVoucher, { data });
    } catch (err) {
      throw err;
    }
  }
  async updateProductType(data: ProductTypeInterface) {
    const { apiVoucher } = this;
    try {
      return await this.req.patch(apiVoucher, { data });
    } catch (err) {
      throw err;
    }
  }

  async deleteProductType(id: string) {
    const { apiProductType } = this;
    try {
      return await this.req.delete(`${apiProductType}/${id}`);
    } catch (err) {
      throw err;
    }
  }

  getCollectionAnalytics(path: string) {
    return getDataFromDocument(this.dbAnalytics.doc(path));
  }

}
