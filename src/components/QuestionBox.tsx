import { useState } from "react";
import DownChevron from "./icons/DownChevron";
import UpChevron from "./icons/UpChevron";

export default function QuestionBox({ question, answer }: { question: string; answer: string }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <button onClick={() => setExpanded(!expanded)} className="flex flex-col bg-primary/45 light:bg-primary-light/45 rounded-lg w-fill border border-white/30 light:border-white/80 px-4 py-2">
            <div className="flex flex-row justify-between w-full items-center">
                <h1 className="text-white/75 light:text-black/75">{question}</h1>
                {expanded ? <UpChevron className="w-5 h-5 text-white/75 light:text-black/75" /> : <DownChevron className="w-5 h-5 text-white/75 light:text-black/75" />}
            </div>
            {expanded && (
                <div className="flex pt-2">
                    <p className="text-white light:text-black text-start">{answer}</p>
                </div>
            )}
        </button>
    );
}
