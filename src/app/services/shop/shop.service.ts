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

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  products$: Observable<ProductInterface[]>;
  collections$: Observable<CollectionInterface[]>;

  private db: AngularFirestoreDocument;
  private products: AngularFirestoreCollection;
  private collections: AngularFirestoreCollection;

  private dbProductsRoute: string;
  private dbCollectionsRoute: string;
  private dbCategoriesRoute: string;

  private user: User;

  constructor(private afs: AngularFirestore, private auth: AuthService) {
    const { db } = environment;
    const {
      version,
      name,
      products,
      categories,
      collections
    } = db;
    this.db = this.afs.collection(version).doc(name);
    this.dbProductsRoute = products;
    this.dbCategoriesRoute = categories;
    this.dbCollectionsRoute = collections;
    this.getCurrentUser();
  }

  getProductById(productId: string): Observable<ProductInterface> {
    const productRef =  this.db.collection(this.dbProductsRoute).doc(productId);
    return getDataFromDocument(productRef);
  }

  getAllProductsByShopId(shopId: string): Observable<ProductInterface[]> {
    this.products = this.queryProducts([{ field: 'shopId', type: '==', value: shopId }]);
    this.products$ = getDataFromCollection(this.products);
    return this.products$;
  }

  getAllCollectionsByShopId(shopId: string): Observable<CollectionInterface[]> {
    const collection = this.queryCollection([{ field: 'shopId', type: '==', value: shopId }]);
    this.collections$ = getDataFromCollection(collection);
    return this.collections$;
  }

  private getCurrentUser() {
    this.auth.getCurrentUserStream().subscribe((user: User) => this.user = user);
  }

  private queryCollection(conditions?: CollectionCondition[]) {
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
