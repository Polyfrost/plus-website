import Logo from "./Logo";
import PolyLogo from "./PolyLogo";

export default function Footer() {
    return (
        <footer className={`bottom-0 w-full bg-primary/45 light:bg-primary-light/45 border-t border-t-white/30 light:border-t-black/30 py-6 backdrop-blur-lg`}>
            <div className="flex max-w-273 mx-auto w-full flex-col min-[1130px]:px-0 px-4">
                <div className="flex min-[800px]:flex-row flex-col items-start justify-between gap-4 min-[800px]:pb-20 pb-6">
                    <div className="flex flex-col gap-1">
                        <Logo className="h-8 w-full" />
                        <div className="flex flex-row items-center gap-2 pl-1">
                            <p className="text-[#2567D8]/75 text-[13px]">by</p>
                            <PolyLogo className="h-5 w-fit" />
                        </div>
                    </div>
                    <div className="flex min-[800px]:flex-row flex-col items-start gap-x-14 gap-y-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="font-medium pb-1">Polyfrost</h1>
                            <p className="text-white/75 light:text-black/75 text-sm">Main website</p>
                            <p className="text-white/75 light:text-black/75 text-sm">About us</p>
                            <p className="text-white/75 light:text-black/75 text-sm">Branding</p>
                            <p className="text-white/75 light:text-black/75 text-sm">Documentation</p>
                            <p className="text-white/75 light:text-black/75 text-sm">Open source</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h1 className="font-medium pb-1">Legal</h1>
                            <p className="text-white/75 light:text-black/75 text-sm">Terms of service</p>
                            <p className="text-white/75 light:text-black/75 text-sm">Privacy policy</p>
                            <p className="text-white/75 light:text-black/75 text-sm">Sale terms and conditions</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h1 className="font-medium pb-1">Social</h1>
                            <p className="text-white/75 light:text-black/75 text-sm">Discord</p>
                            <p className="text-white/75 light:text-black/75 text-sm">Youtube</p>
                            <p className="text-white/75 light:text-black/75 text-sm">GitHub</p>
                            <p className="text-white/75 light:text-black/75 text-sm">Contact Us</p>
                        </div>
                    </div>
                </div>
                <div className="flex min-[600px]:flex-row flex-col items-center justify-between gap-x-4">
                    <p className="text-white/75 light:text-black/75 text-sm leading-4.5">© 2026 Polyfrost. All rights reserved.</p>
                    <p className="text-white/75 light:text-black/75 text-sm leading-4.5">Not affiliated with Mojang or Microsoft</p>
                </div>
            </div>
        </footer>
    );
}
