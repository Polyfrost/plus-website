import Button from "@/components/Button";
import Bag from "@/components/icons/Bag";
import Cart from "@/components/icons/Cart";
import ItemCard from "@/components/ItemCard";
import ItemCarousel from "@/components/ItemCarousel";
import PageNav from "@/components/PageNav";
import Tag from "@/components/Tag";
import { getCosmeticById, usernameToUUID, UUIDToSkinURL } from "@/utils/APIUtils";
import { useRouter } from "next/router";
import { isNewItem } from "@/utils/TimeUtils";
import { useEffect, useRef, useState } from "react";
import { IdleAnimation, SkinViewer, loadCosmeticFromZip } from "skinview3d";
import { useCart } from "@/context/CartContext";
import { searchCosmetics } from "@/utils/APIUtils";
import Check from "@/components/icons/Check";
import { Item } from "@/types/Item";
import TextInput from "@/components/TextInput";
import User from "@/components/icons/User";
import LoadingItemCard from "@/components/LoadingItemCard";

export default function Id() {
    const router = useRouter();
    const cart = useCart();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [username, setUsername] = useState<string>("");
    const [uuid, setUUID] = useState<string | null>(null);
    const [skinURL, setSkinURL] = useState<string>("https://textures.minecraft.net/texture/90b8789136facaa9f87b765140e1c8135e6652f513481bd84e6bd8c44844d7ce");
    const [skinType, setSkinType] = useState<"slim" | "wide">("wide");

    const [cosmetic, setCosmetic] = useState<Item>();
    const [selectedVariant, setSelectedVariant] = useState<number>(0);
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
        async function fetchUUID() {
            if (username) {
                const uuidData = await usernameToUUID(username);
                setUUID(uuidData);
            } else {
                setUUID(null);
            }
        }

        const timeout = setTimeout(() => {
            fetchUUID();
        }, 500);

        return () => clearTimeout(timeout);
    }, [username]);

    useEffect(() => {
        async function fetchSkinURL() {
            if (uuid) {
                const skinURLData = await UUIDToSkinURL(uuid);
                setSkinURL(skinURLData.skin);
                setSkinType(skinURLData.type);
            } else {
                setSkinURL("https://textures.minecraft.net/texture/90b8789136facaa9f87b765140e1c8135e6652f513481bd84e6bd8c44844d7ce");
                setSkinType("wide");
            }
        }

        fetchSkinURL();
    }, [uuid]);

    useEffect(() => {
        if (!cosmetic) return;

        const canvas = canvasRef.current;
        const box = canvas?.parentElement;
        if (!canvas || !box) return;

        if (cosmetic.variants?.find((variant) => variant.name?.toLowerCase() === skinType)) {
            const variantIndex = cosmetic.variants?.findIndex((v) => v.name?.toLowerCase() === skinType) ?? -1;
            setSelectedVariant(variantIndex >= 0 ? variantIndex : 0);
        }

        const skinViewer = new SkinViewer({
            canvas,
            width: 600,
            height: 480,
            skin: skinURL,
            animation: new IdleAnimation(),
        });

        skinViewer.autoRotate = true;
        skinViewer.autoRotateSpeed = 0.3;
        skinViewer.camera.position.set(0, 0, cosmetic.type === "cape" || cosmetic.type === "wings" || cosmetic.type === "backpack" ? -1 : 1);
        skinViewer.zoom = cosmetic.type === "wings" ? 0.55 : 0.9;

        if (cosmetic.type === "hat") {
            skinViewer.camera.position.y = 10;
            skinViewer.controls.target.set(0, 10, 0);
        }

        const assetURL = `${process.env.BACKEND_URL}/asset/${cosmetic.variants?.[selectedVariant]?.assetId ?? cosmetic.assetId}`;

        if (cosmetic.type === "cape") {
            skinViewer.loadCape(assetURL);
        } else {
            loadCosmeticFromZip(skinViewer, assetURL, { type: cosmetic.type as any });
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
    }, [cosmetic, selectedVariant, skinURL]);

    return (
        <>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col min-[840px]:pt-60 pt-20 min-[1130px]:px-0 px-4">
                    {cosmetic ? (
                        <PageNav
                            pages={[
                                { name: "Home", nav: "/" },
                                { name: cosmetic.type.charAt(0).toUpperCase() + cosmetic.type.slice(1), nav: `/type/${cosmetic.type}` },
                                { name: cosmetic.name, nav: `/item/${cosmetic.id}` },
                            ]}
                        />
                    ) : (
                        <div className="h-7 w-80 bg-white/30 mb-4 animate-pulse rounded-md" />
                    )}
                </div>
            </section>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col pt-2 min-[1130px]:px-0 px-4">
                    <div className="flex min-[1130px]:flex-row flex-col gap-7 w-full pb-5">
                        <div className="flex flex-col gap-2 min-[1130px]:w-4/7 w-full">
                            <div className="relative bg-primary/35 light:bg-primary-light/35 h-120 rounded-xl border border-white/30 light:border-white/80 shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] overflow-hidden">
                                <div className="absolute bottom-4 left-4">
                                    <TextInput
                                        icon={<User className="w-4 h-4 text-white/50 light:text-black/50" />}
                                        placeholder="Username"
                                        className="w-40"
                                        value={username}
                                        onChange={(value) => setUsername(value)}
                                    />
                                </div>
                                <canvas ref={canvasRef} className={`hover:cursor-pointer active:cursor-move`} />
                            </div>
                            {cosmetic?.variants && (
                                <>
                                    <h1 className="text-lg">Variants</h1>
                                    <div className="flex flex-row flex-wrap gap-2">
                                        {cosmetic.variants.map((variant, index) => (
                                            <button
                                                className={`${selectedVariant === index ? "bg-blue border-blue-400/30" : "bg-primary/50 light:bg-primary-light/50 border-white/30 light:border-white/80"} duration-300 relative p-2 rounded-md shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] select-none`}
                                                onClick={() => setSelectedVariant(index)}
                                                key={variant.id}
                                            >
                                                <div className="flex flex-col gap-1 justify-center items-center">
                                                    <div className="h-14.5 w-fit bg-neutral-300/10 rounded-lg shrink-0">
                                                        <img
                                                            className="rounded-[5px] h-14.5 w-14.5 border border-white/10 light:border-white/90 object-cover"
                                                            src={`${process.env.BACKEND_URL}/asset/${variant.coverAssetId}`}
                                                        />
                                                    </div>
                                                    <p className="text-text light:text-black text-sm leading-6 whitespace-nowrap truncate">{variant.name || "Default"}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col gap-3 min-[1130px]:w-3/7 w-full">
                            <div className="flex flex-row gap-2 items-center">
                                {cosmetic?.tags && cosmetic?.tags.length > 0 ? (
                                    cosmetic?.tags.map((tag) => <Tag key={tag} label={tag.charAt(0).toUpperCase() + tag.slice(1)} />)
                                ) : (
                                    <div className="h-5 w-30 bg-white/30 animate-pulse rounded-md" />
                                )}
                            </div>
                            {cosmetic ? <h1 className="text-3xl text-white/75 light:text-black/75">{cosmetic.name}</h1> : <div className="h-10.5 w-80 bg-white/30 animate-pulse rounded-md" />}
                            {cosmetic ? <p className="text-text light:text-black text-sm leading-6">{cosmetic.description}</p> : <div className="h-4 w-60 bg-white/30 animate-pulse rounded-md" />}
                            {cosmetic ? (
                                <div className="flex flex-row gap-2 items-end">
                                    {cosmetic && cosmetic.discount && <p className="text-red text-md leading-6 line-through">${cosmetic.price.toFixed(2)}</p>}
                                    <p className={`${cosmetic && cosmetic.discount ? "text-green" : ""} text-[32px] leading-10`}>
                                        ${(cosmetic ? cosmetic.price * (1 - (cosmetic.discount || 0) / 100) : 0).toFixed(2)}
                                    </p>
                                </div>
                            ) : (
                                <div className="h-11.5 w-40 bg-white/30 animate-pulse rounded-md" />
                            )}
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
                <div className="max-w-273 mx-auto flex flex-col justify-center items-center min-[1130px]:px-0 px-4 py-10">
                    <ItemCarousel title="Similar Cosmetics" stepSize={228}>
                        {similarCosmetics.length > 0 ? (
                            <>
                                {similarCosmetics.map((cosmetic) => (
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
                            </>
                        ) : (
                            <>
                                {Array.from({ length: 10 }).map((_, index) => (
                                    <LoadingItemCard key={index} />
                                ))}
                            </>
                        )}
                    </ItemCarousel>
                </div>
            </section>
            {/* <section className="relative overflow-hidden">
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
            </section> */}
        </>
    );
}
