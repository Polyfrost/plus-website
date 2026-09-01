// Mirrors the backend's money math (plus-backend src/utils/money.rs). Every
// line is rounded to whole cents on its own and the rounded cents are what get
// summed, so a cart total shown here is the one PayNow charges. Summing floats
// and rounding once at the end can disagree by a cent.

/** A price is null for a cosmetic that has none set and so cannot be bought. */
export type Price = number | null | undefined;

/** A discount rate is an integer percent, 0-100, or null for no discount. */
export type DiscountRate = number | null | undefined;

/** True only for a rate that actually takes something off the price. */
export function hasDiscount(discountRate: DiscountRate): discountRate is number {
    return typeof discountRate === "number" && discountRate > 0;
}

export function toCents(basePrice: number): number {
    return Math.round(basePrice * 100);
}

export function discounted(basePrice: number, discountRate: number): number {
    return basePrice * (1 - discountRate / 100);
}

/** What one line costs, rounded to cents exactly like the backend rounds it. */
export function effectiveCents(basePrice: number, discountRate: DiscountRate): number {
    return toCents(hasDiscount(discountRate) ? discounted(basePrice, discountRate) : basePrice);
}

export function formatUsd(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}
