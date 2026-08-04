import CheckIcon from "./icons/Check";

export default function Checkbox({
    id,
    label,
    checked,
    onChange,
    customLabel,
}: {
    id: string;
    label?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    customLabel?: React.ReactNode;
}) {
    return (
        <div className="items-start flex flex-row w-fit">
            <div className="relative flex">
                <input
                    id={`checkbox-${id}`}
                    type="checkbox"
                    className="peer appearance-none h-4 w-4 border border-white/10 light:border-white/15 rounded-[3px] bg-primary light:bg-primary-light checked:bg-blue duration-300 cursor-pointer"
                    checked={checked}
                    onChange={(e) => onChange?.(e.target.checked)}
                />
                <CheckIcon className="absolute left-0 top-0 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 duration-300 pointer-events-none" />
            </div>
            {customLabel ? (
                customLabel
            ) : (
                <label htmlFor={`checkbox-${id}`} className="text-white/75 light:text-black/75 text-xs pl-1.5 leading-4.5 cursor-pointer select-none">
                    {label}
                </label>
            )}
        </div>
    );
}
