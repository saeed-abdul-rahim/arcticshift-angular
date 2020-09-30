import { Condition, Content, TimestampInterface } from './Common';

export interface CollectionInterface extends TimestampInterface {
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
    parentFields?: (keyof CollectionInterface)[]
};

type CollectionFields = keyof (CollectionInterface & Content);
