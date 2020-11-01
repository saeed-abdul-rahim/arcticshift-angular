import { Condition, Content, CommonInterface, OrderBy } from './Common';

export interface CollectionInterface extends CommonInterface {
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

export type CollectionOrderBy = OrderBy & {
    field: CollectionInterface
};
