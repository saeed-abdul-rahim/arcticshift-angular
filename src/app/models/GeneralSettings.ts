import { CommonInterface, Content, PaymentGateway } from './Common';

export interface GeneralSettings extends CommonInterface {
    accentColor?: string;
    currency?: string;
    weightUnit?: string;
    paymentGateway?: PaymentGateway;
    cod?: boolean;
    images?: Content[];
    name?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
}
