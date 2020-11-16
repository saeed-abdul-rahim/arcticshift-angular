export function percentDecrease(original: number, discount: number) {
    return Number((100 * ((discount - original) / original)).toFixed(2));
}

export function getDiscountValue(price: number, discount: number) {
    return Number((price * discount / 100).toFixed(2));
}

export function getDiscountPrice(price: number, discount: number) {
    return Number((price - getDiscountValue(price, discount)).toFixed(2));
}
