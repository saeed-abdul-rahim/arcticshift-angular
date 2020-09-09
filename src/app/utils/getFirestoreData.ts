import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export function getDataFromCollection(dbRef: any): Observable<any[]> {
    return dbRef.snapshotChanges().pipe(
      map((actions: Array<any>) => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
}

export function getDataFromDocument(dbRef: any): Observable<any> {
    return dbRef.snapshotChanges().pipe(
        map((a: any) => {
            if (a.payload.exists) {
              const data = a.payload.data();
              const id = a.payload.id;
              data.id = id;
              return data;
          } else {
            return null;
          }
        })
    );
}
