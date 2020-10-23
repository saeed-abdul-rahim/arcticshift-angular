import { Condition, CommonInterface, OrderBy } from './Common';

export interface ProductTypeInterface extends CommonInterface {
    id?: string;
    shopId?: string;
    productTypeId?: string;
    name?: string;
    productAttributeId?: string[];
    variantAttributeId?: string[];
    taxId?: string;
}

export type ProductTypeCondition = Condition & {
    field: ProductTypeFields
};

export type ProductTypeFields = keyof ProductTypeInterface;

export type ProductTypeOrderBy = OrderBy & {
    field: ProductTypeFields
};
