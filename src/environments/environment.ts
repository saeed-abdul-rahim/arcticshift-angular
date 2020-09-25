// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  url: '',
  localStorageKey: 'urPWO0zFGXSBeQAzaCOfIrMjXFDyLSMecf06iD2d7bc',
  api: {
    url: 'https://asia-east2-articshift-7f9cd.cloudfunctions.net/api/v1',
    user: '/user',
    product: '/product',
    category: '/category',
    collection: '/collection',
    sale: '/sale-discount',
    variant: '/variant',
    voucher: '/voucher',
    productType:'/productType',
    attribute:'/attribute',
    warehouse:'/warehouse'

  },
  db: {
    version: 'v1',
    name: 'db',
    users: 'users',
    shops: 'shops',
    products: 'products',
    variants: 'variants',
    productTypes: 'productTypes',
    attributes: 'attributes',
    collections: 'collections',
    categories: 'categories',
    shipping: 'shipping',
    inventory: 'inventory',
    warehouse: 'warehouse',
    vouchers: 'vouchers',
    saleDiscounts: 'saleDiscounts',
    giftCards: 'giftCards',
    orders: 'orders',
    taxes: 'taxes',
    adverts: 'adverts',
    analytics: 'analytics'
  },
  firebase: {
    apiKey: 'AIzaSyB775r6Mde1AeRVgONzX-1bExSBeQAzapU',
    authDomain: 'articshift-7f9cd.firebaseapp.com',
    databaseURL: 'https://articshift-7f9cd.firebaseio.com',
    projectId: 'articshift-7f9cd',
    storageBucket: 'articshift-7f9cd.appspot.com',
    messagingSenderId: '461509042504',
    appId: '1:461509042504:web:8d15de5711ded9f673d37d',
    measurementId: 'G-RK6Z478XFG'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
