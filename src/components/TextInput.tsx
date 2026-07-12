export default function TextInput({
    icon,
    placeholder,
    className,
    value,
    onChange,
    onKeyDown,
}: {
    icon?: React.ReactNode;
    placeholder: string;
    className?: string;
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className={`${className} relative items-center shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] rounded-lg`}>
            {icon && <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 light:text-black/50">{icon}</div>}
            <input
                className="border border-white/30 light:border-white/80 w-full rounded-lg px-3 py-1.5 bg-primary/45 light:bg-primary-light/45 outline-0 pl-8 placeholder:text-white/50 light:placeholder:text-black/50 placeholder:text-sm text-white light:text-black text-sm"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
            />
        </div>
    );
}
