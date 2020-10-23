import { Condition, OrderBy, ValueType } from './Common';

export type TaxObjectType = 'shop' | 'shipping' | 'product';
export const taxTypes: {
    id: TaxObjectType,
    label: string
}[] = [
    { id: 'shop', label: 'Global'},
    { id: 'product', label: 'Product'},
    { id: 'shipping', label: 'Shipping'},
];

export interface TaxInterface {
    shopId?: string;
    taxId?: string;
    name?: string;
    value?: number;
    valueType?: ValueType;
    type?: TaxObjectType;
}

export type TaxCondition = Condition & {
    field: TaxFields
    parentFields?: TaxFields[]
};

export type TaxFields = keyof TaxInterface;

export type TaxOrderBy = OrderBy & {
    field: TaxFields
};
