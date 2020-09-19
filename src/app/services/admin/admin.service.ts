import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { RequestService } from '@services/request/request.service';
import { ProductInterface} from '@models/Product';
import { CollectionInterface} from '@models/Collection';
import { CategoryType} from '@models/Category';
import { VoucherInterface } from '@models/Voucher';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { VariantInterface } from '@models/Variant';

@Injectable()
export class AdminService {

  apiProduct: string;

  constructor(private req: RequestService) {
    const { api } = environment;
    const { url, product } = api;
    this.apiProduct = url + product;
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
    const { apiProduct } = this;
    try {
      return await this.req.post(apiProduct, { data });
    } catch (err) {
      throw err;
    }
  }

  async createCategory(data: CategoryType) {
    const { apiProduct } = this;
    try {
      return await this.req.post(apiProduct, { data });
    } catch (err) {
      throw err;
    }
  }
  async createSale(data: SaleDiscountInterface) {
    const { apiProduct } = this;
    try {
      return await this.req.post(apiProduct, { data });
    } catch (err) {
      throw err;
    }
  }

  async createVariant(data: VariantInterface) {
    const { apiProduct } = this;
    try {
      return await this.req.post(apiProduct, { data });
    } catch (err) {
      throw err;
    }
  }
  async createVoucher(data: VoucherInterface) {
    const { apiProduct } = this;
    try {
      return await this.req.post(apiProduct, { data });
    } catch (err) {
      throw err;
    }
  }

}
