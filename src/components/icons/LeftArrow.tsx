export default function LeftArrow({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 9L3 9M7.5 4.5L3 9L7.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
