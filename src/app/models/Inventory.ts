import { CommonInterface, Condition } from './Common';

export interface InventoryInterface extends CommonInterface {
    id?: string;
    shopId?: string;
    variantId?: string;
    warehouse?: WarehouseInventory[];
    totalWarehouseQuantity?: number;
    bookedQuantity?: number;
}

export type InventoryCondition = Condition & {
    field: InventoryFields;
    parentFields?: InventoryFields[];
};

export type InventoryFields = keyof InventoryInterface;

type WarehouseInventory = {
    warehouseId: string
    quantity: number
};
