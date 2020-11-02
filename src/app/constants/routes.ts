type ADMIN = 'admin';
type LOGIN = 'login';
type DASHBOARD = 'dashboard';
type CATALOG = 'catalog';
type PRODUCT = 'product';
type VARIANT = 'variant';
type CATEGORY = 'category';
type COLLECTION = 'collection';
type ORDER = 'order';
type CUSTOMER = 'customer';
type DISCOUNT = 'discount';
type SALE = 'sale';
type VOUCHER = 'voucher';
type GIFTCARD = 'gift-card';
type TAX = 'tax';
type PRODUCTATTRIBUTE = 'product-attribute';
type PRODUCTTYPE = 'product-type';
type SHIPPING = 'shipping';
type WAREHOUSE = 'warehouse';
type STAFF = 'staff';
type ADD = 'add';
type CHECKOUT = 'checkout';
type CART = 'cart';
type WISHLIST = 'wishlist';

export const ADMIN: ADMIN = 'admin';
export const LOGIN: LOGIN = 'login';
export const DASHBOARD: DASHBOARD = 'dashboard';
export const CATALOG: CATALOG = 'catalog';
export const PRODUCT: PRODUCT = 'product';
export const VARIANT: VARIANT = 'variant';
export const CATEGORY: CATEGORY = 'category';
export const COLLECTION: COLLECTION = 'collection';
export const ORDER: ORDER = 'order';
export const CUSTOMER: CUSTOMER = 'customer';
export const DISCOUNT: DISCOUNT = 'discount';
export const SALE: SALE = 'sale';
export const VOUCHER: VOUCHER = 'voucher';
export const GIFTCARD: GIFTCARD = 'gift-card';
export const TAX: TAX = 'tax';
export const PRODUCTATTRIBUTE: PRODUCTATTRIBUTE = 'product-attribute';
export const PRODUCTTYPE: PRODUCTTYPE = 'product-type';
export const SHIPPING: SHIPPING = 'shipping';
export const WAREHOUSE: WAREHOUSE = 'warehouse';
export const STAFF: STAFF = 'staff';
export const ADD: ADD = 'add';
export const CHECKOUT: CHECKOUT = 'checkout';
export const CART: CART = 'cart';
export const WISHLIST: WISHLIST = 'wishlist';

export const adminRoute = `/${ADMIN}`;
export const catalogRoute = `${adminRoute}/${CATALOG}`;
export const discountRoute = `${adminRoute}/${DISCOUNT}`;
export const productRoute = `${catalogRoute}/${PRODUCT}`;
export const categoryRoute = `${catalogRoute}/${CATEGORY}`;
export const collectionRoute = `${catalogRoute}/${COLLECTION}`;
export const saleDiscountRoute = `${discountRoute}/${SALE}`;
export const voucherRoute = `${discountRoute}/${VOUCHER}`;
export const shippingRoute = `${adminRoute}/${SHIPPING}`;
export const productTypeRoute = `${adminRoute}/${PRODUCTTYPE}`;
export const productAttributeRoute = `${adminRoute}/${PRODUCTATTRIBUTE}`;
