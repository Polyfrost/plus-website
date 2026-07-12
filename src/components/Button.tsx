export default function Button({
    icon,
    label,
    color,
    className,
    disabled,
    addedWidth,
    onClick,
}: {
    icon?: React.ReactNode;
    label?: string;
    color: "primary" | "blue" | "red";
    className: string;
    disabled?: boolean;
    addedWidth?: string;
    onClick: () => void;
}) {
    const buttonColor = () => {
        switch (color) {
            case "primary":
                return "bg-primary/50 light:bg-primary-light/50 border-white/30 light:border-white/80";
            case "blue":
                return "bg-blue border-blue-400/30";
            case "red":
                return "bg-red border-red-400/30";
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${buttonColor()} ${className} disabled:brightness-50 disabled:cursor-not-allowed border relative rounded-md shadow-[0px_6px_15px_0px_rgba(0,0,0,0.15)] select-none`}
            style={{ paddingRight: addedWidth, paddingLeft: addedWidth }}
        >
            {label ? (
                <div className="flex flex-row items-center justify-center gap-2 px-3 py-1">
                    {icon && icon}
                    {label && <p className={`${color === "primary" ? "text-text light:text-black" : "text-text"} text-sm leading-6 font-medium whitespace-nowrap`}>{label}</p>}
                </div>
            ) : (
                <>
                    <div className="flex p-1.5">{icon && icon}</div>
                </>
            )}
        </button>
    );
}
