import { TimestampInterface, Status, ContentStorage, Tax, AttributeValue, Condition } from './Common';

export interface ProductInterface extends TimestampInterface {
    shopId?: string;
    productId?: string;
    name?: string;
    description?: string;
    keywords?: string[];
    url?: string;
    image?: ContentStorage | null;
    thumbnailUrls?: Thumbnail[];
    productInterfaceId?: string;
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

export type ProductCondition = Condition & {
    field: ProductFields
    parentFields?: (keyof ProductInterface)[]
};

type ProductFields = keyof (ProductInterface & Thumbnail & Price & AttributeValue);

type Price = {
    name: string
    value: string
};

type Thumbnail = {
    size: string
    image: ContentStorage | null
};
