import { TimestampInterface, Status, ContentStorage } from './Common';

export interface ProductInterface extends TimestampInterface {
    shopId?: string;
    productId?: string;
    sku?: string;
    name?: string;
    description?: string;
    keywords?: string[];
    url?: string;
    image?: ContentStorage | null;
    thumbnailUrls?: Thumbnail[];
    productTypeId?: string;
    attribute?: Attribute;
    attributeValue?: Attribute;
    categoryId?: string;
    collectionId?: string[];
    prices?: Price[];
    price?: number;
    tax?: number;
    variants?: string[];
    status?: Status;
    like?: number;
    rating?: number;
}

type Price = {
    name: string
    value: string
};

type Attribute = {
    [key: string]: boolean
} | null;

type Thumbnail = {
    size: string
    image: ContentStorage | null
};
