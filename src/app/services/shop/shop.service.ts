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

@Injectable()
export class ShopService {

  products$: Observable<ProductInterface[]>;
  attributes$: Observable<AttributeInterface[]>;
  collections$: Observable<CollectionInterface[]>;
  categories$: Observable<CategoryInterface[]>;
  productTypes$: Observable<ProductTypeInterface[]>;
  productAttributesJoin$: Observable<AttributeJoinInterface[]>;

  constructor(private dbS: DbService) {}

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

  getProductsByShopId(shopId: string): Observable<ProductInterface[]> {
    const products = this.dbS.queryProducts([{ field: 'shopId', type: '==', value: shopId }]);
    this.products$ = getDataFromCollection(products);
    return this.products$;
  }

  getProductTypesByShopId(shopId: string): Observable<ProductTypeInterface[]> {
    const productTypes = this.dbS.queryProductTypes([{ field: 'shopId', type: '==', value: shopId }]);
    this.productTypes$ = getDataFromCollection(productTypes);
    return this.productTypes$;
  }

  getAttributesByShopId(shopId: string): Observable<AttributeInterface[]> {
    const attributes = this.dbS.queryAttributes([{ field: 'shopId', type: '==', value: shopId }]);
    this.attributes$ = getDataFromCollection(attributes);
    return this.attributes$;
  }

  getCategoriesByShopId(shopId: string): Observable<CategoryInterface[]> {
    const categories = this.dbS.queryCategories([{ field: 'shopId', type: '==', value: shopId }]);
    this.categories$ = getDataFromCollection(categories);
    return this.categories$;
  }

  getCollectionsByShopId(shopId: string): Observable<CollectionInterface[]> {
    const collection = this.dbS.queryCollections([{ field: 'shopId', type: '==', value: shopId }]);
    this.collections$ = getDataFromCollection(collection);
    return this.collections$;
  }

  getAttributeValuesByAttributeId(attributeId: string): Observable<AttributeValueInterface[]> {
    const attributeValueRef = this.dbS.queryAttributeValues([{ field: 'attributeId', type: '==', value: attributeId }]);
    return getDataFromCollection(attributeValueRef);
  }

  getVariantsByProductId(productId: string): Observable<VariantInterface[]> {
    const variantsRef = this.dbS.queryVariants([{ field: 'productId', type: '==', value: productId }]);
    return getDataFromCollection(variantsRef);
  }

  getTaxesByShopIdAndType(shopId: string, type: TaxObjectType) {
    const taxes = this.dbS.queryTax([
      { field: 'shopId', type: '==', value: shopId },
      { field: 'type', type: '==', value: type }
    ]);
    return getDataFromCollection(taxes);
  }

  getAttributesByProductTypeId(productTypeId: string): Observable<AttributeJoinInterface[]> {
    const attributes = this.dbS.queryAttributes([
      { field: 'productTypeId', type: 'array-contains', value: productTypeId }
    ]);
    return this.dbS.joinAttributeValues(attributes);
  }

}
