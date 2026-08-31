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
    productId?: string;
    variants: {
        id: number;
        name: string;
        model?: string;
        assetId: number;
        coverAssetId: number;
    }[];
};
