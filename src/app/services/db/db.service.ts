import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, Query } from '@angular/fire/firestore';
import { Observable } from 'rxjs/internal/Observable';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { environment } from '@environment';
import { getDataFromCollection, getDataFromDocument } from '@utils/getFirestoreData';
import { leftJoin } from '@utils/leftJoin';
import {
  AttributeCondition,
  AttributeInterface,
  AttributeJoinInterface,
  AttributeOrderBy,
  AttributeValueCondition,
  AttributeValueOrderBy
} from '@models/Attribute';
import { CategoryCondition, CategoryOrderBy } from '@models/Category';
import { CollectionCondition, CollectionOrderBy } from '@models/Collection';
import { Condition, OrderBy } from '@models/Common';
import { ProductCondition, ProductOrderBy } from '@models/Product';
import { ProductTypeCondition, ProductTypeOrderBy } from '@models/ProductType';
import { ShippingCondition, ShippingOrderBy, ShippingRateCondition, ShippingRateOrderBy } from '@models/Shipping';
import { TaxCondition, TaxOrderBy } from '@models/Tax';
import { VariantCondition, VariantOrderBy } from '@models/Variant';
import { WarehouseCondition, WarehouseOrderBy } from '@models/Warehouse';
import { OrderCondition, OrderOrderBy } from '@models/Order';

@Injectable()
export class DbService {

  afs: AngularFirestore;
  db: AngularFirestoreDocument;
  dbGeneralSettings: AngularFirestoreDocument;
  dbPath: string;

  dbProductsRoute: string;
  dbVariantsRoute: string;
  dbProductTypesRoute: string;
  dbCollectionsRoute: string;
  dbCategoriesRoute: string;
  dbSalesRoute: string;
  dbVouchersRoute: string;
  dbAttributesRoute: string;
  dbAttributeValuesRoute: string;
  dbTaxesRoute: string;
  dbInventoriesRoute: string;
  dbWarehouseRoute: string;
  dbShippingRoute: string;
  dbShippingRatesRoute: string;
  dbOrdersRoute: string;

  dbAttributeValuesRoutePath: string;

  constructor(private firestore: AngularFirestore) {
    this.afs = this.firestore;
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
      inventories,
      warehouses,
      shippings,
      shippingRates,
      orders,
      settings,
      general
    } = db;

    this.db = this.afs.collection(version).doc(name);
    this.dbGeneralSettings = this.db.collection(settings).doc(general);
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
    this.dbWarehouseRoute = warehouses;
    this.dbShippingRoute = shippings;
    this.dbShippingRatesRoute = shippingRates;
    this.dbOrdersRoute = orders;
    this.dbInventoriesRoute = inventories;

    this.dbAttributeValuesRoutePath = `${this.dbPath}/${attributeValues}`;
  }

  getAttributeByIds(attributeIds: string[]): Observable<AttributeJoinInterface[]> {
    const { db, dbAttributesRoute } = this;
    const queries = attributeIds.map(id => {
      const attributeData = db.collection<AttributeInterface>(dbAttributesRoute).doc(id);
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

  joinAttributeValues(dbRef: any) {
    const { dbAttributeValuesRoutePath } = this;
    return getDataFromCollection(dbRef).pipe(
      leftJoin(this.afs, 'attributeId', dbAttributeValuesRoutePath)
    ) as Observable<AttributeJoinInterface[]>;
  }

  queryCategories(conditions?: CategoryCondition[], orderBy?: CategoryOrderBy, limit?: number) {
    const { db, dbCategoriesRoute } = this;
    return this.query(db, dbCategoriesRoute, conditions, orderBy, limit);
  }

  queryCollections(conditions?: CollectionCondition[], orderBy?: CollectionOrderBy, limit?: number) {
    const { db, dbCollectionsRoute } = this;
    return this.query(db, dbCollectionsRoute, conditions, orderBy, limit);
  }

  queryProducts(conditions?: ProductCondition[], orderBy?: ProductOrderBy, limit?: number) {
    const { db, dbProductsRoute } = this;
    return this.query(db, dbProductsRoute, conditions, orderBy, limit);
  }

  queryVariants(conditions?: VariantCondition[], orderBy?: VariantOrderBy, limit?: number) {
    const { db, dbVariantsRoute } = this;
    return this.query(db, dbVariantsRoute, conditions, orderBy, limit);
  }

  queryProductTypes(conditions?: ProductTypeCondition[], orderBy?: ProductTypeOrderBy, limit?: number) {
    const { db, dbProductTypesRoute } = this;
    return this.query(db, dbProductTypesRoute, conditions, orderBy, limit);
  }

  queryAttributes(conditions?: AttributeCondition[], orderBy?: AttributeOrderBy, limit?: number) {
    const { db, dbAttributesRoute } = this;
    return this.query(db, dbAttributesRoute, conditions, orderBy, limit);
  }

  queryAttributeValues(conditions?: AttributeValueCondition[], orderBy?: AttributeValueOrderBy, limit?: number) {
    const { db, dbAttributeValuesRoute } = this;
    return this.query(db, dbAttributeValuesRoute, conditions, orderBy, limit);
  }

  queryTax(conditions?: TaxCondition[], orderBy?: TaxOrderBy, limit?: number) {
    const { db, dbTaxesRoute } = this;
    return this.query(db, dbTaxesRoute, conditions, orderBy, limit);
  }

  queryWarehouse(conditions?: WarehouseCondition[], orderBy?: WarehouseOrderBy, limit?: number) {
    const { db, dbWarehouseRoute } = this;
    return this.query(db, dbWarehouseRoute, conditions, orderBy, limit);
  }

  queryShipping(conditions?: ShippingCondition[], orderBy?: ShippingOrderBy, limit?: number) {
    const { db, dbShippingRoute } = this;
    return this.query(db, dbShippingRoute, conditions, orderBy, limit);
  }

  queryShippingRate(conditions?: ShippingRateCondition[], orderBy?: ShippingRateOrderBy, limit?: number) {
    const { db, dbShippingRatesRoute } = this;
    return this.query(db, dbShippingRatesRoute, conditions, orderBy, limit);
  }

  queryOrders(conditions?: OrderCondition[], orderBy?: OrderOrderBy, limit?: number) {
    const { db, dbOrdersRoute } = this;
    return this.query(db, dbOrdersRoute, conditions, orderBy, limit);
  }

  queryByIds(collection: string, ids: string[]) {
    const { db } = this;
    const queries = ids.map(id => {
      const data = db.collection(collection).doc(id);
      return getDataFromDocument(data);
    });
    return combineLatest(queries);
  }

  query(db: AngularFirestoreDocument, dbRoute: string, conditions?: Condition[], orderBy?: OrderBy, limit?: number) {
    if (conditions && conditions.length > 0) {
      return this.setCondition(db, dbRoute, conditions, orderBy, limit);
    } else {
      return db.collection(dbRoute);
    }
  }

  setCondition(dbRef: AngularFirestoreDocument, collectionName: string, conditions: Condition[], orderBy?: OrderBy, limit?: number) {
    return dbRef.collection(collectionName, ref => {
        let newRef: Query = ref;
        conditions.forEach(condition => {
            const { field, type, value, parentFields } = condition;
            if (parentFields && parentFields.length > 0) {
                const whereField = `${parentFields.join('.')}.${field}`;
                newRef = ref.where(whereField, type, value);
            } else {
                newRef = ref.where(field, type, value);
            }
        });
        if (orderBy) {
          const { field, direction } = orderBy;
          newRef.orderBy(field, direction);
        }
        if (limit) {
          newRef.limit(limit);
        }
        return newRef;
    });
  }

}
