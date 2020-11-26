import { CommonInterface, Condition, OrderBy } from './Common';
import { ProductInterface } from './Product';
import { ProductTypeInterface } from './ProductType';
import { SaleDiscountInterface } from './SaleDiscount';
import { ShippingRateInterface } from './Shipping';
import { TaxInterface } from './Tax';
import { Address } from './User';
import { VariantInterface } from './Variant';
import { VoucherInterface } from './Voucher';

export type OrderStatus = 'draft' | 'unfulfilled' | 'partiallyFulfilled' | 'fulfilled' | 'cancelled' | '';
export type PaymentStatus = 'notCharged' | 'partiallyCharged' | 'fullyCharged' | 'partiallyRefunded' | 'fullyRefunded' | '';

export type VariantQuantity = {
    variantId: string
    quantity: number
};

export type Fullfill = VariantQuantity & {
    warehouseId: string
    trackingId?: string
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
    fullfilled?: Fullfill[];
    subTotal?: number;
    saleDiscount?: number;
    voucherDiscount?: number;
    taxCharge?: number;
    shippingCharge?: number;
    total?: number;
    capturedAmount?: number;
    cod?: boolean;
    payment?: Payment[];
    notes?: string;
    data?: OrderData;
}

export type OrderCondition = Condition & {
    field: AllOrderFields
    parentFields?: (OrderFields)[]
};

export type OrderOrderBy = OrderBy & {
    field: OrderFields
};

export type OrderFields = keyof OrderInterface;

export type OrderDraft = 'order' | 'draft';

export type ProductData = VariantInterface & {
    orderQuantity: number
    baseProduct: ProductInterface
    baseProductType: ProductTypeInterface
    saleDiscount: SaleDiscountInterface | null
    taxData?: TaxInterface | null
};

export type OrderData = {
    productsData: ProductData[]
    shippingRateData: ShippingRateInterface
    voucherData: VoucherInterface
};

type AllOrderFields = keyof (OrderInterface & Address);

type Payment = {
    type: 'charge' | 'refund'
    amount: number
};

