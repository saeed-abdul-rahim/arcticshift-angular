import { AuthType, CommonInterface, OrderBy, Role } from './Common';
import { PaymentMethod } from './Payment';

type Gender = 'Male' | 'Female' | 'Transgender' | '';
export const genders: Gender[] = [ 'Male', 'Female', 'Transgender' ];

export interface User {
    uid: string;
    token: string;
    name: string;
    email: string;
    phone: string;
    expiry: number;
    shopId?: string;
    role?: Role;
    allClaims?: UserClaim[];
}

export interface UserClaim {
    shopId: string;
    role: Role;
}

export interface UserInterface extends AuthType, CommonInterface {
    id?: string;
    uid?: string;
    name?: string;
    email?: string;
    phone?: string;
    dob?: string;
    gender?: Gender;
    photoUrl?: string;
    online?: boolean;
    lastSeen?: number;
    shopId?: string[];
    shopInvite?: string[];
    access?: string[];
    users?: string[];
    paymentMethods?: PaymentMethod[];
    voucherId?: string[];
    orderId?: string[];
    billingAddress?: Address;
    shippingAddress?: Address;
    addressId?: string[];
    wishlist?: string[];
}

export type Address = {
    name?: string
    company?: string
    phone?: string
    email?: string
    line1?: string
    line2?: string
    city?: string
    zip?: string
    area?: string
    country?: string
} | null;

export type UserFields = keyof UserInterface;

export type UserOrderBy = OrderBy & {
    field: UserFields
};
