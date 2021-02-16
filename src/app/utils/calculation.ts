export function percentIncrease(original: number, newNumber: number) {
    if (original === 0) {
        return 0;
    }
    return Number((100 * ((newNumber - original) / original)).toFixed(2));
}

export function getDiscountValue(price: number, discount: number) {
    return Number((price * discount / 100).toFixed(2));
}

export function getDiscountPrice(price: number, discount: number) {
    return Number((price - getDiscountValue(price, discount)).toFixed(2));
}
