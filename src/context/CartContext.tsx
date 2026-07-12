import { Item } from "@/types/Item";
import { getCosmeticById } from "@/utils/APIUtils";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface ICartContext {
    items: Item[] | null;
    add: (id: number) => void;
    remove: (id: number) => void;
    has: (id: number) => boolean;
    clear: () => void;
    count: number;
}

const CartContext = createContext<ICartContext | null>(null);

function readStored(): Item[] | null {
    try {
        return JSON.parse(window.localStorage.getItem("cart") ?? "[]");
    } catch {
        return [];
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<Item[] | null>([]);

    useEffect(() => {
        setItems(readStored());
    }, []);

    useEffect(() => {
        window.localStorage.setItem("cart", JSON.stringify(items));
    }, [items]);

    const add = async (id: number) => {
        const itemData = await getCosmeticById(id);
        if (itemData) {
            setItems((prev) => (prev ? [...prev, itemData] : [itemData]));
        } else {
            console.error("Failed to fetch collections");
        }
    };

    const remove = (id: number) => setItems((prev) => (prev ? prev.filter((item) => item.id !== id) : []));

    const has = (id: number) => items?.some((item) => item.id === id) ?? false;

    const clear = () => setItems([]);

    return <CartContext.Provider value={{ items, add, remove, has, clear, count: items?.length ?? 0 }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext<ICartContext | null>(CartContext);
