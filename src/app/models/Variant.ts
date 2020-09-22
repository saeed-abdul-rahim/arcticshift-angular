import { TimestampInterface, Status, ContentStorage, AttributeValue } from './Common';

export interface VariantInterface extends TimestampInterface {
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
    image?: ContentStorage | null;
    thumbnailUrls?: Thumbnail[];
    productTypeId?: string;
    attribute?: AttributeValue;
    attributeValue?: AttributeValue;
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

type Price = {
    name: string
    value: string
};

type Thumbnail = {
    size: string
    image: ContentStorage | null
};

type WarehouseInventory = {
    warehouseId: string
    quantity: number
};
