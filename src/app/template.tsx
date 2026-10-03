// A template remounts on every navigation, so each page gets a soft fade-and-rise entrance (see .ax-page in motion.css).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="ax-page">{children}</div>;
}
