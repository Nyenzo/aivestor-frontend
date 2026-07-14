export default function Logo({ className = "w-8 h-8" }) {
    return (
        <div className={`shrink-0 ${className}`}>
            <img src="/aivestor-logo.svg" alt="Aivestor" className="h-full w-full object-contain" />
        </div>
    );
}
