import { useTheme } from "next-themes";
import { useState } from "react";
import Button from "./Button";
import BurgerIcon from "./icons/Burger";
import CartIcon from "./icons/Cart";
import NightIcon from "./icons/Night";
import SearchIcon from "./icons/Search";
import Logo from "./Logo";
import TextInput from "./TextInput";
import DayIcon from "./icons/Day";
import NavbarTypeButton from "./NavbarTypeButton";
import { useRouter } from "next/router";
import { useCart } from "@/context/CartContext";

export default function Navbar({ atTop }: { atTop: boolean }) {
    const [extended, setExtended] = useState(false);
    const { resolvedTheme, setTheme } = useTheme();
    const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
    const router = useRouter();
    const cart = useCart();

    const [search, setSearch] = useState("");

    return (
        <header
            className={`fixed z-150 top-0 w-full transition-all duration-300 ease-out ${atTop && !extended ? "bg-transparent border-b border-b-transparent py-6" : "bg-primary/45 light:bg-primary-light/45 border-b border-b-white/10 light:border-b-white/15 py-4 backdrop-blur-[32px] shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] light:shadow-[0px_6px_15px_0px_rgba(0,0,0,0.10)]"}`}
        >
            <div className="flex justify-center">
                <div className={`max-w-273 w-full flex flex-col transition-all duration-300 ease-out ${atTop ? "min-[940px]:gap-8 gap-3" : "min-[940px]:gap-6 gap-3"} min-[1130px]:px-0 px-4`}>
                    <div className="flex flex-row items-center justify-between gap-4">
                        <button onClick={() => router.push("/")} className="flex">
                            <Logo className="w-auto h-8 self-center" />
                        </button>
                        <TextInput
                            icon={<SearchIcon className="w-4.5 h-4.5 text-white/50 light:text-black/50" />}
                            placeholder="Search Cosmetics..."
                            className="w-fit min-[940px]:block hidden"
                            value={search}
                            onChange={setSearch}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setSearch("");
                                    router.push(`/search${!search.trim() ? "" : `?text=${encodeURIComponent(search)}`}`, undefined, { shallow: true });
                                }
                            }}
                        />
                        <div className="flex-row gap-3 min-[940px]:flex hidden">
                            <Button
                                icon={
                                    <>
                                        <NightIcon className="w-4.5 h-4.5 text-white light:hidden" />
                                        <DayIcon className="w-4.5 h-4.5 text-black hidden light:block" />
                                    </>
                                }
                                color="primary"
                                className="w-fit"
                                onClick={toggleTheme}
                            />
                            <Button
                                icon={
                                    <>
                                        <div className="absolute left-5 w-4.5 rounded-full bg-blue -translate-y-1.5">
                                            <p className="text-white text-xs leading-4 font-semibold text-center">{cart?.count || 0}</p>
                                        </div>
                                        <CartIcon className="w-4.5 h-4.5 text-white" />
                                    </>
                                }
                                label="Cart"
                                color="blue"
                                className="w-fit"
                                onClick={() => router.push("/checkout")}
                            />
                        </div>
                        <button className="min-[940px]:hidden block" onClick={() => setExtended(!extended)}>
                            <BurgerIcon className="w-8 h-8" />
                        </button>
                    </div>
                    {extended && (
                        <div className="flex flex-col w-full gap-3 pt-2">
                            <TextInput
                                icon={<SearchIcon className="w-4.5 h-4.5 text-white/50 light:text-black/50" />}
                                placeholder="Search Cosmetics..."
                                className="w-full"
                                value={search}
                                onChange={setSearch}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (!search.trim()) return;
                                        setSearch("");
                                        router.push(`/search?text=${encodeURIComponent(search)}`, undefined, { shallow: true });
                                    }
                                }}
                            />
                            <div className="flex flex-row gap-3 w-full">
                                <Button
                                    icon={
                                        <>
                                            <NightIcon className="w-4.5 h-4.5 text-white light:hidden" />
                                            <DayIcon className="w-4.5 h-4.5 text-black hidden light:block" />
                                        </>
                                    }
                                    color="primary"
                                    className="w-fit"
                                    onClick={toggleTheme}
                                />
                                <Button
                                    icon={
                                        <div className="relative">
                                            <div className="absolute left-2 w-4.5 rounded-full bg-blue -translate-y-1.5">
                                                <p className="text-white text-xs leading-4 font-semibold text-center">12</p>
                                            </div>
                                            <CartIcon className="w-4.5 h-4.5 text-white" />
                                        </div>
                                    }
                                    label="Cart"
                                    color="blue"
                                    className="w-full"
                                    onClick={() => router.push("/checkout")}
                                />
                            </div>
                        </div>
                    )}
                    <div className={`w-full overflow-x-scroll overflow-y-hidden ${extended ? "" : "min-[940px]:flex hidden scrollbar-none"}`}>
                        <div className={`flex flex-row justify-between ease-out w-full min-[940px]:gap-0 gap-6 pb-0.5`}>
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/capes.png" name="Capes" nav="/type/cape" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/wings.png" name="Wings" nav="/type/wings" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/gloves.png" name="Gloves" nav="/type/glove" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/hats.png" name="Hats" nav="/type/hat" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/boots.png" name="Boots" nav="/type/boots" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/backpacks.png" name="Backs" nav="/type/backpack" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/shoulders.png" name="Shoulders" nav="/type/shoulder" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/auras.png" name="Auras" nav="/type/aura" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
