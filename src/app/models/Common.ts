export type Role = 'admin' | 'staff';
export type Status = 'active' | 'inactive';
export type ContentType = 'image' | 'video' | 'document' | '';
export type ValueType = 'fixed' | 'percent';

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

export type Datetime = {
    date: string
    time: string
    zone: string
};

export type AttributeValue = {
    [key: string]: boolean
} | null;

export type AuthType = {
    [key in Role]?: string[];
};

export interface CommonInterface extends TimestampInterface {
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
