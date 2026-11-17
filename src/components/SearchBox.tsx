import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useId, useState } from "react";
import SearchIcon from "./icons/Search";
import TextInput from "./TextInput";
import { Suggestions, suggestCosmetics } from "@/utils/APIUtils";

const optionClass = (active: boolean) => `rounded-md ${active ? "bg-white/10 light:bg-black/5" : ""}`;

export default function SearchBox({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
    const router = useRouter();
    const id = useId();
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<Suggestions | null>(null);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);

    useEffect(() => {
        const text = search.trim();
        if (!text) return setResults(null);
        let stale = false;
        const timer = setTimeout(() => suggestCosmetics(text).then((r) => !stale && setResults(r)), 250);
        return () => {
            stale = true;
            clearTimeout(timer);
        };
    }, [search]);

    useEffect(() => setActive(-1), [results]);
    useEffect(() => {
        if (active >= 0) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: "nearest" });
    }, [active, id]);

    const text = search.trim();
    // One flat list in display order (tags, cosmetics, "see all") so arrow keys walk it top to bottom.
    const options = results
        ? [
              ...results.tags.map((t) => `/search?tag=${encodeURIComponent(t.name)}`),
              ...results.cosmetics.map((c) => `/item/${c.id}`),
              ...(results.tags.length || results.cosmetics.length ? [`/search?text=${encodeURIComponent(text)}`] : []),
          ]
        : [];
    const expanded = open && !!text && !!results;

    const close = () => {
        setSearch("");
        setOpen(false);
        onNavigate?.();
    };

    const option = (i: number, className: string, children: React.ReactNode) => (
        <Link
            key={options[i]}
            id={`${id}-${i}`}
            role="option"
            aria-selected={active === i}
            tabIndex={-1}
            href={options[i]}
            onClick={close}
            onMouseMove={() => setActive(i)}
            className={`${className} ${optionClass(active === i)}`}
        >
            {children}
        </Link>
    );

    return (
        <div className={`${className} relative`} onFocus={() => setOpen(true)} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
            <TextInput
                icon={<SearchIcon className="w-4.5 h-4.5 text-white/50 light:text-black/50" />}
                placeholder="Search Cosmetics..."
                className="w-full"
                value={search}
                onChange={(v) => {
                    setSearch(v);
                    setOpen(true);
                }}
                inputProps={{
                    role: "combobox",
                    "aria-label": "Search cosmetics",
                    "aria-autocomplete": "list",
                    "aria-expanded": expanded,
                    "aria-controls": `${id}-list`,
                    "aria-activedescendant": expanded && active >= 0 ? `${id}-${active}` : undefined,
                    enterKeyHint: "search",
                }}
                onKeyDown={(e) => {
                    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && options.length) {
                        e.preventDefault();
                        setOpen(true);
                        const n = options.length;
                        setActive((i) => (e.key === "ArrowDown" ? (i + 1) % n : (i <= 0 ? n : i) - 1));
                    } else if (e.key === "Escape") {
                        if (expanded) setOpen(false);
                        else setSearch("");
                    } else if (e.key === "Enter") {
                        if (expanded && active >= 0) router.push(options[active]);
                        else router.push(`/search${text ? `?text=${encodeURIComponent(text)}` : ""}`, undefined, { shallow: true });
                        e.currentTarget.blur();
                        close();
                    }
                }}
            />
            {expanded && (
                <div
                    id={`${id}-list`}
                    role="listbox"
                    aria-label="Search suggestions"
                    className="absolute top-full mt-2 w-full z-10 flex flex-col max-h-[min(24rem,60dvh)] overflow-y-auto overscroll-contain p-1.5 gap-1 bg-primary light:bg-primary-light border border-white/10 light:border-white/15 rounded-lg shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] light:shadow-[0px_6px_15px_0px_rgba(0,0,0,0.10)] text-sm"
                >
                    {results.tags.length > 0 && (
                        <div role="group" aria-label="Tags" className="flex flex-row flex-wrap gap-1.5 px-1.5 py-1">
                            {results.tags.map((tag, i) => option(i, "px-2 py-1 rounded-full! border border-white/10 light:border-white/15", tag.displayName))}
                        </div>
                    )}
                    {results.cosmetics.map((c, j) =>
                        option(
                            results.tags.length + j,
                            "flex flex-row items-center gap-3 p-1.5",
                            <>
                                <img
                                    className="h-9 w-9 shrink-0 rounded object-cover bg-primary/50 light:bg-primary-light/50"
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/asset/${c.coverAssetId}`}
                                    alt=""
                                />
                                <div className="flex flex-col min-w-0">
                                    <span className="truncate">{c.name}</span>
                                    <span className="text-xs text-white/50 light:text-black/50 capitalize">{c.type}</span>
                                </div>
                            </>
                        )
                    )}
                    {options.length === 0 ? (
                        <p className="p-1.5 text-white/50 light:text-black/50">No cosmetics found</p>
                    ) : (
                        option(options.length - 1, "p-1.5 text-white/50 light:text-black/50 truncate", <>See all results for &quot;{text}&quot;</>)
                    )}
                </div>
            )}
        </div>
    );
}
