export type Role = 'admin' | 'staff';
export type Status = 'active' | 'inactive';
export type ContentType = 'image' | 'video' | 'document' | '';
export type ValueType = 'fixed' | 'percent';
export type PriceType = 'original' | 'override' | 'strike' | 'discount' | 'cost';

export const valueTypes: {
    id: ValueType,
    label: string
}[] = [
    { id: 'fixed', label: 'Fixed' },
    { id: 'percent', label: 'Percent'}
];

export type Price = {
    name: PriceType
    value: number
};

export interface QueryConfig {
    path?: string;
    orderBy?: string;
    where?: Condition[];
    limit?: number;
    reverse?: boolean;
    prepend?: boolean;
    join?: string;
    joinId?: string;
}

export type CatalogTypeApi = {
    productId?: string[]
    categoryId?: string[]
    collectionId?: string[]
};

export interface TimestampInterface {
    createdAt?: number;
    updatedAt?: number;
}

export type ContentStorage = {
    path: string;
    url: string;
    name?: string;
    dimension?: number;
};

export type Content = {
    content: ContentStorage;
    thumbnails: ContentStorage[];
};

export type Tax = {
    name: string
    value: number
    type: ValueType
};

export type ObjString = {
    [key: string]: string;
};

export type ObjNumber = {
    [key: string]: number
};

export type Datetime = {
    date: string
    time: string
    zone: string
};

export type Point = {
    lat: number,
    lon: number
};

export type AttributeValue = {
    [key: string]: boolean
} | null;

export type AuthType = {
    [key in Role]?: string[];
};

export interface CommonInterface extends TimestampInterface {
    id?: string;
    status?: Status;
}

export class Timestamp implements TimestampInterface {
    createdAt: number;
    updatedAt: number;

    constructor(data: TimestampInterface) {
        this.createdAt = data.createdAt && data.createdAt !== 0 ? data.createdAt : Date.now();
        this.updatedAt = data.updatedAt && data.updatedAt !== 0 ? data.updatedAt : Date.now();
    }

    get(): TimestampInterface {
        return {
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

export type Condition = {
    field: string | firebase.firestore.FieldPath,
    type: firebase.firestore.WhereFilterOp,
    value: any
    parentFields?: string[]
};

export type OrderBy = {
    field: string
    direction: 'asc' | 'desc'
};
