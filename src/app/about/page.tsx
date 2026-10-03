import Link from 'next/link';
import PageHead from '@/components/PageHead';
import Art from '@/components/Art';

export default function AboutPage() {
  return <main className="ab">
    <PageHead title="A Home For The Academic Archive." art="notes" tone="sun">
      ARCHIVUM is a student built academic archive for Josephites to find and share notes, previous-year papers, MCQs and other useful study material.
    </PageHead>

    <section className="ab-story">
      <div className="ab-story-heading">
        <span className="ab-kicker">ABOUT ARCHIVUM</span>
        <h2>It was made to make useful study material easier to find.</h2>
      </div>
      <p>ARCHIVUM exists to solve a really simple problem which is that important academic material should never disappear. The aim is to give students one organised place where they can discover, read and save resources for their classes.</p>
      <p>ARCHIVUM is currently managed by the members of <span className="quest-word">Quest</span> who help keep the archive useful for the students who rely on it.</p>
    </section>

    <section className="ab-story ab-our-story">
      <div className="ab-story-heading">
        <span className="ab-kicker">OUR STORY</span>
        <h2>The Story Behind Archivum</h2>
      </div>
      <p>Yeah, so if I had to explain it very simply, I would say it all started in 2026 when I was studying for my exams and I asked my seniors for previous-year question papers and all that, like notes and study material, which would help me prepare for the Class 11th Golden Tests. They are pretty stressful, and obviously, you want your results to be good too. Those question papers really helped me, especially in understanding the teacher's pattern and the kind of questions they usually ask and stuff. My seniors helped me a lot with that, especially Abheet Di and Kannan Di, and it was really great of them to actually send me whatever material they had. But the thing was, a lot of papers were still missing, mainly because these things were never really preserved properly. There isn't really a proper system or tradition in our school where previous-year question papers, notes, study material and all that are kept somewhere so that students coming after you can actually use them.</p>
      <p>Then, later in that same year, when the Class 10th Pre-Boards were approaching, a lot of people started asking me for notes, PYQs and other study material. And I realised that I didn't actually have a lot of the stuff anymore because I hadn't preserved it properly myself either. So I thought, why not I build it myself? If all these students are asking for the same kind of material, how about I start giving them a platform where they can actually find it all in one place? And that's basically where the idea of Archivum came from</p>
      <small>~Fawzan Kar</small>
    </section>

    <section className="ab-split">
      <div className="ab-block ab-peri">
        <h2>ARCHIVUM × <span className="quest-word">QUEST</span></h2>
        <p>ARCHIVUM is connected with the <span className="quest-word">Quest</span> club and is currently looked after by <span className="quest-word">Quest</span> Club members.</p>
        <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="hm-pill quest-visit">Visit <span className="quest-word">QUEST</span></a>
        <Art name="SST" className="ab-art" />
      </div>
      <div className="ab-block ab-blush">
        <h2>Want ARCHIVUM for your school?</h2>
        <p>Message Fawzan and ask him for the code. He’s happy to share it for free.</p>
        <a href="https://linktr.ee/fawzankar" target="_blank" rel="noopener noreferrer" className="hm-pill">Message Fawzan</a>
        <Art name="Chemistry" className="ab-art" />
      </div>
    </section>

    <nav className="ab-links" aria-label="Next">
      <Link href="/contributors" className="ab-link">Meet contributors</Link>
    </nav>
  </main>;
}
