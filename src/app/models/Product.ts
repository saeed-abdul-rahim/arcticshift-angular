import { CommonInterface, Condition, Content, ObjString, OrderBy } from './Common';

export interface ProductInterface extends CommonInterface {
    shopId?: string;
    productId?: string;
    name?: string;
    description?: string;
    keywords?: string[];
    url?: string;
    images?: Content[];
    attributes?: ObjString;
    productTypeId?: string;
    categoryId?: string;
    allCategoryId?: string[];
    collectionId?: string[];
    prices?: Price[];
    price?: number;
    chargeTax?: boolean;
    variantId?: string[];
    saleDiscountId?: string;
    voucherId?: string;
    like?: number;
    rating?: number;
    clicks?: number;
}

export type ProductCondition = Condition & {
    field: string
    parentFields?: ProductFields[]
};

export type ProductFields = keyof ProductInterface;

type Price = {
    name: string
    value: string
};

export type ProductOrderBy = OrderBy & {
    field: ProductFields
};
