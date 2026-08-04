import CollectionCard from "@/components/CollectionCard";
import CollectionCarousel from "@/components/CollectionCarousel";
import ItemCard from "@/components/ItemCard";
import ItemCarousel from "@/components/ItemCarousel";
import { Collection } from "@/types/Collection";
import { Item } from "@/types/Item";
import { getCollections, searchCosmetics, toSerializable } from "@/utils/APIUtils";
import { isNewItem } from "@/utils/TimeUtils";
import type { GetServerSideProps } from "next";

type HomeProps = {
    collections: Collection[];
    editorsPick: Item[];
    newest: Item[];
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
    const [collections, editorsPick, newest] = await Promise.all([
        getCollections(),
        searchCosmetics({ tags: "editor" })
            .then((data) => data.items)
            .catch(() => []),
        searchCosmetics({ sort: "newest", nb: 10 })
            .then((data) => data.items)
            .catch(() => []),
    ]);

    return { props: toSerializable({ collections, editorsPick, newest }) };
};

export default function Home({ collections, editorsPick, newest }: HomeProps) {
    return (
        <>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex justify-center items-center min-[840px]:pt-65.5 pt-24 min-[1130px]:px-0 px-4 pb-5">
                    <CollectionCarousel collections={collections} />
                </div>
            </section>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col justify-center items-center pt-10 min-[1130px]:px-0 px-4">
                    <ItemCarousel title="Editor's Pick" stepSize={228} viewAll="/category/editor">
                        {editorsPick.map((cosmetic) => (
                            <ItemCard
                                key={cosmetic.id}
                                name={cosmetic.name}
                                id={cosmetic.id}
                                coverId={cosmetic.coverAssetId}
                                price={cosmetic.price}
                                discount={cosmetic.discount}
                                newItem={isNewItem(cosmetic.createdAt)}
                            />
                        ))}
                    </ItemCarousel>
                </div>
            </section>
            {collections.length > 1 && (
                <section className="relative overflow-hidden">
                    <div className="max-w-273 mx-auto flex flex-col justify-center items-center pt-10 min-[1130px]:px-0 px-4">
                        <ItemCarousel title="Collections" stepSize={380}>
                            {collections.map((collection) => (
                                <CollectionCard key={collection.id} size="small" focused title={collection.name} id={collection.id} assetId={collection.assetId} />
                            ))}
                        </ItemCarousel>
                    </div>
                </section>
            )}
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col justify-center items-center py-15 min-[1130px]:px-0 px-4">
                    <ItemCarousel title="Newest" stepSize={228} viewAll="/search?sort=newest">
                        {newest.map((cosmetic) => (
                            <ItemCard
                                key={cosmetic.id}
                                name={cosmetic.name}
                                id={cosmetic.id}
                                coverId={cosmetic.coverAssetId}
                                price={cosmetic.price}
                                discount={cosmetic.discount}
                                newItem={isNewItem(cosmetic.createdAt)}
                            />
                        ))}
                    </ItemCarousel>
                </div>
            </section>
        </>
    );
}
