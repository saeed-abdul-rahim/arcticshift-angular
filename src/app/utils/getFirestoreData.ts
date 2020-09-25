import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export function getDataFromCollection(dbRef: any): Observable<any[]> {
    return dbRef.snapshotChanges().pipe(
      map((actions: Array<any>) => actions.map(a => {
        const { doc } = a.payload;
        const { id } = doc;
        const data = doc.data();
        return { ...data, id, doc };
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
