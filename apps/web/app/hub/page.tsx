export default function Hub(){
  return (
    <main className="min-h-dvh bg-slate-950 text-white p-10">
      <h1 className="text-2xl font-semibold mb-6">Resources Hub</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li><a href="/deck/intro" className="underline">Pitch deck</a></li>
        <li><a href="/summary" className="underline">Executive summary</a></li>
      </ul>
    </main>
  );
}
