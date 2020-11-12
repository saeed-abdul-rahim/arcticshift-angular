import { CommonInterface, Status, Condition, Content, ObjString, ObjNumber, Price, OrderBy } from './Common';

export interface VariantInterface extends CommonInterface {
    shopId?: string;
    productId?: string;
    variantId?: string;
    sku?: string;
    name?: string;
    productName?: string;
    description?: string;
    url?: string;
    images?: Content[];
    productTypeId?: string;
    attributes?: ObjString;
    prices?: Price[];
    price?: number;
    variantIds?: string[];
    status?: Status;
    like?: number;
    rating?: number;
    trackInventory?: boolean;
    warehouseQuantity?: ObjNumber;
    quantity?: number;
    bookedQuantity?: number;
}

export interface VariantSale extends VariantInterface {
    discountPrice: number;
}

export type VariantCondition = Condition & {
    field: string
    parentFields?: VariantFields[]
};

export type VariantFields = keyof VariantInterface;

export type VariantOrderBy = OrderBy & {
    field: VariantFields
};
