import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs/internal/Observable';

import { environment } from '@environment';
import { ProductCondition, ProductInterface } from '@models/Product';
import { getDataFromCollection, getDataFromDocument } from '@utils/getFirestoreData';
import { CollectionCondition, CollectionInterface } from '@models/Collection';
import { CategoryInterface } from '@models/Category';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { ProductTypeCondition, ProductTypeInterface } from '@models/ProductType';
import { AttributeCondition, AttributeInterface, AttributeJoinInterface, AttributeValueCondition, AttributeValueInterface } from '@models/Attribute';
import { leftJoin } from '@utils/leftJoin';
import { VoucherInterface } from '@models/Voucher';
import { TaxCondition, TaxInterface, TaxObjectType } from '@models/Tax';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { VariantCondition, VariantInterface } from '@models/Variant';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/operators';
import { query } from '@utils/query';
import { InventoryInterface } from '@models/Inventory';

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  products$: Observable<ProductInterface[]>;
  attributes$: Observable<AttributeInterface[]>;
  collections$: Observable<CollectionInterface[]>;
  categories$: Observable<CategoryInterface[]>;
  productTypes$: Observable<ProductTypeInterface[]>;
  productAttributesJoin$: Observable<AttributeJoinInterface[]>;

  private db: AngularFirestoreDocument;
  private dbPath: string;

  private dbProductsRoute: string;
  private dbVariantsRoute: string;
  private dbProductTypesRoute: string;
  private dbCollectionsRoute: string;
  private dbCategoriesRoute: string;
  private dbSalesRoute: string;
  private dbVouchersRoute: string;
  private dbAttributesRoute: string;
  private dbAttributeValuesRoute: string;
  private dbTaxesRoute: string;
  private dbInventoriesRoute: string;

  private dbAttributeValuesRoutePath: string;

  constructor(private afs: AngularFirestore) {
    const { db } = environment;
    const {
      version,
      name,
      products,
      variants,
      productTypes,
      categories,
      collections,
      vouchers,
      saleDiscounts,
      attributes,
      attributeValues,
      taxes,
      inventories
    } = db;

    this.db = this.afs.collection(version).doc(name);
    this.dbPath = `/${version}/${name}`;

    this.dbProductsRoute = products;
    this.dbVariantsRoute = variants;
    this.dbCategoriesRoute = categories;
    this.dbCollectionsRoute = collections;
    this.dbSalesRoute = saleDiscounts;
    this.dbAttributesRoute = attributes;
    this.dbAttributeValuesRoute = attributeValues;
    this.dbProductTypesRoute = productTypes;
    this.dbTaxesRoute = taxes;
    this.dbVouchersRoute = vouchers;
    this.dbInventoriesRoute = inventories;

    this.dbAttributeValuesRoutePath = `${this.dbPath}/${attributeValues}`;
  }

  getProductById(productId: string): Observable<ProductInterface> {
    const productRef = this.db.collection(this.dbProductsRoute).doc(productId);
    return getDataFromDocument(productRef);
  }

  getVariantById(variantId: string): Observable<VariantInterface> {
    const variantRef = this.db.collection(this.dbVariantsRoute).doc(variantId);
    return getDataFromDocument(variantRef);
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

  getAttributeValueById(attributeValueId: string): Observable<AttributeValueInterface> {
    const attributeValueRef = this.db.collection(this.dbAttributeValuesRoute).doc(attributeValueId);
    return getDataFromDocument(attributeValueRef);
  }

  getTaxesById(taxId: string): Observable<TaxInterface> {
    const taxRef = this.db.collection(this.dbTaxesRoute).doc(taxId);
    return getDataFromDocument(taxRef);
  }

  getInventoryById(inventoryId: string): Observable<InventoryInterface> {
    const inventoryRef = this.db.collection(this.dbInventoriesRoute).doc(inventoryId);
    return getDataFromDocument(inventoryRef);
  }

  getAttributeByIds(attributeIds: string[]): Observable<AttributeInterface[]> {
    const queries = attributeIds.map(id => {
      const attributeData = this.db.collection<AttributeInterface>(this.dbAttributesRoute).doc(id);
      return getDataFromDocument(attributeData) as Observable<AttributeInterface>;
    });
    return combineLatest(queries);
  }

  getAttributeAndValuesByIds(attributeIds: string[]): Observable<AttributeJoinInterface[]> {
    const queries = attributeIds.map(id => {
      const attributeData = this.db.collection<AttributeInterface>(this.dbAttributesRoute).doc(id);
      const attributeValueData = this.queryAttributeValues([{ field: 'attributeId', type: '==', value: id }]);
      return getDataFromDocument(attributeData).pipe(
          switchMap((attribute: AttributeJoinInterface) => {
            return getDataFromCollection(attributeValueData).pipe(
              map(attributeValues => {
                return { ...attribute, attributeValues };
              })
            );
          })
      ) as Observable<AttributeJoinInterface>;
    });
    return combineLatest(queries);
  }

  getProductsByShopId(shopId: string): Observable<ProductInterface[]> {
    const products = this.queryProducts([{ field: 'shopId', type: '==', value: shopId }]);
    this.products$ = getDataFromCollection(products);
    return this.products$;
  }

  getProductTypesByShopId(shopId: string): Observable<ProductTypeInterface[]> {
    const productTypes = this.queryProductTypes([{ field: 'shopId', type: '==', value: shopId }]);
    this.productTypes$ = getDataFromCollection(productTypes);
    return this.productTypes$;
  }

  getAttributesByShopId(shopId: string): Observable<AttributeInterface[]> {
    const attributes = this.queryAttributes([{ field: 'shopId', type: '==', value: shopId }]);
    this.attributes$ = getDataFromCollection(attributes);
    return this.attributes$;
  }

  getCategoriesByShopId(shopId: string): Observable<CategoryInterface[]> {
    const categories = this.queryCategories([{ field: 'shopId', type: '==', value: shopId }]);
    this.categories$ = getDataFromCollection(categories);
    return this.categories$;
  }

  getCollectionsByShopId(shopId: string): Observable<CollectionInterface[]> {
    const collection = this.queryCollections([{ field: 'shopId', type: '==', value: shopId }]);
    this.collections$ = getDataFromCollection(collection);
    return this.collections$;
  }

  getAttributeValuesByAttributeId(attributeId: string): Observable<AttributeValueInterface[]> {
    const attributeValueRef = this.queryAttributeValues([{ field: 'attributeId', type: '==', value: attributeId }]);
    return getDataFromCollection(attributeValueRef);
  }

  getVariantsByProductId(productId: string): Observable<VariantInterface[]> {
    const variantsRef = this.queryVariants([{ field: 'productId', type: '==', value: productId }]);
    return getDataFromCollection(variantsRef);
  }

  getTaxesByShopIdAndType(shopId: string, type: TaxObjectType) {
    const taxes = this.queryTax([
      { field: 'shopId', type: '==', value: shopId },
      { field: 'type', type: '==', value: type }
    ]);
    return getDataFromCollection(taxes);
  }

  getAttributesByProductTypeId(productTypeId: string): Observable<AttributeJoinInterface[]> {
    const attributes = this.queryAttributes([
      { field: 'productTypeId', type: 'array-contains', value: productTypeId }
    ]);
    return this.getJoinedAttributes(attributes);
  }

  getJoinedAttributes(dbRef: any): Observable<AttributeJoinInterface[]> {
    return getDataFromCollection(dbRef).pipe(
      leftJoin(this.afs, 'attributeId', this.dbAttributeValuesRoutePath)
    ) as Observable<AttributeJoinInterface[]>;
  }

  private queryCategories(conditions?: CollectionCondition[]) {
    const { db, dbCategoriesRoute } = this;
    return query(db, dbCategoriesRoute, conditions);
  }

  private queryCollections(conditions?: CollectionCondition[]) {
    const { db, dbCollectionsRoute } = this;
    return query(db, dbCollectionsRoute, conditions);
  }

  private queryProducts(conditions?: ProductCondition[]) {
    const { db, dbProductsRoute } = this;
    return query(db, dbProductsRoute, conditions);
  }

  private queryVariants(conditions?: VariantCondition[]) {
    const { db, dbVariantsRoute } = this;
    return query(db, dbVariantsRoute, conditions);
  }

  private queryProductTypes(conditions?: ProductTypeCondition[]) {
    const { db, dbProductTypesRoute } = this;
    return query(db, dbProductTypesRoute, conditions);
  }

  private queryAttributes(conditions?: AttributeCondition[]) {
    const { db, dbAttributesRoute } = this;
    return query(db, dbAttributesRoute, conditions);
  }

  private queryAttributeValues(conditions?: AttributeValueCondition[]) {
    const { db, dbAttributeValuesRoute } = this;
    return query(db, dbAttributeValuesRoute, conditions);
  }

  private queryTax(conditions?: TaxCondition[]) {
    const { db, dbTaxesRoute } = this;
    return query(db, dbTaxesRoute, conditions);
  }

}
