interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

/**
 * DatePicker component using native date input with custom styling
 *
 * @example
 * ```tsx
 * <DatePicker
 *   label="Purchase Date"
 *   value={purchaseDate}
 *   onChange={setPurchaseDate}
 *   max={new Date().toISOString().split('T')[0]}
 * />
 * ```
 */
export function DatePicker({
  label,
  value,
  onChange,
  min,
  max,
  disabled = false,
  error,
  required = false,
}: DatePickerProps) {
  return (
    <div>
      <label htmlFor={label} className="mb-2 block text-sm font-medium text-text-secondary">
        {label}
        {required && <span className="ml-1 text-loss">*</span>}
      </label>
      <input
        type="date"
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        className={`w-full rounded-lg border px-4 py-2 text-text-primary transition focus:outline-none focus:ring-2 ${
          error
            ? "border-loss bg-surface-primary focus:border-loss focus:ring-loss/20"
            : "border-border bg-surface-primary focus:border-accent focus:ring-accent/20"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${label}-error` : undefined}
      />
      {error && (
        <p id={`${label}-error`} className="mt-1 text-xs text-loss" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
