import { useRouter } from "next/router";
import Icon from "./icons/Icon";
import RightChevron from "./icons/RightChevron";

export default function PageNav({ pages }: { pages: { name: string; nav: string }[] }) {
    const router = useRouter();

    return (
        <div className="flex flex-row gap-2 items-center mb-4">
            <Icon className="w-7 h-7 text-white/75 light:text-black/75" />
            {pages.map((page, index) => (
                <>
                    <button onClick={() => router.push(page.nav)} className="text-lg text-white/75 light:text-black/75 whitespace-nowrap">
                        {page.name}
                    </button>
                    {index < pages.length - 1 && <RightChevron className="w-5 h-5 text-white/75 light:text-black/75" />}
                </>
            ))}
        </div>
    );
}
