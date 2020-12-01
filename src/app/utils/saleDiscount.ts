import { ProductInterface } from '@models/Product';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { uniqueArr } from './arrUtils';
import { getDiscountPrice, percentIncrease } from './calculation';

export function getSaleDiscountForProduct(saleDiscounts: SaleDiscountInterface[], product: ProductInterface) {
    try {
        const { categoryId, allCategoryId, collectionId, productId } = product;
        allCategoryId.push(categoryId);
        const cids = uniqueArr(allCategoryId);
        const productDiscount = saleDiscounts?.find(sd => sd.productId.includes(productId));
        const categoryDiscount = saleDiscounts?.find(sd => sd.categoryId.some(cid => cids.includes(cid)));
        const collectionDiscount = saleDiscounts?.find(sd => sd.collectionId.some(cid => collectionId.includes(cid)));
        if (productDiscount) {
            return productDiscount;
        } else if (categoryDiscount) {
            return categoryDiscount;
        } else if (collectionDiscount) {
            return collectionDiscount;
        } else {
            return null;
        }
    } catch (err) {
        throw err;
    }
}

export function getProductDiscount(saleDiscount: SaleDiscountInterface, price: number) {
    try {
        const { value, valueType } = saleDiscount;
        if (!valueType) {
            return;
        }
        const original = price;
        let discount: number;
        switch (valueType) {
            case 'fixed':
                discount = percentIncrease(price, value);
                price -= value;
                break;
            case 'percent':
                discount = value;
                price = getDiscountPrice(price, value);
                break;
        }
        return {
            price, discount, original
        };
    } catch (err) {
        throw err;
    }
}
