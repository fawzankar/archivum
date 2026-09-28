export default function NotesLoading(){
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-7 animate-pulse">
    <div className="space-y-3"><div className="h-3 w-28 rounded-full" style={{background:'var(--surface-raised)'}}/><div className="h-10 w-56 rounded-xl" style={{background:'var(--surface-raised)'}}/><div className="h-4 w-full max-w-xl rounded-full" style={{background:'var(--surface-raised)'}}/></div>
    <div className="rounded-[2rem] border p-5 sm:p-7" style={{background:'var(--surface)',borderColor:'var(--border)'}}><div className="h-7 w-48 rounded-lg" style={{background:'var(--surface-raised)'}}/><div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">{Array.from({length:6}).map((_,i)=><div key={i} className="h-24 rounded-2xl" style={{background:'var(--surface-raised)'}}/>)}</div></div>
  </div>;
}
