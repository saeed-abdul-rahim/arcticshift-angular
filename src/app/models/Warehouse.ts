import { CommonInterface, Condition } from './Common';
import { Address } from './User';

export interface WarehouseInterface extends CommonInterface {
    shopId?: string;
    warehouseId?: string;
    name?: string;
    address?: Address | null;
    shippingId?: string;
}

export type WarehouseCondition = Condition & {
    field: WarehouseFields
    parentFields?: (keyof WarehouseInterface)[]
};

type WarehouseFields = keyof (WarehouseInterface & Address);
