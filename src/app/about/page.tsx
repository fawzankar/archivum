import Link from 'next/link';
import PageHead from '@/components/PageHead';
import Art from '@/components/Art';

export default function AboutPage() {
  return <main className="ab">
    <PageHead title="Built from a problem Fawzan Kar faced himself." art="notes" tone="sun">
      ARCHIVUM is a student-built place for SJS students to keep, find and share useful academic material.
    </PageHead>

    <section className="ab-story">
      <p>Fawzan Kar, who founded ARCHIVUM, knew how hard it was to find previous-year papers and quick notes in one reliable place. A single paper could take ages to track down, and useful notes were scattered everywhere.</p>
      <p>His juniors kept asking him for papers too. When he got some himself, he read through them and moved on, so they were never stored for the next batch.</p>
      <p>ARCHIVUM is the fix: a simple archive that keeps these documents safe and easy to find for fellow Josephites.</p>
    </section>

    <section className="ab-split">
      <div className="ab-block ab-peri">
        <h2>ARCHIVUM × QUEST</h2>
        <p>ARCHIVUM is a sister organisation of SJS Quest, the St. Joseph’s school quest community.</p>
        <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="hm-pill">Visit SJS Quest</a>
        <Art name="SST" className="ab-art" />
      </div>
      <div className="ab-block ab-blush">
        <h2>Want ARCHIVUM for your school?</h2>
        <p>Message Fawzan Kar and ask for the code. He’s happy to share it for free.</p>
        <a href="https://linktr.ee/fawzankar" target="_blank" rel="noopener noreferrer" className="hm-pill">Message Fawzan</a>
        <Art name="Chemistry" className="ab-art" />
      </div>
    </section>

    <nav className="ab-links" aria-label="Next">
      <Link href="/contributors" className="ab-link">Meet contributors</Link>
      <Link href="/subjects" className="ab-link ab-link-solid">Browse subjects</Link>
    </nav>
  </main>;
}
