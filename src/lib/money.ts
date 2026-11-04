import type { OrderType, TaxRule } from "./types";

export const pence = (n: number) => Math.round(n);
export const gbp = (p: number) =>
  "£" + (p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** VAT is inclusive in UK menu prices. vat = total * rate / (1 + rate) */
export function vatOf(totalPence: number, rateBps: number) {
  if (!rateBps) return 0;
  const net = totalPence / (1 + rateBps / 10000);
  return Math.round(totalPence - net);
}

export function rateFor(rules: TaxRule[], profileId: string, orderType: OrderType) {
  const r = rules.find((x) => x.tax_profile_id === profileId && x.order_type === orderType);
  return r ? r.rate_bps : 2000;
}

export const bpsLabel = (bps: number) => `${bps / 100}%`;

export function lineTotal(unitPence: number, qty: number, mods: { delta_pence: number }[]) {
  const modsTotal = mods.reduce((s, m) => s + m.delta_pence, 0);
  return (unitPence + modsTotal) * qty;
}

export function discountAmount(type: "PERCENT" | "AMOUNT", value: number, subtotal: number) {
  return type === "PERCENT" ? Math.round(subtotal * (value / 100)) : Math.min(Math.round(value), subtotal);
}
