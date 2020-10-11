import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { Condition } from '@models/Common';
import { setCondition } from './setFirestoreCondition';

export function query(db: AngularFirestoreDocument, dbRoute: string, conditions?: Condition[]) {
    if (conditions && conditions.length > 0) {
      return setCondition(db, dbRoute, conditions);
    } else {
      return db.collection(dbRoute);
    }
}
