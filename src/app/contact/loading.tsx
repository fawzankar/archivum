export default function Loading() {
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse" aria-busy="true"><div className="h-36 rounded-[1.5rem] border" style={{background:'var(--surface)',borderColor:'var(--border)'}} /><div className="h-96 rounded-[1.5rem] border" style={{background:'var(--surface)',borderColor:'var(--border)'}} /></div>;
}
