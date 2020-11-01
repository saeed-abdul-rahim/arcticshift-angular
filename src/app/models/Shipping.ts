import { CommonInterface, Condition, OrderBy } from './Common';

export type RateType = 'price' | 'weight';

export interface ShippingInterface extends CommonInterface {
    shopId?: string;
    shippingId?: string;
    name?: string;
    countries?: string[];
    zipCode?: string[];
    radius?: number;
    rates?: string[];
    warehouseId?: string[];
    taxId?: string;
}

export interface ShippingRateInterface extends CommonInterface {
    shippingId?: string;
    shippingRateId?: string;
    name?: string;
    type?: RateType;
    minValue?: number;
    maxValue?: number;
    price?: number;
    noValueLimit?: boolean;
    freeShipping?: boolean;
}

export type ShippingCondition = Condition & {
    field: ShippingFields
};
export type ShippingRateCondition = Condition & {
    field: ShippingRateFields
};

export type ShippingFields = keyof ShippingInterface;
export type ShippingRateFields = keyof ShippingRateInterface;

export type ShippingOrderBy = OrderBy & {
    field: ShippingFields
};
export type ShippingRateOrderBy = OrderBy & {
    field: ShippingRateFields
};
