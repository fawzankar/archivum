export default function Loading() {
  const box = { background: 'var(--surface)', borderColor: 'var(--border)' } as const;
  return (
    <div className="cbx animate-pulse" aria-busy="true">
      <div className="h-56 rounded-[28px] border" style={box} />
      <div className="grid gap-3 sm:grid-cols-3 mt-4">{[0, 1, 2].map((i) => <div key={i} className="h-44 rounded-3xl border" style={box} />)}</div>
      <div className="grid gap-2.5 mt-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl border" style={box} />)}</div>
    </div>
  );
}
