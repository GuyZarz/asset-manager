import { useState } from "react";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { usePageTransition } from "@/hooks/usePageTransition";

export function SettingsPage() {
  const containerRef = usePageTransition();
  const { preferredCurrency, updateCurrency } = useUserSettings();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCurrencyChange = async (currency: string) => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateCurrency(currency);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to update currency preference. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  ];

  return (
    <div ref={containerRef} className="page-transition mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

      <div className="rounded-xl border border-border bg-surface-card p-6">
        <h2 className="mb-2 text-lg font-semibold text-text-primary">
          Preferred Currency
        </h2>
        <p className="mb-4 text-sm text-text-secondary">
          Choose your preferred currency for displaying portfolio values. Asset
          prices will be automatically converted from their native currency.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-500 bg-green-500/10 p-3 text-sm text-green-500">
            Currency preference updated successfully!
          </div>
        )}

        <div className="space-y-2">
          {currencies.map((currency) => (
            <label
              key={currency.code}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                preferredCurrency === currency.code
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-border-hover"
              }`}
            >
              <input
                type="radio"
                name="currency"
                value={currency.code}
                checked={preferredCurrency === currency.code}
                onChange={() => handleCurrencyChange(currency.code)}
                disabled={saving}
                className="h-4 w-4 text-accent focus:ring-2 focus:ring-accent"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">
                    {currency.code}
                  </span>
                  <span className="text-text-secondary">({currency.symbol})</span>
                </div>
                <span className="text-sm text-text-secondary">
                  {currency.name}
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-surface-bg p-3">
          <p className="text-xs text-text-secondary">
            <strong>Note:</strong> Changing your preferred currency will convert
            all displayed values using real-time exchange rates. Asset prices are
            stored in their native currency and converted on display.
          </p>
        </div>
      </div>
    </div>
  );
}
