import React, { useEffect, useState } from "react";
import { AppProvider, useApp } from "./store";
import PinPad from "./screens/PinPad";
import SellWorkspace from "./screens/Sell";
import { OrdersWorkspace } from "./screens/Orders";
import { MyShift } from "./screens/MyShift";

type Nav = "sell" | "orders" | "shift";

const NAV: { key: Nav; label: string; icon: string }[] = [
  { key: "sell", label: "Sell", icon: "M3 10.5l9-7 9 7V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" },
  { key: "orders", label: "Orders", icon: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" },
  { key: "shift", label: "My shift", icon: "M12 7v5l3.5 2M20.5 12a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z" },
];

function Shell() {
  const { state, t, logout } = useApp();
  const [nav, setNav] = useState<Nav>("sell");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F1") { e.preventDefault(); setNav("sell"); }
      if (e.key === "F2") { e.preventDefault(); setNav("orders"); }
      if (e.key === "F3") { e.preventDefault(); setNav("shift"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!state.staff) return <PinPad />;

  return (
    <div className="h-dvh w-full flex flex-col bg-[#F4F5F7]">
      <Header onLogout={logout} />
      <div className="flex-1 flex min-h-0">
        <aside className="w-[84px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col items-center py-4 gap-1.5">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setNav(n.key)}
              className={`w-[64px] py-2.5 rounded-xl flex flex-col items-center gap-1 transition ${
                nav === n.key ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={n.icon} /></svg>
              <span className="text-[10px] font-semibold">{n.label}</span>
            </button>
          ))}
          <div className="mt-auto flex flex-col items-center gap-1 text-[9px] text-slate-300 font-medium">
            <span className="px-1.5 py-0.5 rounded bg-slate-100">F1</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100">F2</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100">F3</span>
          </div>
        </aside>
        <main className="flex-1 min-w-0 flex">
          {nav === "sell" && <SellWorkspace />}
          {nav === "orders" && <OrdersWorkspace />}
          {nav === "shift" && <MyShift />}
        </main>
      </div>
    </div>
  );
}

function Header({ onLogout }: { onLogout: () => void }) {
  const { state, t, setOffline, setPrinterOffline, flush } = useApp();
  return (
    <header className="h-[62px] shrink-0 bg-white border-b border-slate-200/80 px-5 flex items-center gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-[13px]">DT</div>
        <div className="leading-tight">
          <p className="text-[13px] font-bold text-slate-900">Demo Tandoori</p>
          <p className="text-[10.5px] text-slate-400 font-medium">Counter 1 · SUNMI V2 Pro · London E1</p>
        </div>
      </div>

      <div className="ml-2 hidden lg:flex items-center gap-1.5 rounded-xl bg-slate-100/80 px-3 py-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <span className="text-[11px] text-slate-400 font-medium">Press / to search menu · F9 to charge</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button onClick={() => { setOffline(!state.offline); if (state.offline) flush(); }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition ${
            state.offline ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${state.offline ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
          {state.offline ? `${t("off")} · ${state.pendingSync} ${t("pending")}` : `${t("on")} · ${t("synced")}`}
        </button>
        <button onClick={() => setPrinterOffline(!state.printerOffline)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition ${
            state.printerOffline ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" /></svg>
          {state.printerOffline ? t("printerOff") : "Printer"}
        </button>
        <div className="w-px h-7 bg-slate-200 mx-1" />
        <button onClick={onLogout} className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-slate-50">
          <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center">
            {state.staff.name.split(" ").map((n: string) => n[0]).join("")}
          </span>
          <span className="text-left leading-tight">
            <span className="block text-[11.5px] font-semibold text-slate-700">{state.staff.name.split(" ")[0]}</span>
            <span className="block text-[9.5px] text-slate-400">{state.staff.role} · {state.staff.language.toUpperCase()}</span>
          </span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
