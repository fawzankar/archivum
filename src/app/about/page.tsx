import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="archive-shell">
      <div className="page-heading">
        <span className="eyebrow">About ARCHIVUM</span>
        <h1>A school archive built from a very ordinary problem.</h1>
        <p>Finding an old paper or a quick note should not turn into a hunt through chats, folders and memory.</p>
      </div>

      <div className="page-section grid lg:grid-cols-[1.25fr_.75fr] gap-12">
        <article>
          <p className="text-lg leading-8">
            Fawzan Kar, the founder of ARCHIVUM, had trouble finding previous-year
            papers and quick notes when he needed them. Juniors also kept asking
            for papers, but many useful documents were not being preserved in a
            place where the next student could find them.
          </p>
          <p className="mt-6 text-base leading-7" style={{color:'var(--ink-muted)'}}>
            ARCHIVUM came from that experience. The idea is simple: keep useful
            academic documents organised by class and subject, make them easier
            to search, and give students a way to contribute material for others.
          </p>
          <p className="mt-6 text-base leading-7" style={{color:'var(--ink-muted)'}}>
            It is meant for fellow Josephites first — a practical archive rather
            than another place to scroll when you should be studying.
          </p>

          <div className="mt-10 pt-8 border-t" style={{borderColor:'var(--border)'}}>
            <h2 className="text-2xl font-semibold">If another school wants this</h2>
            <p className="mt-3 text-sm leading-6" style={{color:'var(--ink-muted)'}}>
              Fawzan is happy to share the code for free. If your school wants a
              similar archive, message him through the link below.
            </p>
            <a className="btn btn-primary mt-5" href="https://linktr.ee/fawzankar" target="_blank" rel="noopener noreferrer">
              Contact Fawzan
            </a>
          </div>
        </article>

        <aside className="archive-surface p-6 h-fit">
          <div className="eyebrow">How the archive is organised</div>
          <div className="space-y-5 mt-5">
            <div><h3 className="font-semibold">Class first</h3><p className="text-sm mt-1" style={{color:'var(--ink-muted)'}}>Your class profile keeps the home page and filters focused.</p></div>
            <div><h3 className="font-semibold">Subject next</h3><p className="text-sm mt-1" style={{color:'var(--ink-muted)'}}>Notes and papers are grouped around the subjects students actually study.</p></div>
            <div><h3 className="font-semibold">People matter</h3><p className="text-sm mt-1" style={{color:'var(--ink-muted)'}}>Contributors are credited so useful material has a person behind it.</p></div>
          </div>
        </aside>
      </div>

      <section className="border-t py-10" style={{borderColor:'var(--border)'}}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="eyebrow">Sister organisation</div>
            <h2 className="text-2xl font-semibold">ARCHIVUM and <span className="quest-word">QUEST</span> serve different sides of SJS.</h2>
            <p className="text-sm mt-2 max-w-2xl" style={{color:'var(--ink-muted)'}}>QUEST focuses on school stories, magazines, photography and creative work; ARCHIVUM focuses on academic material and preservation.</p>
          </div>
          <a className="btn btn-secondary shrink-0" href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer">Visit QUEST</a>
        </div>
      </section>
    </main>
  );
}
