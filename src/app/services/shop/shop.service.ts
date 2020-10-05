import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs/internal/Observable';

import { environment } from '@environment';
import { AuthService } from '@services/auth/auth.service';
import { ProductCondition, ProductInterface } from '@models/Product';
import { getDataFromCollection, getDataFromDocument } from '@utils/getFirestoreData';
import { setCondition } from '@utils/setFirestoreCondition';
import { Condition } from '@models/Common';
import { CollectionCondition, CollectionInterface } from '@models/Collection';
import { CategoryInterface } from '@models/Category';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { ProductTypeCondition, ProductTypeInterface } from '@models/ProductType';
import { AttributeCondition, AttributeInterface, AttributeJoinInterface, AttributeValueCondition } from '@models/Attribute';
import { leftJoin } from '@utils/leftJoin';
import { VoucherInterface } from '@models/Voucher';

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  products$: Observable<ProductInterface[]>;
  collections$: Observable<CollectionInterface[]>;
  categories$: Observable<CategoryInterface[]>;
  productTypes$: Observable<ProductTypeInterface[]>;
  productAttributesJoin$: Observable<AttributeJoinInterface[]>;

  private db: AngularFirestoreDocument;
  private dbPath: string;

  private dbProductsRoute: string;
  private dbProductTypesRoute: string;
  private dbCollectionsRoute: string;
  private dbCategoriesRoute: string;
  private dbSalesRoute: string;
  private dbVouchersRoute: string;
  private dbAttributesRoute: string;
  private dbAttributeValuesRoute: string;

  private dbAttributeValuesRoutePath: string;

  constructor(private afs: AngularFirestore, private auth: AuthService) {
    const { db } = environment;
    const {
      version,
      name,
      products,
      productTypes,
      categories,
      collections,
      vouchers,
      saleDiscounts,
      attributes,
      attributeValues
    } = db;

    this.db = this.afs.collection(version).doc(name);
    this.dbPath = `/${version}/${name}`;

    this.dbProductsRoute = products;
    this.dbCategoriesRoute = categories;
    this.dbCollectionsRoute = collections;
    this.dbSalesRoute = saleDiscounts;
    this.dbAttributesRoute = attributes;
    this.dbAttributeValuesRoute = attributeValues;
    this.dbProductTypesRoute = productTypes;
    this.dbVouchersRoute = vouchers;

    this.dbAttributeValuesRoutePath = `${this.dbPath}/${attributeValues}`;
  }

  getProductById(productId: string): Observable<ProductInterface> {
    const productRef = this.db.collection(this.dbProductsRoute).doc(productId);
    return getDataFromDocument(productRef);
  }

  getProductTypeById(productTypeId: string): Observable<ProductTypeInterface> {
    const productTypeRef = this.db.collection(this.dbProductTypesRoute).doc(productTypeId);
    return getDataFromDocument(productTypeRef);
  }

  getCollectionById(collectionId: string): Observable<CollectionInterface> {
    const collectionRef = this.db.collection(this.dbCollectionsRoute).doc(collectionId);
    return getDataFromDocument(collectionRef);
  }

  getCategoryById(categoryId: string): Observable<CategoryInterface> {
    const categoryRef = this.db.collection(this.dbCategoriesRoute).doc(categoryId);
    return getDataFromDocument(categoryRef);
  }

  getSaleById(saleId: string): Observable<SaleDiscountInterface> {
    const saleRef = this.db.collection(this.dbSalesRoute).doc(saleId);
    return getDataFromDocument(saleRef);
  }

  getVoucherById(saleId: string): Observable<VoucherInterface> {
    const saleRef = this.db.collection(this.dbVouchersRoute).doc(saleId);
    return getDataFromDocument(saleRef);
  }

  getAttributeById(attributeId: string): Observable<AttributeInterface> {
    const attributeRef = this.db.collection(this.dbAttributesRoute).doc(attributeId);
    return getDataFromDocument(attributeRef);
  }

  getAllProductsByShopId(shopId: string): Observable<ProductInterface[]> {
    const products = this.queryProducts([{ field: 'shopId', type: '==', value: shopId }]);
    this.products$ = getDataFromCollection(products);
    return this.products$;
  }

  getAllProductTypesByShopId(shopId: string): Observable<ProductTypeInterface[]> {
    const productTypes = this.queryProductTypes([{ field: 'shopId', type: '==', value: shopId }]);
    this.productTypes$ = getDataFromCollection(productTypes);
    return this.productTypes$;
  }

  getAllAttributesByShopIdAndProductTypeId(shopId: string, productTypeId: string): Observable<AttributeJoinInterface[]> {
    const attributes = this.queryAttributes([
      { field: 'shopId', type: '==', value: shopId },
      { field: 'productTypeId', type: '==', value: productTypeId }
    ]);
    this.productAttributesJoin$ = getDataFromCollection(attributes).pipe(
      leftJoin(this.afs, 'attributeId', this.dbAttributeValuesRoutePath)
    ) as Observable<AttributeJoinInterface[]>;
    return this.productAttributesJoin$;
  }

  getAllCategoriesByShopId(shopId: string): Observable<CategoryInterface[]> {
    const categories = this.queryCategories([{ field: 'shopId', type: '==', value: shopId }]);
    this.categories$ = getDataFromCollection(categories);
    return this.categories$;
  }

  getAllCollectionsByShopId(shopId: string): Observable<CollectionInterface[]> {
    const collection = this.queryCollections([{ field: 'shopId', type: '==', value: shopId }]);
    this.collections$ = getDataFromCollection(collection);
    return this.collections$;
  }

  private queryCategories(conditions?: CollectionCondition[]) {
    const { dbCategoriesRoute } = this;
    return this.query(dbCategoriesRoute, conditions);
  }

  private queryCollections(conditions?: CollectionCondition[]) {
    const { dbCollectionsRoute } = this;
    return this.query(dbCollectionsRoute, conditions);
  }

  private queryProducts(conditions?: ProductCondition[]) {
    const { dbProductsRoute } = this;
    return this.query(dbProductsRoute, conditions);
  }

  private queryProductTypes(conditions?: ProductTypeCondition[]) {
    const { dbProductTypesRoute } = this;
    return this.query(dbProductTypesRoute, conditions);
  }

  private queryAttributes(conditions?: AttributeCondition[]) {
    const { dbAttributesRoute } = this;
    return this.query(dbAttributesRoute, conditions);
  }

  private queryAttributeValues(conditions?: AttributeValueCondition[]) {
    const { dbAttributeValuesRoute } = this;
    return this.query(dbAttributeValuesRoute, conditions);
  }

  private query(dbRoute: string, conditions?: Condition[]) {
    const { db } = this;
    if (conditions && conditions.length > 0) {
      return setCondition(db, dbRoute, conditions);
    } else {
      return db.collection(dbRoute);
    }
  }

}
