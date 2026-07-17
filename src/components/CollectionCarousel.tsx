import { useEffect, useState } from "react";
import CollectionCard from "@/components/CollectionCard";
import { Collection } from "@/types/Collection";
import LoadingCollectionCard from "./LoadingCollectionCard";

export default function CollectionCarousel({ collections }: { collections: Collection[] }) {
    const [currentIndex, setCurrentIndex] = useState(2);
    const [isResetting, setIsResetting] = useState(false);
    const [isSliding, setIsSliding] = useState(false);

    const count = collections.length;

    const move = (direction: "forward" | "backward") => {
        if (isSliding) return;
        if (isResetting) return;
        setIsSliding(true);

        if (direction === "forward") {
            setCurrentIndex((prevIndex) => prevIndex + 1);
        } else {
            setCurrentIndex((prevIndex) => prevIndex - 1);
        }

        setTimeout(() => {
            setIsSliding(false);
        }, 500);
    };

    useEffect(() => {
        if (count <= 1) return;

        const interval = setInterval(() => {
            move("forward");
        }, 5000);

        return () => clearInterval(interval);
    }, [count, isSliding]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (currentIndex >= count + 2) {
                setCurrentIndex(2);
                setIsResetting(true);
            } else if (currentIndex < 2) {
                setCurrentIndex(count + 1);
                setIsResetting(true);
            }

            setTimeout(() => {
                setIsResetting(false);
            }, 100);
        }, 500);

        return () => clearTimeout(timeout);
    }, [currentIndex, count]);
    
    const slides = collections.length > 0 ? [collections[count - 2], collections[count - 1], ...collections, collections[0], collections[1]] : [];

    return (
        <div className="relative w-full h-100 flex justify-center">
            {slides.length > 0 ? (slides.map((collection, index) => (
                <div
                    onClick={() => {
                        if (index === currentIndex + 1) {
                            move("forward");
                        } else if (index === currentIndex - 1) {
                            move("backward");
                        }
                    }}
                    key={index}
                    style={{ transform: `translateX(${(index - currentIndex) * 75.5}rem)` }}
                    className={`flex absolute w-full justify-center ${index === currentIndex ? "scale-100" : "scale-90"} ${isResetting ? "transition-none" : "transition-all"} duration-500`}
                >
                    <CollectionCard
                        transition={isResetting ? false : true}
                        focused={index === currentIndex}
                        size="large"
                        title={collection?.name ?? ""}
                        description={collection?.description}
                        id={collection?.id ?? 0}
                        assetId={collection?.assetId ?? 0}
                    />
                </div>
            ))) : (
                Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        style={{ transform: `translateX(${(index - currentIndex) * 75.5}rem)` }}
                        className={`flex absolute w-full justify-center ${index === currentIndex ? "scale-100" : "scale-90"} ${isResetting ? "transition-none" : "transition-all"} duration-500`}
                    >
                        <LoadingCollectionCard size="large" />
                    </div>
                ))
            )}
        </div>
    );
}
