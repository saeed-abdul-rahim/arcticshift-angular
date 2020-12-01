import { TimestampInterface } from './Common';

export interface SaleAnalyticsGroupInterface {
    sale?: SaleAnalyticsInterface[];
}

export interface SaleAnalyticsInterface extends TimestampInterface {
    variantId: string[];
    sale: number;
    orderId: string;
}
