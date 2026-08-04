import { useState } from "react";
import DownChevronIcon from "./icons/DownChevron";
import UpChevronIcon from "./icons/UpChevron";

export default function QuestionBox({ question, answer }: { question: string; answer: string }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <button onClick={() => setExpanded(!expanded)} className="flex flex-col bg-primary/45 light:bg-primary-light/45 rounded-lg w-fill border border-white/10 light:border-white/15 px-4 py-2">
            <div className="flex flex-row justify-between w-full items-center">
                <h1 className="text-white/75 light:text-black/75">{question}</h1>
                {expanded ? <UpChevronIcon className="w-5 h-5 text-white/75 light:text-black/75" /> : <DownChevronIcon className="w-5 h-5 text-white/75 light:text-black/75" />}
            </div>
            {expanded && (
                <div className="flex pt-2">
                    <p className="text-start">{answer}</p>
                </div>
            )}
        </button>
    );
}
