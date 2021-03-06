import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { RequestService } from '@services/request/request.service';
import { ProductInterface } from '@models/Product';
import { CollectionInterface } from '@models/Collection';
import { CategoryInterface } from '@models/Category';
import { VoucherInterface } from '@models/Voucher';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { VariantInterface } from '@models/Variant';
import { getDataFromCollection, getDataFromDocument } from '@utils/getFirestoreData';
import { WarehouseInterface } from '@models/Warehouse';
import { AttributeInterface, AttributeValueInterface } from '@models/Attribute';
import { ProductTypeInterface } from '@models/ProductType';
import { TaxInterface } from '@models/Tax';
import { AuthService } from '@services/auth/auth.service';
import { User, UserInterface } from '@models/User';
import { ShippingInterface, ShippingRateInterface } from '@models/Shipping';
import { DbService } from '@services/db/db.service';
import { CatalogTypeApi } from '@models/Common';
import { OrderInterface } from '@models/Order';
import { Subscription } from 'rxjs/internal/Subscription';
import { Observable } from 'rxjs/internal/Observable';
import { GeneralSettings } from '@models/GeneralSettings';
import { SaleAnalyticsGroupInterface } from '@models/Analytics';

@Injectable()
export class AdminService {

  private apiProduct: string;
  private apiCategory: string;
  private apiCollection: string;
  private apiSale: string;
  private apiVariant: string;
  private apiVoucher: string;
  private apiProductType: string;
  private apiAttribute: string;
  private apiWarehouse: string;
  private apiOrder: string;
  private apiShipping: string;
  private apiShippingRate: string;
  private apiTax: string;
  private apiSettings: string;
  private apiUser: string;

  private dbShop: AngularFirestoreDocument;
  private dbAnalytics: AngularFirestoreCollection;
  private dbAnalyticsOrderDayWise: AngularFirestoreCollection;

  private user: User;
  private userSubscription: Subscription;

  constructor(private req: RequestService, private dbS: DbService, private authService: AuthService) {
    const { api, db } = environment;
    const {
      url,
      user,
      product,
      productType,
      attribute,
      category,
      collection,
      sale,
      variant,
      voucher,
      tax,
      settings,
      warehouse,
      order,
      shipping,
      _rate,
    } = api;
    const { analytics, orders, _dayWise, shops } = db;
    this.getCurrentUser();
    const { shopId } = this.user;

    this.apiUser = url + user;
    this.apiProduct = url + product;
    this.apiProductType = url + productType;
    this.apiAttribute = url + attribute;
    this.apiCategory = url + category;
    this.apiCollection = url + collection;
    this.apiSale = url + sale;
    this.apiVariant = url + variant;
    this.apiVoucher = url + voucher;
    this.apiTax = url + tax;
    this.apiSettings = url + settings;
    this.apiWarehouse = url + warehouse;
    this.apiOrder = url + order;
    this.apiShipping = url + shipping;
    this.apiShippingRate = this.apiShipping + _rate;

    this.dbShop = this.dbS.db.collection(shops).doc(shopId);
    this.dbAnalytics = this.dbS.db.collection(analytics);
    this.dbAnalyticsOrderDayWise = this.dbAnalytics.doc(orders).collection(_dayWise);
  }

  destroy() {
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
  }

  async createDraft() {
    const { req, apiOrder } = this;
    try {
      return await req.post(apiOrder, {});
    } catch (err) {
      throw err;
    }
  }

  async addVariants(id: string, draft: OrderInterface) {
    const { req, apiOrder } = this;
    try {
      return await req.put(`${apiOrder}/${id}/variant`, { data: { ...draft } });
    } catch (err) {
      throw err;
    }
  }

  async getCartTotal(id: string, data: any) {
    const { req, apiOrder } = this;
    try {
      return await req.post(`${apiOrder}/total/${id}`, { data });
    } catch (err) {
      throw err;
    }
  }

  async createOrder(id: string) {
    const { req, apiOrder } = this;
    try {
      return await req.patch(`${apiOrder}/${id}/create`, {});
    } catch (err) {
      throw err;
    }
  }

  async updateUser(uid: string, data: UserInterface) {
    const { apiUser } = this;
    try {
      return await this.req.patch(`${apiUser}/${uid}`, { data });
    } catch (err) {
      throw err;
    }
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

  async deleteVariantImage(id: string, path: string) {
    const { apiVariant } = this;
    try {
      return await this.req.patch(`${apiVariant}/${id}/image`, { path });
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

  async addProductToCollection(collectionId: string, productId: string[]) {
    const { apiCollection } = this;
    try {
      return await this.req.put(apiCollection, { data: { collectionId, productId } });
    } catch (err) {
      throw err;
    }
  }

  async removeProductFromCollection(collectionId: string, productId: string) {
    const { apiCollection } = this;
    try {
      return await this.req.patch(`${apiCollection}/${collectionId}/product`, { data: { productId } });
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

  async addProductToCategory(categoryId: string, productId: string[]) {
    const { apiCategory } = this;
    try {
      return await this.req.put(apiCategory, { data: { categoryId, productId } });
    } catch (err) {
      throw err;
    }
  }

  async removeProductFromCategory(categoryId: string, productId: string) {
    const { apiCategory } = this;
    try {
      return await this.req.patch(`${apiCategory}/${categoryId}/product`, { data: { productId } });
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

  async addCatalogToSaleDiscount(id: string, data: CatalogTypeApi) {
    const { apiSale } = this;
    try {
      return await this.req.put(`${apiSale}/${id}`, { data });
    } catch (err) {
      throw err;
    }
  }

  async removeCatalogFromSaleDiscount(id: string, data: CatalogTypeApi) {
    const { apiSale } = this;
    try {
      return await this.req.patch(`${apiSale}/${id}`, { data });
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

  async addCatalogToVoucher(id: string, data: CatalogTypeApi) {
    const { apiVoucher } = this;
    try {
      return await this.req.put(`${apiVoucher}/${id}`, { data });
    } catch (err) {
      throw err;
    }
  }

  async removeCatalogFromVoucher(id: string, data: CatalogTypeApi) {
    const { apiVoucher } = this;
    try {
      return await this.req.patch(`${apiVoucher}/${id}`, { data });
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
  }

  async deleteWarehouse(id: string) {
    const { apiWarehouse } = this;
    try {
      return await this.req.delete(`${apiWarehouse}/${id}`);
    } catch (err) {
      throw err;
    }
  }

  async createShipping(data: ShippingInterface) {
    const { apiShipping } = this;
    try {
      return await this.req.post(apiShipping, { data });
    } catch (err) {
      throw err;
    }
  }

  async updateShipping(data: ShippingInterface) {
    const { apiShipping } = this;
    try {
      return await this.req.patch(apiShipping, { data });
    } catch (err) {
      throw err;
    }
  }

  async deleteShipping(id: string) {
    const { apiShipping } = this;
    try {
      return await this.req.delete(`${apiShipping}/${id}`);
    } catch (err) {
      throw err;
    }
  }

  async createShippingRate(data: ShippingRateInterface) {
    const { apiShipping } = this;
    try {
      return await this.req.put(apiShipping, { data });
    } catch (err) {
      throw err;
    }
  }

  async updateShippingRate(data: ShippingRateInterface) {
    const { apiShippingRate } = this;
    try {
      return await this.req.patch(apiShippingRate, { data });
    } catch (err) {
      throw err;
    }
  }

  async deleteShippingRate(id: string) {
    const { apiShippingRate } = this;
    try {
      return await this.req.delete(`${apiShippingRate}/${id}`);
    } catch (err) {
      throw err;
    }
  }

  async createTax(data: TaxInterface) {
    const { apiTax } = this;
    try {
      return await this.req.post(apiTax, { data });
    } catch (err) {
      throw err;
    }
  }

  async updateTax(data: TaxInterface) {
    const { apiTax } = this;
    try {
      return await this.req.patch(apiTax, { data });
    } catch (err) {
      throw err;
    }
  }

  async deleteTax(id: string) {
    const { apiTax } = this;
    try {
      return await this.req.delete(`${apiTax}/${id}`);
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

  async deleteAttribute(id: string) {
    const { apiAttribute } = this;
    try {
      return await this.req.delete(`${apiAttribute}/${id}`);
    } catch (err) {
      throw err;
    }
  }

  async createAttributeValue(data: AttributeValueInterface) {
    const { apiAttribute } = this;
    try {
      return await this.req.put(apiAttribute, { data });
    } catch (err) {
      throw err;
    }
  }

  async updateAttributeValue(data: AttributeValueInterface) {
    const { apiAttribute } = this;
    try {
      return await this.req.patch(`${apiAttribute}/value`, { data });
    } catch (err) {
      throw err;
    }
  }

  async deleteAttributeValue(attributeId: string, attributeValueId: string) {
    const { apiAttribute } = this;
    try {
      return await this.req.delete(`${apiAttribute}/${attributeId}/value/${attributeValueId}`);
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

  async deleteProductType(id: string) {
    const { apiProductType } = this;
    try {
      return await this.req.delete(`${apiProductType}/${id}`);
    } catch (err) {
      throw err;
    }
  }

  async fullfillOrder(id: string, data: OrderInterface, sendEmail: boolean) {
    const { apiOrder } = this;
    try {
      return await this.req.patch(`${apiOrder}/${id}/fullfill`, { data, sendEmail });
    } catch (err) {
      throw err;
    }
  }

  async addOrderTracking(orderId: string, data: { warehouseId: string, trackingCode: string }) {
    const { apiOrder } = this;
    try {
      return await this.req.patch(`${apiOrder}/${orderId}/tracking`, { data });
    } catch (err) {
      throw err;
    }
  }

  async cancelFullfillment(orderId: string, warehouseId: string) {
    const { apiOrder } = this;
    try {
      return await this.req.patch(`${apiOrder}/${orderId}/fullfill/cancel`, { data: { warehouseId } });
    } catch (err) {
      throw err;
    }
  }

  async cancelOrder(id: string) {
    const { apiOrder } = this;
    try {
      return await this.req.delete(`${apiOrder}/${id}`);
    } catch (err) {
      throw err;
    }
  }

  async refund(orderId: string, amount: number) {
    const { apiOrder } = this;
    try {
      return await this.req.patch(`${apiOrder}/${orderId}/refund`, { data: { amount } });
    } catch (err) {
      throw err;
    }
  }

  async captureAmount(orderId: string, capturedAmount: number) {
    const { apiOrder } = this;
    try {
      return await this.req.patch(`${apiOrder}/${orderId}/capture`, { data: { capturedAmount } });
    } catch (err) {
      throw err;
    }
  }

  async updateSettings(data: GeneralSettings) {
    const { apiSettings } = this;
    try {
      return await this.req.patch(`${apiSettings}/general`, { data });
    } catch (err) {
      throw err;
    }
  }

  getCurrentShop() {
    return getDataFromDocument(this.dbShop);
  }

  getCollectionAnalytics(path: string) {
    return getDataFromDocument(this.dbAnalytics.doc(path));
  }

  getUserById(id: string): Observable<UserInterface> {
    const { db, dbUsersRoute } = this.dbS;
    const customer = db.collection(dbUsersRoute).doc(id);
    return getDataFromDocument(customer);
  }

  getDraftById(id: string): Observable<OrderInterface> {
    const { db, dbDraftsRoute } = this.dbS;
    const draft = db.collection(dbDraftsRoute).doc(id);
    return getDataFromDocument(draft);
  }

  getOrderById(id: string): Observable<OrderInterface> {
    const { db, dbOrdersRoute } = this.dbS;
    const order = db.collection(dbOrdersRoute).doc(id);
    return getDataFromDocument(order);
  }

  getOrdersByUserId(userId: string, limit?: number): Observable<OrderInterface[]> {
    const orders = this.dbS.queryOrders(
      [{ field: 'userId', type: '==', value: userId }],
      { field: 'createdAt', direction: 'desc' },
      limit
    );
    return getDataFromCollection(orders);
  }

  getProductsByShopId(shopId: string): Observable<ProductInterface[]> {
    const products = this.dbS.queryProducts([{ field: 'shopId', type: '==', value: shopId }]);
    return getDataFromCollection(products);
  }

  getProductTypesByShopId(shopId: string): Observable<ProductTypeInterface[]> {
    const productTypes = this.dbS.queryProductTypes([{ field: 'shopId', type: '==', value: shopId }]);
    return getDataFromCollection(productTypes);
  }

  searchVariantsByKeyword(keyword: string): Observable<VariantInterface[]> {
    const variants = this.dbS.queryVariants([{ field: 'keywords', type: 'array-contains', value: keyword }]);
    return getDataFromCollection(variants);
  }

  getAttributesByShopId(shopId: string): Observable<AttributeInterface[]> {
    const attributes = this.dbS.queryAttributes([{ field: 'shopId', type: '==', value: shopId }]);
    return getDataFromCollection(attributes);
  }

  getCategoriesByShopId(shopId: string): Observable<CategoryInterface[]> {
    const categories = this.dbS.queryCategories([{ field: 'shopId', type: '==', value: shopId }]);
    return getDataFromCollection(categories);
  }

  getCollectionsByShopId(shopId: string): Observable<CollectionInterface[]> {
    const collection = this.dbS.queryCollections([{ field: 'shopId', type: '==', value: shopId }]);
    return getDataFromCollection(collection);
  }

  getProductsByCollectionId(id: string): Observable<ProductInterface[]> {
    const products = this.dbS.queryProducts([{
      field: 'collectionId',
      type: 'array-contains',
      value: id
    }]);
    return getDataFromCollection(products);
  }

  getCategorybyIds(ids: string[]): Observable<CategoryInterface[]> {
    const { dbCategoriesRoute } = this.dbS;
    return this.dbS.queryByIds(dbCategoriesRoute, ids);
  }

  getCollectionbyIds(ids: string[]): Observable<CollectionInterface[]> {
    const { dbCollectionsRoute } = this.dbS;
    return this.dbS.queryByIds(dbCollectionsRoute, ids);
  }

  getWarehousebyIds(ids: string[]): Observable<WarehouseInterface[]> {
    const { dbWarehouseRoute } = this.dbS;
    return this.dbS.queryByIds(dbWarehouseRoute, ids);
  }

  getAnalyticsOrderDayWise(ids: string[]): Observable<SaleAnalyticsGroupInterface[]> {
    const { dbAnalyticsOrderDayWise } = this;
    return this.dbS.queryByIds(dbAnalyticsOrderDayWise, ids);
  }

  getWarehouseById(warehouseId: string): Observable<WarehouseInterface> {
    const { dbWarehouseRoute, db } = this.dbS;
    const warehouse = db.collection(dbWarehouseRoute).doc(warehouseId);
    return getDataFromDocument(warehouse);
  }

  getShippingById(shippingId: string): Observable<ShippingInterface> {
    const { dbShippingRoute, db } = this.dbS;
    const shipping = db.collection(dbShippingRoute).doc(shippingId);
    return getDataFromDocument(shipping);
  }

  getWarehousesByShopId(): Observable<WarehouseInterface[]> {
    const { shopId } = this.user;
    const warehouse = this.dbS.queryWarehouse([{ field: 'shopId', type: '==', value: shopId }]);
    return getDataFromCollection(warehouse);
  }

  getShippingByWarehouseId(warehouseId: string): Observable<ShippingInterface[]> {
    const shipping = this.dbS.queryShipping([{ field: 'warehouseId', type: 'array-contains', value: warehouseId }]);
    return getDataFromCollection(shipping);
  }

  private getCurrentUser() {
    this.userSubscription = this.authService.getCurrentUserStream().subscribe(user => this.user = user);
  }
}
