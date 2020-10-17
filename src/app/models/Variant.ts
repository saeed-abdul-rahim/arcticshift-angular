import { CommonInterface, Status, Condition, Content, ObjString, ObjNumber, Price } from './Common';

export interface VariantInterface extends CommonInterface {
    id?: string;
    shopId?: string;
    productId?: string;
    variantId?: string;
    sku?: string;
    name?: string;
    size?: string;
    description?: string;
    keywords?: string[];
    url?: string;
    images?: Content[];
    productTypeId?: string;
    attributeId?: string[];
    attributeValueId?: string[];
    attributes?: ObjString;
    categoryId?: string;
    collectionId?: string[];
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

export type VariantCondition = Condition & {
    field: VariantFields
    parentFields?: (keyof VariantInterface)[]
};

type VariantFields = keyof (VariantInterface) | string;
