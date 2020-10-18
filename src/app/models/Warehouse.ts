import { CommonInterface, Condition, Point } from './Common';
import { Address } from './User';

export interface WarehouseInterface extends CommonInterface {
    id?: string;
    shopId?: string;
    warehouseId?: string;
    name?: string;
    address?: Address | null;
    shippingId?: string;
    pointLocation?: Point | null;
}

export type WarehouseCondition = Condition & {
    field: AllWarehouseFields
    parentFields?: WarehouseFields[]
};

export type WarehouseFields = keyof WarehouseInterface;

type AllWarehouseFields = keyof (WarehouseInterface & Address & Point);
