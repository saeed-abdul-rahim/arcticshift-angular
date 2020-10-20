import { TimestampInterface } from './Common';

export interface GeneralSettings extends TimestampInterface {
    currency?: string;
    weightUnit?: string;
    accentColor?: string;
}
