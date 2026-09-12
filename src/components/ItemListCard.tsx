import { useCart } from "@/context/CartContext";
import TrashIcon from "./icons/Trash";
import { effectiveCents, formatUsd, hasDiscount, toCents } from "@/utils/PriceUtils";

export default function ItemListCard({
    name,
    description,
    id,
    coverId,
    price,
    discount,
}: {
    name: string;
    description: string;
    id: number;
    coverId: number;
    price: number | null;
    discount?: number | null;
}) {
    const cart = useCart();

    const onSale = hasDiscount(discount);
    // A cosmetic with no price set cannot be bought.
    const unavailable = price === null || price === undefined;

    return (
        <div className="p-3 relative bg-primary/35 light:bg-primary-light/35 border border-white/10 light:border-white/15 backdrop-blur-[32px] rounded-xl shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] light:shadow-[0px_6px_15px_0px_rgba(0,0,0,0.10)] w-full">
            <div className="absolute inset-0 rounded-xl bg-linear-to-b from-white/5 to-transparent" />
            <div className="flex flex-row gap-4">
                <div className="h-14.5 w-fit bg-primary/50 light:bg-primary-light/50 rounded-lg shrink-0">
                    <img
                        className="rounded-[5px] h-14.5 w-14.5 border border-white/10 light:border-white/15 object-cover"
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/asset/${coverId}`}
                        alt={`Cover image for ${name}`}
                    />
                </div>
                <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col">
                        <h1 className="text-sm leading-6 whitespace-nowrap">{name}</h1>
                        <p className="text-white/75 light:text-black/75 text-xs leading-4.5">{description}</p>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex flex-row gap-1 self-end">
                            {onSale && !unavailable && <p className="text-red text-[10px] font-medium line-through leading-5 text-end">{formatUsd(toCents(price))}</p>}
                            <p className={`${onSale ? "text-green" : "text-white light:text-black"} text-sm leading-4.5 font-medium text-end`}>
                                {unavailable ? "Unavailable" : formatUsd(effectiveCents(price, discount))}
                            </p>
                        </div>
                        {onSale && <p className="text-green text-xs font-medium leading-4.5 text-end">SAVE {discount}%</p>}
                        <button onClick={() => cart?.remove(id)} className="flex">
                            <TrashIcon className="h-4.5 w-4.5 absolute bottom-3 right-4 text-red/50" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
