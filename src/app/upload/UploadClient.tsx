'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/components/ToastContext';
import { MAX_UPLOAD_BYTES, sha256, validateFileSignature } from '@/lib/client-file-utils';
import { FileText, ImagePlus, Check, ArrowRight, X, ShieldCheck, BookOpen, UserRound } from 'lucide-react';
import { subjectsForClass } from '@/lib/subjects';
import { useStudentClass } from '@/components/StudentClassContext';

const CLASS_OPTIONS = [9, 10, 11, 12] as const;
const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png'];

type PhotoItem = { file: File; preview: string };
type UploadedAsset = { key: string; fileUrl: string; fileName: string; fileType: string; fileSize: number };

async function uploadAsset(file: File, onProgress?: (value: number) => void): Promise<UploadedAsset> {
  const presign = await fetch('/api/r2-upload', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
  });
  const json = await presign.json().catch(() => ({}));
  if (!presign.ok) throw new Error(json.error || 'Could not prepare the upload.');

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', json.uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed with HTTP ${xhr.status}.`));
    xhr.onerror = () => reject(new Error('The upload connection failed. Please retry.'));
    xhr.onabort = () => reject(new Error('The upload was cancelled.'));
    xhr.timeout = 15 * 60 * 1000;
    xhr.ontimeout = () => reject(new Error('The upload timed out. Please retry.'));
    xhr.send(file);
  });
  return { key: json.key, fileUrl: json.fileUrl, fileName: file.name, fileType: file.type, fileSize: file.size };
}

export default function UploadClient() {
  const { showToast } = useToast();
  const { studentClass, displayName } = useStudentClass();
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [classLevel, setClassLevel] = useState<number>(10);
  const [board, setBoard] = useState('JKBOSE');
  const [subject, setSubject] = useState('Science');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [resourceType, setResourceType] = useState('Notes');
  const [paperType, setPaperType] = useState('Board');
  const [year, setYear] = useState(new Date().getFullYear());
  const [schoolName, setSchoolName] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [success, setSuccess] = useState(false);

  const subjectOptions = useMemo(() => subjectsForClass(classLevel), [classLevel]);

  useEffect(() => { if (studentClass) setClassLevel(studentClass); }, [studentClass]);
  useEffect(() => { if (displayName && !contributorName) setContributorName(displayName); }, [displayName, contributorName]);
  useEffect(() => { if (!subjectOptions.includes(subject)) setSubject(subjectOptions[0]); }, [subjectOptions, subject]);

  const selectMainFile = (selected: File | undefined) => {
    if (!selected) return;
    if (selected.size > MAX_UPLOAD_BYTES) return showToast('The main file must be 50 MB or smaller.', 'error');
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(selected.type)) return showToast('Use a PDF, JPG or PNG for the main resource.', 'error');
    setFile(selected);
    setStatus('');
    if (!title) {
      const clean = selected.name.replace(/\.[^/.]+$/, '').replace(/[_.-]+/g, ' ');
      setTitle(clean);
    }
  };

  const addPhotos = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = [...photos];
    for (const candidate of Array.from(incoming)) {
      if (next.length >= MAX_PHOTOS) break;
      if (!PHOTO_TYPES.includes(candidate.type)) { showToast('Photos must be JPG or PNG.', 'error'); continue; }
      if (candidate.size > MAX_PHOTO_BYTES) { showToast(`${candidate.name} is over the 8 MB photo limit.`, 'error'); continue; }
      next.push({ file: candidate, preview: URL.createObjectURL(candidate) });
    }
    setPhotos(next);
  };

  const removePhoto = (index: number) => setPhotos(items => items.filter((_, i) => i !== index));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeSubject = subject.trim();
    if (!title.trim() || !activeSubject || !file || !contributorName.trim()) return showToast('Add your name, title, subject and main file before submitting.', 'error');
    if (resourceType === 'Previous Year Paper' && paperType !== 'Board' && !schoolName.trim()) return showToast('Add the school or institution for a school paper.', 'error');

    setSubmitting(true); setProgress(0); setStatus('Checking your files…');
    try {
      const mainBytes = new Uint8Array(await file.arrayBuffer());
      if (!validateFileSignature(file, mainBytes)) throw new Error('The main file contents do not match its file type.');
      const mainHash = await sha256(file);

      setStatus('Uploading the main resource…');
      const main = await uploadAsset(file, p => setProgress(Math.round(p * 0.72)));
      const photoAssets: UploadedAsset[] = [];
      for (let i = 0; i < photos.length; i++) {
        setStatus(`Uploading photo ${i + 1} of ${photos.length}…`);
        const asset = await uploadAsset(photos[i].file, p => setProgress(72 + Math.round(((i + p / 100) / Math.max(photos.length, 1)) * 20)));
        photoAssets.push(asset);
      }

      setStatus('Sending it to the moderation queue…'); setProgress(95);
      const res = await fetch('/api/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(), class_level: classLevel, board, subject: activeSubject,
          resource_type: resourceType, paper_type: resourceType === 'Previous Year Paper' ? paperType : null,
          year, school_name: schoolName.trim() || null, contributorName: contributorName.trim(),
          chapter: chapter.trim() || null, topic: topic.trim() || null, description: description.trim() || null,
          fileUrl: main.fileUrl, storageKey: main.key, fileName: main.fileName, fileType: main.fileType, fileSize: main.fileSize, fileHash: mainHash,
          photoKeys: photoAssets.map(p => p.key),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not submit your contribution.');
      setProgress(100); setSuccess(true); showToast('Contribution sent for moderation!', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Upload failed. Please retry.', 'error');
    } finally { setSubmitting(false); setStatus(''); }
  };

  const reset = () => {
    photos.forEach(p => URL.revokeObjectURL(p.preview));
    setFile(null); setPhotos([]); setTitle(''); setDescription(''); setChapter(''); setTopic(''); setSchoolName(''); setSuccess(false); setProgress(0);
  };

  if (success) return (
    <div className="community-upload-success rounded-3xl border p-8 sm:p-12 text-center" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
      <div className="mx-auto w-16 h-16 rounded-2xl grid place-items-center" style={{background:'var(--accent-light)',color:'var(--accent)'}}><Check className="w-8 h-8" /></div>
      <h2 className="font-display text-3xl mt-5">It’s in the queue.</h2>
      <p className="max-w-lg mx-auto mt-2 text-sm leading-6" style={{color:'var(--ink-muted)'}}>Thanks, {contributorName || 'contributor'}. Your material and supporting photos have been submitted for review before they appear in the community archive.</p>
      <div className="flex flex-wrap justify-center gap-3 mt-6"><button onClick={reset} className="px-5 py-3 rounded-xl text-xs font-bold" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>Upload another</button><a href="/" className="px-5 py-3 rounded-xl border text-xs font-bold" style={{borderColor:'var(--border)',color:'var(--ink)'}}>Back home</a></div>
    </div>
  );

  return (
    <form onSubmit={submit} className="community-upload-form border rounded-3xl p-5 sm:p-8 space-y-8" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
      <section className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
        <div><span className="text-[10px] uppercase tracking-[.16em] font-bold" style={{color:'var(--accent)'}}>01 · Identify it</span><h2 className="font-display text-2xl mt-1">Where does this belong?</h2><p className="text-xs leading-6 mt-2" style={{color:'var(--ink-muted)'}}>Give the archive enough context that another student can find it quickly.</p></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="field-label">Class<select value={classLevel} onChange={e=>{setClassLevel(Number(e.target.value));setSubject(subjectsForClass(Number(e.target.value))[0]);}}>{CLASS_OPTIONS.map(x=><option key={x} value={x}>Class {x}</option>)}</select></label>
          <label className="field-label">Board<input value={board} onChange={e=>setBoard(e.target.value)} /></label>
          <label className="field-label">Subject<select value={subject} onChange={e=>setSubject(e.target.value)}>{subjectOptions.map(x=><option key={x}>{x}</option>)}</select></label>
          <label className="field-label">Resource type<select value={resourceType} onChange={e=>setResourceType(e.target.value)}><option>Notes</option><option>Previous Year Paper</option><option>Study Material</option><option>Syllabus</option></select></label>
        </div>
      </section>

      <section className="grid lg:grid-cols-[1fr_1.3fr] gap-6 pt-7 border-t" style={{borderColor:'var(--border-light)'}}>
        <div><span className="text-[10px] uppercase tracking-[.16em] font-bold" style={{color:'var(--accent)'}}>02 · Describe it</span><h2 className="font-display text-2xl mt-1">Make the contribution useful.</h2></div>
        <div className="space-y-3">
          <label className="field-label">Your name<input value={contributorName} onChange={e=>setContributorName(e.target.value)} placeholder="Fawzan Kar" maxLength={80} /><small><UserRound /> This name appears with the approved contribution.</small></label>
          <label className="field-label">Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Units and Measurement | Handwritten Notes" maxLength={200} /></label>
          <div className="grid sm:grid-cols-2 gap-3"><label className="field-label">Chapter<input value={chapter} onChange={e=>setChapter(e.target.value)} placeholder="Optional" /></label><label className="field-label">Topic<input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Optional" /></label></div>
          {resourceType === 'Previous Year Paper' && <div className="grid sm:grid-cols-3 gap-3"><label className="field-label">Paper type<select value={paperType} onChange={e=>setPaperType(e.target.value)}><option>Board</option><option>Pre board</option><option>Unit Test</option><option>Annual/Final</option></select></label><label className="field-label">Year<input type="number" value={year} onChange={e=>setYear(Number(e.target.value))} /></label><label className="field-label">School<input value={schoolName} onChange={e=>setSchoolName(e.target.value)} /></label></div>}
          <label className="field-label">Description<textarea rows={4} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Tell students what is inside and how it can help them." /></label>
        </div>
      </section>

      <section className="pt-7 border-t" style={{borderColor:'var(--border-light)'}}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"><div><span className="text-[10px] uppercase tracking-[.16em] font-bold" style={{color:'var(--accent)'}}>03 · Add the material</span><h2 className="font-display text-2xl mt-1">Main resource</h2></div><span className="text-[10px]" style={{color:'var(--ink-faint)'}}>PDF / JPG / PNG · 50 MB max</span></div>
        <button type="button" onClick={()=>fileRef.current?.click()} className="upload-dropzone w-full mt-4 text-left flex flex-col sm:flex-row sm:items-center gap-4 hover:-translate-y-0.5 transition-transform">
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e=>selectMainFile(e.target.files?.[0])} />
          <span className="w-14 h-14 rounded-2xl grid place-items-center" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>{file?<Check className="w-6 h-6"/>:<FileText className="w-6 h-6"/>}</span>
          <span className="min-w-0"><strong className="block text-sm truncate">{file ? file.name : 'Choose your main resource'}</strong><small className="block mt-1" style={{color:'var(--ink-muted)'}}>{file ? `${(file.size/1048576).toFixed(2)} MB · ready to upload` : 'Drop in a PDF or image, then add optional supporting photos below.'}</small></span>
          <ArrowRight className="sm:ml-auto w-5 h-5" style={{color:'var(--accent)'}} />
        </button>
      </section>

      <section className="pt-7 border-t" style={{borderColor:'var(--border-light)'}}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"><div><span className="text-[10px] uppercase tracking-[.16em] font-bold" style={{color:'var(--accent)'}}>04 · Community proof</span><h2 className="font-display text-2xl mt-1">Add up to 6 photos.</h2><p className="text-xs mt-1" style={{color:'var(--ink-muted)'}}>Show handwriting, diagrams, a contents page or the best parts of the material.</p></div><span className="text-[10px] font-bold" style={{color:'var(--ink-faint)'}}>{photos.length}/{MAX_PHOTOS}</span></div>
        <input ref={photoRef} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={e=>{addPhotos(e.target.files);e.currentTarget.value='';}} />
        <div className="mt-4 grid sm:grid-cols-[1fr_auto] gap-4 items-start">
          <div className="upload-photo-grid">
            {photos.map((photo,i)=><div className="upload-photo-item" key={`${photo.file.name}-${i}`}><img src={photo.preview} alt={`Supporting upload ${i+1}`} /><button type="button" className="upload-photo-remove" onClick={()=>removePhoto(i)} aria-label={`Remove photo ${i+1}`}><X className="w-4 h-4"/></button></div>)}
            {photos.length < MAX_PHOTOS && <button type="button" onClick={()=>photoRef.current?.click()} className="upload-photo-item grid place-items-center text-center p-4" style={{color:'var(--accent)'}}><ImagePlus className="w-7 h-7 mx-auto"/><strong className="block mt-2 text-xs">Add photos</strong><small className="block mt-1" style={{color:'var(--ink-faint)'}}>JPG / PNG · 8 MB each</small></button>}
          </div>
        </div>
      </section>

      {submitting && <div className="rounded-2xl border p-4" style={{borderColor:'var(--border)',background:'var(--surface-raised)'}}><div className="flex justify-between text-xs font-semibold"><span>{status}</span><span>{progress}%</span></div><div className="h-2 rounded-full mt-3 overflow-hidden" style={{background:'var(--border)'}}><div className="h-full transition-all" style={{width:`${progress}%`,background:'var(--accent)'}}/></div></div>}

      <footer className="pt-5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{borderColor:'var(--border-light)'}}>
        <div className="flex flex-wrap gap-3 text-[10px] font-semibold" style={{color:'var(--ink-faint)'}}><span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" style={{color:'var(--accent)'}}/> Moderated</span><span className="inline-flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" style={{color:'var(--accent)'}}/> Student community</span></div>
        <button disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs font-bold disabled:opacity-50" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>{submitting?'Sending…':<>Submit for review <ArrowRight className="w-4 h-4"/></>}</button>
      </footer>
    </form>
  );
}
