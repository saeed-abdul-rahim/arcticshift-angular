import { CommonInterface, Status, Tax, AttributeValue, Condition, Content } from './Common';

export interface ProductInterface extends CommonInterface {
    id?: string;
    shopId?: string;
    productId?: string;
    name?: string;
    description?: string;
    keywords?: string[];
    url?: string;
    images?: Content[];
    productInterfaceId?: string;
    attribute?: AttributeValue;
    attributeValue?: AttributeValue;
    productTypeId?: string;
    categoryId?: string;
    collectionId?: string[];
    prices?: Price[];
    price?: number;
    chargeTax?: boolean;
    tax?: Tax | null;
    variantId?: string[];
    saleDiscountId?: string;
    voucherId?: string;
    like?: number;
    rating?: number;
}

export type ProductCondition = Condition & {
    field: ProductFields
    parentFields?: (keyof ProductInterface)[]
};

type ProductFields = keyof (ProductInterface & Content & Price & AttributeValue);

type Price = {
    name: string
    value: string
};
