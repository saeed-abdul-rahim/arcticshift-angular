import { ValueType } from '@models/Common';
import { ProductInterface } from '@models/Product';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { VariantInterface } from '@models/Variant';
import { getSaleDiscountForProduct } from './saleDiscount';

export function isProductAvailable(variant: VariantInterface) {
    try {
        const { trackInventory, warehouseQuantity, bookedQuantity } = variant;
        if (trackInventory && warehouseQuantity && bookedQuantity) {
            let availableQuantity = 0;
            availableQuantity = Object.keys(warehouseQuantity).map(key => warehouseQuantity[key]).reduce((acc, curr) => acc + curr);
            availableQuantity = availableQuantity - bookedQuantity;
            return availableQuantity > 0 ? true : false;
        }
        return false;
    } catch (err) {
        throw err;
    }
}

export function setSaleDiscountForProduct(saleDiscounts: SaleDiscountInterface[], product: ProductInterface) {
    try {
        let discountValue: number;
        let discountType: ValueType;
        if (saleDiscounts.length > 0) {
          const saleDiscount = getSaleDiscountForProduct(this.saleDiscounts, product);
          if (saleDiscount) {
            const { value, valueType } = saleDiscount;
            discountValue = value;
            discountType = valueType;
          }
        }
        return { discountValue, discountType };
    } catch (err) {
        throw err;
    }
}
