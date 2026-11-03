import React from "react";
import { Chip, Divider } from "@heroui/react";
import { useApp } from "../store";
import { gbp } from "../lib/money";

export function MyShift() {
  const { state, t } = useApp();
  if (!state.staff || !state.sessionStart) return null;
  const mine = state.orders.filter((o: any) => o.staff_id === state.staff.id && o.status !== "VOIDED");
  const gross = mine.reduce((s: number, o: any) => s + o.total_pence, 0);
  const cash = mine.flatMap((o: any) => o.payments).filter((p: any) => p.method === "CASH").reduce((s: number, p: any) => s + p.amount_pence, 0);
  const card = mine.flatMap((o: any) => o.payments).filter((p: any) => p.method === "CARD").reduce((s: number, p: any) => s + p.amount_pence, 0);
  const tips = mine.reduce((s: number, o: any) => s + o.tip_pence, 0);
  const avg = mine.length ? Math.round(gross / mine.length) : 0;

  const stats = [
    { label: t("ordersCount"), value: String(mine.length), sub: "own orders" },
    { label: t("mySales"), value: gbp(gross), sub: "ex VAT shown on receipt" },
    { label: t("avgOrder"), value: gbp(avg), sub: "average basket" },
    { label: t("myTips"), value: gbp(tips), sub: "Tips Act report" },
  ];

  return (
    <div className="flex-1 min-w-0 overflow-y-auto p-5">
      <div className="max-w-[1100px]">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[14px]">
            {state.staff.name.split(" ").map((n: string) => n[0]).join("")}
          </span>
          <div>
            <p className="text-[16px] font-bold text-slate-900">{state.staff.name}</p>
            <p className="text-[11px] text-slate-400">
              {state.staff.role} · {t("sessionStart")} {new Date(state.sessionStart).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · Counter 1
            </p>
          </div>
          <Chip size="sm" color="success" variant="flat" className="ml-2">{t("shiftOpen")}</Chip>
          <span className="ml-auto text-[11px] text-slate-400">Live · updates as orders complete</span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {stats.map((c) => (
            <div key={c.label} className="rounded-2xl bg-white border border-slate-200/80 p-4">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400">{c.label}</p>
              <p className="text-2xl font-black text-slate-900 mono mt-1">{c.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_360px] gap-3 mt-3">
          <div className="rounded-2xl bg-white border border-slate-200/80 p-4">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-2">My orders today</p>
            {mine.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-[12.5px] font-semibold text-slate-500">{t("noSales")}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Orders you complete appear here instantly</p>
              </div>
            ) : (
              <table className="w-full text-[11.5px]">
                <thead>
                  <tr className="text-[9.5px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="text-left font-bold py-1.5">Order</th>
                    <th className="text-left font-bold py-1.5">Time</th>
                    <th className="text-left font-bold py-1.5">Type</th>
                    <th className="text-right font-bold py-1.5">Paid by</th>
                    <th className="text-right font-bold py-1.5">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mine.map((o: any) => (
                    <tr key={o.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2 font-bold text-slate-800">#{o.order_number}</td>
                      <td className="py-2 text-slate-400">{o.client_created_at.slice(11, 16)}</td>
                      <td className="py-2 text-slate-500">{o.order_type === "EAT_IN" ? "eat in" : "takeaway"}</td>
                      <td className="py-2 text-right text-slate-500">{o.payments[0]?.method === "CASH" ? "cash" : "card"}</td>
                      <td className="py-2 text-right font-bold mono">{gbp(o.total_pence)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-white border border-slate-200/80 p-4">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-2">Takings by method</p>
              <div className="flex justify-between text-[12px] py-1.5"><span className="text-slate-600">{t("cashTaken")}</span><span className="font-bold mono">{gbp(cash)}</span></div>
              <div className="flex justify-between text-[12px] py-1.5"><span className="text-slate-600">{t("cardTaken")}</span><span className="font-bold mono">{gbp(card)}</span></div>
              <Divider className="my-1.5" />
              <div className="flex justify-between text-[13px]"><span className="font-bold text-slate-800">{t("total")}</span><span className="font-black mono">{gbp(cash + card)}</span></div>
            </div>
            <div className="rounded-2xl bg-slate-100/70 border border-slate-200/60 p-4">
              <p className="text-[11.5px] font-semibold text-slate-600">Cash-up, float and Z-report belong to the Manager</p>
              <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">This screen is read-only for cashiers. Your tips are recorded per shift for the Tips Act report.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
