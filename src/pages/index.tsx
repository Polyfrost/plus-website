import CollectionCard from "@/components/CollectionCard";
import CollectionCarousel from "@/components/CollectionCarousel";
import ItemCard from "@/components/ItemCard";
import ItemCarousel from "@/components/ItemCarousel";
import { Collection } from "@/types/Collection";
import { Item } from "@/types/Item";
import { getCollections, searchCosmetics } from "@/utils/APIUtils";
import { isNewItem } from "@/utils/TimeUtils";
import { useEffect, useState } from "react";

export default function Home() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [editorsPick, setEditorsPick] = useState<Item[]>([]);
    const [newest, setNewest] = useState<Item[]>([]);

    useEffect(() => {
        async function fetchCollections() {
            const collectionsData = await getCollections();

            setCollections(collectionsData);
        }

        fetchCollections();
    }, []);

    useEffect(() => {
        async function fetchEditorsPick() {
            const cosmeticsData = await searchCosmetics({ tags: "editor" });

            setEditorsPick(cosmeticsData.items);
        }

        fetchEditorsPick();
    }, []);

    useEffect(() => {
        async function fetchNewest() {
            const cosmeticsData = await searchCosmetics({ sort: "newest", nb: 10 });

            setNewest(cosmeticsData.items);
        }

        fetchNewest();
    }, []);

    return (
        <>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex justify-center items-center min-[840px]:pt-65.5 pt-24 min-[1130px]:px-0 px-4 pb-5">
                    <CollectionCarousel collections={collections} />
                </div>
            </section>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col justify-center items-center pt-10 min-[1130px]:px-0 px-4">
                    <ItemCarousel title="Collections" stepSize={380}>
                        {collections.map((collection) => (
                            <CollectionCard key={collection.id} size="small" focused title={collection.name} id={collection.id} assetId={collection.assetId} />
                        ))}
                    </ItemCarousel>
                </div>
            </section>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col justify-center items-center py-15 min-[1130px]:px-0 px-4">
                    <div className="flex flex-col gap-10 w-full">
                        <ItemCarousel title="Editor's Pick" stepSize={228} viewAll="/category/editor">
                            {editorsPick.map((cosmetic) => (
                                <ItemCard key={cosmetic.id} name={cosmetic.name} id={cosmetic.id} coverId={cosmetic.coverAssetId} price={cosmetic.price} discount={cosmetic.discount} newItem={isNewItem(cosmetic.createdAt)} />
                            ))}
                        </ItemCarousel>
                        <ItemCarousel title="Newest" stepSize={228} viewAll="/search?sort=newest">
                            {newest.map((cosmetic) => (
                                <ItemCard key={cosmetic.id} name={cosmetic.name} id={cosmetic.id} coverId={cosmetic.coverAssetId} price={cosmetic.price} discount={cosmetic.discount} newItem={isNewItem(cosmetic.createdAt)} />
                            ))}
                        </ItemCarousel>
                    </div>
                </div>
            </section>
        </>
    );
}
