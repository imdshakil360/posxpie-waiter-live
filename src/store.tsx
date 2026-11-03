import React, { createContext, useContext, useMemo, useReducer } from "react";
import type { CartLine, Lang, Order, OrderType, Staff } from "./lib/types";
import { DISCOUNT_PRESETS, MENU_ITEMS, STAFF, TAX_RULES } from "./data/seed";
import { discountAmount, lineTotal, rateFor, vatOf } from "./lib/money";
import { dict } from "./lib/i18n";

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

export interface DiscountState {
  preset_id: string | null;
  type: "PERCENT" | "AMOUNT";
  value: number;
  amount_pence: number;
  reason_code: string;
  approved_by: string | null;
}

interface State {
  staff: Staff | null;
  sessionStart: string | null;
  pinAttempts: number;
  lockedUntil: number | null;
  offline: boolean;
  printerOffline: boolean;
  pendingSync: number;
  orderType: OrderType;
  lines: CartLine[];
  orderNote: string;
  discount: DiscountState | null;
  tipPence: number;
  orders: Order[];
  orderSeq: number;
  menu: typeof MENU_ITEMS;
}

const initial: State = {
  staff: null, sessionStart: null, pinAttempts: 0, lockedUntil: null,
  offline: false, printerOffline: false, pendingSync: 0,
  orderType: "TAKEAWAY", lines: [], orderNote: "", discount: null, tipPence: 0,
  orders: [], orderSeq: 1042, menu: MENU_ITEMS,
};

type Action =
  | { t: "login"; staff: Staff }
  | { t: "logout" }
  | { t: "pinFail" } | { t: "unlock" }
  | { t: "offline"; v: boolean } | { t: "printerOffline"; v: boolean } | { t: "flush" }
  | { t: "orderType"; v: OrderType }
  | { t: "addLine"; line: CartLine }
  | { t: "qty"; uid: string; delta: number }
  | { t: "removeLine"; uid: string }
  | { t: "noteLine"; uid: string; note: string }
  | { t: "orderNote"; v: string }
  | { t: "discount"; v: DiscountState | null }
  | { t: "tip"; v: number }
  | { t: "toggle86"; itemId: string }
  | { t: "clear" }
  | { t: "place"; order: Order } | { t: "updateOrder"; order: Order };

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case "login": return { ...s, staff: a.staff, sessionStart: now(), pinAttempts: 0, lockedUntil: null };
    case "logout": return { ...s, staff: null, sessionStart: null, lines: [], discount: null, tipPence: 0, orderNote: "" };
    case "pinFail": return { ...s, pinAttempts: s.pinAttempts + 1, lockedUntil: s.pinAttempts + 1 >= 5 ? Date.now() + 60000 : null };
    case "unlock": return { ...s, pinAttempts: 0, lockedUntil: null };
    case "offline": return { ...s, offline: a.v };
    case "printerOffline": return { ...s, printerOffline: a.v };
    case "flush": return { ...s, pendingSync: 0 };
    case "orderType": return { ...s, orderType: a.v };
    case "addLine": return { ...s, lines: [...s.lines, a.line] };
    case "qty": return { ...s, lines: s.lines.map((l) => (l.uid === a.uid ? { ...l, qty: Math.max(0, l.qty + a.delta) } : l)).filter((l) => l.qty > 0) };
    case "removeLine": return { ...s, lines: s.lines.filter((l) => l.uid !== a.uid) };
    case "noteLine": return { ...s, lines: s.lines.map((l) => (l.uid === a.uid ? { ...l, note: a.note } : l)) };
    case "orderNote": return { ...s, orderNote: a.v };
    case "discount": return { ...s, discount: a.v };
    case "tip": return { ...s, tipPence: Math.max(0, a.v) };
    case "toggle86": return { ...s, menu: s.menu.map((m) => (m.id === a.itemId ? { ...m, available: !m.available } : m)) };
    case "clear": return { ...s, lines: [], discount: null, tipPence: 0, orderNote: "" };
    case "place": return { ...s, orders: [a.order, ...s.orders], orderSeq: s.orderSeq + 1, lines: [], discount: null, tipPence: 0, orderNote: "", pendingSync: s.offline ? s.pendingSync + 1 : 0 };
    case "updateOrder": return { ...s, orders: s.orders.map((o) => (o.id === a.order.id ? a.order : o)) };
    default: return s;
  }
}

interface Totals {
  subtotal: number; discount: number; tip: number; vat: number; total: number;
  vatByRate: { rate: number; net: number; vat: number }[]; count: number;
}

const Ctx = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [s, d] = useReducer(reducer, initial);

  const lang: Lang = s.staff?.language ?? "en";
  const t = (k: keyof typeof dict["en"]) => (dict[lang] as any)[k] ?? k;

  const totals: Totals = useMemo(() => {
    const subtotal = s.lines.reduce((sum, l) => sum + lineTotal(l.unit_price_pence, l.qty, l.modifiers_snap), 0);
    const discount = s.discount?.amount_pence ?? 0;
    const netAfterDiscount = Math.max(0, subtotal - discount);
    const ratio = subtotal ? netAfterDiscount / subtotal : 0;
    const byRate = new Map<number, { net: number; vat: number }>();
    s.lines.forEach((l) => {
      const rate = rateFor(TAX_RULES, l.tax_profile_id, s.orderType);
      const lt = Math.round(lineTotal(l.unit_price_pence, l.qty, l.modifiers_snap) * ratio);
      const vat = vatOf(lt, rate);
      const cur = byRate.get(rate) ?? { net: 0, vat: 0 };
      byRate.set(rate, { net: cur.net + (lt - vat), vat: cur.vat + vat });
    });
    const vat = [...byRate.values()].reduce((n, v) => n + v.vat, 0);
    return {
      subtotal, discount, tip: s.tipPence, vat,
      total: netAfterDiscount + s.tipPence,
      vatByRate: [...byRate.entries()].map(([rate, v]) => ({ rate, ...v })),
      count: s.lines.reduce((n, l) => n + l.qty, 0),
    };
  }, [s.lines, s.discount, s.tipPence, s.orderType]);

  const api = {
    state: s, totals, lang, t,
    login: (staff: Staff) => d({ t: "login", staff }),
    logout: () => d({ t: "logout" }),
    pinFail: () => d({ t: "pinFail" }), unlock: () => d({ t: "unlock" }),
    setOffline: (v: boolean) => d({ t: "offline", v }),
    setPrinterOffline: (v: boolean) => d({ t: "printerOffline", v }),
    flush: () => d({ t: "flush" }),
    setOrderType: (v: OrderType) => d({ t: "orderType", v }),
    addLine: (line: CartLine) => d({ t: "addLine", line }),
    qty: (uid: string, delta: number) => d({ t: "qty", uid, delta }),
    removeLine: (uid: string) => d({ t: "removeLine", uid }),
    noteLine: (uid: string, note: string) => d({ t: "noteLine", uid, note }),
    setOrderNote: (v: string) => d({ t: "orderNote", v }),
    applyDiscount: (presetId: string | null, type: "PERCENT" | "AMOUNT", value: number, reason: string, approvedBy: string | null) => {
      const amount = discountAmount(type, value, totals.subtotal);
      d({ t: "discount", v: { preset_id: presetId, type, value, amount_pence: amount, reason_code: reason, approved_by: approvedBy } });
    },
    clearDiscount: () => d({ t: "discount", v: null }),
    setTip: (v: number) => d({ t: "tip", v }),
    toggle86: (itemId: string) => d({ t: "toggle86", itemId }),
    clearBasket: () => d({ t: "clear" }),
    manager: STAFF[0],
    placeOrder(payment: Partial<Order["payments"][0]>, opts?: { tenderedPence?: number; changePence?: number }) {
      const orderId = "ord_" + uid();
      const createdAt = now();
      const ratio = totals.subtotal ? Math.max(0, totals.subtotal - totals.discount) / totals.subtotal : 0;
      const items = s.lines.map((l) => {
        const rate = rateFor(TAX_RULES, l.tax_profile_id, s.orderType);
        const lt = Math.round(lineTotal(l.unit_price_pence, l.qty, l.modifiers_snap) * ratio);
        return {
          id: "oi_" + uid(), order_id: orderId, menu_item_id: l.menu_item_id,
          item_number_snap: l.item_number_snap, name_snap: l.name_snap, qty: l.qty,
          unit_price_pence: l.unit_price_pence, modifiers_snap: l.modifiers_snap,
          tax_profile_id: l.tax_profile_id, vat_rate_bps: rate, vat_pence: vatOf(lt, rate),
          line_total_pence: lt, note: l.note, voided: false,
        };
      });
      const order: Order = {
        id: orderId, location_id: "loc_1", device_id: "dev_1", staff_id: s.staff!.id,
        order_number: s.orderSeq, receipt_number: String(s.orderSeq),
        source: "POS", order_type: s.orderType, status: "COMPLETED",
        subtotal_pence: totals.subtotal, discount_pence: totals.discount,
        service_charge_pence: 0, tip_pence: totals.tip, vat_pence: totals.vat,
        total_pence: totals.total, note: s.orderNote || undefined,
        client_created_at: createdAt, server_received_at: s.offline ? undefined : createdAt,
        version: 1, idempotency_key: orderId,
        items,
        discounts: s.discount ? [{
          id: "dc_" + uid(), order_id: orderId, preset_id: s.discount.preset_id,
          type: s.discount.type, value: s.discount.value, amount_pence: s.discount.amount_pence,
          reason_code: s.discount.reason_code, applied_by_staff_id: s.staff!.id,
          approved_by_staff_id: s.discount.approved_by,
        }] : [],
        payments: [{
          id: "pay_" + uid(), order_id: orderId, method: payment.method as any,
          provider: payment.method === "CARD" ? "STRIPE" : "NONE",
          provider_ref: payment.method === "CARD" ? "pi_" + uid() : undefined,
          amount_pence: totals.total, tip_pence: totals.tip,
          tendered_pence: opts?.tenderedPence, change_pence: opts?.changePence,
          card_brand: payment.method === "CARD" ? "Visa" : undefined,
          card_last4: payment.method === "CARD" ? "4242" : undefined,
          status: "CAPTURED", created_at: createdAt,
        }],
        refunds: [],
        events: [
          { id: "ev_" + uid(), order_id: orderId, type: "ORDER_PLACED", actor_staff_id: s.staff!.id, device_id: "dev_1", created_at: createdAt },
          { id: "ev_" + uid(), order_id: orderId, type: "PAYMENT_TAKEN", payload: { method: payment.method }, actor_staff_id: s.staff!.id, device_id: "dev_1", created_at: createdAt },
        ],
      };
      d({ t: "place", order });
      return order;
    },
    updateOrder: (o: Order) => d({ t: "updateOrder", order: o }),
    presets: DISCOUNT_PRESETS,
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
