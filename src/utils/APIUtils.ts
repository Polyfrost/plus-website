import { Collection } from "@/types/Collection";
import { Item } from "@/types/Item";
import { ItemTag } from "@/types/ItemTag";

type FetchReturn = { res: Response | null; json: any; text: string | null; data: ArrayBuffer | null };

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
    const { res, json } = await polyFetch(`${process.env.BACKEND_URL}/cosmetics/view/${id}`);
    if (res?.ok && json) {
        return {
            name: json.name,
            description: json.description,
            price: json.base_price,
            discount: json.discount_rate,
            createdAt: json.created_at,
            id: json.id,
            assetId: json.asset_id,
            coverAssetId: json.cover_asset_id,
            tags: [...json.tags.custom, ...json.tags.colors],
            type: json.type,
            priceId: json.stripe_price_id,
            variants: json.variants?.map((variant: any) => ({
                id: variant.id,
                name: variant.variant_name,
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
    const { res, json } = await polyFetch(`${process.env.BACKEND_URL}/cosmetics/search?${queryString}`);
    if (res?.ok && json) {
        return {
            items: json.results.map((cosmetic: any) => ({
                name: cosmetic.name,
                description: cosmetic.description,
                price: cosmetic.base_price,
                discount: cosmetic.discount_rate,
                createdAt: cosmetic.created_at,
                id: cosmetic.id,
                assetId: cosmetic.asset_id,
                coverAssetId: cosmetic.cover_asset_id,
                tags: [...cosmetic.tags.custom, ...cosmetic.tags.colors],
                type: cosmetic.type,
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
    const { res, json } = await polyFetch(`${process.env.BACKEND_URL}/tags/list`);
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
    const { res, json } = await polyFetch(`${process.env.BACKEND_URL}/collections/list`);

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

export async function createStripe(uuid: string, prices: string[]): Promise<{ url: string } | null> {
    const { res, json } = await polyFetch(`${process.env.BACKEND_URL}/stripe/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ buyer: uuid, player: uuid, prices }),
    });

    if (res?.ok && json) {
        return { url: json.url };
    } else {
        console.error("Failed to create stripe session");
        return null;
    }
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
