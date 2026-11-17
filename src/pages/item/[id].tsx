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
import { Renderer } from "@plusrenderer/renderer";
import { unzipSync } from "fflate";
import { loadSkinToCanvas } from "skinview-utils";
import { useCart } from "@/context/CartContext";
import CheckIcon from "@/components/icons/Check";
import { Item } from "@/types/Item";
import TextInput from "@/components/TextInput";
import UserIcon from "@/components/icons/User";
import type { GetServerSideProps } from "next";
import { effectiveCents, formatUsd, hasDiscount, toCents } from "@/utils/PriceUtils";

const DEFAULT_SKIN = "https://textures.minecraft.net/texture/90b8789136facaa9f87b765140e1c8135e6652f513481bd84e6bd8c44844d7ce";

// Cosmetics hang off the nearest lower slot, so the player goes first.
const PLAYER_SLOT = 0;
const COSMETIC_SLOT = 1;

const SPIN_DEGREES_PER_SECOND = 1.8;

// The renderer ships no idle, so sway the arms with a looping emote.
const armSway = "math.cos(query.anim_time * 115) * 1.7";
const IDLE_ANIMATION = JSON.stringify({
    format_version: "1.8.0",
    animations: {
        "animation.player.idle": {
            loop: true,
            animation_length: Math.PI,
            bones: {
                rightArm: { rotation: [0, 0, `3.6 + ${armSway}`] },
                leftArm: { rotation: [0, 0, `-3.6 - ${armSway}`] },
            },
        },
    },
});

// Emotes usually play once in game, but the store preview should keep going.
function looped(json: string) {
    const file = JSON.parse(json);
    for (const animation of Object.values<{ loop?: boolean }>(file.animations ?? {})) animation.loop = true;
    return JSON.stringify(file);
}

async function fetchChecked(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res;
}

function cameraFor(type: string) {
    return {
        yaw: type === "cape" || type === "wings" || type === "backpack" ? 180 : 0,
        pitch: 8,
        distance: type === "wings" ? 105 : 64,
        targetY: type === "hat" ? 28 : 18,
    };
}

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
    const cameraRef = useRef(cameraFor(cosmetic.type));

    const price = cosmetic.price;
    const onSale = hasDiscount(cosmetic.discount);
    // A cosmetic with no price set cannot be bought.
    const unavailable = price === null || price === undefined;

    const [username, setUsername] = useState<string>("");
    const [uuid, setUUID] = useState<string | null>(null);
    const [skinURL, setSkinURL] = useState<string>(DEFAULT_SKIN);
    const [skinType, setSkinType] = useState<"slim" | "wide">("wide");

    const [selectedVariant, setSelectedVariant] = useState<number>(0);
    const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);
    const [renderer, setRenderer] = useState<Renderer | null>(null);

    const variant = cosmetic.variants?.filter((variant) => variant.model === skinType || !variant.model).find((variant) => variant.id === selectedVariant);
    const assetId = variant?.assetId ?? cosmetic.assetId;

    useEffect(() => {
        try {
            const canvas = document.createElement("canvas");
            setWebGLSupported(!!canvas.getContext("webgl2"));
        } catch {
            setWebGLSupported(false);
        }
    }, []);

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
                setSkinURL(DEFAULT_SKIN);
                setSkinType("wide");
            }
        }

        fetchSkinURL();
    }, [uuid]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || webGLSupported !== true) return;

        let disposed = false;
        let frame = 0;
        let dragging = false;
        let hovering = false;
        let lastMs: number | undefined;

        // The wasm instance belongs to this renderer and is collected with it.
        Renderer.create(canvas)
            .then((created) => {
                if (disposed) return;
                setRenderer(created);

                const draw = (ms: number) => {
                    if (!dragging && !hovering && lastMs !== undefined) cameraRef.current.yaw += ((ms - lastMs) / 1000) * SPIN_DEGREES_PER_SECOND;
                    lastMs = ms;
                    created.draw(cameraRef.current, ms / 1000);
                    frame = requestAnimationFrame(draw);
                };
                frame = requestAnimationFrame(draw);
            })
            .catch((error) => {
                console.error(error);
                setWebGLSupported(false);
            });

        const onPointerEnter = (e: PointerEvent) => {
            hovering = true;
        };
        const onPointerLeave = (e: PointerEvent) => {
            hovering = false;
        };
        const onPointerDown = (e: PointerEvent) => {
            dragging = true;
            canvas.setPointerCapture(e.pointerId);
        };
        const onPointerUp = () => (dragging = false);
        const onPointerMove = (e: PointerEvent) => {
            if (!dragging) return;
            const camera = cameraRef.current;
            camera.yaw += e.movementX * 0.6;
            camera.pitch = Math.min(89, Math.max(-89, camera.pitch + e.movementY * 0.4));
        };
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const camera = cameraRef.current;
            camera.distance = Math.min(160, Math.max(25, camera.distance * Math.exp(e.deltaY * 0.001)));
        };

        canvas.addEventListener("pointerenter", onPointerEnter);
        canvas.addEventListener("pointerleave", onPointerLeave);
        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("pointercancel", onPointerUp);
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            disposed = true;
            cancelAnimationFrame(frame);
            setRenderer(null);
            canvas.removeEventListener("pointerenter", onPointerEnter);
            canvas.removeEventListener("pointerleave", onPointerLeave);
            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("pointercancel", onPointerUp);
            canvas.removeEventListener("pointermove", onPointerMove);
            canvas.removeEventListener("wheel", onWheel);
        };
    }, [webGLSupported]);

    useEffect(() => {
        cameraRef.current = cameraFor(cosmetic.type);
    }, [cosmetic.type]);

    useEffect(() => {
        if (!renderer) return;
        renderer.loadPlayer(PLAYER_SLOT, skinType === "slim");
        renderer.loadAnimation(PLAYER_SLOT, IDLE_ANIMATION);
        renderer.play(PLAYER_SLOT, performance.now() / 1000);
    }, [renderer, skinType]);

    useEffect(() => {
        if (!renderer) return;
        let cancelled = false;

        fetchChecked(skinURL)
            .then((res) => res.blob())
            .then(createImageBitmap)
            .then((image) => {
                if (cancelled) return;
                // Upgrades legacy 64x32 skins to the layout the player model expects.
                const skin = document.createElement("canvas");
                loadSkinToCanvas(skin, image);
                renderer.setTexture(PLAYER_SLOT, skin);
            })
            .catch(console.error);

        return () => {
            cancelled = true;
        };
    }, [renderer, skinURL]);

    // skinType is a dependency because reloading the player unbinds whatever hangs off it.
    useEffect(() => {
        if (!renderer) return;
        let cancelled = false;
        const isEmote = cosmetic.type === "emote";

        async function loadCosmetic(renderer: Renderer) {
            const res = await fetchChecked(`${process.env.NEXT_PUBLIC_BACKEND_URL}/asset/${assetId}`);
            const bytes = new Uint8Array(await res.arrayBuffer());

            // Zips start with "PK". Anything else is a bare cape texture.
            const files = bytes[0] === 0x50 && bytes[1] === 0x4b ? unzipSync(bytes) : { "cape.png": bytes };
            const paths = Object.keys(files);
            const [geometry, animation, texture, sheet] = renderer.bundleParts(paths).map((index) => paths[index]);
            const decodeText = (path: string) => new TextDecoder().decode(files[path]);

            // An emote is only an animation, and it moves the player itself.
            if (isEmote) {
                if (!animation) throw new Error(`Asset ${assetId} holds no animation`);
                if (cancelled) return;
                renderer.loadAnimation(PLAYER_SLOT, looped(decodeText(animation)));
                renderer.play(PLAYER_SLOT, performance.now() / 1000);
                return;
            }

            if (!texture) throw new Error(`Asset ${assetId} holds no texture`);

            const decodeImage = (path: string) => createImageBitmap(new Blob([files[path] as BlobPart]));
            const [image, sheetImage] = await Promise.all([decodeImage(texture), sheet ? decodeImage(sheet) : undefined]);
            if (cancelled) return;

            if (!geometry) {
                renderer.loadCape(COSMETIC_SLOT, image, sheetImage, sheet);
                return;
            }

            // Either hand slot works for a glove: the renderer picks the arm from the geometry's side.
            const bodySlot = cosmetic.type === "glove" ? "left_hand" : cosmetic.type;
            renderer.loadCosmetic(COSMETIC_SLOT, decodeText(geometry), bodySlot, image);
            if (animation) {
                renderer.loadAnimation(COSMETIC_SLOT, decodeText(animation));
                renderer.play(COSMETIC_SLOT, performance.now() / 1000);
            }
        }

        loadCosmetic(renderer).catch(console.error);

        return () => {
            cancelled = true;
            renderer.clear(COSMETIC_SLOT);
            if (isEmote) {
                renderer.loadAnimation(PLAYER_SLOT, IDLE_ANIMATION);
                renderer.play(PLAYER_SLOT, performance.now() / 1000);
            }
        };
    }, [renderer, assetId, cosmetic.type, skinType]);

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
                                {webGLSupported && (
                                    <div className="absolute bottom-4 left-4">
                                        <TextInput
                                            icon={<UserIcon className="w-4.5 h-4.5 text-white/50 light:text-black/50" />}
                                            placeholder="Username"
                                            className="w-40"
                                            value={username}
                                            onChange={(value) => setUsername(value)}
                                        />
                                    </div>
                                )}
                                {!webGLSupported ? (
                                    <img
                                        className="w-full h-full object-contain"
                                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/asset/${variant?.coverAssetId ?? cosmetic.coverAssetId}`}
                                        alt={`Cover image for ${cosmetic.name}`}
                                    />
                                ) : (
                                    <canvas ref={canvasRef} className="block w-full h-full touch-none hover:cursor-pointer active:cursor-move" />
                                )}
                            </div>
                            {cosmetic.variants && cosmetic.variants.length > 1 && (
                                <>
                                    <h1 className="text-lg">Variants</h1>
                                    <div className="flex flex-row flex-wrap gap-2">
                                        {cosmetic.variants
                                            .filter((variant) => variant.model === skinType || !variant.model)
                                            .map((variant, index) => (
                                                <button
                                                    className={`${selectedVariant === variant.id ? "bg-blue border-blue-400/30" : "bg-primary/50 light:bg-primary-light/50 border-white/10 light:border-white/15"} border duration-300 relative p-2 rounded-md shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] light:shadow-[0px_6px_15px_0px_rgba(0,0,0,0.10)] select-none`}
                                                    onClick={() => setSelectedVariant(variant.id)}
                                                    key={variant.id}
                                                >
                                                    <div className="flex flex-col gap-1 justify-center items-center">
                                                        <div className="h-14.5 w-fit bg-primary/50 light:bg-primary-light/50 rounded-lg shrink-0">
                                                            <img
                                                                className="rounded-[5px] h-14.5 w-14.5 border border-white/10 light:border-white/15 object-cover"
                                                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/asset/${variant.coverAssetId}`}
                                                                alt={`Cover image for ${cosmetic.name} variant ${variant.name || "Default"}`}
                                                            />
                                                        </div>
                                                        <p
                                                            className={`${selectedVariant === variant.id ? "text-white" : "text-white light:text-black"} text-sm leading-6 whitespace-nowrap duration-300`}
                                                        >
                                                            {variant.name || "Default"}
                                                        </p>
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
                                {onSale && !unavailable && <p className="text-red text-md leading-6 line-through">{formatUsd(toCents(price))}</p>}
                                <p className={`${onSale ? "text-green" : ""} text-[32px] leading-10`}>{unavailable ? "Unavailable" : formatUsd(effectiveCents(price, cosmetic.discount))}</p>
                            </div>
                            <div className="flex flex-row gap-4 items-center">
                                <Button
                                    icon={cart?.has(cosmetic.id) ? <CheckIcon className="w-4.5 h-4.5 text-white" /> : <CartIcon className="w-4.5 h-4.5 text-white" />}
                                    label={cart?.has(cosmetic.id) ? "In cart" : "Add to Cart"}
                                    color="blue"
                                    className="w-full"
                                    onClick={() => (cart?.has(cosmetic.id) ? cart.remove(cosmetic.id) : cart?.add(cosmetic.id))}
                                    disabled={unavailable}
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
                                        disabled={unavailable}
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
                                previewUrl={cosmetic.previewUrl}
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
