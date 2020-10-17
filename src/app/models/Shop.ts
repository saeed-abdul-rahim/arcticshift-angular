import { AuthType, CommonInterface } from './Common';
import { Address } from './User';

export interface ShopInterface extends CommonInterface, AuthType {
    shopId?: string;
    name?: string;
    address?: Address | null;
    shopInvite?: string[];
    access?: string[];
    weightUnit?: string;
    taxId?: string;
    currency?: string;
}
