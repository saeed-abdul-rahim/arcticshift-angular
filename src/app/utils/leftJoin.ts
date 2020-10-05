import { AngularFirestore } from '@angular/fire/firestore';

import { combineLatest, of, defer } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { getDataFromCollection } from './getFirestoreData';

export const leftJoin = (
  afs: AngularFirestore,
  field,
  collection,
  limit = 100
) => {
  return source =>
    defer(() => {
      // Operator state
      let collectionData;

      // Track total num of joined doc reads
      let totalJoins = 0;

      return source.pipe(
        switchMap(data => {
          // Clear mapping on each emitted val ;

          // Save the parent data state
          collectionData = data as any[];

          const reads$ = [];
          for (const doc of collectionData) {
            // Push doc read to Array

            if (doc[field]) {
              // Perform query on join key, with optional limit
              const q = ref => ref.where(field, '==', doc[field]).limit(limit);
              const colRef = afs.collection(collection, q);
              reads$.push(getDataFromCollection(colRef));
            } else {
              reads$.push(of([]));
            }
          }

          return combineLatest(reads$);
        }),
        map(joins => {
          return collectionData.map((v, i) => {
            totalJoins += joins[i].length;
            return { ...v, [collection]: joins[i] || null };
          });
        }),
        tap(final => {
          console.log(
            `Queried ${(final as any).length}, Joined ${totalJoins} docs`
          );
          totalJoins = 0;
        })
      );
    });
};
