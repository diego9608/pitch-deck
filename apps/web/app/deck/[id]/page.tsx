export default function Deck({ params }:{ params:{ id:string }}) {
  return (
    <main className="min-h-dvh grid place-items-center text-white bg-slate-950">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Deck: {params.id}</h1>
        <p className="text-white/70 mt-2">Placeholder viewer. Reveal.js or real slides next.</p>
        <a className="underline mt-6 inline-block" href="/hub">Go to Hub</a>
      </div>
    </main>
  );
}
