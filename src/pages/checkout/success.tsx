import Button from "@/components/Button";
import Bag from "@/components/icons/Bag";
import Check from "@/components/icons/Check";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function CheckoutSuccess() {
    const router = useRouter();
    const cart = useCart();

    useEffect(() => {
        cart?.clear();
    }, []);

    return (
        <section className="relative overflow-hidden min-h-[calc(100vh-8rem)] flex items-center justify-center">
            <div className="max-w-273 mx-auto flex flex-col items-center text-center gap-6 py-20 min-[1130px]:px-0 px-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green/15 border border-green/30">
                    <Check className="w-10 h-10 text-green" />
                </div>
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-medium">Payment successful</h1>
                    <p className="text-white/60 light:text-black/60 max-w-md">Thanks for your purchase! Your cosmetics have been added to your account. It may take a few minutes to appear in-game.</p>
                </div>
                <div className="flex flex-row gap-3">
                    <Button icon={<Bag className="w-4 h-4 text-text" />} label="Keep shopping" color="blue" className="w-fit" onClick={() => router.push("/")} />
                </div>
            </div>
        </section>
    );
}
