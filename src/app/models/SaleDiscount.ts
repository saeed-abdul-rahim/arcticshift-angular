import { Datetime, CommonInterface, ValueType } from './Common';

export interface SaleDiscountInterface extends CommonInterface {
    id?: string;
    shopId?: string;
    saleDiscountId?: string;
    name?: string;
    valueType?: ValueType;
    value?: number;
    categoryId?: string[];
    collectionId?: string[];
    productId?: string[];
    startDate?: Datetime | null;
    endDate?: Datetime | null;
}
