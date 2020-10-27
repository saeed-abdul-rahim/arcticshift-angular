import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { ProductInterface } from '@models/Product';
import { getDataFromCollection, getDataFromDocument } from '@utils/getFirestoreData';
import { CollectionInterface } from '@models/Collection';
import { CategoryInterface } from '@models/Category';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { ProductTypeInterface } from '@models/ProductType';
import { AttributeInterface, AttributeJoinInterface, AttributeValueInterface } from '@models/Attribute';
import { VoucherInterface } from '@models/Voucher';
import { TaxInterface, TaxObjectType } from '@models/Tax';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { VariantInterface } from '@models/Variant';
import { InventoryInterface } from '@models/Inventory';
import { DbService } from '@services/db/db.service';
import { GeneralSettings } from '@models/GeneralSettings';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subscription } from 'rxjs/internal/Subscription';
import { RequestService } from '@services/request/request.service';
import { environment } from '@environment';
import { OrderInterface } from '@models/Order';

@Injectable()
export class ShopService {

  generalSettings = new BehaviorSubject<GeneralSettings>(null);
  generalSettings$ = this.generalSettings.asObservable();
  generalSettingsSubscription: Subscription;

  products$: Observable<ProductInterface[]>;
  attributes$: Observable<AttributeInterface[]>;
  collections$: Observable<CollectionInterface[]>;
  categories$: Observable<CategoryInterface[]>;
  productTypes$: Observable<ProductTypeInterface[]>;
  productAttributesJoin$: Observable<AttributeJoinInterface[]>;

  private apiUser: string;
  private apiWishlist: string;
  private apiOrder: string;

  constructor(private dbS: DbService, private req: RequestService) {
    const { api } = environment;
    const { url, user, wishlist, order } = api;
    this.apiUser = url + user;
    this.apiWishlist = this.apiUser + wishlist;
    this.apiOrder = url + order;
  }

  async addToWishlist(productId: string) {
    const { req, apiWishlist } = this;
    try {
      return await req.put(apiWishlist, { productId });
    } catch (err) {
      throw err;
    }
  }

  async addToCart(data: OrderInterface) {
    const { req, apiOrder } = this;
    try {
      return await req.put(apiOrder, { data });
    } catch (err) {
      throw err;
    }
  }

  destroy(): void {
    if (this.generalSettingsSubscription && !this.generalSettingsSubscription.closed) {
      this.generalSettingsSubscription.unsubscribe();
    }
  }

  setGeneralSettings(data: GeneralSettings) {
    this.generalSettings.next(data);
  }

  getGeneralSettings() {
    return this.generalSettings$;
  }

  getGeneralSettingsFromDb() {
    const { dbGeneralSettings } = this.dbS;
    this.generalSettingsSubscription =  getDataFromDocument(dbGeneralSettings)
      .subscribe((data: GeneralSettings) => this.generalSettings.next(data));
  }

  getProductById(productId: string): Observable<ProductInterface> {
    const { db, dbProductsRoute } = this.dbS;
    const productRef = db.collection(dbProductsRoute).doc(productId);
    return getDataFromDocument(productRef);
  }

  getVariantById(variantId: string): Observable<VariantInterface> {
    const { db, dbVariantsRoute } = this.dbS;
    const variantRef = db.collection(dbVariantsRoute).doc(variantId);
    return getDataFromDocument(variantRef);
  }

  getProductTypeById(productTypeId: string): Observable<ProductTypeInterface> {
    const { db, dbProductTypesRoute } = this.dbS;
    const productTypeRef = db.collection(dbProductTypesRoute).doc(productTypeId);
    return getDataFromDocument(productTypeRef);
  }

  getCollectionById(collectionId: string): Observable<CollectionInterface> {
    const { db, dbCollectionsRoute } = this.dbS;
    const collectionRef = db.collection(dbCollectionsRoute).doc(collectionId);
    return getDataFromDocument(collectionRef);
  }

  getCategoryById(categoryId: string): Observable<CategoryInterface> {
    const { db, dbCategoriesRoute } = this.dbS;
    const categoryRef = db.collection(dbCategoriesRoute).doc(categoryId);
    return getDataFromDocument(categoryRef);
  }

  getSaleById(saleId: string): Observable<SaleDiscountInterface> {
    const { db, dbSalesRoute } = this.dbS;
    const saleRef = db.collection(dbSalesRoute).doc(saleId);
    return getDataFromDocument(saleRef);
  }

  getVoucherById(saleId: string): Observable<VoucherInterface> {
    const { db, dbVouchersRoute } = this.dbS;
    const saleRef = db.collection(dbVouchersRoute).doc(saleId);
    return getDataFromDocument(saleRef);
  }

  getAttributeById(attributeId: string): Observable<AttributeInterface> {
    const { db, dbAttributesRoute } = this.dbS;
    const attributeRef = db.collection(dbAttributesRoute).doc(attributeId);
    return getDataFromDocument(attributeRef);
  }

  getAttributeValueById(attributeValueId: string): Observable<AttributeValueInterface> {
    const { db, dbAttributeValuesRoute } = this.dbS;
    const attributeValueRef = db.collection(dbAttributeValuesRoute).doc(attributeValueId);
    return getDataFromDocument(attributeValueRef);
  }

  getTaxesById(taxId: string): Observable<TaxInterface> {
    const { db, dbTaxesRoute } = this.dbS;
    const taxRef = db.collection(dbTaxesRoute).doc(taxId);
    return getDataFromDocument(taxRef);
  }

  getInventoryById(inventoryId: string): Observable<InventoryInterface> {
    const { db, dbInventoriesRoute } = this.dbS;
    const inventoryRef = db.collection(dbInventoriesRoute).doc(inventoryId);
    return getDataFromDocument(inventoryRef);
  }

  getAllAttributes(): Observable<AttributeJoinInterface[]> {
    const { db, dbAttributesRoute } = this.dbS;
    const attributesRef = db.collection(dbAttributesRoute);
    return this.dbS.joinAttributeValues(attributesRef);
  }

  getAttributeByIds(attributeIds: string[]): Observable<AttributeInterface[]> {
    const { db, dbAttributesRoute } = this.dbS;
    const queries = attributeIds.map(id => {
      const attributeData = db.collection<AttributeInterface>(dbAttributesRoute).doc(id);
      return getDataFromDocument(attributeData) as Observable<AttributeInterface>;
    });
    return combineLatest(queries);
  }

  getAttributeAndValuesByIds(attributeIds: string[]): Observable<AttributeJoinInterface[]> {
    return this.dbS.getAttributeByIds(attributeIds);
  }

  getVariantByIds(variantIds: string[]) {
    const { db, dbVariantsRoute } = this.dbS;
    const queries = variantIds.map(id => {
      const variant = db.collection(dbVariantsRoute).doc(id);
      return getDataFromDocument(variant) as Observable<VariantInterface>;
    });
    return combineLatest(queries);
  }

  getAttributeValuesByAttributeId(attributeId: string) {
    const attributeValueRef = this.dbS.queryAttributeValues([{ field: 'attributeId', type: '==', value: attributeId }]);
    return getDataFromCollection(attributeValueRef) as Observable<AttributeValueInterface[]>;
  }

  getVariantsByProductId(productId: string) {
    const variantsRef = this.dbS.queryVariants([{ field: 'productId', type: '==', value: productId }]);
    return getDataFromCollection(variantsRef) as Observable<VariantInterface[]>;
  }

  getTaxesByShopIdAndType(shopId: string, type: TaxObjectType) {
    const taxes = this.dbS.queryTax([
      { field: 'shopId', type: '==', value: shopId },
      { field: 'type', type: '==', value: type }
    ]);
    return getDataFromCollection(taxes) as Observable<TaxInterface[]>;
  }

  getAttributesByProductTypeId(productTypeId: string): Observable<AttributeJoinInterface[]> {
    const attributes = this.dbS.queryAttributes([
      { field: 'productTypeId', type: 'array-contains', value: productTypeId }
    ]);
    return this.dbS.joinAttributeValues(attributes);
  }

  getDraftOrderByUserId(userId: string) {
    const orders = this.dbS.queryOrders([
      { field: 'userId', type: '==', value: userId},
      { field: 'orderStatus', type: '==', value: 'draft' }
    ], {
      field: 'createdAt', direction: 'desc'
    }, 1);
    return getDataFromCollection(orders) as Observable<OrderInterface[]>;
  }

}
