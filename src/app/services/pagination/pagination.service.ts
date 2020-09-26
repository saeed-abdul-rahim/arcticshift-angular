import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, Query } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { tap } from 'rxjs/internal/operators/tap';
import { scan } from 'rxjs/internal/operators/scan';
import { environment } from '@environment';
import { Condition, QueryConfig } from '@models/Common';

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
  where: Condition[];
  dbPath: string;
  limit = 10;

  constructor(private afs: AngularFirestore) {
    const { db } = environment;
    const { version, name } = db;
    this.dbPath = `${version}/${name}`;
  }

  destroy() {
    this.unsubscribe();
  }

  unsubscribe() {
    this.colSubscriptions.forEach(subs => {
      if (subs && !subs.closed) { subs.unsubscribe(); }
    });
  }

  init(path: string, opts?: QueryConfig) {
    this.data = null;
    this._data.next([]);
    this._done.next(false);
    this.unsubscribe();
    path = `${this.dbPath}/${path}`;
    this.query = {
      path,
      limit: this.limit,
      ...opts
    };

    const first = this.afs.collection(this.query.path, ref => {
      let newRef: Query = ref;
      if (this.query.where) {
        this.where = this.query.where;
        newRef = this.setWhere(newRef);
      }
      return newRef
              .orderBy(this.query.orderBy, this.query.reverse ? 'desc' : 'asc')
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
              .orderBy(this.query.orderBy, this.query.reverse ? 'desc' : 'asc')
              .limit(this.query.limit)
              .startAfter(cursor);
    });
    this.mapAndUpdate(more);
  }

  setWhere(ref: Query) {
    this.where.forEach(condition => {
      const { field, type, value } = condition;
      ref = ref.where(field, type, value);
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
          return { ...data, id, doc };
        });

        values = this.query.prepend ? values.reverse() : values;

        this._data.next(values);
        this._loading.next(false);

        if (!values.length) {
          this._done.next(true);
        }
      })
    ).subscribe(() => {}, (err) => console.log(err));
    this.colSubscriptions.push(colSubscription);
    return colSubscription;
  }

}
