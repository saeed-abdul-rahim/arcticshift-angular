import { CommonInterface, Content, PaymentGateway } from './Common';

export interface GeneralSettings extends CommonInterface {
    accentColor?: string;
    currency?: string;
    weightUnit?: string;
    paymentGateway?: PaymentGateway;
    logo?: Content | null;
    logoLong?: Content | null;
    name?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
}
