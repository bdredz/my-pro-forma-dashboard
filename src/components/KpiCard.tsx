
export interface KpiCardProps {
    label: string;
    value: string;
    subtitle?: string;
    highlight?: boolean;
    className?: string;
}

/**
 * KpiCard component - displays a key performance indicator
 */
export function KpiCard({
    label,
    value,
    subtitle,
    highlight = false,
    className = '',
}: KpiCardProps) {
    return (
        <div className={`kpi-card ${highlight ? 'kpi-card-highlight' : ''} ${className}`}>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{value}</div>
            {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
        </div>
    );
}
