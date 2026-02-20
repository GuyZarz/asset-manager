import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatCryptoQuantity,
  formatPercent,
  formatGainLoss,
} from "../formatters";

describe("formatCurrency", () => {
  it("formats basic currency", () => {
    expect(formatCurrency(32500)).toBe("$32,500.00");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats with 2 decimal places", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("abbreviates millions", () => {
    expect(formatCurrency(1200000, true)).toBe("$1.2M");
  });

  it("abbreviates thousands", () => {
    expect(formatCurrency(45000, true)).toBe("$45.0K");
  });

  it("abbreviates billions", () => {
    expect(formatCurrency(2500000000, true)).toBe("$2.5B");
  });

  it("does not abbreviate small values", () => {
    expect(formatCurrency(500, true)).toBe("$500.00");
  });
});

describe("formatCryptoQuantity", () => {
  it("formats with 8 decimal places", () => {
    expect(formatCryptoQuantity(0.5)).toBe("0.50000000");
  });

  it("formats whole numbers", () => {
    expect(formatCryptoQuantity(1)).toBe("1.00000000");
  });

  it("formats small amounts", () => {
    expect(formatCryptoQuantity(0.00000001)).toBe("0.00000001");
  });
});

describe("formatPercent", () => {
  it("formats positive with up arrow", () => {
    expect(formatPercent(5.23)).toBe("\u25B2 +5.23%");
  });

  it("formats negative with down arrow", () => {
    expect(formatPercent(-3.5)).toBe("\u25BC -3.50%");
  });

  it("formats zero with no arrow", () => {
    expect(formatPercent(0)).toBe(" +0.00%");
  });
});

describe("formatGainLoss", () => {
  it("formats positive gain", () => {
    expect(formatGainLoss(2340)).toBe("+$2,340.00");
  });

  it("formats negative loss", () => {
    expect(formatGainLoss(-500)).toBe("-$500.00");
  });
});
