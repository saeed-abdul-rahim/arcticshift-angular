import { Datetime, TimestampInterface, ValueType } from './Common';

export interface ProductTypeInterface extends TimestampInterface {
    name?: string;
    productTypeId?: string;
}
