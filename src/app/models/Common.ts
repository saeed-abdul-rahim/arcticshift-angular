export type Role = 'admin' | 'staff';
export type Status = 'active' | 'inactive';
export type ContentType = 'image' | 'video' | 'document' | '';
export type ValueType = 'fixed' | 'percent';

export interface TimestampInterface {
    createdAt?: number;
    updatedAt?: number;
}

export type ContentStorage = {
    path: string
    url: string
};

export type Tax = {
    name: string
    value: number
    type: ValueType
};

export type AuthType = {
    [key in Role]?: string[];
};

export interface CommonInterface extends AuthType, TimestampInterface {
    users?: string[];
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
