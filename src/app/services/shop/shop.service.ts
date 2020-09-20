import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs/internal/Observable';

import { environment } from '@environment';
import { AuthService } from '@services/auth/auth.service';
import { User } from '@models/User';
import { ProductInterface } from '@models/Product';
import { getDataFromCollection } from '@utils/getFirestoreData';

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  products$: Observable<ProductInterface[]>;

  private db: AngularFirestoreDocument;
  private products: AngularFirestoreCollection;

  private dbProductsRoute: string;

  private user: User;

  constructor(private afs: AngularFirestore, private auth: AuthService) {
    const { db } = environment;
    const { version, name, products } = db;
    this.db = this.afs.collection(version).doc(name);
    this.dbProductsRoute = products;
    this.getCurrentUser();
  }

  getAllProductsByShopId(shopId: string): Observable<ProductInterface[]> {
    this.products = this.db.collection(this.dbProductsRoute, ref => ref.where('shopId', '==', shopId));
    this.products$ = getDataFromCollection(this.products);
    return this.products$;
  }

  private getCurrentUser() {
    this.auth.getCurrentUserStream().subscribe((user: User) => this.user = user);
  }

}
