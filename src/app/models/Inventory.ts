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
    parentFields?: (keyof InventoryInterface)[];
};

type InventoryFields = keyof (InventoryInterface & WarehouseInventory);

type WarehouseInventory = {
    warehouseId: string
    quantity: number
};
