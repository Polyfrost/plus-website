import Button from "@/components/Button";
import Bag from "@/components/icons/Bag";
import Cart from "@/components/icons/Cart";
import ItemCard from "@/components/ItemCard";
import ItemCarousel from "@/components/ItemCarousel";
import PageNav from "@/components/PageNav";
import QuestionBox from "@/components/QuestionBox";
import Tag from "@/components/Tag";
import { getCosmeticById } from "@/utils/APIUtils";
import { useRouter } from "next/router";
import { isNewItem } from "@/utils/TimeUtils";
import { useEffect, useRef, useState } from "react";
import { IdleAnimation, SkinViewer, loadCosmeticFromZip } from "skinview3d";
import { useCart } from "@/context/CartContext";
import { searchCosmetics } from "@/utils/APIUtils";
import Check from "@/components/icons/Check";
import { Item } from "@/types/Item";

export default function Id() {
    const router = useRouter();
    const cart = useCart();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [cosmetic, setCosmetic] = useState<Item>();
    const [similarCosmetics, setSimilarCosmetics] = useState<Item[]>([]);

    useEffect(() => {
        async function fetchCosmetic() {
            if (!router.query.id) return;

            const cosmeticData = await getCosmeticById(Number(router.query.id));
            setCosmetic(cosmeticData);
        }

        fetchCosmetic();
    }, [router]);

    useEffect(() => {
        async function fetchSimilarCosmetics() {
            if (!cosmetic) return;

            const similarCosmeticsData = await searchCosmetics({ types: cosmetic.type, nb: 10 });
            setSimilarCosmetics(similarCosmeticsData.items);
        }

        fetchSimilarCosmetics();
    }, [cosmetic]);

    useEffect(() => {
        if (!cosmetic) return;

        const canvas = canvasRef.current;
        const box = canvas?.parentElement;
        if (!canvas || !box) return;

        const skinViewer = new SkinViewer({
            canvas,
            width: 608,
            height: 480,
            skin: "https://textures.minecraft.net/texture/f1ab242aacf57a7b31ce04957a311ab1456030986fa5920243c07f88f37f3ec6",
            animation: new IdleAnimation(),
        });

        skinViewer.autoRotate = true;
        skinViewer.autoRotateSpeed = 0.5;
        skinViewer.camera.position.set(0, 0, cosmetic.type === "cape" || cosmetic.type === "wings" ? -1 : 1);
        skinViewer.zoom = cosmetic.type === "wings" ? 0.55 : 0.75;

        if (cosmetic.type === "cape") {
            skinViewer.loadCape(`https://plus-staging.polyfrost.org/asset/${cosmetic.assetId}`);
        } else {
            loadCosmeticFromZip(skinViewer, `https://plus-staging.polyfrost.org/asset/${cosmetic.assetId}`, { type: cosmetic.type as any });
        }

        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            skinViewer.setSize(width, height);
        });
        observer.observe(box);

        return () => {
            observer.disconnect();
            skinViewer.dispose();
        };
    }, [cosmetic]);

    return (
        <>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col min-[840px]:pt-60 pt-20 min-[1130px]:px-0 px-4">
                    {cosmetic && (
                        <PageNav
                            pages={[
                                { name: "Home", nav: "/" },
                                { name: cosmetic.type.charAt(0).toUpperCase() + cosmetic.type.slice(1), nav: `/type/${cosmetic.type}` },
                                { name: cosmetic.name, nav: `/item/${cosmetic.id}` },
                            ]}
                        />
                    )}
                </div>
            </section>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col pt-2 min-[1130px]:px-0 px-4">
                    <div className="flex min-[1130px]:flex-row flex-col gap-7 w-full pb-5">
                        <div className="bg-primary/35 light:bg-primary-light/35 rounded-xl border border-white/30 light:border-white/80 min-[1130px]:w-4/7 shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] w-full overflow-hidden">
                            <canvas ref={canvasRef} className={`hover:cursor-pointer active:cursor-move`} />
                        </div>
                        <div className="flex flex-col gap-3 min-[1130px]:w-3/7 w-full">
                            <div className="flex flex-row gap-2 items-center">
                                {cosmetic?.tags.map((tag) => (
                                    <Tag key={tag} label={tag.charAt(0).toUpperCase() + tag.slice(1)} />
                                ))}
                            </div>
                            <h1 className="text-[40px]">{cosmetic?.name}</h1>
                            <p className="text-xl text-white/75 light:text-black/75 wrap-break-word">{cosmetic?.description}</p>
                            <div className="flex flex-row gap-2 items-end">
                                {cosmetic && cosmetic.discount && <p className="text-red text-md leading-6 line-through">${cosmetic.price.toFixed(2)}</p>}
                                <p className={`${cosmetic && cosmetic.discount ? "text-green" : ""} text-[32px] leading-10`}>
                                    ${(cosmetic ? cosmetic.price * (1 - (cosmetic.discount || 0) / 100) : 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="flex flex-row gap-4 items-center">
                                <Button
                                    icon={cart?.has(cosmetic?.id || 0) ? <Check className="w-4 h-4 text-text" /> : <Cart className="w-4 h-4 text-text" />}
                                    label={cart?.has(cosmetic?.id || 0) ? "In cart" : "Add to Cart"}
                                    color="blue"
                                    className="w-full"
                                    disabled={!cosmetic}
                                    onClick={() => (cart?.has(cosmetic?.id || 0) ? cart.remove(cosmetic?.id || 0) : cart?.add(cosmetic?.id || 0))}
                                />
                                {!cart?.has(cosmetic?.id || 0) && (
                                    <Button
                                        icon={<Bag className="w-4 h-4 text-text light:text-black" />}
                                        label="Buy Now"
                                        addedWidth="30px"
                                        color="primary"
                                        className="w-fit"
                                        disabled={!cosmetic}
                                        onClick={() => {
                                            cart?.add(cosmetic?.id || 0);
                                            router.push("/checkout");
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col justify-center items-center min-[1130px]:px-0 px-4 pt-10">
                    <ItemCarousel title="Similar Cosmetics" stepSize={228}>
                        {similarCosmetics.map((cosmetic) => (
                            <ItemCard key={cosmetic.id} name={cosmetic.name} id={cosmetic.id} price={cosmetic.price} discount={cosmetic.discount} newItem={isNewItem(cosmetic.createdAt)} />
                        ))}
                    </ItemCarousel>
                </div>
            </section>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col justify-center items-center min-[1130px]:px-0 px-4 pt-10 pb-15">
                    <div className="flex flex-col w-full">
                        <h1 className="text-lg">Frequently Asked Questions</h1>
                        <div className="flex flex-col gap-4 pt-5">
                            <QuestionBox question="How do I uhhhhhh?" answer="Uhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh" />
                            <QuestionBox question="How do I uhhhhhh?" answer="Uhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh" />
                            <QuestionBox question="How do I uhhhhhh?" answer="Uhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
