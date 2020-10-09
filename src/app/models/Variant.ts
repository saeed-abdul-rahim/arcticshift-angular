import { CommonInterface, Status, Condition, Content } from './Common';

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
    image?: Content[];
    productTypeId?: string;
    attributeId?: string[];
    attributeValueId?: string[];
    categoryId?: string;
    collectionId?: string[];
    prices?: Price[];
    price?: number;
    variantIds?: string[];
    status?: Status;
    like?: number;
    rating?: number;
    trackInventory?: boolean;
    warehouse?: WarehouseInventory[];
    quantity?: number;
    bookedQuantity?: number;
}

export type VariantCondition = Condition & {
    field: VariantFields
    parentFields?: (keyof VariantInterface)[]
};

type VariantFields = keyof (VariantInterface);

type Price = {
    name: string
    value: string
};

type WarehouseInventory = {
    warehouseId: string
    quantity: number
};
