import { useRouter } from "next/router";
import CartIcon from "./icons/Cart";
import { useCart } from "@/context/CartContext";
import CheckIcon from "./icons/Check";

export default function ItemCard({ name, newItem, id, coverId, price, discount, width }: { name: string; newItem?: boolean; id: number; coverId: number; price: number; discount?: number, width?: string }) {
    const router = useRouter();
    const cart = useCart();

    return (
        <div
            className={`cursor-pointer flex flex-col h-fit ${width ? `${width}` : "w-45"} shrink-0 ${discount ? "border border-green" : "border border-white/10 light:border-white/15"} relative bg-primary/35 hover:bg-primary/70 light:bg-primary-light/35 light:hover:bg-primary-light/70 duration-300 backdrop-blur-[32px] rounded-xl shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] light:shadow-[0px_6px_15px_0px_rgba(0,0,0,0.10)]`}
        >
            <button onClick={() => router.push(`/item/${id}`)} className="flex flex-col w-full">
                {newItem && (
                    <div className="absolute top-0 left-1/2 bg-blue rounded-b-xl w-20 h-5 -translate-x-1/2">
                        <p className="text-white text-center text-sm font-medium leading-4.5">NEW</p>
                    </div>
                )}
                {discount && (
                    <div className="absolute top-0 left-1/2 bg-green rounded-b-xl w-20 h-5 -translate-x-1/2">
                        <p className="text-white text-center text-sm font-medium leading-4.5">{discount}% OFF</p>
                    </div>
                )}
                <div className="flex flex-col gap-1.5 px-4 pt-4 pb-2.5">
                    <div className="h-40 w-full bg-primary/50 light:bg-primary-light/50 rounded-lg">
                        <img className="rounded-[5px] h-40 w-full border border-white/10 light:border-white/15 object-cover" src={`${process.env.BACKEND_URL}/asset/${coverId}`} alt={`Cover image for ${name}`} />
                    </div>
                    <div className="flex flex-col text-start">
                        <h1 className="text-sm leading-6 truncate">{name}</h1>
                        <div className="flex flex-row gap-1">
                            {discount && <p className="text-red text-[10px] font-medium line-through leading-5 self-end">${price.toFixed(2)}</p>}
                            <p className={`${discount ? "text-green" : "text-white light:text-black"} text-sm leading-6 font-medium`}>${(price * (1 - (discount || 0) / 100)).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </button>
            <button
                onClick={() => (cart?.has(id) ? cart.remove(id) : cart?.add(id))}
                className={`${discount ? "bg-green border-t border-green" : "bg-primary/70 light:bg-primary-light/70 border-t border-t-white/10 light:border-t-white/15"} rounded-b-xl p-1.5 bottom-0 flex flex-row items-center justify-center gap-3`}
            >
                {cart?.has(id) ? (
                    <>
                        <CheckIcon className={`${discount ? "text-white" : "text-white light:text-black"} w-4.5 h-4.5`} />
                        <p className={`${discount ? "text-white" : "text-white light:text-black"} text-sm leading-6 font-medium`}>In cart</p>
                    </>
                ) : (
                    <>
                        <CartIcon className={`${discount ? "text-white" : "text-white light:text-black"} w-4.5 h-4.5`} />
                        <p className={`${discount ? "text-white" : "text-white light:text-black"} text-sm leading-6 font-medium`}>Add to cart</p>
                    </>
                )}
            </button>
        </div>
    );
}
