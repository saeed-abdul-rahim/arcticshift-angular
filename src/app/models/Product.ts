import { TimestampInterface, Status, ContentStorage, Tax } from './Common';

export interface ProductInterface extends TimestampInterface {
    shopId?: string;
    productId?: string;
    name?: string;
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
    tax?: Tax | null;
    variantId?: string[];
    saleDiscountId?: string;
    voucherId?: string;
    status?: Status;
    like?: number;
    rating?: number;
}

type Price = {
    name: string
    value: string
};

type AttributeValue = {
    [key: string]: boolean
} | null;

type Thumbnail = {
    size: string
    image: ContentStorage | null
};
