import { Condition, CommonInterface, OrderBy } from './Common';

export interface AttributeInterface extends CommonInterface {
    shopId?: string;
    productTypeId?: string[];
    attributeId?: string;
    code?: string;
    name?: string;
    attributeValueId?: string[];
}

export interface AttributeValueInterface extends CommonInterface {
    shopId?: string;
    productTypeId?: string[];
    attributeId?: string;
    code?: string;
    name?: string;
    attributeValueId?: string;
}

export interface AttributeJoinInterface extends AttributeInterface {
    attributeValues?: AttributeValueInterface[];
}

export type AttributeCondition = Condition & {
    field: AttributeFields
};

export type AttributeValueCondition = Condition & {
    field: AttributeValueFields
};

export type AttributeFields = keyof AttributeInterface;
export type AttributeValueFields = keyof AttributeValueInterface;

export type AttributeOrderBy = OrderBy & {
    field: AttributeFields
};

export type AttributeValueOrderBy = OrderBy & {
    field: AttributeValueFields
};
