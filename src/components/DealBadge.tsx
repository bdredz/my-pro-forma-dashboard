
export interface DealBadgeProps {
    badge: 'Great' | 'Borderline' | 'Pass';
    profitPercentage: number;
}

/**
 * DealBadge component - displays the deal assessment badge
 */
export function DealBadge({ badge, profitPercentage }: DealBadgeProps) {
    const badgeConfig = {
        Great: {
            className: 'badge-great',
            label: '✓ Great Deal',
            color: '#2D8CFF', // Zoom blue
        },
        Borderline: {
            className: 'badge-borderline',
            label: '~ Borderline',
            color: '#6B7280', // Neutral gray
        },
        Pass: {
            className: 'badge-pass',
            label: '✗ Pass',
            color: '#9CA3AF', // Muted gray
        },
    };

    const config = badgeConfig[badge];

    return (
        <div className={`deal-badge ${config.className}`}>
            <span className="badge-label">{config.label}</span>
            <span className="badge-percentage">
                {profitPercentage === 0 && badge === 'Pass' ? '—' : `${(profitPercentage * 100).toFixed(1)}%`}
            </span>
        </div>
    );
}
