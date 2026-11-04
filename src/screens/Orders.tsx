import React, { useState } from "react";
import { Button, Checkbox, Chip, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs } from "@heroui/react";
import { addToast } from "@heroui/react";
import { useApp } from "../store";
import { ManagerPin, ConfirmModal } from "../components/modals";
import { gbp } from "../lib/money";

const uid = () => Math.random().toString(36).slice(2, 9);

export function OrdersWorkspace() {
  const { state, t } = useApp();
  const [filter, setFilter] = useState("mine");
  const [selected, setSelected] = useState<string | null>(null);
  const list = state.orders.filter((o: any) => (filter === "mine" ? o.staff_id === state.staff.id : true));
  const order = state.orders.find((o: any) => o.id === (selected ?? list[0]?.id));

  return (
    <div className="flex-1 min-w-0 flex gap-4 p-4">
      <div className="w-[352px] shrink-0 bg-white rounded-2xl border border-slate-200/80 flex flex-col overflow-hidden">
        <div className="px-3.5 pt-3.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-bold text-slate-900">{t("orders")}</p>
            <Chip size="sm" variant="flat" className="h-5 text-[9.5px]">{list.length}</Chip>
          </div>
          <Tabs aria-label="filter" fullWidth size="sm" radius="full" selectedKey={filter} onSelectionChange={(k) => setFilter(k as string)}
            classNames={{ tabList: "bg-slate-100 h-8", cursor: "bg-white shadow-sm", tab: "h-7", tabContent: "text-[11px] font-semibold group-data-[selected=true]:text-slate-900 text-slate-500" }}>
            <Tab key="mine" title="Mine" />
            <Tab key="all" title="All today" />
          </Tabs>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {list.length === 0 && (
            <div className="text-center py-16 px-4">
              <p className="text-[12.5px] font-semibold text-slate-500">{t("noOrders")}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Completed orders appear here instantly</p>
            </div>
          )}
          {list.map((o: any) => (
            <button key={o.id} onClick={() => setSelected(o.id)}
              className={`w-full text-left rounded-xl border p-2.5 transition ${
                order?.id === o.id ? "border-indigo-300 bg-indigo-50/60" : "border-slate-100 hover:bg-slate-50"}`}>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-bold text-slate-900">#{o.order_number}</span>
                <span className="text-[12.5px] font-bold mono text-slate-900">{gbp(o.total_pence)}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Chip size="sm" variant="flat" className="h-4 text-[8.5px]">{o.order_type === "EAT_IN" ? "eat in" : "takeaway"}</Chip>
                {o.status !== "COMPLETED" && <Chip size="sm" color="danger" variant="flat" className="h-4 text-[8.5px]">{o.status}</Chip>}
                <span className="text-[10px] text-slate-400 ml-auto">{o.client_created_at.slice(11, 16)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200/80 flex flex-col overflow-hidden">
        {!order ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.6"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" /></svg>
            </div>
            <p className="text-[13px] font-semibold text-slate-500">Select an order</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Detail, VAT breakdown and the event timeline appear here</p>
          </div>
        ) : (
          <OrderDetailPanel key={order.id} order={order} />
        )}
      </div>
    </div>
  );
}

function OrderDetailPanel({ order }: any) {
  const { state, t, updateOrder, manager } = useApp();
  const [pinOpen, setPinOpen] = useState(false);
  const [confirmVoid, setConfirmVoid] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  const doVoid = () => {
    const now = new Date().toISOString();
    updateOrder({
      ...order, status: "VOIDED", version: order.version + 1,
      payments: order.payments.map((p: any) => ({ ...p, status: "REVERSED" })),
      events: [...order.events, { id: "ev_" + uid(), order_id: order.id, type: "VOIDED", actor_staff_id: state.staff.id, device_id: "dev_1", created_at: now, payload: { approved_by: manager.id } }],
    } as any);
    addToast({ title: t("orderVoided"), description: `#${order.order_number} · manager approved`, color: "danger" });
  };

  return (
    <>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[17px] font-bold text-slate-900">#{order.order_number}</p>
            <Chip size="sm" color={order.status === "VOIDED" ? "danger" : order.status === "REFUNDED" ? "warning" : "success"} variant="flat" className="h-5 text-[9.5px]">{order.status}</Chip>
            <Chip size="sm" variant="flat" className="h-5 text-[9.5px]">{order.order_type === "EAT_IN" ? "eat in" : "takeaway"}</Chip>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {order.client_created_at.slice(11, 16)} · {order.staff_id === state.staff.id ? "you" : order.staff_id === "stf_2" ? "Shumi" : "Ana"} · Counter 1
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="flat" radius="full" className="h-8 text-[11.5px]" onPress={() => addToast({ title: t("reprint"), description: "Sent to printer", color: "success", timeout: 1300 })}>{t("reprint")}</Button>
          <Button size="sm" variant="flat" color="danger" radius="full" className="h-8 text-[11.5px]" isDisabled={order.status === "VOIDED"} onPress={() => setConfirmVoid(true)}>{t("void")}</Button>
          <Button size="sm" color="primary" variant="flat" radius="full" className="h-8 text-[11.5px]" isDisabled={["VOIDED", "REFUNDED"].includes(order.status)} onPress={() => setRefundOpen(true)}>{t("refund")}</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 grid grid-cols-[1fr_320px] gap-5">
        <div>
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-2">Items · order_items</p>
          <div className="rounded-xl border border-slate-100 divide-y divide-slate-100">
            {order.items.map((l: any) => (
              <div key={l.id} className="px-3 py-2.5">
                <div className="flex justify-between">
                  <span className={`text-[12.5px] font-semibold ${order.status === "VOIDED" ? "line-through text-slate-400" : "text-slate-800"}`}>
                    <span className="text-slate-400 mr-1.5">{l.item_number_snap}</span>{l.name_snap} <span className="text-slate-400">×{l.qty}</span>
                  </span>
                  <span className="text-[12.5px] font-bold mono">{gbp(l.line_total_pence)}</span>
                </div>
                {l.modifiers_snap?.length > 0 && <p className="text-[10.5px] text-slate-500 mt-0.5">{l.modifiers_snap.map((m: any) => m.name).join(" · ")}</p>}
                <p className="text-[9.5px] text-slate-400 mt-0.5">VAT {l.vat_rate_bps / 100}% · {gbp(l.vat_pence)}</p>
              </div>
            ))}
          </div>

          <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mt-5 mb-2">Timeline · order_events</p>
          <div className="rounded-xl border border-slate-100 p-3 space-y-2.5">
            {order.events.map((e: any) => (
              <div key={e.id} className="flex gap-2.5">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                <div>
                  <p className="text-[11.5px] font-semibold text-slate-700 capitalize">{e.type.replace(/_/g, " ").toLowerCase()}</p>
                  <p className="text-[10px] text-slate-400">{e.created_at.slice(11, 16)} · {e.actor_staff_id === state.staff.id ? "you" : "manager"} · {e.device_id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-slate-100 p-3.5">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-2">Totals</p>
            <div className="space-y-1 text-[11.5px]">
              <div className="flex justify-between text-slate-600"><span>{t("subtotal")}</span><span className="mono">{gbp(order.subtotal_pence)}</span></div>
              {order.discount_pence > 0 && <div className="flex justify-between text-rose-500"><span>{t("discount")}</span><span className="mono">−{gbp(order.discount_pence)}</span></div>}
              <div className="flex justify-between text-slate-500"><span>{t("vat")}</span><span className="mono">{gbp(order.vat_pence)}</span></div>
              {order.tip_pence > 0 && <div className="flex justify-between text-emerald-600"><span>{t("tip")}</span><span className="mono">{gbp(order.tip_pence)}</span></div>}
              <Divider className="my-1.5" />
              <div className="flex justify-between text-[14px] font-black text-slate-900"><span>{t("total")}</span><span className="mono">{gbp(order.total_pence)}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 p-3.5 mt-3">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-2">Payment</p>
            <p className="text-[12px] font-semibold text-slate-700">
              {order.payments[0]?.method === "CASH" ? "Cash" : `Card · ${order.payments[0]?.card_brand} ****${order.payments[0]?.card_last4}`}
            </p>
            <p className="text-[10.5px] text-slate-400">status {order.payments[0]?.status}</p>
            {order.payments[0]?.tendered_pence != null && (
              <div className="mt-2 space-y-0.5 text-[10.5px] text-slate-500">
                <div className="flex justify-between"><span>tendered</span><span className="mono">{gbp(order.payments[0].tendered_pence)}</span></div>
                <div className="flex justify-between"><span>change</span><span className="mono">{gbp(order.payments[0].change_pence ?? 0)}</span></div>
              </div>
            )}
          </div>

          {order.discounts?.length > 0 && (
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 mt-3">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-rose-400 mb-1">Discount · approved</p>
              <p className="text-[11.5px] font-semibold text-rose-600">{order.discounts[0].type === "PERCENT" ? `${order.discounts[0].value}%` : gbp(order.discounts[0].value)} · {order.discounts[0].reason_code}</p>
              <p className="text-[10px] text-rose-400 mt-0.5">approved by manager · audit logged</p>
            </div>
          )}

          {order.refunds?.length > 0 && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3.5 mt-3">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-amber-500 mb-1">Refunds</p>
              {order.refunds.map((r: any) => (
                <p key={r.id} className="text-[11.5px] font-semibold text-amber-700">{gbp(r.amount_pence)} · {r.reason_code}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      <ManagerPin open={pinOpen} onClose={() => setPinOpen(false)} onSuccess={doVoid} note={`void #${order.order_number}`} />
      <ConfirmModal open={confirmVoid} onClose={() => setConfirmVoid(false)} title={`${t("voidTitle")} #${order.order_number}`}
        body="This reverses the payment, writes an audit entry and requires a manager PIN." confirmLabel={t("continue")} danger
        onConfirm={() => setPinOpen(true)} />
      <RefundModal open={refundOpen} onClose={() => setRefundOpen(false)} order={order} />
    </>
  );
}

function RefundModal({ open, onClose, order }: any) {
  const { state, t, updateOrder, manager } = useApp();
  const [full, setFull] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  const amount = full ? order.total_pence : order.items.filter((l: any) => picked.includes(l.id)).reduce((s: number, l: any) => s + l.line_total_pence, 0);

  const doRefund = () => {
    const now = new Date().toISOString();
    updateOrder({
      ...order, status: full ? "REFUNDED" : "PARTIAL_REFUND", version: order.version + 1,
      refunds: [...order.refunds, { id: "rf_" + uid(), order_id: order.id, payment_id: order.payments[0].id, amount_pence: amount, method: order.payments[0].method, reason_code: reason, requested_by_staff_id: state.staff.id, approved_by_staff_id: manager.id, created_at: now }],
      events: [...order.events, { id: "ev_" + uid(), order_id: order.id, type: "REFUNDED", payload: { amount_pence: amount, reason }, actor_staff_id: state.staff.id, device_id: "dev_1", created_at: now }],
    } as any);
    addToast({ title: t("refunded"), description: `${gbp(amount)} · ${reason}`, color: "success" });
    onClose();
  };

  return (
    <>
      <Modal isOpen={open} onOpenChange={onClose} size="md" placement="center" backdrop="blur">
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader className="text-[15px]">{t("refundTitle")} · #{order.order_number}</ModalHeader>
              <ModalBody className="space-y-3">
                <div className="flex gap-2">
                  <Button size="sm" radius="full" className="flex-1" variant={full ? "solid" : "flat"} color={full ? "primary" : "default"} onPress={() => setFull(true)}>{t("fullRefund")}</Button>
                  <Button size="sm" radius="full" className="flex-1" variant={!full ? "solid" : "flat"} color={!full ? "primary" : "default"} onPress={() => setFull(false)}>Per item</Button>
                </div>
                {!full && (
                  <div className="space-y-1">
                    {order.items.map((l: any) => (
                      <Checkbox key={l.id} size="sm" isSelected={picked.includes(l.id)}
                        onValueChange={(v) => setPicked(v ? [...picked, l.id] : picked.filter((x) => x !== l.id))}>
                        <span className="text-[11.5px]">{l.item_number_snap} {l.name_snap} ×{l.qty} · {gbp(l.line_total_pence)}</span>
                      </Checkbox>
                    ))}
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">{t("reason")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Wrong order", "Cold food", "Customer cancelled", "Goodwill"].map((r) => (
                      <Button key={r} size="sm" radius="full" variant={reason === r ? "solid" : "bordered"} color={reason === r ? "primary" : "default"} onPress={() => setReason(r)}>{r}</Button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 flex items-center justify-between">
                  <span className="text-[11.5px] font-semibold text-rose-700">Refund amount</span>
                  <span className="text-[15px] font-black mono text-rose-700">{gbp(amount)}</span>
                </div>
                <p className="text-[10.5px] text-slate-400">
                  {order.payments[0]?.method === "CASH" ? "Cash refund opens the drawer and logs a cash movement." : "Card refund is reversed through Stripe to the original card."}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="light" onPress={close}>{t("cancel")}</Button>
                <Button size="sm" color="danger" isDisabled={amount === 0 || !reason} onPress={() => setPinOpen(true)}>{t("refundTitle")} · {gbp(amount)}</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <ManagerPin open={pinOpen} onClose={() => setPinOpen(false)} onSuccess={() => { doRefund(); onClose(); }} note="refund approval" />
    </>
  );
}
