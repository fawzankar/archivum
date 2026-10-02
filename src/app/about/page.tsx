import Link from 'next/link';
import PageHead from '@/components/PageHead';
import Art from '@/components/Art';

export default function AboutPage() {
  return <main className="ab">
    <PageHead title="Your study material, all in one place." art="notes" tone="sun">
      ARCHIVUM is built by students, for SJS students. It’s where notes, past papers, MCQs and other study material live so nobody has to hunt for them.
    </PageHead>

    <section className="ab-story">
      <div className="ab-story-heading">
        <span className="ab-kicker">ABOUT ARCHIVUM</span>
        <h2>Good material shouldn’t be hard to find.</h2>
      </div>
      <p>We started with a simple problem: useful study material keeps getting lost in old chats, random folders and phones nobody uses anymore. ARCHIVUM gives it one proper home, so you can find it, read it and save it.</p>
      <p>Right now, the <span className="quest-word">Quest</span> Club looks after it, keeping things tidy and useful for everyone who relies on it.</p>
    </section>

    <section className="ab-story ab-our-story">
      <div className="ab-story-heading">
        <span className="ab-kicker">OUR STORY</span>
        <h2>It started with exam stress.</h2>
      </div>
      <p>When our founder, Fawzan Kar, was preparing for exams, he needed past papers and MCQs to practise with. But they were scattered everywhere, and finding the right one often took longer than actually solving it.</p>
      <p>He also noticed that good material got passed around casually and then vanished before the next batch could use it. ARCHIVUM grew out of that: less time hunting, more time studying.</p>
    </section>

    <section className="ab-split">
      <div className="ab-block ab-peri">
        <h2>ARCHIVUM × <span className="quest-word">QUEST</span></h2>
        <p>ARCHIVUM is part of the <span className="quest-word">Quest</span> family, and <span className="quest-word">Quest</span> Club members keep it running.</p>
        <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="hm-pill quest-visit">Visit <span className="quest-word">QUEST</span></a>
        <Art name="SST" className="ab-art" />
      </div>
      <div className="ab-block ab-blush">
        <h2>Want ARCHIVUM for your school?</h2>
        <p>Just message Fawzan Kar and ask. He’s happy to share the code, free of charge.</p>
        <a href="https://linktr.ee/fawzankar" target="_blank" rel="noopener noreferrer" className="hm-pill">Message Fawzan</a>
        <Art name="Chemistry" className="ab-art" />
      </div>
    </section>

    <nav className="ab-links" aria-label="Next">
      <Link href="/contributors" className="ab-link">Meet the contributors</Link>
    </nav>
  </main>;
}
