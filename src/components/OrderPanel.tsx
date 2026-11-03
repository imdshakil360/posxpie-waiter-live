import React, { useEffect, useState } from "react";
import { Button, Chip, Divider, Modal, ModalBody, ModalContent, Spinner } from "@heroui/react";
import { addToast } from "@heroui/react";
import { useApp } from "../store";
import { DiscountSheet, TipsSheet, TextSheet } from "./modals";
import { gbp, lineTotal } from "../lib/money";

type Mode = "cart" | "charge" | "cash" | "card";

export function OrderPanel() {
  const { state, t, totals, qty, removeLine, noteLine, setOrderType, setOrderNote, clearBasket, clearDiscount, placeOrder } = useApp();
  const [mode, setMode] = useState<Mode>("cart");
  const [tendered, setTendered] = useState("");
  const [discountOpen, setDiscountOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [lineNote, setLineNote] = useState<any>(null);
  const [cardPhase, setCardPhase] = useState<"present" | "processing" | "declined">("present");
  const [receipt, setReceipt] = useState<any>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F9" && mode === "cart" && totals.count > 0) { e.preventDefault(); setMode("charge"); }
      if (e.key === "Escape" && mode !== "cart") { setMode("cart"); setTendered(""); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, totals.count]);

  const tender = Math.round(Number(tendered || 0) * 100);
  const change = tender - totals.total;

  const finish = (order: any, msg: string) => {
    setReceipt(order);
    setMode("cart"); setTendered(""); setCardPhase("present");
    addToast({ title: msg, description: `#${order.order_number} · ${gbp(order.total_pence)}`, color: "success" });
  };

  const payCash = () => finish(placeOrder({ method: "CASH" } as any, { tenderedPence: tender, changePence: change }), t("orderPlaced"));

  const payCard = (forceDecline = false) => {
    setCardPhase("processing");
    setTimeout(() => {
      if (forceDecline) return setCardPhase("declined");
      finish(placeOrder({ method: "CARD" } as any), t("approved"));
    }, 1100);
  };

  const empty = totals.count === 0;

  return (
    <>
      <aside className="w-[380px] xl:w-[408px] shrink-0 bg-white rounded-2xl border border-slate-200/80 flex flex-col overflow-hidden">
        {/* header */}
        <div className="px-4 pt-3.5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400">
                {mode === "cart" ? `${t("basket")} · draft` : mode === "cash" ? t("cash") : mode === "card" ? t("card") : t("checkout")}
              </p>
              <p className="text-[15px] font-bold text-slate-900 leading-tight">
                {mode === "cart" ? `${totals.count} ${t("items")}` : gbp(totals.total)}
              </p>
            </div>
            {mode === "cart" ? (
              <div className="flex bg-slate-100 rounded-lg p-0.5">
                {(["TAKEAWAY", "EAT_IN"] as const).map((k) => (
                  <button key={k} onClick={() => setOrderType(k)}
                    className={`px-2.5 py-1 rounded-[7px] text-[10.5px] font-bold transition ${state.orderType === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}>
                    {k === "EAT_IN" ? t("eatIn") : t("takeaway")}
                  </button>
                ))}
              </div>
            ) : (
              <button onClick={() => { setMode("cart"); setTendered(""); }} className="text-[11px] font-semibold text-slate-400 hover:text-slate-700">{t("back")}</button>
            )}
          </div>
        </div>

        {/* body */}
        {mode === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
              {empty && (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.8"><path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M6 6L5 3H2" /></svg>
                  </div>
                  <p className="text-[12.5px] font-semibold text-slate-500">No items yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tap a tile or type an item number</p>
                </div>
              )}
              {state.lines.map((l: any) => (
                <div key={l.uid} className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-slate-800 leading-tight">
                        <span className="text-slate-400 mr-1">{l.item_number_snap}</span>{l.name_snap}
                      </p>
                      {l.modifiers_snap.length > 0 && <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{l.modifiers_snap.map((m: any) => m.name).join(" · ")}</p>}
                      {l.note && <p className="text-[10px] text-amber-600 mt-0.5">note: {l.note}</p>}
                    </div>
                    <span className="text-[12px] font-bold mono shrink-0">{gbp(lineTotal(l.unit_price_pence, l.qty, l.modifiers_snap))}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => qty(l.uid, -1)} className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-500 text-[13px] leading-none font-bold">−</button>
                      <span className="w-6 text-center text-[11.5px] font-bold mono">{l.qty}</span>
                      <button onClick={() => qty(l.uid, 1)} className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-500 text-[13px] leading-none font-bold">+</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setLineNote(l)} className="text-[10px] font-semibold text-indigo-500">{t("itemNote")}</button>
                      <button onClick={() => removeLine(l.uid)} className="text-[10px] font-semibold text-slate-400 hover:text-rose-500">{t("remove")}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!empty && (
              <div className="border-t border-slate-100 px-3 py-2 space-y-0.5">
                <Row label={t("subtotal")} value={gbp(totals.subtotal)} onClick={() => {}} />
                <Row label={t("discount")} value={totals.discount ? `−${gbp(totals.discount)}` : "Add"} accent={totals.discount ? "rose" : "muted"} onClick={() => setDiscountOpen(true)} />
                <Row label={t("tip")} value={totals.tip ? gbp(totals.tip) : "Add"} accent={totals.tip ? "emerald" : "muted"} onClick={() => setTipsOpen(true)} />
                <Row label={t("orderNote")} value={state.orderNote || "Add"} accent="muted" onClick={() => setNoteOpen(true)} />
                <div className="flex items-center justify-between pt-1 text-[10.5px] text-slate-400">
                  <span>{state.orderType === "EAT_IN" ? "Eat in" : "Takeaway"} VAT</span>
                  <span className="mono">{gbp(totals.vat)}</span>
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 p-3 space-y-2">
              <div className="flex items-end justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t("total")}</span>
                <span className="text-2xl font-black text-slate-900 mono leading-none">{gbp(totals.total)}</span>
              </div>
              <Button color="primary" radius="full" className="w-full h-11 font-bold text-[13px]" isDisabled={empty} onPress={() => setMode("charge")}>
                {t("pay")} {!empty && `· ${gbp(totals.total)}`}
                <span className="ml-1.5 text-[9.5px] font-semibold text-indigo-200">F9</span>
              </Button>
              {!empty && <button onClick={clearBasket} className="w-full text-[10.5px] font-semibold text-slate-400 hover:text-rose-500">{t("clear")}</button>}
            </div>
          </>
        )}

        {mode === "charge" && (
          <div className="flex-1 flex flex-col p-4">
            <div className="text-center py-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("total")}</p>
              <p className="text-4xl font-black text-slate-900 mono mt-1">{gbp(totals.total)}</p>
              <p className="text-[11px] text-slate-400 mt-1">{totals.count} {t("items")} · VAT {gbp(totals.vat)}</p>
            </div>
            <div className="space-y-2.5 mt-2">
              <button onClick={() => setMode("cash")} className="w-full rounded-xl border border-slate-200 bg-white hover:border-emerald-300 p-3 flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></svg>
                </span>
                <div className="text-left">
                  <p className="text-[12.5px] font-bold text-slate-800">{t("cash")}</p>
                  <p className="text-[10.5px] text-slate-400">drawer · change calculator</p>
                </div>
                <span className="ml-auto text-slate-300">›</span>
              </button>
              <button onClick={() => state.offline ? null : setMode("card")} disabled={state.offline}
                className={`w-full rounded-xl border p-3 flex items-center gap-3 ${state.offline ? "bg-slate-50 border-slate-200 opacity-70" : "bg-white border-slate-200 hover:border-indigo-300"}`}>
                <span className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /></svg>
                </span>
                <div className="text-left">
                  <p className="text-[12.5px] font-bold text-slate-800">{t("card")}</p>
                  <p className="text-[10.5px] text-slate-400">{state.offline ? t("cardOffline") : "Tap to Pay · Stripe Terminal"}</p>
                </div>
                <span className="ml-auto text-slate-300">›</span>
              </button>
            </div>
            {state.offline && <p className="mt-3 text-[10.5px] font-semibold text-amber-600 text-center">Offline · cash only</p>}
            <div className="mt-auto pt-4">
              <button onClick={() => setMode("cart")} className="w-full text-[11px] font-semibold text-slate-400">{t("back")}</button>
            </div>
          </div>
        )}

        {mode === "cash" && (
          <div className="flex-1 flex flex-col p-4">
            <div className="rounded-xl bg-slate-900 text-white p-3 text-center">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400">{t("tender")}</p>
              <p className="text-3xl font-black mono">{tendered ? `£${tendered}` : "£0"}</p>
              <div className="h-5">
                {tender > 0 && change >= 0 && <p className="text-[12px] font-bold text-emerald-400">{t("changeDue")} {gbp(change)}</p>}
                {tender > 0 && change < 0 && <p className="text-[11px] font-bold text-rose-400">{gbp(-change)} short</p>}
              </div>
            </div>
            <div className="flex gap-1.5 my-2.5">
              {[500, 1000, 2000, totals.total].map((c, i) => (
                <button key={i} onClick={() => setTendered(String(c / 100))}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-[10.5px] font-bold text-slate-600 hover:border-indigo-300">
                  {i === 3 ? t("exact") : `£${c / 100}`}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((k) => (
                <button key={k} onClick={() => {
                  if (k === "C") return setTendered("");
                  if (k === "⌫") return setTendered((v) => v.slice(0, -1));
                  setTendered((v) => (v + k).slice(0, 6));
                }} className={`h-10 rounded-lg text-[14px] font-semibold border ${k === "C" || k === "⌫" ? "bg-slate-100 border-slate-200 text-slate-500" : "bg-white border-slate-200 text-slate-700"}`}>{k}</button>
              ))}
            </div>
            <div className="mt-auto pt-3">
              <Button color="primary" radius="full" className="w-full h-11 font-bold" isDisabled={tender < totals.total || empty} onPress={payCash}>
                {t("confirm")} · {gbp(totals.total)}
              </Button>
            </div>
          </div>
        )}

        {mode === "card" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /></svg>
            </div>
            <p className="text-3xl font-black mono text-slate-900">{gbp(totals.total)}</p>
            {cardPhase === "present" && (
              <>
                <p className="text-[12px] font-semibold text-slate-500 mt-1">{t("present")} · Tap to Pay</p>
                <Button color="primary" radius="full" className="mt-5 h-11 px-8 font-bold" onPress={() => payCard()}>{t("present")}</Button>
                <button onClick={() => payCard(true)} className="mt-3 text-[10.5px] text-slate-400 underline">simulate decline</button>
              </>
            )}
            {cardPhase === "processing" && (
              <div className="mt-6 flex flex-col items-center gap-2">
                <Spinner color="primary" size="sm" />
                <p className="text-[12px] font-semibold text-slate-500">{t("paying")}…</p>
              </div>
            )}
            {cardPhase === "declined" && (
              <div className="mt-5 w-full rounded-xl bg-rose-50 border border-rose-200 p-3">
                <p className="text-[12.5px] font-bold text-rose-600">{t("declined")}</p>
                <p className="text-[10.5px] text-rose-400">Issuer declined · code 05</p>
                <div className="flex gap-2 mt-2.5">
                  <Button size="sm" radius="full" variant="flat" className="flex-1" onPress={() => payCard()}>{t("tryAgain")}</Button>
                  <Button size="sm" radius="full" color="primary" className="flex-1" onPress={() => setMode("cash")}>{t("payCash")}</Button>
                </div>
              </div>
            )}
            <button onClick={() => { setMode("cart"); setCardPhase("present"); }} className="mt-auto text-[10.5px] font-semibold text-slate-400">{t("cancel")}</button>
          </div>
        )}
      </aside>

      <DiscountSheet open={discountOpen} onClose={() => setDiscountOpen(false)} />
      <TipsSheet open={tipsOpen} onClose={() => setTipsOpen(false)} />
      <TextSheet open={noteOpen} title={t("orderNote")} label="Note for kitchen" value={state.orderNote} onClose={() => setNoteOpen(false)} onSave={(v: string) => setOrderNote(v)} />
      <TextSheet open={!!lineNote} title={t("itemNote")} label="Note for kitchen" value={lineNote?.note ?? ""} onClose={() => setLineNote(null)} onSave={(v: string) => noteLine(lineNote.uid, v)} />

      <Modal isOpen={!!receipt} onOpenChange={() => setReceipt(null)} size="sm" placement="center" backdrop="blur" hideCloseButton scrollBehavior="inside">
        <ModalContent>
          {() => (
            <ModalBody className="p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[13px]">✓</span>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">Order #{receipt?.order_number} complete</p>
                  <p className="text-[11px] text-slate-400">{gbp(receipt?.total_pence ?? 0)} · {receipt?.payments?.[0]?.method === "CASH" ? "cash" : "card"}</p>
                </div>
              </div>
              {receipt && <ReceiptBlock order={receipt} />}
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="flat" radius="full" className="flex-1 h-10 font-semibold"
                  onPress={() => addToast({ title: t("printKitchen"), description: state.printerOffline ? "queued · printer offline" : "sent to kitchen", color: state.printerOffline ? "warning" : "success", timeout: 1400 })}>
                  {t("printKitchen")}
                </Button>
                <Button size="sm" color="primary" radius="full" className="flex-1 h-10 font-bold"
                  onPress={() => addToast({ title: t("printReceipt"), description: state.printerOffline ? "queued · printer offline" : "sent to printer", color: state.printerOffline ? "warning" : "success", timeout: 1400 })}>
                  {t("printReceipt")}
                </Button>
              </div>
              <Button size="sm" variant="light" radius="full" className="w-full mt-1" onPress={() => setReceipt(null)}>{t("nextOrder")}</Button>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

function Row({ label, value, onClick, accent = "muted" }: any) {
  const color = accent === "rose" ? "text-rose-500" : accent === "emerald" ? "text-emerald-600" : "text-slate-500";
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between py-1 group">
      <span className="text-[11.5px] font-medium text-slate-500 group-hover:text-slate-800">{label}</span>
      <span className={`text-[11.5px] font-semibold mono ${color}`}>{value}</span>
    </button>
  );
}

export function ReceiptBlock({ order }: any) {
  return (
    <div className="rounded-xl border border-slate-200 p-3.5 font-mono text-[10.5px] leading-relaxed text-slate-900 bg-white">
      <div className="text-center mb-1.5">
        <div className="font-bold text-[12px] tracking-wide">DEMO TANDOORI</div>
        <div className="text-slate-500">148 Brick Lane, London E1 6RU · VAT GB 123 4567 89</div>
      </div>
      <Divider className="my-1.5 border-dashed" />
      <div className="flex justify-between"><span>Order #{order.order_number}</span><span>{order.order_type === "EAT_IN" ? "EAT IN" : "TAKEAWAY"}</span></div>
      <div className="flex justify-between text-slate-500"><span>{order.client_created_at.slice(11, 16)}</span><span>{order.status}</span></div>
      <Divider className="my-1.5 border-dashed" />
      {order.items.map((l: any) => (
        <div key={l.id}>
          <div className="flex justify-between gap-2"><span className="truncate">{l.item_number_snap} {l.name_snap} ×{l.qty}</span><span>{gbp(l.line_total_pence)}</span></div>
          {l.modifiers_snap?.length > 0 && <div className="text-[9.5px] text-slate-500 pl-3">{l.modifiers_snap.map((m: any) => m.name).join(", ")}</div>}
        </div>
      ))}
      <Divider className="my-1.5 border-dashed" />
      <div className="flex justify-between"><span>Subtotal</span><span>{gbp(order.subtotal_pence)}</span></div>
      {order.discount_pence > 0 && <div className="flex justify-between"><span>Discount</span><span>−{gbp(order.discount_pence)}</span></div>}
      <div className="flex justify-between text-slate-600"><span>VAT</span><span>{gbp(order.vat_pence)}</span></div>
      {order.tip_pence > 0 && <div className="flex justify-between"><span>Tip</span><span>{gbp(order.tip_pence)}</span></div>}
      <div className="flex justify-between font-bold text-[12px] border-t border-slate-200 mt-1 pt-1"><span>TOTAL</span><span>{gbp(order.total_pence)}</span></div>
      <div className="flex justify-between text-slate-600">
        <span>{order.payments[0]?.method === "CASH" ? "Cash" : `Card ${order.payments[0]?.card_brand} ****${order.payments[0]?.card_last4}`}</span>
        <span>{gbp(order.payments[0]?.amount_pence ?? 0)}</span>
      </div>
      {order.payments[0]?.change_pence > 0 && <div className="flex justify-between"><span>Change</span><span>{gbp(order.payments[0].change_pence)}</span></div>}
      <Divider className="my-1.5 border-dashed" />
      <div className="text-center text-[9.5px] text-slate-400">Thank you · 14-allergen info on request</div>
    </div>
  );
}
