import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import Bag from "@/components/icons/Bag";
import User from "@/components/icons/User";
import ItemCard from "@/components/ItemCard";
import ItemCarousel from "@/components/ItemCarousel";
import ItemListCard from "@/components/ItemListCard";
import PageNav from "@/components/PageNav";
import TextInput from "@/components/TextInput";
import { useCart } from "@/context/CartContext";
import { Item } from "@/types/Item";
import { createStripe, searchCosmetics, usernameToUUID } from "@/utils/APIUtils";
import { isNewItem } from "@/utils/TimeUtils";
import { useEffect, useState } from "react";

export default function Checkout() {
    const [username, setUsername] = useState<string>("");
    const [uuid, setUUID] = useState<string | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

    const [editorsPick, setEditorsPick] = useState<Item[]>([]);
    const cart = useCart();

    useEffect(() => {
        async function fetchEditorsPick() {
            const cosmeticsData = await searchCosmetics({ tags: "editor" });

            setEditorsPick(cosmeticsData.items);
        }

        fetchEditorsPick();
    }, []);

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

    const handleStripeCheckout = async () => {
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

        const stripeData = await createStripe(
            uuid,
            cart.items.filter((item) => item.priceId !== undefined).map((item) => item.priceId!)
        );

        if (stripeData && stripeData.url) {
            window.location.href = stripeData.url;
        } else {
            alert("Failed to create Stripe checkout session.");
        }
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
                            {cart?.items!.map((item) => (
                                <ItemListCard key={item.id} name={item.name} description={item.description} id={item.id} price={item.price} discount={item.discount} />
                            ))}
                        </div>
                        <div className="flex flex-col gap-5 min-[900px]:w-1/3 w-full">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-row justify-between items-center">
                                    <h2 className="text-sm">Minecraft Username</h2>
                                    {uuid && <img className="h-5 w-5" src={`https://nmsr.nickac.dev/face/${uuid}`} />}
                                </div>
                                <TextInput
                                    icon={<User className="w-4 h-4 text-white/50 light:text-black/50" />}
                                    placeholder="Enter your Minecraft username"
                                    className="w-full"
                                    value={username}
                                    onChange={(value) => setUsername(value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-row justify-between items-center">
                                    <h1 className="text-xl font-medium">Total</h1>
                                    <p className="text-2xl font-medium">${cart?.items!.reduce((total, item) => total + item.price * (1 - (item.discount || 0) / 100), 0).toFixed(2)}</p>
                                </div>
                                <div className="flex flex-row justify-between items-center">
                                    <h1 className="text-sm">Subtotal</h1>
                                    <p className="text-sm">${cart?.items!.reduce((total, item) => total + item.price, 0).toFixed(2)}</p>
                                </div>
                                <div className="flex flex-row justify-between items-center">
                                    <h1 className="text-sm">Discounts</h1>
                                    <p className="text-sm text-green">-${cart?.items!.reduce((total, item) => total + (item.price * (item.discount || 0)) / 100, 0).toFixed(2)}</p>
                                </div>
                            </div>
                            <Button
                                icon={<Bag className="w-4 h-4 text-text" />}
                                label={`Checkout ${cart?.items!.length} items`}
                                color="blue"
                                className="w-full"
                                onClick={handleStripeCheckout}
                                disabled={!acceptedTerms || !uuid}
                            />
                            {/* <div className="flex flex-col gap-3">
                                <h2 className="text-sm">
                                    Coupon Codes
                                </h2>
                                <div className="flex flex-row gap-4">
                                    <TextInput icon={<ItemTag className="w-4 h-4 text-white/50 light:text-black/50" />} placeholder="Enter coupon code..." className="w-full" />
                                    <Button icon={<Check className="w-4 h-4 text-text" />} label="Apply" color="blue" className="w-fit" />
                                </div>
                                <div className="flex flex-row flex-wrap gap-2">
                                    <Tag label="SUMMER20" />
                                    <Tag label="SUMMER20" />
                                </div>
                            </div> */}
                            <Checkbox
                                id="terms"
                                customLabel={
                                    <label htmlFor={`checkbox-terms`} className="text-white light:text-black text-sm pl-2 leading-4.5 cursor-pointer select-none">
                                        I have read and agree to the <span className="text-blue">OneClient Sale Terms and Conditions</span>
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
                            <ItemCard key={cosmetic.id} name={cosmetic.name} id={cosmetic.id} price={cosmetic.price} discount={cosmetic.discount} newItem={isNewItem(cosmetic.createdAt)} />
                        ))}
                    </ItemCarousel>
                </div>
            </section>
        </>
    );
}
