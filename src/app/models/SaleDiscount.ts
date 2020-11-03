import { CommonInterface, ValueType, OrderBy, Condition } from './Common';

export interface SaleDiscountInterface extends CommonInterface {
    shopId?: string;
    saleDiscountId?: string;
    name?: string;
    valueType?: ValueType;
    value?: number;
    categoryId?: string[];
    collectionId?: string[];
    productId?: string[];
    startDate?: number;
    endDate?: number;
}

export type SaleDiscountCondition = Condition & {
    field: SaleDiscountFields
};

export type SaleDiscountFields = keyof SaleDiscountInterface;

export type SaleDiscountOrderBy = OrderBy & {
    field: SaleDiscountFields
};
