import { Item } from "@/types/Item";
import { getCosmeticById } from "@/utils/APIUtils";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

interface ICartContext {
    items: Item[] | null;
    add: (id: number) => void;
    remove: (id: number) => void;
    has: (id: number) => boolean;
    clear: () => void;
    count: number;
}

const CartContext = createContext<ICartContext | null>(null);

// The cart used to persist whole items, price and discount included, and never
// looked at them again. A sale that started (or ended) after something was
// added to the cart therefore never showed up, while checkout charged the
// current price. Only ids are stored now, everything else is re-fetched.
function readStoredIds(): number[] {
    let stored: unknown;
    try {
        stored = JSON.parse(window.localStorage.getItem("cart") ?? "[]");
    } catch {
        return [];
    }

    if (!Array.isArray(stored)) return [];

    // Carts written before this change hold whole items, so accept both shapes.
    return stored
        .map((entry) => {
            if (typeof entry === "number") return entry;
            if (typeof entry === "object" && entry !== null) return (entry as Partial<Item>).id;
            return undefined;
        })
        .filter((id): id is number => Number.isInteger(id));
}

export function CartProvider({ children }: { children: ReactNode }) {
    // null until the stored ids have been rehydrated, so consumers can tell an
    // empty cart apart from one that has not loaded yet.
    const [items, setItems] = useState<Item[] | null>(null);
    // How many lines are stored, known before their items arrive. Keeps the
    // cart badge from flashing a zero at someone who has items.
    const [storedCount, setStoredCount] = useState<number>(0);
    // Set once the cart has been emptied deliberately, so a rehydration that is
    // still in flight cannot put the items back.
    const discardHydration = useRef<boolean>(false);

    useEffect(() => {
        const ids = readStoredIds();
        setStoredCount(ids.length);

        if (ids.length === 0) {
            setItems([]);
            return;
        }

        let cancelled = false;

        (async () => {
            const fetched = await Promise.all(ids.map((id) => getCosmeticById(id).catch(() => null)));
            if (cancelled || discardHydration.current) return;

            // A cosmetic that no longer exists, or is no longer enabled, would
            // only render as a broken row, so drop it.
            const rehydrated = fetched.filter((item): item is Item => item !== null);

            // Anything added while the fetches were in flight has to survive.
            setItems((prev) => [...rehydrated, ...(prev ?? []).filter((item) => !rehydrated.some((other) => other.id === item.id))]);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (items === null) return;
        window.localStorage.setItem("cart", JSON.stringify(items.map((item) => item.id)));
    }, [items]);

    const add = async (id: number) => {
        try {
            const itemData = await getCosmeticById(id);
            setItems((prev) => (prev ? [...prev, itemData] : [itemData]));
        } catch {
            console.error(`Failed to fetch cosmetic ${id}`);
        }
    };

    const remove = (id: number) => setItems((prev) => (prev ? prev.filter((item) => item.id !== id) : []));

    const has = (id: number) => items?.some((item) => item.id === id) ?? false;

    const clear = () => {
        discardHydration.current = true;
        setStoredCount(0);
        setItems([]);
    };

    return <CartContext.Provider value={{ items, add, remove, has, clear, count: items?.length ?? storedCount }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext<ICartContext | null>(CartContext);
