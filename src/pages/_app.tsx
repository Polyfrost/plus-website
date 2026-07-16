import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { useInView } from "react-intersection-observer";

export default function App({ Component, pageProps }: AppProps) {
    const [navRef, atTop] = useInView({ initialInView: true });

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <CartProvider>
                <Navbar atTop={atTop} />
                <div ref={navRef} />
                <div className="overflow-hidden overflow-y-hidden relative flex flex-col">
                    <div className="max-w-273 mx-auto flex flex-col justify-center items-center relative -z-10">
                        {/* Boxes are 1928px (h-482) and translates are offset by -66 (=264px)
                            from the old 1400px discs, so each glow stays centred where it was. */}
                        <div className="absolute h-482 w-482 -translate-x-66 -translate-y-36 -z-10 glow" />
                        <div className="absolute h-482 w-482 translate-x-184 translate-y-209 -z-10 glow" />
                        <div className="absolute h-482 w-482 -translate-x-266 translate-y-334 -z-10 glow" />
                    </div>
                    <Component {...pageProps} />
                    <Footer />
                </div>
            </CartProvider>
        </ThemeProvider>
    );
}
