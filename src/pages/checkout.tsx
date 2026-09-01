import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import BagIcon from "@/components/icons/Bag";
import CheckIcon from "@/components/icons/Check";
import ItemTagIcon from "@/components/icons/ItemTag";
import UserIcon from "@/components/icons/User";
import ItemCard from "@/components/ItemCard";
import ItemCarousel from "@/components/ItemCarousel";
import ItemListCard from "@/components/ItemListCard";
import PageNav from "@/components/PageNav";
import Tag from "@/components/Tag";
import TextInput from "@/components/TextInput";
import { useCart } from "@/context/CartContext";
import { Item } from "@/types/Item";
import { createCheckout, searchCosmetics, toSerializable, usernameToUUID } from "@/utils/APIUtils";
import { isNewItem } from "@/utils/TimeUtils";
import { effectiveCents, formatUsd, toCents } from "@/utils/PriceUtils";
import type { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

type CheckoutProps = {
    editorsPick: Item[];
};

export const getServerSideProps: GetServerSideProps<CheckoutProps> = async () => {
    const editorsPick = await searchCosmetics({ tags: "editor" })
        .then((data) => data.items)
        .catch(() => []);

    return { props: toSerializable({ editorsPick }) };
};

export default function Checkout({ editorsPick }: CheckoutProps) {
    const [username, setUsername] = useState<string>("");
    const [uuid, setUUID] = useState<string | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
    const [promoCode, setPromoCode] = useState<string>("");
    const [promoCodes, setPromoCodes] = useState<string[]>([]);

    const cart = useCart();
    // null while the cart is rehydrating its prices from the API.
    const items = cart?.items ?? null;
    const loading = items === null;

    // Rounded per line, then summed, so these match what the backend charges.
    const subtotalCents = (items ?? []).reduce((total, item) => total + toCents(item.price ?? 0), 0);
    const totalCents = (items ?? []).reduce((total, item) => total + effectiveCents(item.price ?? 0, item.discount), 0);
    const discountCents = subtotalCents - totalCents;

    useEffect(() => {
        async function fetchUUID() {
            if (username) {
                const minecraftData = await usernameToUUID(username);
                setUUID(minecraftData);
            } else {
                setUUID(null);
            }
        }

        const timeout = setTimeout(() => {
            fetchUUID();
        }, 500);

        return () => clearTimeout(timeout);
    }, [username]);

    const handleCheckout = async () => {
        if (!uuid) {
            alert("Please enter a valid Minecraft username.");
            return;
        }

        if (!cart || !cart.items || cart.items.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        if (!acceptedTerms) {
            alert("Please accept the terms and conditions.");
            return;
        }

        // Silently dropping these would charge for a smaller basket than the
        // total the page is showing.
        const unavailable = cart.items.filter((item) => !item.productId || item.price === null);
        if (unavailable.length > 0) {
            alert(`These items can't be purchased right now: ${unavailable.map((item) => item.name).join(", ")}. Please remove them from your cart.`);
            return;
        }

        const result = await createCheckout(
            uuid,
            cart.items.map((item) => item.productId!),
            promoCodes
        );

        if ("url" in result) {
            window.location.href = result.url;
        } else {
            alert(result.error);
        }
    };

    const addPromoCode = () => {
        const code = promoCode.trim().toUpperCase();
        if (!code || promoCodes.includes(code)) {
            setPromoCode("");
            return;
        }

        setPromoCodes([...promoCodes, code]);
        setPromoCode("");
    };

    const removePromoCode = (code: string) => {
        setPromoCodes(promoCodes.filter((existing) => existing !== code));
    };

    return (
        <>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col min-[840px]:pt-60 pt-20 min-[1130px]:px-0 px-4">
                    <PageNav
                        pages={[
                            { name: "Home", nav: "/" },
                            { name: "Checkout", nav: "/checkout" },
                        ]}
                    />
                </div>
            </section>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col pt-2 min-[1130px]:px-0 px-4">
                    <div className="flex min-[900px]:flex-row flex-col gap-8 w-full">
                        <div className="flex flex-col gap-3 min-[900px]:w-2/3 w-full pb-5">
                            {items?.map((item) => (
                                <ItemListCard key={item.id} name={item.name} description={item.description} id={item.id} coverId={item.coverAssetId} price={item.price} discount={item.discount} />
                            ))}
                            {loading && <p className="text-center">Loading your cart...</p>}
                            {items?.length === 0 && <p className="text-center">No Items {`:(`}</p>}
                        </div>
                        <div className="flex flex-col gap-5 min-[900px]:w-1/3 w-full">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-row justify-between items-center">
                                    <h2 className="text-sm">Minecraft Username</h2>
                                    {uuid && <img className="h-5 w-5" src={`https://nmsr.nickac.dev/face/${uuid}`} alt={`Minecraft face for ${username}`} />}
                                </div>
                                <TextInput
                                    icon={<UserIcon className="w-4.5 h-4.5 text-white/50 light:text-black/50" />}
                                    placeholder="Enter your Minecraft username"
                                    className="w-full"
                                    value={username}
                                    onChange={(value) => setUsername(value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-row justify-between items-center">
                                    <h1 className="text-xl font-medium">Total</h1>
                                    <p className="text-2xl font-medium">{loading ? "-" : formatUsd(totalCents)}</p>
                                </div>
                                <div className="flex flex-row justify-between items-center">
                                    <h1 className="text-sm">Subtotal</h1>
                                    <p className="text-sm">{loading ? "-" : formatUsd(subtotalCents)}</p>
                                </div>
                                <div className="flex flex-row justify-between items-center">
                                    <h1 className="text-sm">Discounts</h1>
                                    <p className="text-sm text-green">{loading ? "-" : `-${formatUsd(discountCents)}`}</p>
                                </div>
                            </div>
                            <Button
                                icon={<BagIcon className="w-4.5 h-4.5 text-white" />}
                                label={`Checkout ${items?.length ?? 0} items`}
                                color="blue"
                                className="w-full"
                                onClick={handleCheckout}
                                disabled={!acceptedTerms || !uuid || !items || items.length === 0}
                            />
                            <div className="flex flex-col gap-3">
                                <h2 className="text-sm">Coupon Codes</h2>
                                <div className="flex flex-row gap-4">
                                    <TextInput
                                        icon={<ItemTagIcon className="w-4.5 h-4.5 text-white/50 light:text-black/50" />}
                                        placeholder="Enter coupon code..."
                                        className="w-full"
                                        value={promoCode}
                                        onChange={(value) => setPromoCode(value)}
                                    />
                                    <Button icon={<CheckIcon className="w-4.5 h-4.5 text-white" />} label="Apply" color="blue" className="w-fit" onClick={addPromoCode} disabled={!promoCode.trim()} />
                                </div>
                                {promoCodes.length > 0 && (
                                    <div className="flex flex-row flex-wrap gap-2">
                                        {promoCodes.map((code) => (
                                            <Tag key={code} label={code} onClick={() => removePromoCode(code)} />
                                        ))}
                                    </div>
                                )}
                                {promoCodes.length > 0 && <p className="text-xs text-white/50 light:text-black/50">Codes are checked when you continue to payment. Click one to remove it.</p>}
                            </div>
                            <Checkbox
                                id="terms"
                                customLabel={
                                    <label htmlFor={`checkbox-terms`} className="text-sm pl-2 leading-4.5 cursor-pointer select-none">
                                        I&apos;ve read & agree to the{" "}
                                        <a className="text-blue" href="https://polyfrost.org/legal/terms" target="_blank">
                                            OneClient Terms of Service
                                        </a>
                                    </label>
                                }
                                checked={acceptedTerms}
                                onChange={(checked) => setAcceptedTerms(checked)}
                            />
                        </div>
                    </div>
                </div>
            </section>
            <section className="relative overflow-hidden">
                <div className="max-w-273 mx-auto flex flex-col justify-center items-center min-[1130px]:px-0 px-4 pt-10 pb-15">
                    <ItemCarousel title="Discover More Cosmetics" stepSize={228}>
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
        </>
    );
}
