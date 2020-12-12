import { AttributeJoinInterface } from '@models/Attribute';
import { ValueType } from '@models/Common';
import { ProductCondition, ProductInterface } from '@models/Product';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { VariantInterface } from '@models/Variant';
import { setThumbnails } from './media';
import { getSaleDiscountForProduct } from './saleDiscount';

export function isProductAvailable(variant: VariantInterface) {
    try {
        const { trackInventory, warehouseQuantity, bookedQuantity } = variant;
        if (trackInventory && warehouseQuantity) {
            let availableQuantity = 0;
            availableQuantity = Object.keys(warehouseQuantity).map(key => warehouseQuantity[key]).reduce((acc, curr) => acc + curr, 0);
            availableQuantity = availableQuantity - (bookedQuantity || 0);
            return availableQuantity > 0 ? true : false;
        }
        return true;
    } catch (err) {
        throw err;
    }
}

export function isColorAttribute(attribute: AttributeJoinInterface): boolean {
    const { attributeValues } = attribute;
    if (attributeValues && attributeValues.length > 0) {
      const values = attributeValues
        .map(value => value.name)
        .filter(value => value[0] === '#' && value.length === 7);
      return values.length === attributeValues.length;
    } else {
      return false;
    }
  }

export function setSaleDiscountForProduct(saleDiscounts: SaleDiscountInterface[], product: ProductInterface) {
    try {
        let discountValue: number;
        let discountType: ValueType;
        if (saleDiscounts.length > 0) {
            const saleDiscount = getSaleDiscountForProduct(saleDiscounts, product);
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

export function setProducts(products: ProductInterface[], imageSize: number, saleDiscounts?: SaleDiscountInterface[]) {
    return products.map(product => {
        if (!product) { return; }
        const { id, images, price, name } = product;
        const thumbnails = setThumbnails(images, name, imageSize);
        let discountValue: number;
        let discountType: ValueType;
        if (saleDiscounts) {
            const productDiscount = setSaleDiscountForProduct(saleDiscounts, product);
            discountType = productDiscount.discountType;
            discountValue = productDiscount.discountValue;
        }
        return {
            id, price, name,
            images: thumbnails,
            value: discountValue,
            valueType: discountType
        };
    }).filter(e => e);
}

export function filterProductsByCategoryCollection(id: string, productFilters: ProductCondition[], type: 'category' | 'collection') {
    let setField = '';
    let unSetField = '';
    if (type === 'category') {
        unSetField = 'collectionId';
        setField = 'allCategoryId';
    } else if (type === 'collection') {
        unSetField = 'allCategoryId';
        setField = 'collectionId';
    }
    const nxtFilters = productFilters.filter(p => p.field !== unSetField);
    const categoryFilterIdx = nxtFilters.findIndex(p => p.field === setField);
    const categoryFilter: ProductCondition = { field: setField, type: 'array-contains', value: id };
    if (categoryFilterIdx > -1) {
      nxtFilters[categoryFilterIdx] = categoryFilter;
    } else {
      nxtFilters.push(categoryFilter);
    }
    return nxtFilters;
}
