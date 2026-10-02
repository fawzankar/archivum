import { NextResponse } from 'next/server';
import { getRealStats, getResources, type Resource } from '@/lib/resources';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function clean(value: unknown, max = 240) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function linkFor(r: Resource) { return `/resource/${r.slug}`; }

function resourceCards(items: Resource[]) {
  return items.slice(0, 6).map((r) => ({
    id: r.id, title: r.title, classLevel: r.class_level, subject: r.subject,
    type: r.resource_type, paperType: r.paper_type, year: r.year, chapter: r.chapter,
    downloads: r.downloads, rating: r.average_rating, ratingCount: r.rating_count, href: linkFor(r),
  }));
}

function inferFilters(q: string, studentClass?: number | null) {
  const text = q.toLowerCase();
  const classMatch = text.match(/\b(?:class|grade)\s*(9|10|11|12)\b/) || text.match(/\b(9|10|11|12)(?:th|st|nd|rd)?\s*(?:class|grade)\b/);
  const subjectMap: Record<string, string> = {
    physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology', maths: 'Maths', mathematics: 'Maths',
    english: 'English', hindi: 'Hindi', urdu: 'Urdu', science: 'Science', 'social science': 'Social Science',
    sst: 'Social Science', history: 'History', geography: 'Geography', economics: 'Economics',
  };
  let subject: string | undefined;
  for (const [key, value] of Object.entries(subjectMap)) if (text.includes(key)) { subject = value; break; }
  let resourceType: string | undefined;
  if (/previous|pyq|paper|question paper|board paper|pre[- ]?board|exam paper|sample paper/.test(text)) resourceType = 'Previous Year Paper';
  else if (/note|notes|revision|summary|chapter material|study material/.test(text)) resourceType = 'Notes';
  const yearMatch = text.match(/\b(20\d{2})\b/);
  const classLevel = classMatch ? Number(classMatch[1]) : (studentClass && /\bmy class\b|\bfor me\b|\bmy grade\b/.test(text) ? studentClass : undefined);
  return { classLevel, subject, resourceType, year: yearMatch ? Number(yearMatch[1]) : undefined };
}

function fallbackAnswer(q: string, filters: ReturnType<typeof inferFilters>, results: Resource[], stats: Awaited<ReturnType<typeof getRealStats>>) {
  const text = q.toLowerCase();
  if (/\b(hello|hi|hey|yo|namaste)\b/.test(text)) return 'Hey! I’m your ARCHIVUM study assistant. I can find notes and papers, explain study topics, help you choose what to revise, show you resources for your class, and guide you around the site. What are you working on?';
  if (/who are you|what can you do|help me/.test(text)) return `I can do quite a bit inside ARCHIVUM:\n\n• Find notes, previous papers and study material\n• Filter resources by class, subject and year\n• Help you discover relevant resources\n• Explain common study topics in a clear way\n• Give revision and exam practice suggestions\n• Tell you about ARCHIVUM features and navigation\n\nThere are currently ${stats.totalApproved} approved resources in the archive.`;
  if (/how many|how much|resources|library size|archive size/.test(text) && !results.length) return `The archive currently has ${stats.totalApproved} approved resources, with ${stats.totalDownloads} recorded downloads and ${stats.totalViews} views.`;
  if (/saved|bookmark/.test(text)) return 'Your saved resources are available from the Saved section. Bookmark a resource when you want it available again without searching for it.';
  if (/install|pwa|home screen/.test(text)) return 'ARCHIVUM can be installed as a Progressive Web App. Open the About page and follow the install instructions for your browser.';
  if (/search|find/.test(text) && !results.length) return 'Tell me what you want to find, for example “Class 11 Physics notes” or “Class 12 Chemistry papers from 2024”, and I’ll narrow the archive down for you.';
  if (results.length) return `I found ${results.length} resource${results.length === 1 ? '' : 's'}${filters.classLevel ? ` for Class ${filters.classLevel}` : ''}${filters.subject ? ` in ${filters.subject}` : ''}. I’ve put the closest matches below so you can open them directly.`;
  return 'I couldn’t find an exact match in the current archive. Try adding your class, subject, chapter or year, such as “Class 12 Physics ray optics notes” or “Class 10 Science papers 2024”.';
}

async function askModel(message: string, history: { role: 'user'|'assistant'; content: string }[], context: unknown, studentClass?: number | null) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  const system = `You are ARCHIVUM Guide, a warm, concise academic assistant inside the ARCHIVUM school resource platform. Be genuinely helpful, natural and encouraging without sounding robotic. You can help with study questions, revision strategy, finding resources, and navigating ARCHIVUM. Never invent an ARCHIVUM resource or claim a file exists unless it is present in the supplied context. If asked to find resources, use the supplied resource context. If asked an academic question, explain it clearly at a school appropriate level and show steps when useful. If the user asks for a current archive fact, use the supplied stats. User class: ${studentClass ?? 'unknown'}. Return plain text with short paragraphs and bullets when useful. Do not use markdown tables.`;
  const payload = {
    model: MODEL, temperature: 0.35, max_tokens: 650,
    messages: [
      { role: 'system', content: system },
      ...history.slice(-8),
      { role: 'user', content: `ARCHIVUM DATA:\n${JSON.stringify(context)}\n\nUSER:\n${message}` },
    ],
  };
  const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(payload), cache: 'no-store' });
  if (!response.ok) return null;
  const data = await response.json();
  return clean(data?.choices?.[0]?.message?.content, 5000) || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = clean(body?.message, 700);
    if (!message) return NextResponse.json({ error: 'Ask me something first.' }, { status: 400 });
    const studentClass = Number(body?.studentClass) || null;
    const history = Array.isArray(body?.history) ? body.history.filter((m: any) => m?.role && m?.content).map((m: any) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: clean(m.content, 1200) })) : [];
    const filters = inferFilters(message, studentClass);
    const result = await getResources({ ...filters, status: 'approved', sortBy: 'relevance', page: 1, limit: 8, withCount: true });
    const stats = await getRealStats();
    const tips = await query<{ title: string; body: string; subject: string; class_level: number }>(`SELECT title,body,subject,class_level FROM tips WHERE status='approved' ${filters.classLevel ? 'AND class_level=?' : ''} ORDER BY created_at DESC LIMIT 5`, filters.classLevel ? [filters.classLevel] : []);
    const cards = resourceCards(result.items);
    const context = { filters, totalMatches: result.totalCount, resources: cards, tips, stats };
    const ai = await askModel(message, history, context, studentClass).catch(() => null);
    const answer = ai || fallbackAnswer(message, filters, result.items, stats);
    const params = new URLSearchParams();
    if (filters.classLevel) params.set('class', String(filters.classLevel));
    if (filters.subject) params.set('subject', filters.subject);
    if (filters.resourceType) params.set('type', filters.resourceType);
    const actions = [
      { label: 'Search the archive', href: params.toString() ? `/search?${params}` : '/search' },
      { label: 'Notes', href: '/notes' },
      { label: 'Previous papers', href: '/previous-papers' },
    ];
    return NextResponse.json({ answer, resources: cards, actions, filters, meta: { ai: Boolean(ai), totalMatches: result.totalCount } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'The guide is temporarily unavailable.' }, { status: 500 });
  }
}
