export default function Cross({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M20 20L4 4m16 0L4 20" />
        </svg>
    );
}
