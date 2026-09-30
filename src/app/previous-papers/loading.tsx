export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse" aria-busy="true">
      <div className="rounded-[1.5rem] border p-6 space-y-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="h-4 w-32 rounded-full" style={{ background: 'var(--surface-raised)' }} />
        <div className="h-9 w-2/3 rounded-xl" style={{ background: 'var(--surface-raised)' }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} />
        ))}
      </div>
    </div>
  );
}
