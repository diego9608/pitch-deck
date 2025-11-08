"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvitePage() {
  const r = useRouter();
  const [key, setKey] = useState("");
  const [nda, setNda] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, consent: { ndaAccepted: nda } })
    });
    if (res.ok) r.push("/deck/intro");
    else setErr("Wrong key or NDA not accepted.");
  }

  return (
    <main className="min-h-dvh relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="absolute inset-0 backdrop-blur-xl" />
      <div className="relative z-10 flex items-center justify-center min-h-dvh p-6">
        <div className="w-[420px] rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <h1 className="text-xl font-semibold text-white mb-4">Enter access key</h1>
          <input
            value={key}
            onChange={(e)=>setKey(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-md bg-black/50 border border-white/10 text-white px-3 py-2 outline-none"
          />
          <label className="flex items-center gap-2 text-sm text-white/80 mt-4">
            <input type="checkbox" className="accent-sky-400" checked={nda} onChange={e=>setNda(e.target.checked)}/>
            I accept the NDA
          </label>
          {err && <p className="text-red-400 text-sm mt-2">{err}</p>}
          <button onClick={submit} className="mt-4 w-full rounded-md bg-sky-500/90 hover:bg-sky-500 text-white py-2 font-medium">
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
