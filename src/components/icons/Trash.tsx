export default function Trash({ className }: { className?: string }) {
    return (
        <svg className={className} width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M6.375 2.125H10.625M2.125 4.25H14.875M13.4583 4.25L12.9616 11.7012C12.8871 12.8191 12.8498 13.3781 12.6083 13.8019C12.3958 14.175 12.0751 14.475 11.6887 14.6623C11.2497 14.875 10.6895 14.875 9.56912 14.875H7.43088C6.31047 14.875 5.75027 14.875 5.31132 14.6623C4.92487 14.475 4.60423 14.175 4.39165 13.8019C4.1502 13.3781 4.11294 12.8191 4.03841 11.7012L3.54167 4.25M7.08333 7.4375V10.9792M9.91667 7.4375V10.9792"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
