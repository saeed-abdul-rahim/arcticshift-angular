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
import { ShippingRateInterface } from '@models/Shipping';
import { map } from 'rxjs/internal/operators/map';
import { AuthService } from '@services/auth/auth.service';
import { User } from '@models/User';
import { GeoIp } from '@models/GeoIp';
import { ExchangeRate } from '@models/ExchangeRate';
import { currencyList } from '@utils/currencyList';

@Injectable()
export class ShopService {

  private saleDiscountSubscription: Subscription;
  private generalSettingsSubscription: Subscription;
  private saleDiscounts = new BehaviorSubject<SaleDiscountInterface[]>(null);
  private generalSettings = new BehaviorSubject<GeneralSettings>(null);
  private currentLocation = new BehaviorSubject<GeoIp>(null);
  private currentExchangeRate = new BehaviorSubject<number>(null);
  generalSettings$ = this.generalSettings.asObservable();
  saleDiscounts$ = this.saleDiscounts.asObservable();
  currentLocation$ = this.currentLocation.asObservable();
  currentExchangeRate$ = this.currentExchangeRate.asObservable();

  products$: Observable<ProductInterface[]>;
  attributes$: Observable<AttributeInterface[]>;
  collections$: Observable<CollectionInterface[]>;
  categories$: Observable<CategoryInterface[]>;
  productTypes$: Observable<ProductTypeInterface[]>;
  productAttributesJoin$: Observable<AttributeJoinInterface[]>;

  private apiUser: string;
  private apiWishlist: string;
  private apiOrder: string;

  private user: User;

  constructor(private dbS: DbService, private req: RequestService, private auth: AuthService) {
    const { api } = environment;
    const { url, user, wishlist, order } = api;
    this.apiUser = url + user;
    this.apiWishlist = this.apiUser + wishlist;
    this.apiOrder = url + order;
    this.getCurrentUser();
  }

  async getCurrentLocationDetails() {
    try {
      const location = await this.getLocation();
      const countryCode = location.country_code;
      const currencyCode = currencyList[countryCode];
      await this.getExchangeRate(currencyCode);
    } catch (err) {
      throw err;
    }
  }

  async addToWishlist(productId: string) {
    const { req, apiWishlist } = this;
    try {
      return await req.put(apiWishlist, { productId });
    } catch (err) {
      throw err;
    }
  }

  async removeFromWishlist(productId: string) {
    const { req, apiWishlist } = this;
    try {
      return await req.delete(`${apiWishlist}/${productId}`);
    } catch (err) {
      throw err;
    }
  }

  async addToCart(data: OrderInterface) {
    const { req, apiOrder, user } = this;
    try {
      return await req.put(apiOrder, { data: { ...data, userId: user.uid } });
    } catch (err) {
      throw err;
    }
  }

  async getCartTotal() {
    const { req, apiOrder } = this;
    try {
      return await req.get(`${apiOrder}/total`);
    } catch (err) {
      throw err;
    }
  }

  async removeVariantFromCart(orderId: string, variantId: string) {
    const { req, apiOrder, user } = this;
    try {
      return await req.patch(`${apiOrder}/${orderId}/variant`, { data: { userId: user.uid, variantId } });
    } catch (err) {
      throw err;
    }
  }

  async addVoucher(orderId: string, code: string) {
    const { req, apiOrder, user } = this;
    try {
      return await req.put(`${apiOrder}/${orderId}/voucher`, { data: { userId: user.uid, code } });
    } catch (err) {
      throw err;
    }
  }

  destroy(): void {
    if (this.generalSettingsSubscription && !this.generalSettingsSubscription.closed) {
      this.generalSettingsSubscription.unsubscribe();
    }
    this.unsubscribeSaleDiscounts();
  }

  unsubscribeSaleDiscounts() {
    if (this.saleDiscountSubscription && !this.saleDiscountSubscription.closed) {
      this.saleDiscountSubscription.unsubscribe();
    }
  }

  setGeneralSettings(data: GeneralSettings) {
    this.generalSettings.next(data);
  }

  getGeneralSettings() {
    return this.generalSettings$;
  }

  getCurrentLocation() {
    return this.currentLocation$;
  }

  getCurrentExchangeRate() {
    return this.currentExchangeRate$;
  }

  getGeneralSettingsFromDb() {
    const { dbGeneralSettings } = this.dbS;
    this.generalSettingsSubscription =  getDataFromDocument(dbGeneralSettings)
      .subscribe((data: GeneralSettings) => this.generalSettings.next(data));
  }

  setSaleDiscounts() {
    this.unsubscribeSaleDiscounts();
    this.saleDiscountSubscription = this.getSaleDiscountsFromDb().subscribe(sales => this.saleDiscounts.next(sales));
  }

  getSaleDiscounts() {
    return this.saleDiscounts$;
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

  getVoucherById(voucherId: string): Observable<VoucherInterface> {
    const { db, dbVouchersRoute } = this.dbS;
    const saleRef = db.collection(dbVouchersRoute).doc(voucherId);
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

  getCategoryByParentId(categoryId: string): Observable<CategoryInterface[]> {
    const products = this.dbS.queryCategories([{
      field: 'parentCategoryId',
      type: '==',
      value: categoryId
    }]);
    return getDataFromCollection(products);
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

  getShippingRateByShippingId(shippingId: string) {
    const shippingRate = this.dbS.queryShippingRate([
      { field: 'shippingId', type: '==', value: shippingId }
    ]);
    return getDataFromCollection(shippingRate) as Observable<ShippingRateInterface[]>;
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
    ], null, 1);
    return getDataFromCollection(orders) as Observable<OrderInterface[]>;
  }

  getSaleDiscountsFromDb(): Observable<SaleDiscountInterface[]> {
    const now = Date.now();
    const saleDiscounts = this.dbS.querySaleDiscounts([
      { field: 'status', type: '==', value: 'active' },
      { field: 'startDate', type: '<=', value: now },
      { field: 'startDate', type: '>', value: 0 }
    ]);
    return getDataFromCollection(saleDiscounts).pipe(
        map((data: SaleDiscountInterface[]) => data.filter(s => s.endDate < now))
      );
  }

  private getCurrentUser() {
    this.auth.getCurrentUserStream().subscribe(user => this.user = user);
  }

  private async getLocation() {
    try {
      const location = await (await fetch('https://freegeoip.app/json/')).json() as GeoIp;
      this.currentLocation.next(location);
      return location;
    } catch (err) {
      throw err;
    }
  }

  private async getExchangeRate(currency: string) {
    this.generalSettings.subscribe(async settings => {
      if (settings) {
        const baseCurrency = settings.currency;
        if (baseCurrency && baseCurrency !== currency) {
          try {
            const rate = await (await fetch(`https://api.exchangerate.host/latest?base=${baseCurrency}&symbols=${currency}`))
              .json() as ExchangeRate;
            this.currentExchangeRate.next(rate.rates[currency]);
            return rate;
          } catch (err) {
            throw err;
          }
        } else {
          this.currentExchangeRate.next(1);
          return 1;
        }
      }
    });
  }

}
