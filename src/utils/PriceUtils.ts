// Mirrors the backend's money math (plus-backend src/utils/money.rs)

export type Price = number | null | undefined;

export type DiscountRate = number | null | undefined;

export function hasDiscount(discountRate: DiscountRate): discountRate is number {
    return typeof discountRate === "number" && discountRate > 0;
}

export function toCents(basePrice: number): number {
    return Math.round(basePrice * 100);
}

export function discounted(basePrice: number, discountRate: number): number {
    return basePrice * (1 - discountRate / 100);
}

export function effectiveCents(basePrice: number, discountRate: DiscountRate): number {
    return toCents(hasDiscount(discountRate) ? discounted(basePrice, discountRate) : basePrice);
}

export function formatUsd(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}
