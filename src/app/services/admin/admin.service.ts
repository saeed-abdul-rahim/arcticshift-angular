import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { RequestService } from '@services/request/request.service';
import { ProductInterface } from '@models/Product';

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

}
