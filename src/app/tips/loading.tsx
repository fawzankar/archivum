export default function Loading() {
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse" aria-busy="true"><div className="h-48 rounded-[1.5rem] border" style={{background:'var(--surface)',borderColor:'var(--border)'}} /><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><div key={i} className="h-52 rounded-xl border" style={{background:'var(--surface)',borderColor:'var(--border)'}} />)}</div></div>;
}
