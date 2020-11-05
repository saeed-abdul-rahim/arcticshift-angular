import { CommonInterface, Condition, OrderBy } from './Common';
import { Address } from './User';

export type OrderStatus = 'draft' | 'unfulfilled' | 'partiallyFulfilled' | 'fulfilled' | 'cancelled' | '';
export type PaymentStatus = 'notCharged' | 'partiallyCharged' | 'fullyCharged' | 'partiallyRefunded' | 'fullyRefunded' | '';

export type VariantQuantity = {
    variantId: string
    quantity: number
};

export interface OrderInterface extends CommonInterface {
    shopId?: string;
    userId?: string;
    customerName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    orderId?: string;
    orderNo?: number;
    gatewayOrderId?: string;
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    billingAddress?: Address | null;
    shippingAddress?: Address | null;
    shippingRateId?: string;
    voucherId?: string;
    giftCardId?: string;
    shippingId?: string;
    variants?: VariantQuantity[];
    fullfilled?: Fulfilled[];
    subTotal?: number;
    saleDiscount?: number;
    voucherDiscount?: number;
    taxCharge?: number;
    shippingCharge?: number;
    total?: number;
    payment?: Payment[];
    notes?: string;
}

export type OrderCondition = Condition & {
    field: AllOrderFields
    parentFields?: (OrderFields)[]
};

export type OrderFields = keyof OrderInterface;

type AllOrderFields = keyof (OrderInterface & Address);

type Fulfilled = VariantQuantity & {
    inventoryId: string
};

type Payment = {
    type: 'charge' | 'refund'
    amount: number
};

export type OrderOrderBy = OrderBy & {
    field: OrderFields
};
