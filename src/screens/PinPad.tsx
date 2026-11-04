import React, { useEffect, useState } from "react";
import { useApp } from "../store";
import { DEVICE, LOCATION, STAFF } from "../data/seed";

export default function PinPad() {
  const { t, login, state, pinFail, unlock } = useApp();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [left, setLeft] = useState(0);
  const locked = !!(state.lockedUntil && state.lockedUntil > Date.now());

  useEffect(() => {
    if (!state.lockedUntil) return;
    const i = setInterval(() => {
      const s = Math.max(0, Math.ceil((state.lockedUntil! - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) { unlock(); setErr(""); clearInterval(i); }
    }, 400);
    return () => clearInterval(i);
  }, [state.lockedUntil]);

  const submit = (v: string) => {
    const staff = STAFF.find((s) => s.pin_hash === v && s.active);
    if (staff) { login(staff); return; }
    pinFail(); setErr(t("wrongPin")); setPin("");
  };

  const push = (k: string) => {
    if (locked) return;
    if (k === "C") return setPin("");
    if (k === "⌫") return setPin(pin.slice(0, -1));
    const next = (pin + k).slice(0, 4);
    setPin(next);
    if (next.length === 4) setTimeout(() => submit(next), 120);
  };

  return (
    <div className="h-dvh w-full flex bg-[#F4F5F7]">
      {/* brand side */}
      <div className="hidden lg:flex w-[46%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center font-black">DT</div>
          <div>
            <p className="text-[15px] font-bold">Demo Tandoori</p>
            <p className="text-[11px] text-indigo-200">Point of sale · {DEVICE.name}</p>
          </div>
        </div>
        <div>
          <h1 className="text-[34px] font-black leading-tight tracking-tight">
            Take the order.<br />Take the money.<br /><span className="text-indigo-300">In 20 seconds.</span>
          </h1>
          <p className="text-[13px] text-indigo-200 mt-4 max-w-[400px] leading-relaxed">
            {LOCATION.address_1}, {LOCATION.city} {LOCATION.postcode} · VAT {LOCATION.vat_number}
          </p>
          <div className="flex gap-2 mt-6">
            {["Works offline", "VAT correct", "Tips per staff"].map((f) => (
              <span key={f} className="text-[10.5px] font-semibold bg-white/10 border border-white/15 rounded-full px-3 py-1.5">{f}</span>
            ))}
          </div>
        </div>
        <p className="text-[10.5px] text-indigo-300/70">Phase 1 MVP · Cashier / Waiter · UI language follows the staff member</p>
      </div>

      {/* pin side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[360px]">
          <div className="text-center mb-6">
            <h2 className="text-[20px] font-bold text-slate-900">{t("signIn")}</h2>
            <p className="text-[11.5px] text-slate-400 mt-1">4-digit PIN · switches staff, language and attribution</p>
          </div>

          <div className="flex justify-center gap-3 mb-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition ${
                pin.length > i ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white"}`}>
                {pin.length > i ? "•" : ""}
              </div>
            ))}
          </div>
          <div className="h-6 text-center">
            {err && !locked && <span className="text-[11px] font-semibold text-rose-500">{err} · attempt {state.pinAttempts} of 5</span>}
            {locked && <span className="text-[11px] font-semibold text-amber-600">{t("locked")} · {t("wait")} {left}{t("seconds")}</span>}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-1">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((k) => (
              <button key={k} onClick={() => push(k)}
                className={`h-12 rounded-xl text-[16px] font-semibold border transition active:scale-[0.97] ${
                  k === "C" || k === "⌫" ? "bg-slate-100 border-slate-200 text-slate-500" : "bg-white border-slate-200 text-slate-800 hover:border-indigo-300"}`}>
                {k}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-white border border-slate-200 p-3">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Demo staff</p>
            <div className="space-y-1">
              {STAFF.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">{s.name} <span className="text-slate-400 font-normal">· {s.role.toLowerCase()}</span></span>
                  <span className="mono font-bold text-indigo-600">{s.pin_hash}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
