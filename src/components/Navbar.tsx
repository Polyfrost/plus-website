import { useTheme } from "next-themes";
import { useState } from "react";
import Button from "./Button";
import Burger from "./icons/Burger";
import Cart from "./icons/Cart";
import Login from "./icons/Login";
import Night from "./icons/Night";
import Search from "./icons/Search";
import Logo from "./Logo";
import TextInput from "./TextInput";
import Day from "./icons/Day";
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
            className={`fixed z-150 top-0 w-full transition-all duration-300 ease-out ${atTop && !extended ? "bg-transparent border-b border-b-transparent py-6" : "bg-primary/45 light:bg-primary-light/45 border-b border-b-white/30 light:border-b-black/30 py-4 backdrop-blur-[32px] shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)]"}`}
        >
            <div className="flex justify-center">
                <div className={`max-w-273 w-full flex flex-col transition-all duration-300 ease-out ${atTop ? "min-[940px]:gap-8 gap-3" : "min-[940px]:gap-6 gap-3"} min-[1130px]:px-0 px-4`}>
                    <div className="flex flex-row items-center justify-between gap-4">
                        <button onClick={() => router.push("/")} className="flex">
                            <Logo className="w-auto h-8 self-center" />
                        </button>
                        <TextInput
                            icon={<Search className="w-4 h-4 text-white/50 light:text-black/50" />}
                            placeholder="Search Cosmetics..."
                            className="w-fit min-[940px]:block hidden"
                            value={search}
                            onChange={setSearch}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    if (!search.trim()) return;
                                    setSearch("");
                                    router.push(`/search?text=${encodeURIComponent(search)}`);
                                }
                            }}
                        />
                        <div className="flex-row gap-3 min-[940px]:flex hidden">
                            <Button
                                icon={
                                    <>
                                        <Night className="w-5 h-5 text-text light:hidden" />
                                        <Day className="w-5 h-5 text-black hidden light:block" />
                                    </>
                                }
                                color="primary"
                                className="w-fit"
                                onClick={toggleTheme}
                            />
                            <Button icon={<Login className="w-4 h-4 text-text light:text-black" />} label="Login" color="primary" className="w-fit" onClick={() => void 0} />
                            <Button
                                icon={
                                    <>
                                        <div className="absolute left-5 w-4 rounded-full bg-blue -translate-y-1.5">
                                            <p className="text-text text-xs leading-4 font-semibold text-center">{cart?.count || 0}</p>
                                        </div>
                                        <Cart className="w-4 h-4 text-text" />
                                    </>
                                }
                                label="Cart"
                                color="blue"
                                className="w-fit"
                                onClick={() => router.push("/checkout")}
                            />
                        </div>
                        <button className="min-[940px]:hidden block" onClick={() => setExtended(!extended)}>
                            <Burger className="w-8 h-8" />
                        </button>
                    </div>
                    {extended && (
                        <div className="flex flex-col w-full gap-3 pt-2">
                            <TextInput
                                icon={<Search className="w-4 h-4 text-white/50 light:text-black/50" />}
                                placeholder="Search Cosmetics..."
                                className="w-full"
                                value={search}
                                onChange={setSearch}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (!search.trim()) return;
                                        setSearch("");
                                        router.push(`/search?text=${encodeURIComponent(search)}`);
                                    }
                                }}
                            />
                            <div className="flex flex-row gap-3 w-full">
                                <Button icon={<Night className="w-5 h-5 text-text light:text-black" />} color="primary" className="w-fit" onClick={toggleTheme} />
                                <Button icon={<Login className="w-4 h-4 text-text light:text-black" />} label="Login" color="primary" className="w-full" onClick={() => void 0} />
                                <Button
                                    icon={
                                        <div className="relative">
                                            <div className="absolute left-2 w-4 rounded-full bg-blue -translate-y-1.5">
                                                <p className="text-text text-xs leading-4 font-semibold text-center">12</p>
                                            </div>
                                            <Cart className="w-4 h-4 text-text" />
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
                        <div className={`flex flex-row justify-between ease-out w-full min-[940px]:gap-0 gap-6`}>
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/pets.png" name="Capes" nav="/type/cape" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/pets.png" name="Emotes" nav="/type/emote" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/pets.png" name="Wings" nav="/type/wings" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/pets.png" name="Gloves" nav="/type/glove" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/pets.png" name="Hats" nav="/type/hat" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/pets.png" name="Boots" nav="/type/boots" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/pets.png" name="Backpacks" nav="/type/backpack" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/pets.png" name="Glasses" nav="/type/glasses" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/pets.png" name="Shoulders" nav="/type/shoulder" />
                            <NavbarTypeButton atTop={atTop} extended={extended} image="/pets.png" name="Auras" nav="/type/aura" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
