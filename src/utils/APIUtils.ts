import { Collection } from "@/types/Collection";
import { Item } from "@/types/Item";
import { ItemTag } from "@/types/ItemTag";

type FetchReturn = { res: Response | null; json: any; text: string | null; data: ArrayBuffer | null };

export function toSerializable<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

export async function polyFetch(url: string, options?: RequestInit): Promise<FetchReturn> {
    let response = null;
    let json = null;
    let text = null;
    let data = null;
    try {
        response = await fetch(url, options);
        const arrayBuffer = await response.arrayBuffer();

        if (response.headers.get("content-type")?.includes("application/json")) {
            json = JSON.parse(new TextDecoder().decode(arrayBuffer));
        } else if (response.headers.get("content-type")?.includes("text/")) {
            text = new TextDecoder().decode(arrayBuffer);
        } else {
            data = arrayBuffer;
        }
    } catch (err) {
        console.log(`Fetch error: ${err}`);
        return { res: response, json: null, text: null, data: null };
    }

    return { res: response, json: json, text: text, data: data };
}

export async function getCosmeticById(id: number): Promise<Item> {
    const { res, json } = await polyFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cosmetics/view/${id}`);
    if (res?.ok && json) {
        return {
            name: json.name,
            description: json.description,
            price: json.base_price ?? null,
            discount: json.discount_rate ?? null,
            createdAt: json.created_at,
            id: json.id,
            assetId: json.asset_id,
            coverAssetId: json.cover_asset_id,
            tags: [...json.tags.custom, ...json.tags.colors],
            type: json.type,
            productId: json.store_product_id ?? undefined,
            variants: json.variants?.map((variant: any) => ({
                id: variant.id,
                name: variant.variant_name,
                model: variant.model_variant,
                assetId: variant.asset_id,
                coverAssetId: variant.cover_asset_id,
            })),
        };
    } else {
        throw new Error("Failed to fetch cosmetic");
    }
}

export async function searchCosmetics(queryItems: { [key: string]: string | number | boolean }): Promise<{ items: Item[]; total: number; pages: number }> {
    const queryString = new URLSearchParams(queryItems as Record<string, string>).toString();
    const { res, json } = await polyFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cosmetics/search?${queryString}`);
    if (res?.ok && json) {
        return {
            items: json.results.map((cosmetic: any) => ({
                name: cosmetic.name,
                description: cosmetic.description,
                price: cosmetic.base_price ?? null,
                discount: cosmetic.discount_rate ?? null,
                createdAt: cosmetic.created_at,
                id: cosmetic.id,
                assetId: cosmetic.asset_id,
                coverAssetId: cosmetic.cover_asset_id,
                tags: [...cosmetic.tags.custom, ...cosmetic.tags.colors],
                type: cosmetic.type,
                // Older backends omit this from search results, which just
                // leaves the item unpurchasable until they catch up.
                productId: cosmetic.store_product_id ?? undefined,
                variants: cosmetic.variants?.map((variant: any) => ({
                    id: variant.id,
                    name: variant.variant_name,
                    assetId: variant.asset_id,
                    coverAssetId: variant.cover_asset_id,
                })),
            })),
            total: json.pagination.total_items,
            pages: json.pagination.total_pages,
        };
    } else {
        throw new Error("Failed to search cosmetics");
    }
}

export async function getTags(): Promise<ItemTag[]> {
    const { res, json } = await polyFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tags/list`);
    if (res?.ok && json) {
        return json.tags.map((tag: any) => ({
            name: tag.name,
            displayName: tag.display_name,
            tagType: tag.tag_type,
        }));
    } else {
        console.error("Failed to fetch tags");
        return [];
    }
}

export async function getCollections(): Promise<Collection[]> {
    const { res, json } = await polyFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/collections/list`);

    if (res?.ok && json) {
        return json.collections.map((collection: any) => ({
            name: collection.name,
            description: collection.description,
            id: collection.id,
            assetId: collection.asset_id,
        }));
    } else {
        console.error("Failed to fetch collections");
        return [];
    }
}

export type CheckoutResult = { url: string } | { error: string };

export async function createCheckout(uuid: string, products: string[], promoCodes: string[] = []): Promise<CheckoutResult> {
    const { res, json, text } = await polyFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/checkout/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ buyer: uuid, player: uuid, products, promo_codes: promoCodes }),
    });

    if (res?.ok && json) {
        return { url: json.url };
    }

    // The backend names the cosmetics on a 409, so pass its message through
    // rather than replacing it with something generic.
    console.error("Failed to create checkout session");
    return { error: text?.trim() || "Failed to start checkout. Please try again." };
}

export async function usernameToUUID(username: string): Promise<string | null> {
    const { res, json } = await polyFetch(`https://playerdb.co/api/player/minecraft/${username}`);
    if (res?.ok && json) {
        return json.data.player.id;
    } else {
        return null;
    }
}

export async function UUIDToSkinURL(uuid: string): Promise<{ skin: string; type: "slim" | "wide" }> {
    const mojangReq = await polyFetch(`https://mowojang.seraph.si/session/minecraft/profile/${uuid}`);

    if (mojangReq.res?.ok && mojangReq.json) {
        const mojangProperties = mojangReq.json.properties as { name: string; value: string }[];
        const textureProperty = JSON.parse(Buffer.from(mojangProperties.find((prop) => prop.name === "textures")?.value ?? "{}", "base64").toString("utf-8"));

        return {
            skin: textureProperty?.textures?.SKIN?.url ?? "https://textures.minecraft.net/texture/90b8789136facaa9f87b765140e1c8135e6652f513481bd84e6bd8c44844d7ce",
            type: textureProperty?.textures?.SKIN?.metadata?.model === "slim" ? "slim" : "wide",
        };
    } else {
        return {
            skin: "https://textures.minecraft.net/texture/90b8789136facaa9f87b765140e1c8135e6652f513481bd84e6bd8c44844d7ce",
            type: "wide",
        };
    }
}
