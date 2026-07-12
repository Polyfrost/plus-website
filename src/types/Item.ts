export type Item = {
    name: string;
    description: string;
    price: number;
    discount: number;
    createdAt: string;
    id: number;
    assetId: number;
    tags: string[];
    type: string;
    priceId?: string;
};
