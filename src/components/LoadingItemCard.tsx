import Cart from "./icons/Cart";

export default function LoadingItemCard() {
    return (
        <div
            className={`cursor-pointer flex flex-col h-fit border border-white/30 light:border-white/80 relative bg-primary/35 hover:bg-primary/70 light:bg-primary-light/35 light:hover:bg-primary-light/70 duration-300 backdrop-blur-[32px] rounded-xl shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] w-45 shrink-0`}
        >
            <button className="flex flex-col w-full">
                <div className="flex flex-col gap-1.5 px-4 pt-4 pb-2.5">
                    <div className="h-40 w-full bg-neutral-300/10 animate-pulse rounded-lg border border-white/10 light:border-white/90"/>
                    <div className="flex flex-col gap-2 my-2 text-start">
                        <div className={`h-3 w-22 bg-white/30 animate-pulse rounded-md`} />
                        <div className="flex flex-row gap-1">
                            <div className={`h-3 w-10 bg-white/30 animate-pulse rounded-md`} />
                        </div>
                    </div>
                </div>
            </button>
            <button
                className={`bg-primary/70 light:bg-primary-light/70 border-t border-t-white/10 light:border-t-white/90 rounded-b-xl p-1.5 bottom-0 flex flex-row items-center justify-center gap-3`}
            >
                <Cart className={`text-text light:text-black w-4 h-4`} />
                <p className={`text-text light:text-black text-sm leading-6 font-medium`}>Add to cart</p>
            </button>
        </div>
    );
}
