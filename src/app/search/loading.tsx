export default function Loading() {
  return (
    <div className="library-loading-screen" role="status" aria-live="polite" aria-busy="true">
      <div className="library-loading-card">
        <div className="library-loading-spinner" aria-hidden="true" />
        <strong>Searching…</strong>
        <span>Just a moment</span>
      </div>
    </div>
  );
}
