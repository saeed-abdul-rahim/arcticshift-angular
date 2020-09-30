import { Condition, Content, TimestampInterface } from './Common';

export interface CategoryInterface extends TimestampInterface {
    id?: string;
    shopId?: string;
    categoryId?: string;
    parentCategoryId?: string;
    name?: string;
    description?: string;
    images?: Content[];
    subCategoryId?: string[];
    parentCategoryIds?: string[];
    productId?: string[];
    saleDiscountId?: string;
    voucherId?: string;
}

export type CategoryCondition = Condition & {
    field: CategoryFields
    parentFields?: (keyof CategoryInterface)[]
};

type CategoryFields = keyof (CategoryInterface & Content);
