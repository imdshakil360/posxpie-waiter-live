import React, { useState, useEffect } from "react";
import {
  Button, Chip, Divider, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader,
  Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Radio, RadioGroup, Textarea,
} from "@heroui/react";
import { useApp } from "../store";
import { STAFF } from "../data/seed";
import { gbp, rateFor } from "../lib/money";
import { TAX_RULES } from "../data/seed";
import { Keypad, Money } from "./ui";

/* ───────────── Manager PIN ───────────── */
export function ManagerPin({ open, onClose, onSuccess, note }: any) {
  const { t } = useApp();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => { if (open) { setPin(""); setErr(""); } }, [open]);

  const submit = (value: string) => {
    const mgr = STAFF.find((s) => s.role === "MANAGER" || s.role === "OWNER");
    if (value === mgr!.pin_hash) { onSuccess?.(mgr); onClose(); }
    else { setErr(t("wrongPin")); setPin(""); }
  };
  const push = (k: string) => {
    if (k === "C") return setPin("");
    if (k === "⌫") return setPin(pin.slice(0, -1));
    const next = (pin + k).slice(0, 4);
    setPin(next);
    if (next.length === 4) setTimeout(() => submit(next), 120);
  };

  return (
    <Modal isOpen={open} onOpenChange={onClose} placement="center" size="sm" backdrop="blur" hideCloseButton>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 pb-0">
              <span className="text-base">Manager PIN</span>
              <span className="text-[11px] font-normal text-slate-500">{note}</span>
            </ModalHeader>
            <ModalBody className="pb-2">
              <div className="flex justify-center gap-3 py-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold ${pin.length > i ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white"}`}>
                    {pin.length > i ? "•" : ""}
                  </div>
                ))}
              </div>
              {err && <p className="text-center text-[11px] text-rose-500 font-semibold">{err}</p>}
              <Keypad onKey={push} />
              <p className="text-center text-[10px] text-slate-400">Demo manager PIN · 1111</p>
            </ModalBody>
            <ModalFooter className="pt-0">
              <Button size="sm" variant="light" className="w-full" onPress={onClose}>{t("cancel")}</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

/* ───────────── Modifiers ───────────── */
export function ModifierSheet({ open, onClose, item, onAdd }: any) {
  const { state, t } = useApp();
  const [sel, setSel] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!open || !item) return;
    const init: Record<string, string[]> = {};
    item.modifier_groups.forEach((g: any) => {
      if (g.min_select > 0) init[g.id] = [g.modifiers[0].id];
      else init[g.id] = [];
    });
    setSel(init); setQty(1);
  }, [open, item]);

  if (!item) return null;
  const chosen = item.modifier_groups.flatMap((g: any) =>
    (sel[g.id] ?? []).map((id: string) => {
      const m = g.modifiers.find((x: any) => x.id === id);
      return { group: g.name_en, name: state.staff?.language === "bn" ? m.name_bn : m.name_en, delta_pence: m.price_delta_pence };
    })
  );
  const unit = item.price_pence + chosen.reduce((s: number, m: any) => s + m.delta_pence, 0);
  const valid = item.modifier_groups.every((g: any) => (sel[g.id]?.length ?? 0) >= g.min_select && (sel[g.id]?.length ?? 0) <= g.max_select);

  const toggle = (g: any, id: string) => {
    setSel((prev) => {
      const cur = prev[g.id] ?? [];
      if (cur.includes(id)) return { ...prev, [g.id]: cur.filter((x) => x !== id) };
      const next = g.max_select === 1 ? [id] : [...cur, id].slice(-g.max_select);
      return { ...prev, [g.id]: next };
    });
  };

  return (
    <Drawer isOpen={open} onOpenChange={onClose} placement="bottom" size="2xl" backdrop="blur" hideCloseButton>
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader className="flex-col items-start gap-0.5 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-600">#{item.item_number}</span>
                <span className="text-base font-bold">{state.staff?.language === "bn" ? item.name_bn : item.name_en}</span>
              </div>
              <span className="text-[11px] text-slate-500">{gbp(item.price_pence)} · {item.tax_profile_id === "COLD_DRINK" ? "cold drink" : "food"}</span>
            </DrawerHeader>
            <DrawerBody className="space-y-4 pb-2">
              {item.modifier_groups.map((g: any) => (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{g.name_en}</p>
                    <span className={`text-[10px] font-semibold ${g.required ? "text-rose-500" : "text-slate-400"}`}>
                      {g.required ? "required" : `up to ${g.max_select}`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.modifiers.map((m: any) => {
                      const on = (sel[g.id] ?? []).includes(m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => toggle(g, m.id)}
                          className={`px-3 py-2 rounded-xl border text-[12px] font-semibold transition ${
                            on ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          {state.staff?.language === "bn" ? m.name_bn : m.name_en}
                          {m.price_delta_pence > 0 && <span className={on ? " text-indigo-100" : " text-slate-400"}> +{gbp(m.price_delta_pence)}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-xl bg-slate-100 p-2">
                <span className="text-[12px] font-semibold text-slate-600">{t("qty")}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" isIconOnly radius="full" variant="flat" onPress={() => setQty(Math.max(1, qty - 1))}>−</Button>
                  <span className="w-7 text-center font-bold mono">{qty}</span>
                  <Button size="sm" isIconOnly radius="full" variant="flat" onPress={() => setQty(qty + 1)}>+</Button>
                </div>
              </div>
            </DrawerBody>
            <DrawerFooter className="pt-0">
              <Button
                color="primary" radius="full" className="w-full h-12 font-bold" isDisabled={!valid}
                onPress={() => onAdd({ item, modifiers: chosen, qty })}
              >
                {t("add")} · {gbp(unit * qty)}
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

/* ───────────── Text sheet (note / order note / open price) ───────────── */
export function TextSheet({ open, onClose, title, label, value, onSave, numeric }: any) {
  const { t } = useApp();
  const [v, setV] = useState(value ?? "");
  useEffect(() => { if (open) setV(value ?? ""); }, [open, value]);
  return (
    <Modal isOpen={open} onOpenChange={onClose} placement="center" size="sm" backdrop="blur">
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="text-base">{title}</ModalHeader>
            <ModalBody>
              {numeric ? (
                <NumberInput label={label} value={Number(v) / 100} onValueChange={(n) => setV(String(Math.round(n * 100)))} minValue={0} startContent="£" size="sm" />
              ) : (
                <Textarea label={label} value={v} onValueChange={setV} minRows={2} size="sm" autoFocus />
              )}
            </ModalBody>
            <ModalFooter>
              <Button size="sm" variant="light" onPress={close}>{t("cancel")}</Button>
              <Button size="sm" color="primary" onPress={() => { onSave(v); close(); }}>{t("save")}</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

/* ───────────── Search ───────────── */
export function SearchSheet({ open, onClose, onPick }: any) {
  const { state, t, lang } = useApp();
  const [q, setQ] = useState("");
  useEffect(() => { if (open) setQ(""); }, [open]);
  const list = state.menu.filter((m: any) =>
    q === "" ? false : (m.name_en + m.name_bn + m.item_number).toLowerCase().includes(q.toLowerCase())
  ).slice(0, 20);
  return (
    <Drawer isOpen={open} onOpenChange={onClose} placement="bottom" size="2xl" backdrop="blur">
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader className="text-base">{t("search")}</DrawerHeader>
            <DrawerBody className="pb-6">
              <Input autoFocus size="sm" variant="bordered" placeholder={t("searchPlaceholder")} value={q} onValueChange={setQ} startContent={<span className="text-slate-400 text-xs">#</span>} />
              <div className="mt-2 divide-y divide-slate-100">
                {list.map((m: any) => (
                  <button key={m.id} className="w-full flex items-center justify-between py-2.5 text-left" onClick={() => { onPick(m); onClose(); }}>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-800">{m.item_number} · {lang === "bn" ? m.name_bn : m.name_en}</div>
                      <div className="text-[11px] text-slate-400">{m.available ? gbp(m.price_pence) : "86 · out of stock"}</div>
                    </div>
                    {!m.available && <Chip size="sm" color="danger" variant="flat">86</Chip>}
                  </button>
                ))}
                {q && list.length === 0 && <p className="py-6 text-center text-xs text-slate-400">{t("noResults")}</p>}
              </div>
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

/* ───────────── Discount ───────────── */
export function DiscountSheet({ open, onClose, requireManager }: any) {
  const { state, t, presets, applyDiscount, clearDiscount, totals } = useApp();
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [presetId, setPresetId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [customType, setCustomType] = useState<"PERCENT" | "AMOUNT">("PERCENT");
  const [customValue, setCustomValue] = useState("10");
  const [pinOpen, setPinOpen] = useState(false);
  const [approvedBy, setApprovedBy] = useState<string | null>(null);

  useEffect(() => { if (open) { setMode("preset"); setPresetId(null); setReason(""); setApprovedBy(null); } }, [open]);

  const preset = presets.find((p: any) => p.id === presetId);
  const needsReason = mode === "preset" ? !!preset?.reason_required : true;
  const canApply = (mode === "preset" ? !!preset : Number(customValue) > 0) && (!needsReason || reason.trim().length > 0);

  const apply = () => {
    if (mode === "preset" && preset) {
      if (preset.requires_manager && !approvedBy) return setPinOpen(true);
      applyDiscount(preset.id, preset.type, preset.value, reason || "—", approvedBy);
      onClose();
    } else {
      if (!approvedBy) return setPinOpen(true);
      applyDiscount(null, customType, Number(customValue), reason || "—", approvedBy);
      onClose();
    }
  };

  return (
    <>
      <Drawer isOpen={open} onOpenChange={onClose} placement="bottom" size="2xl" backdrop="blur">
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="text-base">{t("discountTitle")}</DrawerHeader>
              <DrawerBody className="space-y-3 pb-4">
                <div className="flex gap-2">
                  <Button size="sm" radius="full" className="flex-1" variant={mode === "preset" ? "solid" : "flat"} color={mode === "preset" ? "primary" : "default"} onPress={() => setMode("preset")}>Presets</Button>
                  <Button size="sm" radius="full" className="flex-1" variant={mode === "custom" ? "solid" : "flat"} color={mode === "custom" ? "primary" : "default"} onPress={() => setMode("custom")}>{t("custom")}</Button>
                </div>

                {mode === "preset" ? (
                  <div className="space-y-1.5">
                    {presets.map((p: any) => (
                      <button key={p.id} onClick={() => setPresetId(p.id)}
                        className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-left ${presetId === p.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}`}>
                        <div>
                          <div className="text-[13px] font-semibold text-slate-800">{p.name}</div>
                          <div className="text-[11px] text-slate-400">{p.type === "PERCENT" ? `${p.value}%` : gbp(p.value)}{p.requires_manager ? " · manager approval" : ""}</div>
                        </div>
                        {presetId === p.id && <Chip size="sm" color="primary" variant="flat">✓</Chip>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" radius="full" className="flex-1" variant={customType === "PERCENT" ? "solid" : "flat"} color={customType === "PERCENT" ? "primary" : "default"} onPress={() => setCustomType("PERCENT")}>%</Button>
                    <Button size="sm" radius="full" className="flex-1" variant={customType === "AMOUNT" ? "solid" : "flat"} color={customType === "AMOUNT" ? "primary" : "default"} onPress={() => setCustomType("AMOUNT")}>£</Button>
                    <Input size="sm" className="flex-[2]" variant="bordered" value={customValue} onValueChange={setCustomValue} type="number" />
                  </div>
                )}

                {needsReason && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">{t("reason")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Staff food", "Goodwill", "Manager override", "Promo"].map((r) => (
                        <Button key={r} size="sm" radius="full" variant={reason === r ? "solid" : "bordered"} color={reason === r ? "primary" : "default"} onPress={() => setReason(r)}>{r}</Button>
                      ))}
                    </div>
                  </div>
                )}

                {approvedBy && <Chip size="sm" color="success" variant="flat">approved · manager</Chip>}
                {totals.discount > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-100 px-3 py-2">
                    <span className="text-[12px] font-semibold text-rose-600">Current discount −{gbp(totals.discount)}</span>
                    <Button size="sm" variant="light" color="danger" onPress={() => { clearDiscount(); onClose(); }}>{t("remove")}</Button>
                  </div>
                )}
              </DrawerBody>
              <DrawerFooter className="pt-0 gap-2">
                <Button variant="light" radius="full" className="flex-1" onPress={onClose}>{t("cancel")}</Button>
                <Button color="primary" radius="full" className="flex-[2] h-11 font-bold" isDisabled={!canApply} onPress={apply}>{t("apply")}</Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
      <ManagerPin open={pinOpen} onClose={() => setPinOpen(false)} onSuccess={(m: any) => setApprovedBy(m.id)} note={t("required")} />
    </>
  );
}

/* ───────────── Tips ───────────── */
export function TipsSheet({ open, onClose }: any) {
  const { t, setTip, state } = useApp();
  const [v, setV] = useState(String(state.tipPence / 100 || ""));
  useEffect(() => { if (open) setV(String(state.tipPence / 100 || "")); }, [open, state.tipPence]);
  return (
    <Drawer isOpen={open} onOpenChange={onClose} placement="bottom" size="lg" backdrop="blur">
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader className="text-base">{t("addTip")}</DrawerHeader>
            <DrawerBody className="space-y-3 pb-4">
              <div className="flex gap-2">
                {[1, 2, 5, 10].map((n) => (
                  <Button key={n} size="sm" radius="full" variant={v === String(n) ? "solid" : "bordered"} color={v === String(n) ? "primary" : "default"} className="flex-1" onPress={() => setV(String(n))}>£{n}</Button>
                ))}
              </div>
              <NumberInput label={t("tip")} value={Number(v)} onValueChange={(n) => setV(String(n))} minValue={0} startContent="£" size="sm" />
              <p className="text-[11px] text-slate-400">Tips are attributed to {state.staff?.name} for the Tips Act report.</p>
            </DrawerBody>
            <DrawerFooter className="pt-0">
              <Button variant="light" radius="full" className="flex-1" onPress={onClose}>{t("cancel")}</Button>
              <Button color="primary" radius="full" className="flex-1 h-11 font-bold" onPress={() => { setTip(Math.round(Number(v) * 100)); onClose(); }}>{t("save")}</Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

/* ───────────── Item actions (long press) ───────────── */
export function ItemActions({ open, onClose, item, on86, onNote }: any) {
  const { t, lang } = useApp();
  if (!item) return null;
  return (
    <Drawer isOpen={open} onOpenChange={onClose} placement="bottom" size="lg" backdrop="blur">
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader className="flex-col items-start gap-0.5">
              <span className="text-base font-bold">{item.item_number} · {lang === "bn" ? item.name_bn : item.name_en}</span>
              <span className="text-[11px] text-slate-500">{gbp(item.price_pence)}</span>
            </DrawerHeader>
            <DrawerBody className="pb-4 space-y-2">
              <Button variant="flat" className="w-full justify-start" onPress={() => { onNote(item); onClose(); }}>{t("itemNote")}</Button>
              <Button variant={item.available ? "flat" : "solid"} color={item.available ? "danger" : "success"} className="w-full justify-start" onPress={() => { on86(item); onClose(); }}>
                {item.available ? t("outOfStock") : t("restore")}
              </Button>
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

/* ───────────── Void / confirm ───────────── */
export function ConfirmModal({ open, onClose, onConfirm, title, body, confirmLabel, danger }: any) {
  const { t } = useApp();
  return (
    <Modal isOpen={open} onOpenChange={onClose} placement="center" size="sm" backdrop="blur">
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="text-base">{title}</ModalHeader>
            <ModalBody className="text-[13px] text-slate-600">{body}</ModalBody>
            <ModalFooter>
              <Button size="sm" variant="light" onPress={close}>{t("cancel")}</Button>
              <Button size="sm" color={danger ? "danger" : "primary"} onPress={() => { onConfirm(); close(); }}>{confirmLabel ?? t("confirm")}</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
