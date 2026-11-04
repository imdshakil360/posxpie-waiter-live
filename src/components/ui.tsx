import React from "react";
import { Badge, Button, Chip, Divider } from "@heroui/react";
import { useApp } from "../store";
import { DEVICE, LOCATION } from "../data/seed";
import { gbp } from "../lib/money";

export function TopBar({ title, onBack, right }: { title?: string; onBack?: () => void; right?: React.ReactNode }) {
  const { state, t, setOffline, setPrinterOffline, flush, lang } = useApp();
  const offline = state.offline;
  return (
    <div className="sticky top-0 z-20 bg-[#F6F7F9]/95 backdrop-blur px-4 pt-3 pb-2 border-b border-slate-200/70">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          {onBack ? (
            <button onClick={onBack} className="flex items-center gap-1 text-slate-500 text-xs font-semibold mb-0.5 hover:text-slate-800">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
              {t("back")}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              <span>{DEVICE.name.split(" · ")[0]}</span>
              <span className="text-slate-300">·</span>
              <span>{LOCATION.name}</span>
            </div>
          )}
          {title && <h1 className="text-lg font-bold text-slate-900 leading-tight truncate">{title}</h1>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">{right}</div>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <button
          onClick={() => { setOffline(!offline); if (offline) flush(); }}
          className={`flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1 text-[11px] font-semibold border transition ${
            offline ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${offline ? "bg-amber-500" : "bg-emerald-500"}`} />
          {offline ? t("off") : t("on")}
          {offline && state.pendingSync > 0 && <span className="text-amber-600">· {state.pendingSync} {t("pending")}</span>}
          {!offline && <span className="text-emerald-600">· {t("synced")}</span>}
        </button>
        <button
          onClick={() => setPrinterOffline(!state.printerOffline)}
          className={`flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1 text-[11px] font-semibold border transition ${
            state.printerOffline ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white border-slate-200 text-slate-500"
          }`}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" /></svg>
          {state.printerOffline ? t("printerOff") : "Printer"}
        </button>
        <span className="ml-auto text-[10px] font-bold tracking-wider text-slate-300">{lang.toUpperCase()}</span>
      </div>
    </div>
  );
}

export function StaffChip({ onSwitch }: { onSwitch: () => void }) {
  const { state, t } = useApp();
  if (!state.staff) return null;
  return (
    <button onClick={onSwitch} className="flex items-center gap-2 rounded-full bg-white border border-slate-200 pl-1 pr-2.5 py-1">
      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center">
        {state.staff.name.split(" ").map((n: string) => n[0]).join("")}
      </span>
      <span className="text-[11px] font-semibold text-slate-700 max-w-[74px] truncate">{state.staff.name.split(" ")[0]}</span>
    </button>
  );
}

export function Keypad({ onKey, className = "" }: { onKey: (k: string) => void; className?: string }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"];
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {keys.map((k) => (
        <Button
          key={k}
          onPress={() => onKey(k)}
          variant={k === "C" || k === "⌫" ? "flat" : "bordered"}
          className={`h-12 text-lg font-semibold rounded-xl ${k === "C" || k === "⌫" ? "text-slate-500 bg-slate-100" : "bg-white"}`}
        >
          {k}
        </Button>
      ))}
    </div>
  );
}

export function Money({ pence, className = "" }: { pence: number; className?: string }) {
  return <span className={`mono ${className}`}>{gbp(pence)}</span>;
}

export function Receipt80({
  order, lines, totals, orderType, staffName, orderNo, showCompany = true,
}: any) {
  const rows = lines ?? order?.items ?? [];
  return (
    <div className="bg-white text-slate-900 rounded-xl border border-slate-200 p-4 font-mono text-[11px] leading-relaxed shadow-sm">
      {showCompany && (
        <div className="text-center mb-2">
          <div className="font-bold text-[13px] tracking-wide">{LOCATION.name.toUpperCase()}</div>
          <div>{LOCATION.address_1}, {LOCATION.city} {LOCATION.postcode}</div>
          <div>VAT {LOCATION.vat_number}</div>
          <div className="text-[10px] text-slate-500">FHRS {LOCATION.fhrs_id}</div>
        </div>
      )}
      <Divider className="my-2 border-dashed" />
      <div className="flex justify-between">
        <span>Order #{orderNo ?? order?.order_number}</span>
        <span>{orderType === "EAT_IN" ? "EAT IN" : "TAKEAWAY"}</span>
      </div>
      <div className="flex justify-between text-slate-500">
        <span>{(order?.client_created_at ?? new Date().toISOString()).slice(11, 16)} · {staffName ?? "—"}</span>
        <span>{order ? order.status : "PREVIEW"}</span>
      </div>
      <Divider className="my-2 border-dashed" />
      <div className="space-y-1">
        {rows.map((l: any, i: number) => (
          <div key={i}>
            <div className="flex justify-between gap-2">
              <span className="truncate">{l.item_number_snap} {l.name_snap} ×{l.qty}</span>
              <span>{gbp(l.line_total_pence)}</span>
            </div>
            {l.modifiers_snap?.length > 0 && (
              <div className="text-[10px] text-slate-500 pl-3">{l.modifiers_snap.map((m: any) => m.name).join(", ")}</div>
            )}
            {l.note && <div className="text-[10px] text-slate-500 pl-3">note: {l.note}</div>}
          </div>
        ))}
      </div>
      <Divider className="my-2 border-dashed" />
      <div className="space-y-0.5">
        <div className="flex justify-between"><span>Subtotal</span><span>{gbp(totals?.subtotal ?? order?.subtotal_pence ?? 0)}</span></div>
        {(totals?.discount ?? order?.discount_pence) > 0 && (
          <div className="flex justify-between"><span>Discount</span><span>-{gbp(totals?.discount ?? order?.discount_pence)}</span></div>
        )}
        {(totals?.vatByRate ?? []).map((v: any) => (
          <div key={v.rate} className="flex justify-between text-slate-600"><span>VAT {(v.rate / 100).toFixed(1)}%</span><span>{gbp(v.vat)}</span></div>
        ))}
        {!totals && order && (
          <div className="flex justify-between text-slate-600"><span>VAT</span><span>{gbp(order.vat_pence)}</span></div>
        )}
        {(totals?.tip ?? order?.tip_pence) > 0 && (
          <div className="flex justify-between"><span>Tip</span><span>{gbp(totals?.tip ?? order?.tip_pence)}</span></div>
        )}
        <div className="flex justify-between font-bold text-[13px] pt-1 border-t border-slate-200 mt-1">
          <span>TOTAL</span><span>{gbp(totals?.total ?? order?.total_pence ?? 0)}</span>
        </div>
        {order?.payments?.[0] && (
          <div className="flex justify-between text-slate-600 pt-1">
            <span>{order.payments[0].method === "CASH" ? "Cash" : `Card ${order.payments[0].card_brand ?? ""} ****${order.payments[0].card_last4 ?? ""}`}</span>
            <span>{gbp(order.payments[0].amount_pence)}</span>
          </div>
        )}
        {order?.payments?.[0]?.change_pence > 0 && (
          <div className="flex justify-between"><span>Change</span><span>{gbp(order.payments[0].change_pence)}</span></div>
        )}
      </div>
      <Divider className="my-2 border-dashed" />
      <div className="text-center text-[10px] text-slate-500">Thank you · dhanyabad</div>
      <div className="text-center text-[10px] text-slate-400">14-allergen info available on request</div>
    </div>
  );
}
