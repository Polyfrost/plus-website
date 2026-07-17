import { useRouter } from "next/router";

export default function LoadingCollectionCard({ size }: { size: "small" | "large" }) {
    const router = useRouter();

    return (
        <button
            className={`${size === "small" ? "max-w-83 w-full h-37.5" : "max-w-273 w-full h-100"} p-4 shrink-0 relative bg-primary/35 light:bg-primary-light/35 border border-white/30 light:border-white/80 backdrop-blur-[32px] rounded-xl shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)]`}
        >
            <div className={`${size === "small" ? "bottom-0 left-0" : "min-[650px]:bottom-3 bottom-0 min-[650px]:left-3 left-0"} absolute flex text-start flex-col gap-3 p-4`}>
                {size === "large" && <div className={`h-9 w-40 bg-white/30 animate-pulse rounded-md`} />}
                <div className={`${size === "small" ? "w-30 h-7" : "w-60 h-4"} bg-white/30 animate-pulse rounded-md`} />
            </div>
        </button>
    );
}
