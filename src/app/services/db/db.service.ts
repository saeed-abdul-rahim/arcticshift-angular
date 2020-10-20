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
  AttributeFields,
  AttributeInterface,
  AttributeJoinInterface,
  AttributeValueCondition,
  AttributeValueFields
} from '@models/Attribute';
import { CategoryCondition, CategoryFields } from '@models/Category';
import { CollectionCondition, CollectionFields } from '@models/Collection';
import { Condition } from '@models/Common';
import { ProductCondition, ProductFields } from '@models/Product';
import { ProductTypeCondition, ProductTypeFields } from '@models/ProductType';
import { ShippingCondition, ShippingFields } from '@models/Shipping';
import { TaxCondition, TaxFields } from '@models/Tax';
import { VariantCondition, VariantFields } from '@models/Variant';
import { WarehouseCondition, WarehouseFields } from '@models/Warehouse';

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
      settings,
      general
    } = db;

    this.db = this.afs.collection(version).doc(name);
    this.dbGeneralSettings = this.db.collection(settings).doc(general);
    this.dbPath = `/${version}/${name}`;

    this.dbWarehouseRoute = warehouses;
    this.dbShippingRoute = shippings;

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

  queryCategories(conditions?: CategoryCondition[], orderBy?: CategoryFields) {
    const { db, dbCategoriesRoute } = this;
    return this.query(db, dbCategoriesRoute, conditions, orderBy);
  }

  queryCollections(conditions?: CollectionCondition[], orderBy?: CollectionFields) {
    const { db, dbCollectionsRoute } = this;
    return this.query(db, dbCollectionsRoute, conditions, orderBy);
  }

  queryProducts(conditions?: ProductCondition[], orderBy?: ProductFields) {
    const { db, dbProductsRoute } = this;
    return this.query(db, dbProductsRoute, conditions, orderBy);
  }

  queryVariants(conditions?: VariantCondition[], orderBy?: VariantFields) {
    const { db, dbVariantsRoute } = this;
    return this.query(db, dbVariantsRoute, conditions, orderBy);
  }

  queryProductTypes(conditions?: ProductTypeCondition[], orderBy?: ProductTypeFields) {
    const { db, dbProductTypesRoute } = this;
    return this.query(db, dbProductTypesRoute, conditions, orderBy);
  }

  queryAttributes(conditions?: AttributeCondition[], orderBy?: AttributeFields) {
    const { db, dbAttributesRoute } = this;
    return this.query(db, dbAttributesRoute, conditions, orderBy);
  }

  queryAttributeValues(conditions?: AttributeValueCondition[], orderBy?: AttributeValueFields) {
    const { db, dbAttributeValuesRoute } = this;
    return this.query(db, dbAttributeValuesRoute, conditions, orderBy);
  }

  queryTax(conditions?: TaxCondition[], orderBy?: TaxFields) {
    const { db, dbTaxesRoute } = this;
    return this.query(db, dbTaxesRoute, conditions, orderBy);
  }

  queryWarehouse(conditions?: WarehouseCondition[], orderBy?: WarehouseFields) {
    const { db, dbWarehouseRoute } = this;
    return this.query(db, dbWarehouseRoute, conditions, orderBy);
  }

  queryShipping(conditions?: ShippingCondition[], orderBy?: ShippingFields) {
    const { db, dbShippingRoute } = this;
    return this.query(db, dbShippingRoute, conditions, orderBy);
  }

  query(db: AngularFirestoreDocument, dbRoute: string, conditions?: Condition[], orderBy?: string) {
    if (conditions && conditions.length > 0) {
      return this.setCondition(db, dbRoute, conditions, orderBy);
    } else {
      return db.collection(dbRoute);
    }
  }

  setCondition(dbRef: AngularFirestoreDocument, collectionName: string, conditions: Condition[], orderBy?: string) {
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
          return newRef.orderBy(orderBy);
        } else {
          return newRef;
        }
    });
  }

}
