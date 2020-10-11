import { Condition } from './Common';

export interface ShippingInterface {
    shopId?: string;
    shippingId?: string;
    name?: string;
    countries?: string[];
    zipCode?: string[];
    priceBased?: Rate;
    weightBased?: Rate;
    warehouseId?: string[];
    taxId?: string;
}

type Rate = {
    name: string
    minValue?: number
    maxValue?: number
    price?: number
    noValueLimit?: boolean
    freeShipping?: boolean
} | null;

export type ShippingCondition = Condition & {
    field: ShippingFields
    parentFields?: (keyof ShippingFields)[]
};

type ShippingFields = keyof (ShippingInterface & Rate);
