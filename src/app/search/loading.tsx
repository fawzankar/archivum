export default function Loading() {
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse" aria-busy="true"><div className="h-36 rounded-[1.5rem] border" style={{background:'var(--surface)',borderColor:'var(--border)'}} /><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><div key={i} className="h-48 rounded-2xl border" style={{background:'var(--surface)',borderColor:'var(--border)'}} />)}</div></div>;
}
