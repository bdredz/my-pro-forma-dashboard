/**
 * Formatting utilities for displaying values
 */

/**
 * Format a number as currency (USD)
 * Example: 1234567.89 => "$1,234,567.89"
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Format a number as a percentage
 * Example: 0.15 => "15%"
 * Example: 0.1575 => "15.75%"
 */
export function formatPercent(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/**
 * Format a number with commas
 * Example: 1234567 => "1,234,567"
 */
export function formatNumber(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/**
 * Parse currency input to number
 * Accepts: "$1,234.56", "1234.56", "1234", etc.
 */
export function parseCurrency(value: string): number {
    const cleaned = value.replace(/[$,\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

/**
 * Parse percentage input to decimal
 * Accepts: "15%", "15.5", "15", etc.
 * Returns: 0.15, 0.155, 0.15
 */
export function parsePercent(value: string): number {
    const cleaned = value.replace(/[%\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}
