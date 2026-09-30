import Link from 'next/link';
import PageHead from '@/components/PageHead';
import Art from '@/components/Art';

export default function AboutPage() {
  return <main className="ab">
    <PageHead title="A home for the academic archive." art="notes" tone="sun">
      ARCHIVUM is a student-built academic archive for SJS students to keep, find and share notes, previous-year papers, MCQs and other useful study material.
    </PageHead>

    <section className="ab-story">
      <div className="ab-story-heading">
        <span className="ab-kicker">ABOUT ARCHIVUM</span>
        <h2>Built to make useful study material easier to find.</h2>
      </div>
      <p>ARCHIVUM exists to solve a simple problem: important academic material should not disappear into chats, folders and old devices. The aim is to give students one organised place where they can discover, read and save resources for their classes.</p>
      <p>ARCHIVUM is currently managed by the members of the <span className="quest-word">Quest</span> Club, who help keep the archive useful for the students who rely on it.</p>
    </section>

    <section className="ab-story ab-our-story">
      <div className="ab-story-heading">
        <span className="ab-kicker">OUR STORY</span>
        <h2>It started with exam preparation.</h2>
      </div>
      <p>When our founder, Fawzan Kar, was studying for exams, he needed previous year questions, MCQs and other practice material. The problem was that these resources were not properly stored in one place, so finding the right paper or set of questions could take far longer than studying from it.</p>
      <p>He also noticed that useful material was often passed around informally and then became difficult for the next batch to recover. ARCHIVUM grew from that experience: a practical archive designed so students can spend less time hunting for resources and more time using them.</p>
    </section>

    <section className="ab-split">
      <div className="ab-block ab-peri">
        <h2>ARCHIVUM × <span className="quest-word">QUEST</span></h2>
        <p>ARCHIVUM is connected with the <span className="quest-word">Quest</span> community and is currently looked after by <span className="quest-word">Quest</span> Club members.</p>
        <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="hm-pill quest-visit">Visit <span className="quest-word">QUEST</span></a>
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
    </nav>
  </main>;
}
