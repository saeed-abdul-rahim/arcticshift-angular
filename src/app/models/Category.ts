import { Condition, Content, CommonInterface, OrderBy } from './Common';

export interface CategoryInterface extends CommonInterface {
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
    parentFields?: CategoryFields[]
};

export type CategoryFields = keyof CategoryInterface;

export type CategoryOrderBy = OrderBy & {
    field: CategoryFields
};
