import { useCart } from "@/context/CartContext";
import Trash from "./icons/Trash";

export default function ItemListCard({ name, description, id, coverId, price, discount }: { name: string; description: string; id: number; coverId: number; price: number; discount?: number }) {
    const cart = useCart();

    return (
        <div className="p-3 relative bg-primary/35 light:bg-primary-light/35 border border-white/30 light:border-white/80 backdrop-blur-[32px] rounded-xl shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] w-full">
            <div className="absolute inset-0 rounded-xl bg-linear-to-b from-white/5 to-transparent" />
            <div className="flex flex-row gap-4">
                <div className="h-14.5 w-fit bg-neutral-300/10 rounded-lg shrink-0">
                    <img className="rounded-[5px] h-14.5 w-14.5 border border-white/10 light:border-white/90 object-cover" src={`${process.env.BACKEND_URL}/asset/${coverId}`} />
                </div>
                <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col">
                        <h1 className="text-text light:text-black text-sm leading-6 whitespace-nowrap">{name}</h1>
                        <p className="text-white/75 light:text-black/75 text-xs leading-4.5">{description}</p>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex flex-row gap-1 self-end">
                            {discount && <p className="text-red text-[10px] font-medium line-through leading-5 text-end">${price.toFixed(2)}</p>}
                            <p className={`${discount ? "text-green" : "text-text light:text-black"} text-sm leading-4.5 font-medium text-end`}>${(price * (1 - (discount || 0) / 100)).toFixed(2)}</p>
                        </div>
                        {discount && <p className="text-green text-xs font-medium leading-4.5 text-end">SAVE {discount}%</p>}
                        <button onClick={() => cart?.remove(id)} className="flex">
                            <Trash className="h-4.5 w-4.5 absolute bottom-3 right-4 text-red/50" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
