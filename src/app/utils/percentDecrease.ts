export function percentDecrease(original: number, discount: number) {
    return (100 * ((discount - original) / original)).toFixed(2);
}
