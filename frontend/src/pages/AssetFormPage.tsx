import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAsset,
  getAsset,
  updateAsset,
  validateSymbol,
  type SymbolValidation,
} from "@/api/assets";
import type { AssetType, PropertyType } from "@/types/asset";
import { formatCurrency } from "@/utils/formatters";
import { Collapsible } from "@/components/shared/Collapsible";
import { DatePicker } from "@/components/shared/DatePicker";
import { Tooltip, InfoIcon } from "@/components/shared/Tooltip";
import { useToast } from "@/contexts/ToastContext";
import { usePageTransition } from "@/hooks/usePageTransition";

type ValidationState = "idle" | "loading" | "valid" | "invalid";

export function AssetFormPage() {
  const containerRef = usePageTransition();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { addToast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<AssetType>("Crypto");
  const [quantity, setQuantity] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [notes, setNotes] = useState("");

  // Symbol validation
  const [symbolValidation, setSymbolValidation] =
    useState<ValidationState>("idle");
  const [validationResult, setValidationResult] =
    useState<SymbolValidation | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Crypto
  const [cryptoSymbol, setCryptoSymbol] = useState("");
  const [cryptoNetwork, setCryptoNetwork] = useState("");
  const [cryptoExchange, setCryptoExchange] = useState("");
  const [cryptoWallet, setCryptoWallet] = useState("");
  const [cryptoStaking, setCryptoStaking] = useState(false);

  // Stock
  const [stockSymbol, setStockSymbol] = useState("");
  const [stockExchange, setStockExchange] = useState("");
  const [stockSector, setStockSector] = useState("");
  const [stockDividend, setStockDividend] = useState("");

  // Real Estate
  const [propertyType, setPropertyType] = useState<PropertyType>("House");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [mortgageBalance, setMortgageBalance] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Debounced symbol validation
  const doValidateSymbol = useCallback(
    (assetType: AssetType, symbol: string, exchange?: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!symbol || symbol.length < 1) {
        setSymbolValidation("idle");
        setValidationResult(null);
        return;
      }

      setSymbolValidation("loading");
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await validateSymbol(
            assetType,
            symbol,
            exchange || undefined
          );
          setValidationResult(res.data);
          setSymbolValidation(res.data.valid ? "valid" : "invalid");
          if (res.data.valid && res.data.name && !name) {
            setName(res.data.name);
          }
        } catch (err) {
          setSymbolValidation("invalid");
          setValidationResult(null);
          setError(
            "Unable to validate symbol. Please check your internet connection or add manually."
          );
        }
      }, 500);
    },
    [name]
  );

  // Trigger validation when symbol changes (debounced)
  useEffect(() => {
    if (isEdit) return;
    // Reset manual entry when symbol changes
    setManualEntry(false);
    if (type === "Crypto" && cryptoSymbol) {
      doValidateSymbol("Crypto", cryptoSymbol);
    } else if (type === "Stock" && stockSymbol) {
      doValidateSymbol("Stock", stockSymbol, stockExchange);
    } else {
      setSymbolValidation("idle");
      setValidationResult(null);
    }
  }, [cryptoSymbol, stockSymbol, type, isEdit, doValidateSymbol, stockExchange]);

  // Immediate re-validation when stock exchange changes (no debounce)
  useEffect(() => {
    if (isEdit || type !== "Stock" || !stockSymbol) return;

    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Immediately validate with new exchange
    setSymbolValidation("loading");
    validateSymbol("Stock", stockSymbol, stockExchange || undefined)
      .then((res) => {
        setValidationResult(res.data);
        setSymbolValidation(res.data.valid ? "valid" : "invalid");
        if (res.data.valid && res.data.name && !name) {
          setName(res.data.name);
        }
      })
      .catch(() => {
        setSymbolValidation("invalid");
        setValidationResult(null);
        setError(
          "Unable to validate symbol. Please check your internet connection or add manually."
        );
      });
  }, [stockExchange]);

  useEffect(() => {
    if (!id) return;
    getAsset(Number(id))
      .then((res) => {
        const a = res.data;
        setName(a.name);
        setType(a.type);
        setQuantity(String(a.quantity));
        setCostBasis(String(a.costBasis));
        setCurrentPrice(String(a.currentPrice));
        setNotes(a.notes ?? "");

        if (a.cryptoDetails) {
          setCryptoSymbol(a.cryptoDetails.symbol);
          setCryptoNetwork(a.cryptoDetails.network ?? "");
          setCryptoExchange(a.cryptoDetails.exchange ?? "");
          setCryptoWallet(a.cryptoDetails.walletAddress ?? "");
          setCryptoStaking(a.cryptoDetails.staking);
        }
        if (a.stockDetails) {
          setStockSymbol(a.stockDetails.symbol);
          setStockExchange(a.stockDetails.exchange ?? "");
          setStockSector(a.stockDetails.sector ?? "");
          setStockDividend(String(a.stockDetails.dividendYield));
        }
        if (a.realEstateDetails) {
          setPropertyType(a.realEstateDetails.propertyType);
          setAddress(a.realEstateDetails.address);
          setCity(a.realEstateDetails.city);
          setState(a.realEstateDetails.state);
          setZipCode(a.realEstateDetails.zipCode ?? "");
          setPurchasePrice(String(a.realEstateDetails.purchasePrice));
          setCurrentValue(String(a.realEstateDetails.currentValue));
          setMortgageBalance(String(a.realEstateDetails.mortgageBalance));
          setMonthlyRent(String(a.realEstateDetails.monthlyRent));
          setMonthlyExpenses(String(a.realEstateDetails.monthlyExpenses));
          setSquareFeet(a.realEstateDetails.squareFeet?.toString() ?? "");
          setBedrooms(a.realEstateDetails.bedrooms?.toString() ?? "");
          setBathrooms(a.realEstateDetails.bathrooms?.toString() ?? "");
          setYearBuilt(a.realEstateDetails.yearBuilt?.toString() ?? "");
        }
      })
      .catch(() => setError("Failed to load asset"))
      .finally(() => setLoading(false));
  }, [id]);

  // Validate individual fields
  const validateField = (fieldName: string, value: string, required = false): string => {
    if (required && !value.trim()) {
      return "This field is required";
    }
    if (value && ["quantity", "costBasis", "currentPrice", "purchasePrice", "currentValue", "mortgageBalance", "monthlyRent", "monthlyExpenses", "stockDividend"].includes(fieldName)) {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return "Must be a positive number";
      }
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block submission if symbol validation is invalid or loading (unless manual entry)
    if (!isEdit && !manualEntry) {
      if (type === "Crypto" && symbolValidation !== "valid") {
        setError("Please enter a valid crypto symbol");
        return;
      }
      if (type === "Stock" && symbolValidation !== "valid") {
        setError("Please enter a valid stock symbol");
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const base: Record<string, unknown> = {
      name,
      type,
      quantity: Number(quantity),
      costBasis: Number(costBasis),
      notes: notes || null,
    };

    // Only include currentPrice for real estate or manual stock entries (crypto/stock auto-fetched by backend)
    if (type === "RealEstate" || (type === "Stock" && manualEntry)) {
      base.currentPrice = Number(currentPrice);
    }

    if (type === "Crypto") {
      base.cryptoDetails = {
        symbol: cryptoSymbol,
        network: cryptoNetwork || null,
        exchange: cryptoExchange || null,
        walletAddress: cryptoWallet || null,
        staking: cryptoStaking,
      };
    } else if (type === "Stock") {
      base.stockDetails = {
        symbol: stockSymbol,
        exchange: stockExchange || null,
        sector: stockSector || null,
        dividendYield: Number(stockDividend) || 0,
      };
    } else {
      base.realEstateDetails = {
        propertyType,
        address,
        city,
        state,
        zipCode: zipCode || null,
        purchasePrice: Number(purchasePrice),
        currentValue: Number(currentValue) || 0,
        mortgageBalance: Number(mortgageBalance) || 0,
        monthlyRent: Number(monthlyRent) || 0,
        monthlyExpenses: Number(monthlyExpenses) || 0,
        squareFeet: squareFeet ? Number(squareFeet) : null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        yearBuilt: yearBuilt ? Number(yearBuilt) : null,
      };
    }

    try {
      if (isEdit) {
        await updateAsset(Number(id), base);
        addToast({
          type: "success",
          message: "Asset updated successfully",
        });
      } else {
        await createAsset(base);
        addToast({
          type: "success",
          message: "Asset added successfully",
        });
      }
      navigate("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save asset";
      setError(errorMessage);
      addToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface-hover border-t-accent" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
  const labelClass = "block text-sm font-medium text-text-secondary mb-1";

  const symbolValidationBadge = (
    <>
      {symbolValidation === "loading" && (
        <span className="ml-2 inline-flex items-center gap-1 text-xs text-text-muted">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-surface-hover border-t-accent" />
          Validating...
        </span>
      )}
      {symbolValidation === "valid" && validationResult && (
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-gain">&#10003; {validationResult.name}</span>
          {validationResult.currentPrice != null && (
            <span className="font-mono text-xs tabular-nums text-text-muted">
              {formatCurrency(validationResult.currentPrice)} {validationResult.currency}
            </span>
          )}
        </div>
      )}
      {symbolValidation === "invalid" && !manualEntry && (
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-loss">
            &#10007; Symbol not found
          </span>
          <button
            type="button"
            onClick={() => setManualEntry(true)}
            className="text-xs text-accent underline hover:text-cyan-400"
          >
            Add manually
          </button>
        </div>
      )}
      {manualEntry && (
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-amber-400">
            ⚠ Manual entry - price must be entered manually
          </span>
          <button
            type="button"
            onClick={() => setManualEntry(false)}
            className="text-xs text-text-muted underline hover:text-text-secondary"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );

  return (
    <div ref={containerRef} className="page-transition mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-text-primary">
        {isEdit ? "Edit Asset" : "Add Asset"}
      </h1>

      {error && (
        <div className="mb-4 rounded-lg border border-loss/30 bg-loss/10 p-3 text-sm text-loss">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-surface-card p-6">
          <h2 className="mb-4 font-semibold text-text-primary">Basic Info</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bitcoin, Apple Inc."
                className={inputClass}
                required
              />
            </div>
            {!isEdit && (
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AssetType)}
                  className={inputClass}
                >
                  <option value="Crypto">Crypto</option>
                  <option value="Stock">Stock</option>
                  <option value="RealEstate">Real Estate</option>
                </select>
              </div>
            )}
            {type !== "RealEstate" && (
              <div>
                <label className={labelClass}>Quantity</label>
                <input
                  type="number"
                  step={type === "Crypto" ? "0.00000001" : "0.01"}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={inputClass}
                  required
                  min="0"
                />
              </div>
            )}
            <div>
              <label className={labelClass}>
                Cost Basis (per unit)
                <Tooltip content="The price you paid per unit when you purchased">
                  <InfoIcon />
                </Tooltip>
              </label>
              <input
                type="number"
                step="0.01"
                value={costBasis}
                onChange={(e) => setCostBasis(e.target.value)}
                className={inputClass}
                required
                min="0"
              />
            </div>
            {(type === "RealEstate" || (type === "Stock" && manualEntry)) && (
              <div>
                <label className={labelClass}>Current Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  className={inputClass}
                  min="0"
                  required={manualEntry}
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className={labelClass}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {type === "Crypto" && (
          <div className="rounded-xl border border-border bg-surface-card p-6">
            <h2 className="mb-4 font-semibold text-crypto">Crypto Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Symbol</label>
                <input
                  type="text"
                  value={cryptoSymbol}
                  onChange={(e) => setCryptoSymbol(e.target.value.toUpperCase())}
                  placeholder="BTC"
                  className={inputClass}
                  required
                />
                {symbolValidationBadge}
              </div>
            </div>

            <Collapsible title="Advanced Options">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Network
                    <Tooltip content="The blockchain network this crypto runs on">
                      <InfoIcon />
                    </Tooltip>
                  </label>
                  <input
                    type="text"
                    value={cryptoNetwork}
                    onChange={(e) => setCryptoNetwork(e.target.value)}
                    placeholder="Ethereum"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Exchange</label>
                  <input
                    type="text"
                    value={cryptoExchange}
                    onChange={(e) => setCryptoExchange(e.target.value)}
                    placeholder="Coinbase"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Wallet Address</label>
                  <input
                    type="text"
                    value={cryptoWallet}
                    onChange={(e) => setCryptoWallet(e.target.value)}
                    className={inputClass}
                    placeholder="0x..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="staking"
                    checked={cryptoStaking}
                    onChange={(e) => setCryptoStaking(e.target.checked)}
                    className="rounded border-border bg-surface-primary"
                  />
                  <label htmlFor="staking" className="text-sm text-text-secondary">
                    Staking
                    <Tooltip content="Is this crypto locked for earning rewards?">
                      <InfoIcon />
                    </Tooltip>
                  </label>
                </div>
              </div>
            </Collapsible>
          </div>
        )}

        {type === "Stock" && (
          <div className="rounded-xl border border-border bg-surface-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-stock">Stock Details</h2>
              {!manualEntry && (
                <button
                  type="button"
                  onClick={() => setManualEntry(true)}
                  className="text-xs text-accent underline hover:text-cyan-400"
                >
                  Can't find your stock? Add manually
                </button>
              )}
              {manualEntry && (
                <button
                  type="button"
                  onClick={() => setManualEntry(false)}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  ← Back to auto-validation
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Symbol</label>
                <input
                  type="text"
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                  placeholder="AAPL"
                  className={inputClass}
                  required
                />
                {symbolValidationBadge}
              </div>
              <div>
                <label className={labelClass}>Exchange</label>
                <select
                  value={stockExchange}
                  onChange={(e) => setStockExchange(e.target.value)}
                  className={inputClass}
                >
                  <option value="">US (default)</option>
                  <option value="TASE">TASE (Israel)</option>
                  <option value="LSE">LSE (London)</option>
                  <option value="TSX">TSX (Toronto)</option>
                  <option value="XETRA">XETRA (Frankfurt)</option>
                </select>
              </div>
            </div>

            <Collapsible title="Advanced Options">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Sector</label>
                  <input
                    type="text"
                    value={stockSector}
                    onChange={(e) => setStockSector(e.target.value)}
                    placeholder="Technology"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Dividend Yield (%)
                    <Tooltip content="Annual dividend as a percentage of stock price">
                      <InfoIcon />
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockDividend}
                    onChange={(e) => setStockDividend(e.target.value)}
                    className={inputClass}
                    min="0"
                  />
                </div>
              </div>
            </Collapsible>
          </div>
        )}

        {type === "RealEstate" && (
          <div className="rounded-xl border border-border bg-surface-card p-6">
            <h2 className="mb-4 font-semibold text-real-estate">
              Real Estate Details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className={inputClass}
                >
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Land">Land</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>ZIP Code</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Purchase Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className={inputClass}
                  required
                  min="0"
                />
              </div>
              <div>
                <label className={labelClass}>Current Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className={inputClass}
                  min="0"
                />
              </div>
              <div>
                <label className={labelClass}>Mortgage Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={mortgageBalance}
                  onChange={(e) => setMortgageBalance(e.target.value)}
                  className={inputClass}
                  min="0"
                />
              </div>
            </div>

            <Collapsible title="Additional Property Details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Monthly Rent
                    <Tooltip content="Rental income received per month">
                      <InfoIcon />
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    className={inputClass}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Monthly Expenses
                    <Tooltip content="Property taxes, HOA, maintenance, etc.">
                      <InfoIcon />
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    className={inputClass}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>Square Feet</label>
                  <input
                    type="number"
                    value={squareFeet}
                    onChange={(e) => setSquareFeet(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Bedrooms</label>
                  <input
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Bathrooms</label>
                  <input
                    type="number"
                    step="0.5"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <DatePicker
                    label="Year Built"
                    value={yearBuilt}
                    onChange={setYearBuilt}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </Collapsible>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={
              submitting ||
              (!isEdit &&
                !manualEntry &&
                ((type === "Crypto" && symbolValidation !== "valid") ||
                  (type === "Stock" && symbolValidation !== "valid")))
            }
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-600 disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEdit ? "Update Asset" : "Add Asset"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
