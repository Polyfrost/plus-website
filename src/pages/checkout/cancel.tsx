import Button from "@/components/Button";
import Bag from "@/components/icons/Bag";
import Cross from "@/components/icons/Cross";
import { useRouter } from "next/router";

export default function CheckoutCancel() {
    const router = useRouter();

    return (
        <section className="relative overflow-hidden min-h-[calc(100vh-8rem)] flex items-center justify-center">
            <div className="max-w-273 mx-auto flex flex-col items-center text-center gap-6 py-20 min-[1130px]:px-0 px-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red/15 border border-red/30">
                    <Cross className="w-9 h-9 text-red" />
                </div>
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-medium">Payment cancelled</h1>
                    <p className="text-white/60 light:text-black/60 max-w-md">
                        Your payment didn&apos;t go through and you haven&apos;t been charged. Your cart is still saved if you&apos;d like to try again.
                    </p>
                </div>
                <div className="flex flex-row gap-3">
                    <Button icon={<Bag className="w-4 h-4 text-text" />} label="Back to checkout" color="blue" className="w-fit" onClick={() => router.push("/checkout")} />
                </div>
            </div>
        </section>
    );
}
