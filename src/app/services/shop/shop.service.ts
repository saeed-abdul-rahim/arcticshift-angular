import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs/internal/Observable';

import { environment } from '@environment';
import { AuthService } from '@services/auth/auth.service';
import { User } from '@models/User';
import { ProductCondition, ProductInterface } from '@models/Product';
import { getDataFromCollection, getDataFromDocument } from '@utils/getFirestoreData';
import { setCondition } from '@utils/setFirestoreCondition';
import { Condition } from '@models/Common';
import { CollectionCondition, CollectionInterface } from '@models/Collection';
import { CategoryInterface } from '@models/Category';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { ProductTypeInterface } from '@models/ProductType';

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  products$: Observable<ProductInterface[]>;
  collections$: Observable<CollectionInterface[]>;
  categories$: Observable<CategoryInterface[]>;

  private db: AngularFirestoreDocument;

  private dbProductsRoute: string;
  private dbProductTypesRoute: string;
  private dbCollectionsRoute: string;
  private dbCategoriesRoute: string;
  private dbSalesRoute: string;
  private dbVouchersRoute: string;
  private dbAttributesRoute: string;

  private user: User;

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
      attributes
    } = db;
    this.db = this.afs.collection(version).doc(name);
    this.dbProductsRoute = products;
    this.dbCategoriesRoute = categories;
    this.dbCollectionsRoute = collections;
    this.dbSalesRoute = saleDiscounts;
    this.dbAttributesRoute = attributes;
    this.dbProductTypesRoute = productTypes;
    this.dbVouchersRoute = vouchers;
    this.getCurrentUser();
  }

  getProductById(productId: string): Observable<ProductInterface> {
    const productRef =  this.db.collection(this.dbProductsRoute).doc(productId);
    return getDataFromDocument(productRef);
  }

  getProductTypeById(productTypeId: string): Observable<ProductTypeInterface> {
    const productTypeRef =  this.db.collection(this.dbProductTypesRoute).doc(productTypeId);
    return getDataFromDocument(productTypeRef);
  }

  getCollectionById(collectionId: string): Observable<CollectionInterface> {
    const collectionRef =  this.db.collection(this.dbCollectionsRoute).doc(collectionId);
    return getDataFromDocument(collectionRef);
  }

  getCategoryById(categoryId: string): Observable<CategoryInterface> {
    const categoryRef =  this.db.collection(this.dbCategoriesRoute).doc(categoryId);
    return getDataFromDocument(categoryRef);
  }

  getSaleById(saleId: string): Observable<SaleDiscountInterface> {
    const saleRef =  this.db.collection(this.dbSalesRoute).doc(saleId);
    return getDataFromDocument(saleRef);
  }

  getVoucherById(saleId: string): Observable<SaleDiscountInterface> {
    const saleRef =  this.db.collection(this.dbVouchersRoute).doc(saleId);
    return getDataFromDocument(saleRef);
  }

  getAttributeById(attributeId: string): Observable<SaleDiscountInterface> {
    const attributeRef =  this.db.collection(this.dbAttributesRoute).doc(attributeId);
    return getDataFromDocument(attributeRef);
  }

  getAllProductsByShopId(shopId: string): Observable<ProductInterface[]> {
    const products = this.queryProducts([{ field: 'shopId', type: '==', value: shopId }]);
    this.products$ = getDataFromCollection(products);
    return this.products$;
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

  private getCurrentUser() {
    this.auth.getCurrentUserStream().subscribe((user: User) => this.user = user);
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

  private query(dbRoute: string, conditions?: Condition[]) {
    const { db } = this;
    if (conditions && conditions.length > 0) {
      return setCondition(db, dbRoute, conditions);
    } else {
      return db.collection(dbRoute);
    }
  }

}
