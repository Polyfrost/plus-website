export type Item = {
    id: number;
    name: string;
    description: string;
    /** USD, major units. Null for a cosmetic with no price set. */
    price: number | null;
    /** Integer percent off, 0-100. Null when the cosmetic is not on sale. */
    discount: number | null;
    createdAt: string;
    assetId: number;
    coverAssetId: number;
    tags: string[];
    type: string;
    productId?: string;
    variants: {
        id: number;
        name: string;
        model?: string;
        assetId: number;
        coverAssetId: number;
    }[];
};
