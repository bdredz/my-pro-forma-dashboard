import { useState } from 'react';

export interface NumberFieldProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    type?: 'currency' | 'percent' | 'number';
    placeholder?: string;
    min?: number;
    max?: number;

    required?: boolean;
    disabled?: boolean;
    className?: string;
}

/**
 * Reusable NumberField component with proper formatting and mobile-friendly input
 */
export function NumberField({
    label,
    value,
    onChange,
    type = 'number',
    placeholder,
    min,
    max,
    required = false,
    disabled = false,
    className = '',
}: NumberFieldProps) {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    function formatValue(val: number, valueType: string): string {
        if (val === 0) return '';

        switch (valueType) {
            case 'currency':
                return val.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
            case 'percent':
                return val.toFixed(2);
            default:
                return val.toString();
        }
    }

    function parseValue(str: string): number {
        const cleaned = str.replace(/[$,%\s]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }

    // Compute display value based on current state
    const computedDisplayValue = isFocused
        ? displayValue
        : (value === 0 ? '' : formatValue(value, type));

    function handleFocus() {
        setIsFocused(true);
        // Show raw number on focus (easier to edit)
        setDisplayValue(value === 0 ? '' : value.toString());
    }

    function handleBlur() {
        setIsFocused(false);
        const parsed = parseValue(displayValue);

        // Apply min/max constraints
        let constrained = parsed;
        if (min !== undefined && constrained < min) constrained = min;
        if (max !== undefined && constrained > max) constrained = max;

        onChange(constrained);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setDisplayValue(e.target.value);
    }

    const inputMode = type === 'number' ? 'numeric' : 'decimal';
    const prefix = type === 'currency' && !isFocused ? '$' : '';
    const suffix = type === 'percent' && !isFocused ? '%' : '';

    return (
        <div className={`number-field ${className}`}>
            <label className="number-field-label">
                {label}
                {required && <span className="required">*</span>}
            </label>
            <div className="number-field-input-wrapper">
                {prefix && <span className="input-prefix">{prefix}</span>}
                <input
                    type="text"
                    inputMode={inputMode}
                    value={computedDisplayValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="number-field-input"
                    aria-label={label}
                />
                {suffix && <span className="input-suffix">{suffix}</span>}
            </div>
        </div>
    );
}
