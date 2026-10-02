import Link from 'next/link';
import PageHead from '@/components/PageHead';
import Art from '@/components/Art';
import Credit from '@/components/Credit';
import { CREDIT } from '@/lib/credit';

export default function AboutPage() {
  return <main className="ab">
    <PageHead title="Study material, all in one place." art="notes" tone="sun">
      ARCHIVUM is a student-built archive where SJS students can find, keep and share notes, previous-year papers, MCQs and other study material.
    </PageHead>

    <section className="ab-story">
      <div className="ab-story-heading">
        <span className="ab-kicker">ABOUT</span>
        <h2>Why it exists</h2>
      </div>
      <p>Good notes and old papers keep getting lost in group chats, random folders and phones nobody uses any more. ARCHIVUM keeps them in one place, sorted by class and subject, so you can find what you need and get back to studying.</p>
    </section>

    <section className="ab-story ab-our-story">
      <div className="ab-story-heading">
        <span className="ab-kicker">OUR STORY</span>
        <h2>It started with exam prep.</h2>
      </div>
      <p>While he was preparing for his exams, our founder, {CREDIT.name}, kept looking for previous-year questions, MCQs and practice material. None of it was in one place, and finding the right paper often took longer than solving it.</p>
      <p>He also noticed that good material only travelled by word of mouth, so the next batch had no way to get it back. ARCHIVUM is his answer to that.</p>
    </section>

    <section className="ab-split">
      <div className="ab-block ab-peri">
        <h2>ARCHIVUM × <span className="quest-word">QUEST</span></h2>
        <p>ARCHIVUM is a sister organisation of <span className="quest-word">Quest</span>, and <span className="quest-word">Quest</span> Club members currently look after it.</p>
        <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="hm-pill quest-visit">Visit <span className="quest-word">QUEST</span></a>
        <Art name="SST" className="ab-art" />
      </div>
      <div className="ab-block ab-blush">
        <h2>Want this for your school?</h2>
        <p>Message {CREDIT.name} and ask for the code. It's free.</p>
        <a href={CREDIT.url} target="_blank" rel="noopener noreferrer" className="hm-pill">Message Fawzan</a>
        <Art name="Chemistry" className="ab-art" />
      </div>
    </section>

    <nav className="ab-links" aria-label="Next">
      <Link href="/contributors" className="ab-link">Meet contributors</Link>
    </nav>
    <div className="ab-credit"><Credit link /></div>
  </main>;
}
