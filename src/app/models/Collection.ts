import { ContentStorage, TimestampInterface } from './Common';

export interface CollectionInterface extends TimestampInterface {
    shopId?: string;
    collectionId?: string;
    name?: string;
    description?: string;
    images?: ContentStorage[];
    productId?: string[];
    featureOnHomePage?: boolean;
    hidden?: boolean;
    saleDiscountId?: string;
    voucherId?: string;
}
