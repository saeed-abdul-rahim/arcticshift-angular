import { Condition, Content, CommonInterface } from './Common';

export interface CollectionInterface extends CommonInterface {
    id?: string;
    shopId?: string;
    collectionId?: string;
    name?: string;
    description?: string;
    images?: Content[];
    productId?: string[];
    featureOnHomePage?: boolean;
    hidden?: boolean;
    saleDiscountId?: string;
    voucherId?: string;
}

export type CollectionCondition = Condition & {
    field: CollectionFields
    parentFields?: CollectionFields[]
};

export type CollectionFields = keyof CollectionInterface;
