export type RazorpayOptions = {
    key?: string,
    amount?: number,
    currency?: string,
    name?: string,
    description?: string,
    image?: string,
    order_id?: string,
    account_id?: string,
    prefill?: {
        name?: string,
        email?: string,
        contact?: string,
        method?: 'card' | 'netbanking' | 'wallet' | 'emi' | 'upi'
    }
    handler?: (response: any) => any
};
