/**
 * ARCHIVUM study space — everything here lives in this browser only.
 * Nothing is sent to a server, which keeps the privacy policy honest.
 */

const STUDY_KEY = 'archivum_study_v1';
const SEARCH_KEY = 'archivum_recent_searches';
export const STUDY_EVENT = 'archivum:study-updated';

export interface StudyDay { ids: number[]; focusMin: number }
export interface ExamTarget { label: string; date: string }
export interface StudyData {
  days: Record<string, StudyDay>;
  goal: number;
  exam: ExamTarget | null;
}

const EMPTY: StudyData = { days: {}, goal: 3, exam: null };

export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sanitise(raw: unknown): StudyData {
  if (!raw || typeof raw !== 'object') return { ...EMPTY, days: {} };
  const r = raw as Partial<StudyData>;
  const days: Record<string, StudyDay> = {};
  if (r.days && typeof r.days === 'object') {
    for (const [k, v] of Object.entries(r.days)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !v || typeof v !== 'object') continue;
      const ids = Array.isArray((v as StudyDay).ids) ? (v as StudyDay).ids.filter(Number.isInteger) : [];
      const focusMin = Number.isFinite((v as StudyDay).focusMin) ? Math.max(0, Math.round((v as StudyDay).focusMin)) : 0;
      days[k] = { ids, focusMin };
    }
  }
  const goal = Number.isInteger(r.goal) && (r.goal as number) >= 1 && (r.goal as number) <= 10 ? (r.goal as number) : 3;
  const exam = r.exam && typeof r.exam.label === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.exam.date)
    ? { label: r.exam.label.slice(0, 40), date: r.exam.date }
    : null;
  return { days, goal, exam };
}

export function loadStudy(): StudyData {
  if (typeof window === 'undefined') return { ...EMPTY, days: {} };
  try {
    const raw = localStorage.getItem(STUDY_KEY);
    return sanitise(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...EMPTY, days: {} };
  }
}

function saveStudy(data: StudyData) {
  try {
    // Keep roughly four months of history — plenty for streaks, small on disk.
    const keys = Object.keys(data.days).sort();
    for (const k of keys.slice(0, Math.max(0, keys.length - 120))) delete data.days[k];
    localStorage.setItem(STUDY_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(STUDY_EVENT));
  } catch {}
}

/** Call when a student opens a note or paper. Each resource counts once per day. */
export function recordOpen(resourceId: number) {
  if (typeof window === 'undefined') return;
  const data = loadStudy();
  const key = dayKey();
  const day = data.days[key] || { ids: [], focusMin: 0 };
  if (day.ids.includes(resourceId)) return;
  day.ids.push(resourceId);
  data.days[key] = day;
  saveStudy(data);
}

export function recordFocus(minutes: number) {
  if (typeof window === 'undefined' || !Number.isFinite(minutes) || minutes <= 0) return;
  const data = loadStudy();
  const key = dayKey();
  const day = data.days[key] || { ids: [], focusMin: 0 };
  day.focusMin += Math.round(minutes);
  data.days[key] = day;
  saveStudy(data);
}

export function setGoal(goal: number) {
  const data = loadStudy();
  data.goal = Math.min(10, Math.max(1, Math.round(goal)));
  saveStudy(data);
}

export function setExam(exam: ExamTarget | null) {
  const data = loadStudy();
  data.exam = exam ? { label: exam.label.trim().slice(0, 40) || 'Exam', date: exam.date } : null;
  saveStudy(data);
}

const active = (d?: StudyDay) => Boolean(d && (d.ids.length > 0 || d.focusMin > 0));

export function currentStreak(data: StudyData): number {
  const cursor = new Date();
  // A streak is still alive if today is empty but yesterday was studied.
  if (!active(data.days[dayKey(cursor)])) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (active(data.days[dayKey(cursor)])) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function longestStreak(data: StudyData): number {
  const keys = Object.keys(data.days).filter(k => active(data.days[k])).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of keys) {
    const [y, m, d] = k.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    if (prev) {
      const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000);
      run = diff === 1 ? run + 1 : 1;
    } else run = 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}

export function lastSevenDays(data: StudyData) {
  const out: { key: string; label: string; active: boolean; today: boolean }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = dayKey(d);
    out.push({
      key,
      label: d.toLocaleDateString('en-IN', { weekday: 'narrow' }),
      active: active(data.days[key]),
      today: i === 0,
    });
  }
  return out;
}

export function todayStats(data: StudyData) {
  const day = data.days[dayKey()];
  return { opened: day?.ids.length ?? 0, focusMin: day?.focusMin ?? 0 };
}

export function totalFocusMinutes(data: StudyData): number {
  return Object.values(data.days).reduce((sum, d) => sum + d.focusMin, 0);
}

export function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}

/* ---------- recent searches ---------- */

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(SEARCH_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string').slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string) {
  const q = query.trim().slice(0, 60);
  if (!q || typeof window === 'undefined') return;
  try {
    const next = [q, ...getRecentSearches().filter(s => s.toLowerCase() !== q.toLowerCase())].slice(0, 6);
    localStorage.setItem(SEARCH_KEY, JSON.stringify(next));
  } catch {}
}

export function clearRecentSearches() {
  try { localStorage.removeItem(SEARCH_KEY); } catch {}
}

/* ---------- time-aware greeting ---------- */

export function greetingForNow(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return 'Burning the midnight oil';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Late-night revision';
}

/* ---------- daily tip ---------- */

export const DAILY_TIPS: string[] = [
  'Past papers beat re-reading. Try one under a timer before you open the notes again.',
  'Stuck on a chapter? Explain it out loud to an empty chair. The gaps show up fast.',
  'Study in 25-minute bursts, then take five. Your brain keeps working in the break.',
  'Write down the three things you got wrong today. That is tomorrow’s revision list.',
  'Do the hardest subject first, while your head is still fresh.',
  'Highlight less. If everything is yellow, nothing stands out.',
  'Before you sleep, skim today’s notes for two minutes. It sticks better than you’d expect.',
  'Solve a numerical without peeking at the solution for five full minutes before you check.',
  'Keep your phone in another room. Even a face-down phone pulls at your attention.',
  'Draw the diagram from memory, then compare. That’s where the marks are.',
  'Make a one-page formula sheet for each chapter. Rewriting it is half the revision.',
  'Mix subjects in a session. Switching topics keeps you sharper than one long grind.',
  'Read the question twice before you write a word. Most lost marks are misreads.',
  'Sleep is revision. An all-nighter before an exam usually costs more than it gives.',
  'Attempt the paper in the order you’re most confident. Early wins settle the nerves.',
  'If a topic feels boring, switch the format: try a paper, a video or a friend’s notes.',
  'Revisit a chapter after one day, one week and one month. That rhythm is what makes it stay.',
  'Keep water nearby. A slightly thirsty brain is a slower brain.',
  'Finish with the answers you were unsure about, not the ones you already know.',
  'Tidy your desk for two minutes before you start. It makes starting easier.',
  'Don’t compare your pace with anyone else’s. Compare with your own last week.',
  'For long answers, jot three keywords first. They keep you from rambling.',
  'Treat a mistake in practice as a free lesson. The real exam won’t give you one.',
  'Pair every new fact with something you already know. Connections are what you actually remember.',
  'Take a short walk when you’re stuck. Answers often show up on the way back.',
  'Set a tiny goal for today, like one chapter or one paper. Small and finished beats big and abandoned.',
  'Check the marking scheme in old papers. It tells you exactly what examiners look for.',
  'Say the formula and its units out loud. You’ll never forget a unit again.',
  'Rest days count. Plan one before you burn out, not after.',
  'You don’t need to feel ready to start. Open one note and read the first page.',
];

export function tipOfTheDay(date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}
