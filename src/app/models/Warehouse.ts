import { CommonInterface } from './Common';
import { Address } from './User';

export interface WarehouseInterface extends CommonInterface {
    shopId?: string;
    warehouseId?: string;
    name?: string;
    address?: Address | null;
    shippingId?: string;
}
