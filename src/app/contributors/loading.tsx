export default function Loading() {
  return <div className="max-w-6xl mx-auto px-3 sm:px-6 py-8 space-y-5 animate-pulse" aria-busy="true"><div className="h-44 rounded-[1.5rem] border" style={{background:'var(--surface)',borderColor:'var(--border)'}} />{Array.from({length:5}).map((_,i)=><div key={i} className="h-16 rounded-2xl border" style={{background:'var(--surface)',borderColor:'var(--border)'}} />)}</div>;
}
