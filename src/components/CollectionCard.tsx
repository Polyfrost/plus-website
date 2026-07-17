import { useRouter } from "next/router";

export default function CollectionCard({
    size,
    title,
    description,
    focused,
    transition = true,
    id,
    assetId,
}: {
    size: "small" | "large";
    title: string;
    description?: string;
    focused?: boolean;
    transition?: boolean;
    id: number;
    assetId: number;
}) {
    const router = useRouter();

    return (
        <button
            onClick={() => {
                if (!focused) return;
                router.push(`/collection/${id}`);
            }}
            className={`${size === "small" ? "max-w-83 w-full aspect-[3/1]" : "max-w-273 w-full aspect-[3/1]"} ${focused ? "" : "brightness-75"} ${transition ? "transition-[filter] duration-700 ease-in-out" : ""} p-4 shrink-0 relative bg-primary/35 light:bg-primary-light/35 border border-white/30 light:border-white/80 backdrop-blur-[32px] rounded-xl shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)]`}
        >
            <div className={`${transition ? "transition-opacity duration-700 ease-in-out" : ""} ${focused ? "opacity-100" : "opacity-0"}`}>
                <div className="absolute inset-0 rounded-xl bg-linear-to-b from-transparent to-black/10 -z-5" />
                <div className="absolute inset-0 rounded-xl bg-linear-to-b from-transparent to-accent/10 -z-10" />
            </div>
            <img src={`${process.env.BACKEND_URL}/asset/${assetId}`} className="absolute inset-0 h-full w-full object-cover rounded-xl -z-20" />
            <div className={`${transition ? "transition-opacity duration-700 ease-in-out" : ""} ${focused ? "opacity-100" : "opacity-0"}`}>
                <div className={`${size === "small" ? "bottom-0 left-0" : "min-[650px]:bottom-3 bottom-0 min-[650px]:left-3 left-0"} absolute flex text-start flex-col gap-1 p-4`}>
                    <h1 className={`${size === "small" ? "text-2xl" : "text-4xl"} text-white`}>{title}</h1>
                    {description && <p className="text-white/75">{description}</p>}
                </div>
            </div>
        </button>
    );
}
