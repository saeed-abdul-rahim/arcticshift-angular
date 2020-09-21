import { AngularFirestoreDocument, Query } from '@angular/fire/firestore';

export type Condition = {
    field: string | firebase.firestore.FieldPath,
    type: firebase.firestore.WhereFilterOp,
    value: any
    parentFields?: string[]
};

export function setCondition(dbRef: AngularFirestoreDocument, collectionName: string, conditions: Condition[]) {
    return dbRef.collection(collectionName, ref => {
        let newRef: Query = ref;
        conditions.forEach(condition => {
            const { field, type, value, parentFields } = condition;
            if (parentFields && parentFields.length > 0) {
                const whereField = parentFields.join('.') + field;
                newRef = ref.where(whereField, type, value);
            } else {
                newRef = ref.where(field, type, value);
            }
        });
        return newRef;
    });
}
