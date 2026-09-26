'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquareQuote, Star, Send } from 'lucide-react';

type Review = { id:number; name:string; rating:number; review:string; created_at:string };

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/reviews').then((r) => r.ok ? r.json() : { reviews: [] }).then((data) => setReviews(data.reviews || [])).catch(() => {});
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true); setStatus('');
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, review, rating }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not submit review');
      setName(''); setReview(''); setRating(5);
      setStatus('Thanks — your review is waiting for moderation.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not submit review.');
    } finally { setLoading(false); }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color:'var(--accent)' }}>STUDENT FEEDBACK</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl" style={{ color:'var(--ink)' }}>Real reviews, from real users.</h2>
          <p className="text-xs mt-1 max-w-xl" style={{ color:'var(--ink-muted)' }}>Reviews shown here are submitted through SJS CONNECT and approved before publication.</p>
        </div>
        <MessageSquareQuote className="hidden sm:block w-7 h-7" style={{ color:'var(--accent)' }} />
      </div>

      <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          {reviews.length ? reviews.map((item) => (
            <article key={item.id} className="rounded-2xl border p-5" style={{ backgroundColor:'var(--surface)', borderColor:'var(--border)' }}>
              <div className="flex gap-1 mb-3">{[1,2,3,4,5].map((star) => <Star key={star} className="w-3.5 h-3.5" style={{ color: star <= item.rating ? 'var(--accent)' : 'var(--border)', fill: star <= item.rating ? 'var(--accent)' : 'transparent' }} />)}</div>
              <p className="text-sm leading-relaxed" style={{ color:'var(--ink)' }}>“{item.review}”</p>
              <p className="mt-4 text-[11px] font-bold" style={{ color:'var(--ink-muted)' }}>{item.name}</p>
            </article>
          )) : (
            <div className="sm:col-span-2 rounded-2xl border border-dashed p-8 text-center" style={{ borderColor:'var(--border)', color:'var(--ink-muted)' }}>
              <p className="text-sm font-semibold" style={{ color:'var(--ink)' }}>No public reviews yet.</p>
              <p className="text-xs mt-1">Be the first student to leave honest feedback.</p>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor:'var(--surface-raised)', borderColor:'var(--border)' }}>
          <div><h3 className="font-display font-bold text-lg" style={{ color:'var(--ink)' }}>Share your experience</h3><p className="text-[11px]" style={{ color:'var(--ink-muted)' }}>Honest feedback only. We review every submission.</p></div>
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" maxLength={80} className="w-full rounded-xl border px-3 py-2.5 text-xs outline-none bg-transparent" style={{ borderColor:'var(--border)', color:'var(--ink)' }} />
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((star) => <button type="button" key={star} onClick={()=>setRating(star)} aria-label={`${star} stars`} className="p-1"><Star className="w-5 h-5" style={{ color: star <= rating ? 'var(--accent)' : 'var(--border)', fill: star <= rating ? 'var(--accent)' : 'transparent' }} /></button>)}
          </div>
          <textarea value={review} onChange={(e)=>setReview(e.target.value)} rows={4} maxLength={800} placeholder="What did you find useful? What should improve?" className="w-full rounded-xl border px-3 py-2.5 text-xs outline-none bg-transparent resize-none" style={{ borderColor:'var(--border)', color:'var(--ink)' }} />
          <button disabled={loading} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold disabled:opacity-50" style={{ backgroundColor:'var(--ink)', color:'var(--surface)' }}>
            <Send className="w-3.5 h-3.5" />{loading ? 'Sending…' : 'Submit review'}
          </button>
          {status && <p className="text-[11px]" style={{ color:'var(--accent)' }}>{status}</p>}
        </form>
      </div>
    </section>
  );
}
