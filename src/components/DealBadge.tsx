
export interface DealBadgeProps {
    badge: 'Great' | 'Good' | 'NO Deal';
    profitPercentage: number;
}

/**
 * DealBadge component - displays the deal assessment badge
 */
export function DealBadge({ badge, profitPercentage }: DealBadgeProps) {
    const badgeConfig = {
        Great: {
            className: 'badge-great',
            label: '🚀 Great Deal',
            color: '#10B981', // Green
        },
        Good: {
            className: 'badge-good',
            label: '✅ Good Deal',
            color: '#F59E0B', // Yellow/amber
        },
        'NO Deal': {
            className: 'badge-no-deal',
            label: '👎 NO Deal',
            color: '#EF4444', // Red
        },
    };

    const config = badgeConfig[badge];

    return (
        <div className={`deal-badge ${config.className}`}>
            <span className="badge-label">{config.label}</span>
            <span className="badge-percentage">
                {profitPercentage === 0 && badge === 'NO Deal' ? '—' : `${(profitPercentage * 100).toFixed(1)}%`}
            </span>
        </div>
    );
}
