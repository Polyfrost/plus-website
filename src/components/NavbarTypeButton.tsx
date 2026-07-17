import { useRouter } from "next/router";

export default function NavbarTypeButton({ atTop, extended, image, name, nav }: { atTop: boolean; extended: boolean; image: string; name: string; nav: string }) {
    const router = useRouter();

    return (
        <button onClick={() => router.push(nav)} className="flex flex-col gap-0.5 shrink-0 hover:scale-105 duration-300">
            <img
                src={image}
                draggable={false}
                className={`w-20 self-center overflow-hidden [transition:opacity_150ms_ease-out,transform_300ms_ease-out,height_300ms_ease-out] ${atTop || extended ? "h-20 opacity-100 translate-y-0" : "h-0 opacity-0 -translate-y-3"}`}
            />
            <p className={`text-white/75 light:text-black/75 transition-all duration-300 ease-out ${atTop || extended ? "text-lg" : "text-sm"} leading-6 text-center`}>{name}</p>
        </button>
    );
}
