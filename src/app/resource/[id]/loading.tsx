export default function ResourceLoading(){
  return <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 space-y-6 animate-pulse">
    <div className="h-4 w-32 rounded-full" style={{background:'var(--surface-raised)'}}/>
    <div className="rounded-[2rem] border overflow-hidden" style={{background:'var(--surface)',borderColor:'var(--border)'}}><div className="p-7 sm:p-10" style={{background:'var(--surface-raised)'}}><div className="h-4 w-40 rounded-full" style={{background:'var(--border)'}}/><div className="h-12 w-4/5 max-w-2xl rounded-2xl mt-6" style={{background:'var(--border)'}}/></div><div className="p-6 space-y-5"><div className="h-12 w-48 rounded-xl" style={{background:'var(--surface-raised)'}}/><div className="h-24 rounded-2xl" style={{background:'var(--surface-raised)'}}/></div></div>
  </div>;
}
