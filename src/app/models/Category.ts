import { ContentStorage, TimestampInterface } from './Common';

export interface CategoryType extends TimestampInterface {
    shopId?: string
    categoryId?: string
    parentCategoryId?: string
    name?: string
    description?: string
    images?: ContentStorage[]
    subCategoryId?: string[]
    parentCategoryIds?: string[]
    productId?: string[]
    saleDiscountId?: string
    voucherId?: string
}
