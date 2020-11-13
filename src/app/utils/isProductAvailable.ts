import { VariantInterface } from '@models/Variant';

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
