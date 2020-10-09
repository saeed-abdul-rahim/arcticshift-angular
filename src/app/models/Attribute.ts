import { Condition, CommonInterface } from './Common';

export interface AttributeInterface extends CommonInterface {
    id?: string;
    shopId?: string;
    productTypeId?: string[];
    attributeId?: string;
    code?: string;
    name?: string;
    attributeValueId?: string[];
}

export interface AttributeValueInterface extends CommonInterface {
    id?: string;
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
    field: keyof AttributeInterface
};

export type AttributeValueCondition = Condition & {
    field: keyof AttributeValueInterface
};
