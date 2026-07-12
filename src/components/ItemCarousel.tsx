import { useRouter } from "next/router";
import LeftArrow from "./icons/LeftArrow";
import RightArrow from "./icons/RightArrow";
import { useCallback, useEffect, useRef, useState } from "react";

export default function ItemCarousel({ children, title, stepSize, viewAll }: { children: React.ReactNode; title: string; stepSize: number; viewAll?: string }) {
    const router = useRouter();

    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollBackward, setCanScrollBackward] = useState(false);
    const [canScrollForward, setCanScrollForward] = useState(false);

    const updateScrollState = useCallback(() => {
        const el = carouselRef.current;
        if (!el) return;
        setCanScrollBackward(el.scrollLeft > 0);
        setCanScrollForward(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }, []);

    useEffect(() => {
        updateScrollState();
        const el = carouselRef.current;
        if (!el) return;
        el.addEventListener("scroll", updateScrollState, { passive: true });
        window.addEventListener("resize", updateScrollState);
        return () => {
            el.removeEventListener("scroll", updateScrollState);
            window.removeEventListener("resize", updateScrollState);
        };
    }, [updateScrollState, children]);

    const move = (direction: "forward" | "backward") => {
        if (!carouselRef.current) return;
        const step = carouselRef.current.clientWidth === 1092 ? stepSize : stepSize - 24;
        const scrollAmount = direction === "forward" ? step : -step;
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-row justify-between items-center w-full">
                <h1 className="text-lg">{title}</h1>
                <div className="flex flex-row items-center gap-3.5">
                    {viewAll && (
                        <button onClick={() => router.push(viewAll)} className="text-white/75 light:text-black/75">
                            View all
                        </button>
                    )}
                    <div className="flex flex-row gap-2">
                        <button className="flex items-center justify-center" onClick={() => move("backward")} disabled={!canScrollBackward}>
                            <LeftArrow className={`h-4.5 ${canScrollBackward ? "text-text/75 light:text-black/75" : "text-text/30 light:text-black/30"}`} />
                        </button>
                        <button className="flex items-center justify-center" onClick={() => move("forward")} disabled={!canScrollForward}>
                            <RightArrow className={`h-4.5 ${canScrollForward ? "text-text/75 light:text-black/75" : "text-text/30 light:text-black/30"}`} />
                        </button>
                    </div>
                </div>
            </div>
            <div ref={carouselRef} className={`flex flex-row min-[1130px]:gap-12 gap-6 w-full overflow-scroll scrollbar-none pt-2 pb-5`}>
                {children}
            </div>
        </div>
    );
}
