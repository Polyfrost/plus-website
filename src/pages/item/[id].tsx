import Button from "@/components/Button";
import BagIcon from "@/components/icons/Bag";
import CartIcon from "@/components/icons/Cart";
import ItemCard from "@/components/ItemCard";
import ItemCarousel from "@/components/ItemCarousel";
import PageNav from "@/components/PageNav";
import Tag from "@/components/Tag";
import { getCosmeticById, searchCosmetics, toSerializable, usernameToUUID, UUIDToSkinURL } from "@/utils/APIUtils";
import { useRouter } from "next/router";
import { isNewItem } from "@/utils/TimeUtils";
import { useEffect, useRef, useState } from "react";
import { IdleAnimation, SkinViewer, loadCosmeticFromZip } from "skinview3d";
import { useCart } from "@/context/CartContext";
import CheckIcon from "@/components/icons/Check";
import { Item } from "@/types/Item";
import TextInput from "@/components/TextInput";
import UserIcon from "@/components/icons/User";
import type { GetServerSideProps } from "next";

type IdProps = {
    cosmetic: Item;
    similarCosmetics: Item[];
};

export const getServerSideProps: GetServerSideProps<IdProps> = async ({ params }) => {
    const id = Number(params?.id);
    if (!Number.isInteger(id)) return { notFound: true };

    let cosmetic: Item;
    try {
        cosmetic = await getCosmeticById(id);
    } catch {
        return { notFound: true };
    }

    const similarCosmetics = await searchCosmetics({ types: cosmetic.type, nb: 10 })
        .then((data) => data.items)
        .catch(() => []);

    return { props: toSerializable({ cosmetic, similarCosmetics }) };
};

export default function Id({ cosmetic, similarCosmetics }: IdProps) {
    const router = useRouter();
    const cart = useCart();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [username, setUsername] = useState<string>("");
    const [uuid, setUUID] = useState<string | null>(null);
    const [skinURL, setSkinURL] = useState<string>("https://textures.minecraft.net/texture/90b8789136facaa9f87b765140e1c8135e6652f513481bd84e6bd8c44844d7ce");
    const [skinType, setSkinType] = useState<"slim" | "wide">("wide");

    const [selectedVariant, setSelectedVariant] = useState<number>(0);

    useEffect(() => {
        setSelectedVariant(cosmetic.variants?.filter((variant) => variant.model === skinType || !variant.model)[0]?.id ?? 0);
    }, [cosmetic, skinType]);

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
        const canvas = canvasRef.current;
        const box = canvas?.parentElement;
        if (!canvas || !box) return;

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

        const assetURL = `${process.env.BACKEND_URL}/asset/${cosmetic.variants?.filter((variant) => variant.model === skinType || !variant.model).find((variant) => variant.id === selectedVariant)?.assetId ?? cosmetic.assetId}`;

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
    }, [cosmetic, selectedVariant, skinURL, skinType]);

    return (
        <>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col min-[840px]:pt-60 pt-20 min-[1130px]:px-0 px-4">
                    <PageNav
                        pages={[
                            { name: "Home", nav: "/" },
                            { name: cosmetic.type.charAt(0).toUpperCase() + cosmetic.type.slice(1), nav: `/type/${cosmetic.type}` },
                            { name: cosmetic.name, nav: `/item/${cosmetic.id}` },
                        ]}
                    />
                </div>
            </section>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col pt-2 min-[1130px]:px-0 px-4">
                    <div className="flex min-[1130px]:flex-row flex-col gap-7 w-full pb-5">
                        <div className="flex flex-col gap-2 min-[1130px]:w-4/7 w-full">
                            <div className="relative bg-primary/35 light:bg-primary-light/35 h-120 rounded-xl border border-white/10 light:border-white/15 shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] light:shadow-[0px_6px_15px_0px_rgba(0,0,0,0.10)] overflow-hidden">
                                <div className="absolute bottom-4 left-4">
                                    <TextInput
                                        icon={<UserIcon className="w-4.5 h-4.5 text-white/50 light:text-black/50" />}
                                        placeholder="Username"
                                        className="w-40"
                                        value={username}
                                        onChange={(value) => setUsername(value)}
                                    />
                                </div>
                                <canvas ref={canvasRef} className={`hover:cursor-pointer active:cursor-move`} />
                            </div>
                            {cosmetic.variants && cosmetic.variants.length > 1 && (
                                <>
                                    <h1 className="text-lg">Variants</h1>
                                    <div className="flex flex-row flex-wrap gap-2">
                                        {cosmetic.variants.filter((variant) => variant.model === skinType || !variant.model).map((variant, index) => (
                                            <button
                                                className={`${selectedVariant === variant.id ? "bg-blue border-blue-400/30" : "bg-primary/50 light:bg-primary-light/50 border-white/10 light:border-white/15"} border duration-300 relative p-2 rounded-md shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] light:shadow-[0px_6px_15px_0px_rgba(0,0,0,0.10)] select-none`}
                                                onClick={() => setSelectedVariant(variant.id)}
                                                key={variant.id}
                                            >
                                                <div className="flex flex-col gap-1 justify-center items-center">
                                                    <div className="h-14.5 w-fit bg-primary/50 light:bg-primary-light/50 rounded-lg shrink-0">
                                                        <img
                                                            className="rounded-[5px] h-14.5 w-14.5 border border-white/10 light:border-white/15 object-cover"
                                                            src={`${process.env.BACKEND_URL}/asset/${variant.coverAssetId}`}
                                                            alt={`Cover image for ${cosmetic.name} variant ${variant.name || "Default"}`}
                                                        />
                                                    </div>
                                                    <p className={`${selectedVariant === variant.id ? "text-white" : "text-white light:text-black"} text-sm leading-6 whitespace-nowrap duration-300`}>{variant.name || "Default"}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col gap-3 min-[1130px]:w-3/7 w-full">
                            <div className="flex flex-row gap-2 items-center">
                                {cosmetic.tags.map((tag) => (
                                    <Tag key={tag} label={tag.charAt(0).toUpperCase() + tag.slice(1)} />
                                ))}
                            </div>
                            <h1 className="text-3xl">{cosmetic.name}</h1>
                            <p className="text-sm text-white/75 light:text-black/75 leading-6">{cosmetic.description}</p>
                            <div className="flex flex-row gap-2 items-end">
                                {cosmetic.discount && <p className="text-red text-md leading-6 line-through">${cosmetic.price.toFixed(2)}</p>}
                                <p className={`${cosmetic.discount ? "text-green" : ""} text-[32px] leading-10`}>${(cosmetic.price * (1 - (cosmetic.discount || 0) / 100)).toFixed(2)}</p>
                            </div>
                            <div className="flex flex-row gap-4 items-center">
                                <Button
                                    icon={cart?.has(cosmetic.id) ? <CheckIcon className="w-4.5 h-4.5 text-white" /> : <CartIcon className="w-4.5 h-4.5 text-white" />}
                                    label={cart?.has(cosmetic.id) ? "In cart" : "Add to Cart"}
                                    color="blue"
                                    className="w-full"
                                    onClick={() => (cart?.has(cosmetic.id) ? cart.remove(cosmetic.id) : cart?.add(cosmetic.id))}
                                />
                                {!cart?.has(cosmetic.id) && (
                                    <Button
                                        icon={<BagIcon className="w-4.5 h-4.5" />}
                                        label="Buy Now"
                                        addedWidth="30px"
                                        color="primary"
                                        className="w-fit"
                                        onClick={() => {
                                            cart?.add(cosmetic.id);
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
