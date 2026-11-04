import React, { useEffect, useState } from "react";
import { Button, Chip, Divider, Spinner } from "@heroui/react";
import { addToast } from "@heroui/react";
import { useApp } from "../store";
import { TopBar, Keypad } from "../components/ui";
import { gbp } from "../lib/money";

/* ───── Charge ───── */
export function Charge({ go, back }: any) {
  const { state, t, totals } = useApp();
  return (
    <>
      <TopBar title={t("charge")} onBack={back} />
      <div className="flex-1 px-5 pt-6">
        <div className="text-center mb-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t("total")}</p>
          <p className="text-5xl font-black text-slate-900 mono mt-1">{gbp(totals.total)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{totals.count} {t("items")} · VAT {gbp(totals.vat)}</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => go("cash")} className="w-full rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-4 active:scale-[0.99] transition">
            <span className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></svg>
            </span>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">{t("cash")}</p>
              <p className="text-[11px] text-slate-400">cash drawer · change calculator</p>
            </div>
            <span className="ml-auto text-slate-300">›</span>
          </button>
          <button
            onClick={() => go("card")}
            disabled={state.offline}
            className={`w-full rounded-2xl border p-4 flex items-center gap-4 transition ${state.offline ? "bg-slate-100 border-slate-200 opacity-70" : "bg-white border-slate-200 active:scale-[0.99]"}`}
          >
            <span className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /></svg>
            </span>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">{t("card")}</p>
              <p className="text-[11px] text-slate-400">{state.offline ? t("cardOffline") : "Tap to Pay · Visa ****4242"}</p>
            </div>
            <span className="ml-auto text-slate-300">›</span>
          </button>
        </div>
        {state.offline && <p className="text-center text-[11px] font-semibold text-amber-600 mt-4">Offline · card disabled, cash still works</p>}
      </div>
    </>
  );
}

/* ───── Cash tender ───── */
export function CashTender({ go, back }: any) {
  const { t, totals, placeOrder, state } = useApp();
  const [tendered, setTendered] = useState("");
  const value = Math.round(Number(tendered || 0) * 100);
  const change = value - totals.total;
  const chips = [500, 1000, 2000, totals.total];

  const push = (k: string) => {
    if (k === "C") return setTendered("");
    if (k === "⌫") return setTendered(tendered.slice(0, -1));
    setTendered((tendered + k).slice(0, 6));
  };

  const confirm = () => {
    const order = placeOrder({ method: "CASH" } as any, { tenderedPence: value, changePence: change });
    addToast({ title: t("orderPlaced"), description: `#${order.order_number} · ${t("changeDue")} ${gbp(change)}`, color: "success" });
    go("receipt", { order });
  };

  return (
    <>
      <TopBar title={t("cash")} onBack={back} />
      <div className="flex-1 px-5 pt-4 flex flex-col">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t("total")}</p>
          <p className="text-3xl font-black text-slate-900 mono">{gbp(totals.total)}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 text-white p-4 text-center my-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("tender")}</p>
          <p className="text-4xl font-black mono">{tendered ? `£${tendered}` : "£0"}</p>
          <div className="mt-1 h-6">
            {value > 0 && change >= 0 && <p className="text-[13px] font-bold text-emerald-400">{t("changeDue")} {gbp(change)}</p>}
            {value > 0 && change < 0 && <p className="text-[12px] font-bold text-rose-400">{gbp(-change)} short</p>}
          </div>
        </div>
        <div className="flex gap-1.5 mb-3">
          {chips.map((c, i) => (
            <Button key={i} size="sm" radius="full" variant="flat" className="flex-1 text-[11px] font-bold" onPress={() => setTendered(String(c / 100))}>
              {i === 3 ? t("exact") : `£${c / 100}`}
            </Button>
          ))}
        </div>
        <Keypad onKey={push} />
        <div className="mt-auto pt-3 pb-4">
          <Button color="primary" radius="full" className="w-full h-12 font-bold" isDisabled={value < totals.total || totals.total === 0} onPress={confirm}>
            {t("confirm")} · {gbp(totals.total)}
          </Button>
          {state.pendingSync > 0 && <p className="text-center text-[10px] text-amber-600 font-semibold mt-2">{state.pendingSync} {t("pending")} · saved locally</p>}
        </div>
      </div>
    </>
  );
}

/* ───── Card ───── */
export function CardPay({ go, back }: any) {
  const { t, totals, placeOrder, state } = useApp();
  const [phase, setPhase] = useState<"present" | "processing" | "declined">("present");

  const run = (forceDecline = false) => {
    setPhase("processing");
    setTimeout(() => {
      if (forceDecline) return setPhase("declined");
      const order = placeOrder({ method: "CARD" } as any);
      addToast({ title: t("approved"), description: `#${order.order_number} · ${gbp(totals.total)}`, color: "success" });
      go("receipt", { order });
    }, 1300);
  };

  return (
    <>
      <TopBar title={t("card")} onBack={back} />
      <div className="flex-1 px-6 pt-10 text-center flex flex-col">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /></svg>
        </div>
        <p className="text-2xl font-black mono text-slate-900">{gbp(totals.total)}</p>
        {phase === "present" && (
          <>
            <p className="text-[13px] font-semibold text-slate-500 mt-1">{t("present")} · Tap to Pay</p>
            <Button color="primary" radius="full" className="mt-6 h-12 font-bold px-10" onPress={() => run()}>{t("present")}</Button>
            <button onClick={() => run(true)} className="mt-3 text-[11px] text-slate-400 underline">simulate a decline</button>
          </>
        )}
        {phase === "processing" && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <Spinner color="primary" />
            <p className="text-[13px] font-semibold text-slate-500">{t("paying")}…</p>
          </div>
        )}
        {phase === "declined" && (
          <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 p-4">
            <p className="text-[13px] font-bold text-rose-600">{t("declined")}</p>
            <p className="text-[11px] text-rose-400 mt-1">Issuer declined · code 05</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" radius="full" variant="flat" className="flex-1" onPress={() => run()}>{t("tryAgain")}</Button>
              <Button size="sm" radius="full" color="primary" className="flex-1" onPress={() => go("cash")}>{t("payCash")}</Button>
            </div>
          </div>
        )}
        {state.printerOffline && <p className="mt-auto pb-6 text-[11px] font-semibold text-rose-500">Printer offline · receipt will queue</p>}
      </div>
    </>
  );
}

/* ───── Receipt ───── */
export function ReceiptScreen({ go, back, order }: any) {
  const { t, state } = useApp();
  const [queued, setQueued] = useState(false);

  const print = (kind: "receipt" | "kitchen") => {
    if (state.printerOffline) {
      setQueued(true);
      addToast({ title: "Printer offline", description: "Ticket queued · will print when back online", color: "warning" });
    } else {
      addToast({ title: kind === "receipt" ? t("printReceipt") : t("printKitchen"), description: "Sent to printer", color: "success", timeout: 1500 });
    }
  };

  return (
    <>
      <TopBar title={t("receipt")} onBack={back} right={<Chip size="sm" color="success" variant="flat">{order.status}</Chip>} />
      <div className="scroll-area px-4 py-3">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-3 mb-3">
          <span className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center">✓</span>
          <div>
            <p className="text-[13px] font-bold text-emerald-800">Order #{order.order_number} complete</p>
            <p className="text-[11px] text-emerald-600">{gbp(order.total_pence)} · {order.payments[0]?.method === "CASH" ? "cash" : "card"}</p>
          </div>
        </div>
        <ReceiptPaper order={order} />
        {queued && <p className="text-center text-[11px] font-semibold text-rose-500 mt-2">1 ticket queued · printer offline</p>}
      </div>
      <div className="p-4 border-t border-slate-200 bg-white space-y-2">
        <div className="flex gap-2">
          <Button variant="flat" radius="full" className="flex-1 h-11 font-semibold" onPress={() => print("kitchen")}>{t("printKitchen")}</Button>
          <Button color="primary" radius="full" className="flex-1 h-11 font-bold" onPress={() => print("receipt")}>{t("printReceipt")}</Button>
        </div>
        <Button variant="light" radius="full" className="w-full" onPress={() => go("sell")}>{t("nextOrder")}</Button>
      </div>
    </>
  );
}

function ReceiptPaper({ order }: any) {
  const { t } = useApp();
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 font-mono text-[11px] leading-relaxed text-slate-900">
      <div className="text-center mb-2">
        <div className="font-bold text-[13px] tracking-wide">DEMO TANDOORI</div>
        <div>148 Brick Lane, London E1 6RU</div>
        <div>VAT GB 123 4567 89</div>
      </div>
      <Divider className="my-2 border-dashed" />
      <div className="flex justify-between"><span>Order #{order.order_number}</span><span>{order.order_type === "EAT_IN" ? "EAT IN" : "TAKEAWAY"}</span></div>
      <div className="flex justify-between text-slate-500">
        <span>{order.client_created_at.slice(11, 16)} · {order.staff_id === "stf_2" ? "Shumi" : "Ana"}</span>
        <span>{order.status}</span>
      </div>
      <Divider className="my-2 border-dashed" />
      {order.items.map((l: any) => (
        <div key={l.id} className="mb-0.5">
          <div className="flex justify-between gap-2"><span className="truncate">{l.item_number_snap} {l.name_snap} ×{l.qty}</span><span>{gbp(l.line_total_pence)}</span></div>
          {l.modifiers_snap?.length > 0 && <div className="text-[10px] text-slate-500 pl-3">{l.modifiers_snap.map((m: any) => m.name).join(", ")}</div>}
        </div>
      ))}
      <Divider className="my-2 border-dashed" />
      <div className="flex justify-between"><span>Subtotal</span><span>{gbp(order.subtotal_pence)}</span></div>
      {order.discount_pence > 0 && <div className="flex justify-between"><span>Discount</span><span>−{gbp(order.discount_pence)}</span></div>}
      <div className="flex justify-between text-slate-600"><span>VAT</span><span>{gbp(order.vat_pence)}</span></div>
      {order.tip_pence > 0 && <div className="flex justify-between"><span>Tip</span><span>{gbp(order.tip_pence)}</span></div>}
      <div className="flex justify-between font-bold text-[13px] border-t border-slate-200 mt-1 pt-1"><span>TOTAL</span><span>{gbp(order.total_pence)}</span></div>
      <div className="flex justify-between text-slate-600 pt-1">
        <span>{order.payments[0]?.method === "CASH" ? "Cash" : `Card ${order.payments[0]?.card_brand} ****${order.payments[0]?.card_last4}`}</span>
        <span>{gbp(order.payments[0]?.amount_pence ?? 0)}</span>
      </div>
      {order.payments[0]?.change_pence > 0 && <div className="flex justify-between"><span>Change</span><span>{gbp(order.payments[0].change_pence)}</span></div>}
      <Divider className="my-2 border-dashed" />
      <div className="text-center text-[10px] text-slate-500">Thank you · dhanyabad</div>
      <div className="text-center text-[10px] text-slate-400">14-allergen info on request</div>
    </div>
  );
}
