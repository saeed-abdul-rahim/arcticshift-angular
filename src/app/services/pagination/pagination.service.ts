import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, Query } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { scan } from 'rxjs/internal/operators/scan';
import { tap } from 'rxjs/internal/operators/tap';
import { environment } from '@environment';
import { AuthService } from '@services/auth/auth.service';
import { User } from '@models/User';

interface QueryConfig {
  path: string; //  path to collection
  field: string; // field to orderBy
  limit: number; // limit per query
  reverse: boolean; // reverse order?
  prepend: boolean; // prepend to source?
}

@Injectable()
export class PaginationService {

  // tslint:disable-next-line: variable-name
  private _done = new BehaviorSubject(false);
  // tslint:disable-next-line: variable-name
  private _loading = new BehaviorSubject(false);
  // tslint:disable-next-line: variable-name
  private _data = new BehaviorSubject([]);

  private query: QueryConfig;

  colSubscriptions: Subscription[] = [];
  data: Observable<any>;
  done: Observable<boolean> = this._done.asObservable();
  loading: Observable<boolean> = this._loading.asObservable();
  where: any;
  dbPath: string;
  user: User;
  limit = 8;

  constructor(private afs: AngularFirestore, private auth: AuthService) {
    this.getCurrentUser();
    const { db } = environment;
    const { version, name } = db;
    this.dbPath = `${version}/${name}`;
  }

  onDestroy() {
    this.unsubscribe();
  }

  unsubscribe() {
    this.colSubscriptions.forEach(subs => {
      if (subs && !subs.closed) { subs.unsubscribe(); }
    });
  }

  init(path: string, field: string, where?: any, opts?: any) {
    this.data = null;
    this._data.next([]);
    this._done.next(false);
    this.unsubscribe();
    path = `${this.dbPath}/${path}`;
    this.query = {
      path,
      field,
      limit: this.limit,
      reverse: false,
      prepend: false,
      ...opts
    };

    const first = this.afs.collection(this.query.path, ref => {
      let newRef: Query = ref;
      if (where) {
        this.where = where;
        newRef = this.setWhere(newRef);
      }
      return newRef
              .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
              .limit(this.query.limit);
    });

    this.mapAndUpdate(first);

    this.data = this._data.asObservable().pipe(
        scan( (acc, val) => {
          return this.query.prepend ? val.concat(acc) : acc.concat(val);
        }));
  }

  more() {
    const cursor = this.getCursor();

    const more = this.afs.collection(this.query.path, ref => {
      let newRef: Query = ref;
      if (this.where) {
        this.where = this.where;
        newRef = this.setWhere(newRef);
      }
      return newRef
              .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
              .limit(this.query.limit)
              .startAfter(cursor);
    });
    this.mapAndUpdate(more);
  }

  setWhere(ref: Query) {
    const { shopId } = this.user;
    this.where = { shopId, ...this.where };
    Object.keys(this.where).forEach(c => {
      ref = ref.where(c, '==', this.where[c]);
    });
    return ref;
  }

  private getCursor() {
    const current = this._data.value;
    if (current.length) {
      return this.query.prepend ? current[0].doc : current[current.length - 1].doc;
    }
    return null;
  }

  private mapAndUpdate(col: AngularFirestoreCollection<any>) {

    if (this._done.value || this._loading.value) { return; }

    this._loading.next(true);

    const colSubscription = col.snapshotChanges()
    .pipe(
      tap(arr => {
        let values = arr.map(snap => {
          const data = snap.payload.doc.data();
          const doc = snap.payload.doc;
          const id = snap.payload.doc.id;
          return { id, ...data, doc };
        });

        values = this.query.prepend ? values.reverse() : values;

        this._data.next(values);
        this._loading.next(false);

        if (!values.length) {
          this._done.next(true);
        }
      })
    ).subscribe(() => {}, (err) => err);
    this.colSubscriptions.push(colSubscription);
    return colSubscription;
  }

  private getCurrentUser() {
    this.auth.getCurrentUserStream().subscribe((user: User) => this.user = user);
  }

}
