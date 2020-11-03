import { CommonInterface, ValueType, OrderBy } from './Common';

export type VoucherValueType = ValueType | 'shipping';
export type MinimumRequirementType = 'orderValue' | 'quantity';
export type OrderType = 'entireOrder' | 'specificProducts';

export type MinimumRequirement = {
    type: MinimumRequirementType
    value: number
} | null;

export interface VoucherInterface extends CommonInterface {
    shopId?: string;
    voucherId?: string;
    code?: string;
    valueType?: VoucherValueType;
    orderType?: OrderType;
    value?: number;
    oncePerOrder?: boolean;
    categoryId?: string[];
    collectionId?: string[];
    productId?: string[];
    minimumRequirement?: MinimumRequirement;
    totalUsage?: number;
    onePerUser?: boolean;
    startDate?: number;
    endDate?: number;
}

export type VoucherFields = keyof VoucherInterface;

export type VoucherOrderBy = OrderBy & {
    field: VoucherFields
};
