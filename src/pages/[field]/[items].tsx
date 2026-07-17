import Checkbox from "@/components/Checkbox";
import ItemCard from "@/components/ItemCard";
import PageNav from "@/components/PageNav";
import Tag from "@/components/Tag";
import { Item } from "@/types/Item";
import { getTags, searchCosmetics } from "@/utils/APIUtils";
import type { ItemTag } from "@/types/ItemTag";
import { useRouter } from "next/router";
import { isNewItem } from "@/utils/TimeUtils";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import LoadingItemCard from "@/components/LoadingItemCard";

export default function Items() {
    const router = useRouter();
    const arg1 = router.query.field as string;
    const arg2 = router.query.items as string;

    const validArg1s = ["type", "category", "collection"];
    const validTypes = ["cape", "emote", "wings", "glove", "hat", "boots", "backpack", "glasses", "shoulder", "aura"];

    const [items, setItems] = useState<Item[]>([]);
    const [pages, setPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const [tags, setTags] = useState<ItemTag[]>([]);

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const [paginating, setPaginating] = useState<boolean>(false);

    const { ref, inView } = useInView({
        threshold: 1,
    });

    useEffect(() => {
        if (router.isReady && (!validArg1s.includes(arg1) || (arg1 === "type" && !validTypes.includes(arg2)))) {
            router.push("/");
        }
    }, [arg1, arg2, router]);

    const handleCosmeticSearch = async (page: number) => {
        setPaginating(true);
        switch (arg1) {
            case "type":
                const typeData = await searchCosmetics({ tags: [...selectedTags, ...selectedColors].join(","), types: arg2, nb: 12, page });
                setItems((prev) => (page === 1 ? typeData.items : [...prev, ...typeData.items]));
                setPages(typeData.pages);
                setTotalItems(typeData.total);
                setCurrentPage(page);
                break;
            case "collection":
                const collectionData = await searchCosmetics({ tags: [...selectedTags, ...selectedColors].join(","), types: selectedTypes.join(","), collection: arg2, nb: 12, page });
                setItems((prev) => (page === 1 ? collectionData.items : [...prev, ...collectionData.items]));
                setPages(collectionData.pages);
                setTotalItems(collectionData.total);
                setCurrentPage(page);
                break;
            case "category":
                const categoryData = await searchCosmetics({ tags: [arg2, ...selectedTags, ...selectedColors].join(","), types: selectedTypes.join(","), nb: 12, page });
                setItems((prev) => (page === 1 ? categoryData.items : [...prev, ...categoryData.items]));
                setPages(categoryData.pages);
                setTotalItems(categoryData.total);
                setCurrentPage(page);
                break;
            default:
                console.error("Invalid field");
                break;
        }
        setPaginating(false);
        setLoading(false);
    };

    useEffect(() => {
        if (router.isReady) {
            handleCosmeticSearch(1);
        }
    }, [arg1, arg2, selectedTags, selectedColors, selectedTypes, router.isReady]);

    useEffect(() => {
        if (inView && currentPage < pages && !paginating) {
            handleCosmeticSearch(currentPage + 1);
            setCurrentPage((prev) => prev + 1);
        }
    }, [inView, currentPage, pages]);

    useEffect(() => {
        async function fetchTags() {
            const tagsData = await getTags();
            setTags(tagsData);
        }

        fetchTags();
    }, []);

    return (
        <>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col min-[840px]:pt-60 pt-20 min-[1130px]:px-0 px-4">
                    {router.isReady && (
                        <PageNav
                            pages={[
                                { name: "Home", nav: "/" },
                                { name: arg2.charAt(0).toUpperCase() + arg2.slice(1), nav: `/${arg1}/${arg2}` },
                            ]}
                        />
                    )}
                    <div className="flex min-[570px]:flex-row flex-col justify-between items-start gap-4 pb-3">
                        <div className="flex min-[840px]:flex-row flex-col min-[840px]:items-center items-start gap-x-4">
                            {router.isReady && (
                                <h1 className="text-[28px]">
                                    {arg1.charAt(0).toUpperCase() + arg1.slice(1)}: &quot;{arg2}&quot;
                                </h1>
                            )}
                            <p className="text-white/50 light:text-black/50 text-2xl">({totalItems} cosmetics)</p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col justify-center items-center pt-2 pb-15 min-[1130px]:px-0 px-4">
                    <div className="flex min-[1130px]:flex-row flex-col w-full gap-12">
                        <div className="min-[1130px]:w-45 w-full shrink-0 h-fit py-2.5 px-4 bg-primary/35 light:bg-primary-light/35 border border-white/30 light:border-white/80 rounded-xl shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)]">
                            <div className="flex min-[1130px]:flex-col min-[430px]:flex-row flex-col min-[1130px]:gap-4 min-[430px]:gap-16 gap-4">
                                {arg1 !== "type" && (
                                    <div className="flex flex-col gap-2">
                                        <h2 className="font-medium">Types</h2>
                                        <div className="flex flex-col gap-1">
                                            {validTypes.map((type) => (
                                                <Checkbox
                                                    key={type}
                                                    id={type}
                                                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                                                    checked={selectedTypes.includes(type)}
                                                    onChange={(checked) => {
                                                        setSelectedTypes((prev) => (checked ? [...prev, type] : prev.filter((t) => t !== type)));
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {arg1 !== "category" && (
                                    <>
                                        <div className="flex flex-col gap-2">
                                            <h2 className="font-medium">Tags</h2>
                                            <div className="flex flex-row flex-wrap gap-2">
                                                {tags
                                                    .filter((tag) => tag.tagType === "custom")
                                                    .map((tag) => (
                                                        <Tag
                                                            key={tag.name}
                                                            clicked={selectedTags.includes(tag.name)}
                                                            onClick={() => {
                                                                setSelectedTags((prev) => (prev.includes(tag.name) ? prev.filter((t) => t !== tag.name) : [...prev, tag.name]));
                                                            }}
                                                            label={tag.displayName}
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h2 className="font-medium">Colors</h2>
                                            <div className="flex flex-col gap-1">
                                                {tags
                                                    .filter((tag) => tag.tagType === "color")
                                                    .map((tag) => (
                                                        <Checkbox
                                                            key={tag.name}
                                                            checked={selectedColors.includes(tag.name)}
                                                            onChange={(checked) => {
                                                                setSelectedColors((prev) => (checked ? [...prev, tag.name] : prev.filter((t) => t !== tag.name)));
                                                            }}
                                                            id={tag.name}
                                                            label={tag.displayName}
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-row flex-wrap min-[1130px]:gap-x-12 min-[1130px]:justify-start justify-center gap-x-4 gap-y-8">
                                {!loading ? (
                                    <>
                                        {items.map((cosmetic) => (
                                            <ItemCard key={cosmetic.id} name={cosmetic.name} id={cosmetic.id} coverId={cosmetic.coverAssetId} price={cosmetic.price} discount={cosmetic.discount} newItem={isNewItem(cosmetic.createdAt)} />
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {Array.from({ length: 8 }).map((_, index) => (
                                            <LoadingItemCard key={index} />
                                        ))}
                                    </>
                                )}
                            </div>
                            {items.length > 0 && currentPage < pages && !paginating && <div ref={ref} className="flex h-0.5 w-full" />}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
