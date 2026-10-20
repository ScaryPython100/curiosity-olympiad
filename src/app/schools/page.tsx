"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { KuppuAvatar } from "@/components/KuppuGuide";
import { addSchool, getTeacherClass, teacherLogin, teacherLogout } from "@/app/actions/teacher";
import { ClassView, type ClassData } from "@/components/TeacherClassView";


const fill = (s: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((out, [k, v]) => out.replace(`{${k}}`, String(v)), s);

export default function TeacherPortalPage() {
  const { t } = useLanguage();
  const tt = t.teacher;
  const [phase, setPhase] = useState<"loading" | "login" | "class" | "error">("loading");
  const [errorKind, setErrorKind] = useState<"setup" | "failed">("failed");
  const [data, setData] = useState<ClassData | null>(null);

  const load = useCallback(async () => {
    const res = await getTeacherClass();
    if (res.success) {
      setData(res);
      setPhase("class");
    } else if (res.error === "signed_out") {
      setPhase("login");
    } else {
      setErrorKind(res.error);
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    // Loading the class from the server is the effect's job here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-['Montserrat']">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 min-w-0" aria-label="Curiosity Olympiad">
            <KuppuAvatar size={34} />
            <span className="font-black text-[#143867] truncate">{tt.title}</span>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSelector />
            {phase === "class" && (
              <button
                type="button"
                onClick={async () => {
                  await teacherLogout();
                  setData(null);
                  setPhase("login");
                }}
                className="min-h-[40px] px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-700"
              >
                {tt.sign_out}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 sm:py-8 pb-24">
        {phase === "loading" && <p className="text-center text-gray-500 py-20">{tt.loading}</p>}
        {phase === "error" && (
          <p className="max-w-md mx-auto text-center font-bold text-red-800 bg-red-50 border border-red-200 rounded-2xl p-5">
            {errorKind === "setup" ? tt.err_setup : tt.err_failed}
          </p>
        )}
        {phase === "login" && <LoginCard onSignedIn={load} />}
        {phase === "class" && data && <ClassView data={data} />}
      </main>
    </div>
  );
}

function LoginCard({ onSignedIn }: { onSignedIn: () => void }) {
  const { t } = useLanguage();
  const tt = t.teacher;
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <KuppuAvatar size={72} mood="happy" />
        </div>
        <h1 className="text-2xl font-black text-[#143867]">{tt.title}</h1>
        <p className="text-sm text-gray-600">{tt.subtitle}</p>
      </div>
      <form
        className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const res = await teacherLogin(code, pin);
          setBusy(false);
          if (res.success) {
            setPin("");
            onSignedIn();
          } else if (res.error === "locked") {
            setError(fill(tt.err_locked, { minutes: res.minutes ?? 15 }));
          } else {
            setError(res.error === "setup" ? tt.err_setup : tt.err_invalid);
          }
        }}
      >
        <label className="block space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-[#143867]">{tt.school_code}</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoCapitalize="characters"
            autoComplete="organization"
            required
            placeholder="AGS-KUPPAM-101"
            className="w-full min-h-[48px] px-4 rounded-xl border border-gray-300 font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-[#143867]"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-[#143867]">{tt.pin}</span>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            maxLength={20}
            className="w-full min-h-[48px] px-4 rounded-xl border border-gray-300 font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#143867]"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm font-bold text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full min-h-[52px] rounded-2xl bg-[#143867] hover:bg-[#1e4a85] disabled:opacity-60 text-white font-black shadow-[0_5px_0_0_#0b2140] active:translate-y-1 active:shadow-none transition-all"
        >
          {busy ? tt.signing_in : tt.sign_in}
        </button>
        <p className="text-xs text-gray-500 text-center">🔒 {tt.private_note}</p>
      </form>
      <AdminCard />
    </div>
  );
}

/** Agastya staff only: add a school or reset its PIN (needs the admin key). */
function AdminCard() {
  const { t } = useLanguage();
  const tt = t.teacher;
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const errors: Record<string, string> = {
    unauthorized: tt.admin_unauthorized,
    bad_code: tt.admin_bad_code,
    bad_name: tt.admin_bad_name,
    bad_pin: tt.admin_bad_pin,
    setup: tt.err_setup,
    failed: tt.err_failed,
  };

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="bg-white/70 rounded-2xl border border-dashed border-gray-300 px-4 py-3"
    >
      <summary className="cursor-pointer text-sm font-bold text-gray-600 min-h-[32px] flex items-center">{tt.admin_title}</summary>
      <form
        className="space-y-3 pt-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMessage(null);
          const res = await addSchool(key, code, name, pin);
          setBusy(false);
          if (res.success) {
            setMessage({ ok: true, text: fill(tt.admin_ok, { code: res.code, n: res.studentsAlreadyJoined }) });
          } else {
            setMessage({ ok: false, text: errors[res.error] ?? tt.err_failed });
          }
        }}
      >
        {[
          { label: tt.admin_key, value: key, set: setKey, type: "password", auto: "off" },
          { label: tt.school_code, value: code, set: (v: string) => setCode(v.toUpperCase()), type: "text", auto: "off" },
          { label: tt.school_name, value: name, set: setName, type: "text", auto: "organization" },
        ].map((f) => (
          <label key={f.label} className="block space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-600">{f.label}</span>
            <input
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              type={f.type}
              autoComplete={f.auto}
              required
              className="w-full min-h-[44px] px-3 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#143867]"
            />
          </label>
        ))}
        <label className="block space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-600">{tt.pin}</span>
          <div className="flex gap-2">
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="off"
              required
              className="flex-1 min-w-0 min-h-[44px] px-3 rounded-xl border border-gray-300 text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#143867]"
            />
            <button
              type="button"
              onClick={() => {
                // 8 random digits from the browser's secure random source
                const digits = crypto.getRandomValues(new Uint32Array(8));
                setPin(Array.from(digits, (d) => d % 10).join(""));
              }}
              className="shrink-0 min-h-[44px] px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-black text-[#143867]"
            >
              {tt.make_pin}
            </button>
          </div>
        </label>
        {message && (
          <p
            role="status"
            className={`text-sm font-bold rounded-xl px-3 py-2 border ${
              message.ok ? "text-green-800 bg-green-50 border-green-200" : "text-red-800 bg-red-50 border-red-200"
            }`}
          >
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full min-h-[44px] rounded-xl bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-60 text-white text-sm font-black"
        >
          {tt.add_school}
        </button>
      </form>
    </details>
  );
}
