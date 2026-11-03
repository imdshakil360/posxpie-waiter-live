import React, { useState } from "react";
import { Button, Chip, Divider } from "@heroui/react";
import { useApp } from "../store";
import { TopBar } from "../components/ui";
import { DiscountSheet, TipsSheet, TextSheet } from "../components/modals";
import { gbp, lineTotal } from "../lib/money";

export default function Basket({ go, back }: { go: (n: string) => void; back: () => void }) {
  const { state, t, totals, qty, removeLine, noteLine, setOrderNote, clearBasket, clearDiscount } = useApp();
  const [discountOpen, setDiscountOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [lineNote, setLineNote] = useState<any>(null);

  return (
    <>
      <TopBar title={t("basket")} onBack={back} right={<Chip size="sm" variant="flat">{state.orderType === "EAT_IN" ? t("eatIn") : t("takeaway")}</Chip>} />
      <div className="scroll-area px-4 py-3 space-y-2">
        {state.lines.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-slate-100 mx-auto mb-3 flex items-center justify-center text-2xl">🛒</div>
            <p className="text-sm font-semibold text-slate-500">Basket is empty</p>
            <p className="text-[11px] text-slate-400 mt-1">Add items from the Sell screen</p>
            <Button size="sm" className="mt-4" variant="flat" onPress={back}>Back to menu</Button>
          </div>
        )}

        {state.lines.map((l: any) => (
          <div key={l.uid} className="rounded-2xl bg-white border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[12.5px] font-bold text-slate-800 leading-tight">
                  <span className="text-slate-400 mr-1">{l.item_number_snap}</span>{l.name_snap}
                </p>
                {l.modifiers_snap.length > 0 && (
                  <p className="text-[10.5px] text-slate-500 mt-0.5">{l.modifiers_snap.map((m: any) => m.name).join(" · ")}</p>
                )}
                {l.note && <p className="text-[10.5px] text-amber-600 mt-0.5">note: {l.note}</p>}
                <button onClick={() => { setLineNote(l); }} className="text-[10px] font-semibold text-indigo-500 mt-1">+ note</button>
              </div>
              <span className="text-[13px] font-bold mono text-slate-900 shrink-0">{gbp(lineTotal(l.unit_price_pence, l.qty, l.modifiers_snap))}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5">
                <Button size="sm" isIconOnly radius="full" variant="flat" className="w-7 h-7 min-w-7" onPress={() => qty(l.uid, -1)}>−</Button>
                <span className="w-6 text-center text-[13px] font-bold mono">{l.qty}</span>
                <Button size="sm" isIconOnly radius="full" variant="flat" className="w-7 h-7 min-w-7" onPress={() => qty(l.uid, 1)}>+</Button>
              </div>
              <Button size="sm" variant="light" color="danger" className="h-7 text-[11px]" onPress={() => removeLine(l.uid)}>{t("remove")}</Button>
            </div>
          </div>
        ))}

        {state.lines.length > 0 && (
          <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100">
            <button onClick={() => setDiscountOpen(true)} className="w-full flex items-center justify-between px-3 py-2.5">
              <span className="text-[12px] font-semibold text-slate-600">{t("discount")}</span>
              <span className={`text-[12px] font-bold mono ${totals.discount ? "text-rose-500" : "text-slate-400"}`}>
                {totals.discount ? `−${gbp(totals.discount)}` : "Add"} ›
              </span>
            </button>
            <button onClick={() => setTipsOpen(true)} className="w-full flex items-center justify-between px-3 py-2.5">
              <span className="text-[12px] font-semibold text-slate-600">{t("tip")}</span>
              <span className={`text-[12px] font-bold mono ${totals.tip ? "text-emerald-600" : "text-slate-400"}`}>
                {totals.tip ? gbp(totals.tip) : "Add"} ›
              </span>
            </button>
            <button onClick={() => setNoteOpen(true)} className="w-full flex items-center justify-between px-3 py-2.5">
              <span className="text-[12px] font-semibold text-slate-600">{t("orderNote")}</span>
              <span className="text-[11px] text-slate-400 max-w-[55%] truncate">{state.orderNote || "Add"} ›</span>
            </button>
            <div className="px-3 py-2.5 space-y-1">
              <div className="flex justify-between text-[12px] text-slate-600"><span>{t("subtotal")}</span><span className="mono">{gbp(totals.subtotal)}</span></div>
              {totals.discount > 0 && <div className="flex justify-between text-[12px] text-rose-500"><span>{t("discount")} <button onClick={clearDiscount} className="text-[10px] underline">clear</button></span><span className="mono">−{gbp(totals.discount)}</span></div>}
              {totals.vatByRate.map((v: any) => (
                <div key={v.rate} className="flex justify-between text-[11px] text-slate-400"><span>VAT {v.rate / 100}%</span><span className="mono">{gbp(v.vat)}</span></div>
              ))}
              {totals.tip > 0 && <div className="flex justify-between text-[12px] text-emerald-600"><span>{t("tip")}</span><span className="mono">{gbp(totals.tip)}</span></div>}
              <Divider className="my-1.5" />
              <div className="flex justify-between text-[15px] font-black text-slate-900"><span>{t("total")}</span><span className="mono">{gbp(totals.total)}</span></div>
            </div>
          </div>
        )}

        {state.lines.length > 0 && (
          <Button size="sm" variant="light" color="danger" className="w-full" onPress={clearBasket}>{t("clear")}</Button>
        )}
      </div>

      {state.lines.length > 0 && (
        <div className="p-4 border-t border-slate-200 bg-white">
          <Button color="primary" radius="full" className="w-full h-12 font-bold" onPress={() => go("charge")}>
            {t("pay")} · {gbp(totals.total)}
          </Button>
        </div>
      )}

      <DiscountSheet open={discountOpen} onClose={() => setDiscountOpen(false)} />
      <TipsSheet open={tipsOpen} onClose={() => setTipsOpen(false)} />
      <TextSheet open={noteOpen} title={t("orderNote")} label="Note for kitchen" value={state.orderNote} onClose={() => setNoteOpen(false)} onSave={(v: string) => setOrderNote(v)} />
      <TextSheet open={!!lineNote} title={t("itemNote")} label="Note for kitchen" value={lineNote?.note ?? ""} onClose={() => setLineNote(null)} onSave={(v: string) => noteLine(lineNote.uid, v)} />
    </>
  );
}
