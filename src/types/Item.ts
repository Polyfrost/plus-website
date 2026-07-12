export type Item = {
    name: string;
    description: string;
    price: number;
    discount: number;
    createdAt: string;
    id: number;
    assetId: number;
    coverAssetId: number;
    tags: string[];
    type: string;
    priceId?: string;
};
