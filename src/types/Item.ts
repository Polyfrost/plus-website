export type Item = {
    id: number;
    name: string;
    description: string;
    price: number;
    discount: number;
    createdAt: string;
    assetId: number;
    coverAssetId: number;
    tags: string[];
    type: string;
    priceId?: string;
    variants: {
        id: number;
        name: string;
        assetId: number;
        coverAssetId: number;
    }[];
};
