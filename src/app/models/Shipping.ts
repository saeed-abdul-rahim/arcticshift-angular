import { Condition } from './Common';

export interface ShippingInterface {
    shopId?: string;
    shippingId?: string;
    name?: string;
    countries?: string[];
    zipCode?: string[];
    radius?: number;
    priceBased?: Rate[];
    weightBased?: Rate[];
    warehouseId?: string[];
    taxId?: string;
}

export type RateType = 'price' | 'weight';

export type Rate = {
    name: string
    minValue?: number
    maxValue?: number
    price?: number
    noValueLimit?: boolean
    freeShipping?: boolean
};

export type ShippingCondition = Condition & {
    field: ShippingFields
    parentFields?: (keyof ShippingFields)[]
};

type ShippingFields = keyof (ShippingInterface & Rate);
