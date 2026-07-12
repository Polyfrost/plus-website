export default function Tag({ label, clicked, onClick }: { label: string; clicked?: boolean; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`${clicked ? "bg-blue" : "bg-primary/45 light:bg-primary-light/45"} ${onClick ? "cursor-pointer!" : "cursor-default!"} border-white/30 light:border-white/80 duration-500 rounded-[19px] border w-fit py-0.5 px-3 shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)]`}
        >
            <p className="text-white/75 light:text-black/75 text-xs leading-4.5">{label}</p>
        </button>
    );
}
