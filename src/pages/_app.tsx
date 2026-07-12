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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <CartProvider>
                <Navbar atTop={atTop} />
                <div ref={navRef} />
                <div className="overflow-hidden overflow-y-hidden relative flex flex-col">
                    <div className="max-w-273 mx-auto flex flex-col justify-center items-center relative -z-10">
                        <div className="absolute h-350 w-350 translate-y-30 blur-[175px] -z-10 rounded-full bg-accent/15" />
                        <div className="absolute h-350 w-350 translate-y-275 translate-x-250 blur-[175px] -z-10 rounded-full bg-accent/15" />
                        <div className="absolute h-350 w-350 translate-y-400 -translate-x-200 blur-[175px] -z-10 rounded-full bg-accent/15" />
                    </div>
                    <Component {...pageProps} />
                    <Footer />
                </div>
            </CartProvider>
        </ThemeProvider>
    );
}
