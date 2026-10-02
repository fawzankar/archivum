'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarClock, Check, Flame, Lightbulb, Minus, Pencil, Plus, Target, Timer, X } from 'lucide-react';
import type { Resource } from '@/lib/resources';
import { getRecentlyViewed } from '@/lib/savedStorage';
import {
  STUDY_EVENT, currentStreak, daysUntil, lastSevenDays, loadStudy, longestStreak,
  setExam, setGoal, tipOfTheDay, todayStats, totalFocusMinutes, type StudyData,
} from '@/lib/studyStats';

function formatMinutes(total: number) {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function streakLine(streak: number, studiedToday: boolean) {
  if (streak === 0) return 'Open any note today and your streak begins.';
  if (!studiedToday) return `You’re on ${streak} ${streak === 1 ? 'day' : 'days'}. Study a little today to keep it going.`;
  if (streak === 1) return 'Day one is done. Come back tomorrow.';
  if (streak < 7) return 'Nicely done. Keep showing up.';
  return 'That’s a proper habit now. Don’t break it.';
}

function examLine(days: number) {
  if (days < 0) return 'This one’s behind you. Set the next one.';
  if (days === 0) return 'It’s today. You’ve got this.';
  if (days === 1) return 'Tomorrow. Light revision, early night.';
  if (days <= 7) return 'Final stretch. Papers over new topics.';
  if (days <= 30) return 'Plenty of time if you start now.';
  return 'Plenty of runway. Little and often wins.';
}

export default function StudyHub({ activeClass }: { activeClass: number }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<StudyData | null>(null);
  const [recent, setRecent] = useState<Resource[]>([]);
  const [editingExam, setEditingExam] = useState(false);
  const [examLabel, setExamLabel] = useState('');
  const [examDate, setExamDate] = useState('');
  const [tip, setTip] = useState('');

  const refresh = useCallback(() => {
    setData(loadStudy());
    setRecent(getRecentlyViewed().slice(0, 6));
  }, []);

  useEffect(() => {
    refresh();
    setTip(tipOfTheDay());
    setReady(true);
    window.addEventListener(STUDY_EVENT, refresh);
    window.addEventListener('sjs_saved_updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(STUDY_EVENT, refresh);
      window.removeEventListener('sjs_saved_updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  if (!ready || !data) {
    return <section className="sh" aria-hidden="true"><div className="sh-skeleton" /></section>;
  }

  const streak = currentStreak(data);
  const best = longestStreak(data);
  const week = lastSevenDays(data);
  const today = todayStats(data);
  const goalDone = today.opened >= data.goal;
  const pct = Math.min(100, Math.round((today.opened / data.goal) * 100));
  const ring = 2 * Math.PI * 26;
  const daysLeft = data.exam ? daysUntil(data.exam.date) : null;
  const resume = recent.filter(r => r.class_level === activeClass).concat(recent.filter(r => r.class_level !== activeClass)).slice(0, 4);
  const todayIso = new Date().toISOString().slice(0, 10);

  const openExamEditor = () => {
    setExamLabel(data.exam?.label ?? '');
    setExamDate(data.exam?.date ?? '');
    setEditingExam(true);
  };
  const saveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examDate) return;
    setExam({ label: examLabel || 'My exam', date: examDate });
    setEditingExam(false);
  };

  return (
    <section className="sh" aria-labelledby="sh-title">
      <div className="sh-head">
        <div>
          <span className="sh-kicker">Your study space</span>
          <h2 id="sh-title">Small habits, big marks.</h2>
        </div>
        {totalFocusMinutes(data) > 0 && <span className="sh-total">{formatMinutes(totalFocusMinutes(data))} focused so far</span>}
      </div>

      <div className="sh-grid">
        {/* Streak */}
        <article className="sh-card sh-streak">
          <div className="sh-card-top">
            <span className="sh-icon sh-icon-flame"><Flame aria-hidden="true" /></span>
            <span className="sh-label">Study streak</span>
          </div>
          <div className="sh-big">{streak}<small>{streak === 1 ? 'day' : 'days'}</small></div>
          <div className="sh-week" role="img" aria-label={`Last seven days: ${week.filter(w => w.active).length} active`}>
            {week.map(d => (
              <span key={d.key} className={`sh-dot${d.active ? ' on' : ''}${d.today ? ' today' : ''}`}>
                <i />{d.label}
              </span>
            ))}
          </div>
          <p className="sh-note">{streakLine(streak, today.opened > 0 || today.focusMin > 0)}{best > streak && best > 1 ? ` Your best is ${best}.` : ''}</p>
        </article>

        {/* Goal */}
        <article className="sh-card sh-goal">
          <div className="sh-card-top">
            <span className="sh-icon sh-icon-goal"><Target aria-hidden="true" /></span>
            <span className="sh-label">Today’s goal</span>
          </div>
          <div className="sh-goal-body">
            <svg className="sh-ring" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="26" className="sh-ring-bg" />
              <circle cx="32" cy="32" r="26" className="sh-ring-fg" strokeDasharray={ring} strokeDashoffset={ring - (ring * pct) / 100} />
            </svg>
            <div className="sh-goal-text">
              <strong>{goalDone ? 'Goal reached' : `${today.opened} of ${data.goal}`}</strong>
              <span>{goalDone ? 'Lovely. Anything more is a bonus.' : 'resources opened today'}</span>
            </div>
          </div>
          <div className="sh-stepper" aria-label="Daily goal">
            <button type="button" onClick={() => setGoal(data.goal - 1)} disabled={data.goal <= 1} aria-label="Lower the goal"><Minus /></button>
            <span>{data.goal} a day</span>
            <button type="button" onClick={() => setGoal(data.goal + 1)} disabled={data.goal >= 10} aria-label="Raise the goal"><Plus /></button>
          </div>
        </article>

        {/* Exam countdown */}
        <article className="sh-card sh-exam">
          <div className="sh-card-top">
            <span className="sh-icon sh-icon-exam"><CalendarClock aria-hidden="true" /></span>
            <span className="sh-label">Countdown</span>
            {data.exam && !editingExam && <button type="button" className="sh-mini" onClick={openExamEditor} aria-label="Edit exam"><Pencil /></button>}
          </div>
          {editingExam ? (
            <form className="sh-exam-form" onSubmit={saveExam}>
              <input value={examLabel} onChange={e => setExamLabel(e.target.value)} placeholder="Which exam? e.g. Pre-boards" maxLength={40} aria-label="Exam name" />
              <input type="date" value={examDate} min={todayIso} onChange={e => setExamDate(e.target.value)} required aria-label="Exam date" />
              <div className="sh-exam-actions">
                <button type="submit" className="sh-solid"><Check /> Save</button>
                <button type="button" className="sh-ghost" onClick={() => setEditingExam(false)}><X /> Cancel</button>
                {data.exam && <button type="button" className="sh-link" onClick={() => { setExam(null); setEditingExam(false); }}>Remove</button>}
              </div>
            </form>
          ) : data.exam && daysLeft !== null ? (
            <>
              <div className="sh-big">{Math.max(daysLeft, 0)}<small>{daysLeft === 1 ? 'day to go' : 'days to go'}</small></div>
              <p className="sh-exam-name">{data.exam.label}</p>
              <p className="sh-note">{examLine(daysLeft)}</p>
            </>
          ) : (
            <>
              <p className="sh-empty-title">Got an exam coming up?</p>
              <p className="sh-note">Add the date and we’ll keep the countdown on your home screen.</p>
              <button type="button" className="sh-solid" onClick={openExamEditor}><Plus /> Add an exam</button>
            </>
          )}
        </article>

        {/* Focus */}
        <Link href="/focus" className="sh-card sh-focus">
          <div className="sh-card-top">
            <span className="sh-icon sh-icon-focus"><Timer aria-hidden="true" /></span>
            <span className="sh-label">Focus timer</span>
          </div>
          <p className="sh-focus-title">Ready for a proper study session?</p>
          <p className="sh-note">{today.focusMin > 0 ? `${formatMinutes(today.focusMin)} focused today. Add another round.` : 'Twenty-five quiet minutes, then a break. That’s the whole idea.'}</p>
          <span className="sh-cta">Start a session <ArrowRight /></span>
        </Link>
      </div>

      {resume.length > 0 && (
        <div className="sh-resume">
          <div className="sh-resume-head"><h3>Pick up where you left off</h3><Link href="/saved">All saved</Link></div>
          <div className="sh-resume-row">
            {resume.map(r => (
              <Link key={r.id} href={`/resource/${r.slug || r.id}`} className="sh-resume-card">
                <span className="sh-resume-meta">Class {r.class_level} · {r.subject}</span>
                <strong>{r.title}</strong>
                <span className="sh-resume-open">Open again <ArrowRight /></span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tip && (
        <aside className="sh-tip">
          <span className="sh-icon sh-icon-tip"><Lightbulb aria-hidden="true" /></span>
          <div><span className="sh-label">Tip of the day</span><p>{tip}</p></div>
        </aside>
      )}
    </section>
  );
}
