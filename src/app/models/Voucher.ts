import { CommonInterface, ValueType, OrderBy } from './Common';

export interface VoucherInterface extends CommonInterface {
    id?: string;
    shopId?: string;
    voucherId?: string;
    code?: string;
    valueType?: VoucherValueType;
    value?: number;
    entireOrder?: boolean;
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

type MinimumRequirement = {
    type: MinimumRequirementType
    value: number
} | null;
type VoucherValueType = ValueType | 'shipping';
type MinimumRequirementType = 'orderValue' | 'quantity';
