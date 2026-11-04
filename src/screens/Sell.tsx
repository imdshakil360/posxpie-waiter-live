import React, { useMemo, useState, useEffect, useRef } from "react";
import { Button, Chip } from "@heroui/react";
import { addToast } from "@heroui/react";
import { useApp } from "../store";
import { ModifierSheet, SearchSheet, ItemActions, TextSheet } from "../components/modals";
import { OrderPanel } from "../components/OrderPanel";
import { gbp } from "../lib/money";

const CATS = [
  { id: "c1", en: "Starters", bn: "স্টার্টার" },
  { id: "c2", en: "Curries", bn: "কারি" },
  { id: "c3", en: "Biryani & Rice", bn: "বিরিয়ানি" },
  { id: "c4", en: "Grills", bn: "গ্রিল" },
  { id: "c5", en: "Breads & Sides", bn: "রুটি" },
  { id: "c6", en: "Drinks & Desserts", bn: "পানীয়" },
];

export default function SellWorkspace() {
  const { state, t, lang, addLine, toggle86 } = useApp();
  const [cat, setCat] = useState("c1");
  const [mode, setMode] = useState<"grid" | "keypad">("grid");
  const [typed, setTyped] = useState("");
  const [typedQty, setTypedQty] = useState(1);
  const [modItem, setModItem] = useState<any>(null);
  const [actItem, setActItem] = useState<any>(null);
  const [search, setSearch] = useState(false);
  const [noteFor, setNoteFor] = useState<any>(null);
  const searchFocus = useRef<() => void>(null);

  const items = state.menu.filter((m: any) => m.category_id === cat);
  const preview = state.menu.find((m: any) => String(m.item_number) === typed);

  const add = (item: any, qtyN = 1, mods: any[] = []) => {
    addLine({
      uid: Math.random().toString(36).slice(2, 9),
      menu_item_id: item.id, item_number_snap: item.item_number,
      name_snap: lang === "bn" ? item.name_bn : item.name_en,
      qty: qtyN, unit_price_pence: item.price_pence,
      modifiers_snap: mods, tax_profile_id: item.tax_profile_id,
    });
    addToast({ title: `${item.item_number} · ${lang === "bn" ? item.name_bn : item.name_en}`, description: t("addedToBasket"), color: "success", timeout: 1200 });
  };

  const onTile = (item: any) => {
    if (!item.available) return;
    if (item.modifier_groups?.length) setModItem(item);
    else add(item);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as any).tagName)) {
        e.preventDefault(); setSearch(true);
      }
      if (mode !== "keypad") return;
      if (/^[0-9]$/.test(e.key)) setTyped((v) => (v + e.key).slice(0, 3));
      if (e.key === "Backspace") setTyped((v) => v.slice(0, -1));
      if (e.key === "Enter" && preview) {
        e.preventDefault();
        if (preview.modifier_groups?.length) setModItem(preview); else add(preview, typedQty);
        setTyped(""); setTypedQty(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, typed, preview, typedQty]);

  return (
    <div className="flex-1 min-w-0 flex gap-4 p-4">
      {/* category rail */}
      <div className="w-[186px] shrink-0 bg-white rounded-2xl border border-slate-200/80 p-2 flex flex-col">
        <p className="px-2 pt-1.5 pb-2 text-[9.5px] font-bold uppercase tracking-widest text-slate-400">Menu</p>
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5">
          {CATS.map((c) => {
            const count = state.menu.filter((m: any) => m.category_id === c.id).length;
            const on = cat === c.id;
            return (
              <button key={c.id} onClick={() => setCat(c.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition ${
                  on ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200" : "text-slate-600 hover:bg-slate-50"}`}>
                <span className="text-[12px] font-semibold truncate">{lang === "bn" ? c.bn : c.en}</span>
                <span className={`text-[10px] font-bold ${on ? "text-indigo-200" : "text-slate-300"}`}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 rounded-xl bg-slate-50 p-2">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">VAT</p>
          <p className="text-[10.5px] text-slate-500 leading-snug mt-0.5">Cold drinks 0% on takeaway, food 20%</p>
        </div>
      </div>

      {/* centre */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex bg-white rounded-xl border border-slate-200/80 p-0.5">
            {(["grid", "keypad"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-[10px] text-[11.5px] font-semibold transition ${mode === m ? "bg-slate-900 text-white" : "text-slate-500"}`}>
                {m === "grid" ? "Grid" : `${t("keypad")} · numbers`}
              </button>
            ))}
          </div>
          <Button size="sm" variant="flat" radius="full" className="h-8 text-[11.5px] font-semibold" onPress={() => setSearch(true)} startContent={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>}>
            {t("search")}
          </Button>
          <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-400">
            <span className="font-semibold">{items.filter((i: any) => !i.available).length}</span> out of stock
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
          {mode === "grid" ? (
            <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(158px, 1fr))" }}>
              {items.map((item: any) => (
                <button key={item.id} onClick={() => onTile(item)} onContextMenu={(e) => { e.preventDefault(); setActItem(item); }}
                  className={`group relative text-left rounded-2xl border p-3 h-[104px] flex flex-col justify-between transition ${
                    item.available ? "bg-white border-slate-200/80 hover:border-indigo-300 hover:shadow-sm active:scale-[0.98]" : "bg-slate-50 border-slate-200 opacity-80"}`}>
                  <span className="absolute top-2 right-2.5 text-[9.5px] font-bold text-slate-300 group-hover:text-indigo-400">{item.item_number}</span>
                  <span className={`text-[12px] font-semibold leading-snug line-clamp-2 pr-5 ${item.available ? "text-slate-800" : "text-slate-400 line-through"}`}>
                    {lang === "bn" ? item.name_bn : item.name_en}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className={`text-[12.5px] font-bold mono ${item.available ? "text-indigo-600" : "text-slate-400"}`}>{gbp(item.price_pence)}</span>
                    {item.modifier_groups?.length > 0 && <span className="text-[9px] text-slate-400">options</span>}
                  </div>
                  {!item.available && <Chip size="sm" color="danger" variant="flat" className="absolute bottom-2 right-2 h-5 text-[9px]">86</Chip>}
                </button>
              ))}
            </div>
          ) : (
            <div className="max-w-[520px] space-y-3">
              <div className="rounded-2xl bg-white border border-slate-200/80 p-4">
                <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400">Item number</p>
                <div className="text-5xl font-black mono text-slate-900 h-14 mt-1">{typed || "—"}</div>
                {preview ? (
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-2.5">
                    <div>
                      <p className="text-[12.5px] font-bold text-indigo-900">{lang === "bn" ? preview.name_bn : preview.name_en}</p>
                      <p className="text-[10px] text-indigo-400">{gbp(preview.price_pence)} · {preview.tax_profile_id === "COLD_DRINK" ? "0% on takeaway" : "VAT 20%"}</p>
                    </div>
                    <Chip size="sm" color="primary" variant="flat">#{preview.item_number}</Chip>
                  </div>
                ) : typed ? (
                  <p className="mt-2 text-[12px] font-semibold text-rose-500">No item #{typed}</p>
                ) : (
                  <p className="mt-2 text-[11.5px] text-slate-400">Type a number, set quantity, press ↵ — UK takeaway menus are numbered</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white border border-slate-200/80 px-3 py-2">
                <span className="text-[11.5px] font-semibold text-slate-500">{t("qty")}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" isIconOnly radius="full" variant="flat" onPress={() => setTypedQty(Math.max(1, typedQty - 1))}>−</Button>
                  <span className="w-8 text-center font-bold mono">{typedQty}</span>
                  <Button size="sm" isIconOnly radius="full" variant="flat" onPress={() => setTypedQty(typedQty + 1)}>+</Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((k) => (
                  <Button key={k} onPress={() => {
                    if (k === "C") { setTyped(""); setTypedQty(1); return; }
                    if (k === "⌫") return setTyped((v) => v.slice(0, -1));
                    setTyped((v) => (v + k).slice(0, 3));
                  }} variant={k === "C" || k === "⌫" ? "flat" : "bordered"}
                    className={`h-11 text-[15px] font-semibold rounded-xl bg-white ${k === "C" || k === "⌫" ? "text-slate-500" : ""}`}>{k}</Button>
                ))}
              </div>

              <Button color="primary" radius="full" className="w-full h-11 font-bold text-[13px]" isDisabled={!preview}
                onPress={() => {
                  if (!preview) return;
                  if (preview.modifier_groups?.length) setModItem(preview); else add(preview, typedQty);
                  setTyped(""); setTypedQty(1);
                }}>
                ↵ {t("add")}{preview ? ` · ${gbp(preview.price_pence * typedQty)}` : ""}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* order panel */}
      <OrderPanel />

      <ModifierSheet open={!!modItem} item={modItem} onClose={() => setModItem(null)}
        onAdd={({ item, modifiers, qty }: any) => { add(item, qty, modifiers); setModItem(null); }} />
      <SearchSheet open={search} onClose={() => setSearch(false)} onPick={(m: any) => onTile(m)} />
      <ItemActions open={!!actItem} item={actItem} onClose={() => setActItem(null)}
        on86={(m: any) => { toggle86(m.id); addToast({ title: m.available ? "Marked 86" : "Item restored", color: m.available ? "danger" : "success", timeout: 1300 }); }}
        onNote={(m: any) => setNoteFor(m)} />
      <TextSheet open={!!noteFor} title={t("itemNote")} label="Note for kitchen" value="" onClose={() => setNoteFor(null)}
        onSave={() => addToast({ title: "Note saved", description: "Applied to the next added item", color: "success", timeout: 1300 })} />
    </div>
  );
}
