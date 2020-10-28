import { CommonInterface, ValueType, OrderBy } from './Common';

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
    startDate?: number;
    endDate?: number;
}

export type SaleDiscountFields = keyof SaleDiscountInterface;

export type SaleDiscountOrderBy = OrderBy & {
    field: SaleDiscountFields
};
