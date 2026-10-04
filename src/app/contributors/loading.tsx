export default function Loading() {
  const box = { background: 'var(--surface)', borderColor: 'var(--border)' } as const;
  return (
    <div className="cbx animate-pulse" aria-busy="true">
      <div className="h-44 rounded-[1.5rem] border" style={box} />
      <div className="mt-5 rounded-2xl border overflow-hidden" style={box}>
        {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-[62px] border-b last:border-b-0" style={{ borderColor: 'var(--border-light)' }} />)}
      </div>
    </div>
  );
}
