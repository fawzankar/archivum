'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ToastContext';
import { MAX_UPLOAD_BYTES, sha256, validateFileSignature } from '@/lib/client-file-utils';
import { 
  Upload, 
  FileText, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { subjectsForClass } from '@/lib/subjects';
import { useStudentClass } from '@/components/StudentClassContext';

const CLASS_OPTIONS = [9, 10, 11, 12] as const;


export default function UploadClient() {
  const { showToast } = useToast();
  const { studentClass, displayName } = useStudentClass();

  const [classLevel, setClassLevel] = useState<number>(10);
  const [board, setBoard] = useState<string>('JKBOSE');
  const [subject, setSubject] = useState<string>('Science');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [chapter, setChapter] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [resourceType, setResourceType] = useState<string>('Notes');
  const [paperType, setPaperType] = useState<string>('Board');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [schoolName, setSchoolName] = useState<string>('');
  const [contributorName, setContributorName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const subjectOptions = useMemo(() => subjectsForClass(classLevel), [classLevel]);

  useEffect(() => {
    if (studentClass) setClassLevel(studentClass);
    if (displayName && !contributorName) setContributorName(displayName);
    const params = new URLSearchParams(window.location.search);
    const requestedClass = Number(params.get('class'));
    const requestedSubject = params.get('subject') || '';
    if (CLASS_OPTIONS.includes(requestedClass as 9 | 10 | 11 | 12)) setClassLevel(requestedClass as 9 | 10 | 11 | 12);
    if (requestedSubject) setSubject(requestedSubject);
  }, [studentClass, displayName, contributorName]);

  useEffect(() => {
    if (!subjectOptions.includes(subject)) setSubject(subjectOptions[0]);
  }, [subjectOptions, subject]);

  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (selectedFile.size > MAX_UPLOAD_BYTES) {
        showToast('File size exceeds the 50 MB maximum limit', 'error');
        setFile(null);
        return;
      }

      const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowed.includes(selectedFile.type)) {
        showToast('Only PDF, JPG, JPEG, and PNG files are allowed.', 'error');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setUploadStatus(null);

      if (!title) {
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_.-]+/g, ' ');
        setTitle(`Class ${classLevel} ${subject === 'Other' ? customSubject : subject} — ${cleanName}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const activeSubject = subject === 'Other' ? customSubject.trim() : subject;
    if (!title.trim() || !activeSubject || !file || !contributorName.trim()) {
      showToast('Please fill in your name, all required fields, and select a file', 'error');
      return;
    }

    if (resourceType === 'Previous Year Paper' && paperType !== 'Board' && !schoolName.trim()) {
      showToast('School name is required for school examination papers', 'error');
      return;
    }

    setSubmitting(true);
    setDuplicateWarning(null);

    try {
      setUploadStatus('Preparing upload…');
      setUploadProgress(0);

      // Compression is intentionally disabled for now. Upload the original file unchanged.
      const preparedFile = file;
      if (preparedFile.size > MAX_UPLOAD_BYTES) {
        showToast('File size exceeds the 50 MB maximum limit.', 'error');
        return;
      }

      const bytes = new Uint8Array(await preparedFile.arrayBuffer());
      if (!validateFileSignature(preparedFile, bytes)) {
        showToast('The file contents do not match the selected file type.', 'error');
        return;
      }

      const hash = await sha256(preparedFile);
      setUploadStatus('Uploading securely…');

      const presign = await fetch('/api/r2-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: preparedFile.name,
          contentType: preparedFile.type,
          size: preparedFile.size,
        }),
      });
      const presignJson = await presign.json().catch(() => ({}));
      if (!presign.ok) throw new Error(presignJson.error || 'Could not prepare the file upload.');

      // Upload directly to the signed R2 URL. XHR gives us the real HTTP
      // status and byte progress; fetch collapses many CORS/403 failures into
      // the unhelpful generic "Failed to fetch" message.
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presignJson.uploadUrl, true);
        xhr.setRequestHeader('Content-Type', preparedFile.type);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.max(1, Math.min(99, Math.round((event.loaded / event.total) * 100))));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(100);
            resolve();
            return;
          }
          const detail = (xhr.responseText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (xhr.status === 403) {
            reject(new Error(`R2 rejected the upload with HTTP 403. This is usually a presigned-signature mismatch or R2 permission/bucket mismatch. ${detail.slice(0, 220)}`));
          } else {
            reject(new Error(`R2 upload failed with HTTP ${xhr.status}. ${detail.slice(0, 220)}`));
          }
        };
        xhr.onerror = async () => {
          // A completed PUT can still surface as XHR onerror when R2's final
          // response is blocked by CORS. Ask our same-origin server to verify
          // the object before declaring the upload failed.
          try {
            const verify = await fetch(`/api/r2-upload/verify?key=${encodeURIComponent(presignJson.key)}`);
            const verifyJson = await verify.json().catch(() => ({}));
            if (verify.ok && verifyJson.exists) {
              setUploadProgress(100);
              resolve();
              return;
            }
          } catch {}
          reject(new Error(
            'R2 did not confirm the upload. This is no longer treated as a generic CORS error. Check the R2 account/bucket credentials in Vercel and the exact R2 bucket endpoint; then retry.'
          ));
        };
        xhr.onabort = () => reject(new Error('The R2 upload was cancelled.'));
        xhr.ontimeout = () => reject(new Error('The R2 upload timed out. Please retry.'));
        xhr.timeout = 15 * 60 * 1000;
        xhr.send(preparedFile);
      });


      setUploadStatus('Saving submission details…');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          class_level: classLevel,
          board,
          subject: activeSubject,
          resource_type: resourceType,
          paper_type: resourceType === 'Previous Year Paper' ? paperType : null,
          year,
          school_name: schoolName.trim() || null,
          contributorName: contributorName.trim(),
          chapter: chapter.trim() || null,
          topic: topic.trim() || null,
          description: description.trim() || null,
          fileUrl: presignJson.fileUrl,
          storageKey: presignJson.key,
          fileName: preparedFile.name,
          fileType: preparedFile.type,
          fileSize: preparedFile.size,
          fileHash: hash,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessSubmitted(true);
        showToast('Resource submitted for moderation! 🚀');
      } else {
        showToast(json.error || 'Upload failed', 'error');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Network error during upload', 'error');
    } finally {
      setSubmitting(false);
      setUploadStatus(null);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setChapter('');
    setTopic('');
    setSchoolName('');
    setContributorName('');
    setSuccessSubmitted(false);
    setDuplicateWarning(null);
    setUploadStatus(null);
    setUploadProgress(0);
  };

  if (successSubmitted) {
    return (
      <div
        className="community-upload-success border p-8 sm:p-12 text-center space-y-5 max-w-2xl mx-auto"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-emerald-50 text-emerald-700">
          <Check className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-zinc-900 dark:text-zinc-100">
            Thank you for contributing!
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Your document has entered the editorial moderation queue. Once verified by our academic reviewers, it will be published to the public library.
          </p>
        </div>

        {duplicateWarning && (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs flex items-center gap-2 text-left">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{duplicateWarning}</span>
          </div>
        )}

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={resetForm}
            className="px-6 py-2.5 rounded-full font-medium text-xs text-white bg-zinc-900 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            Upload Another Document
          </button>
          <Link
            href="/notes"
            className="px-6 py-2.5 rounded-full font-medium text-xs border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
          >
            Return to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="community-upload-form border p-5 sm:p-8 space-y-7"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* 1. Academic Target Selection */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          1. Academic Classification
        </h3>

        {/* Class level pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[9, 10, 11, 12].map((lvl) => {
            const active = classLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => { setClassLevel(lvl); setSubject(subjectsForClass(lvl)[0]); }}
                className="py-3 px-4 rounded-2xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer"
                style={{
                  borderColor: active ? 'var(--ink)' : 'var(--border)',
                  backgroundColor: active ? 'var(--surface-raised)' : 'transparent',
                  color: 'var(--ink)',
                }}
              >
                <span>Class {lvl}</span>
                {active && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--sage)' }} />}
              </button>
            );
          })}
        </div>

        {/* Resource Category & Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ink-muted)' }}>
              Resource Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full text-xs py-2.5 px-3.5 rounded-xl border bg-transparent font-medium outline-none cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <option value="Notes">Notes (Chapter Summary / Revision)</option>
              <option value="Previous Year Paper">Previous Year Paper / Exam</option>
              <option value="Study Material">Study Material / Formulas</option>
              <option value="Syllabus">Official Syllabus Document</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ink-muted)' }}>
              Subject <span className="text-rose-500">*</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs py-2.5 px-3.5 rounded-xl border bg-transparent font-medium outline-none cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              {subjectOptions.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Previous Paper specific inputs */}
        {resourceType === 'Previous Year Paper' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--surface-raised)' }}>
            <div>
              <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>
                Paper Category
              </label>
              <select
                value={paperType}
                onChange={(e) => setPaperType(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border bg-transparent outline-none cursor-pointer"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              >
                <option value="Board">Board Paper (JKBOSE)</option>
                <option value="Pre-board">School Pre-board</option>
                <option value="Unit Test">Unit Test / Terminal</option>
                <option value="Annual/Final">Annual / Final School Exam</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>
                Exam Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="w-full text-xs py-2 px-3 rounded-lg border bg-transparent outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>
                School / Institution Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g. Tyndale Biscoe, DPS Srinagar..."
                className="w-full text-xs py-2 px-3 rounded-lg border bg-transparent outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Document Information */}
      <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          2. Document Details
        </h3>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ink-muted)' }}>
            Contributor Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
            placeholder="Your name — shown on your contribution"
            maxLength={80}
            className="w-full text-xs py-2.5 px-3.5 rounded-xl border bg-transparent font-medium outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
          />
          <p className="mt-1.5 text-[10px]" style={{ color: 'var(--ink-faint)' }}>Use your real name or the name you want students to see on your contributor profile.</p>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ink-muted)' }}>
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chemical Reactions and Equations — Hand-written Notes"
            className="w-full text-xs py-2.5 px-3.5 rounded-xl border bg-transparent font-medium outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ink-muted)' }}>
              Chapter Name (Optional)
            </label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="e.g. Carbon and its Compounds"
              className="w-full text-xs py-2.5 px-3.5 rounded-xl border bg-transparent font-medium outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ink-muted)' }}>
              Topic / Key Focus (Optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Complete Solved Numerical Problems"
              className="w-full text-xs py-2.5 px-3.5 rounded-xl border bg-transparent font-medium outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ink-muted)' }}>
            Short Description (Optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context or instructions for other students..."
            className="w-full text-xs py-2.5 px-3.5 rounded-xl border bg-transparent font-medium outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
          />
        </div>
      </div>

      {/* 3. File Attachment */}
      <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          3. Upload File
        </h3>

        <div
          className="rounded-2xl border-2 border-dashed p-8 text-center transition-colors relative flex flex-col items-center justify-center gap-3 cursor-pointer"
          style={{
            borderColor: file ? 'var(--sage)' : 'var(--border)',
            backgroundColor: file ? '#EAF1E8' : 'var(--surface-raised)',
          }}
        >
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />

          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm" style={{ color: 'var(--sage)' }}>
            {file ? <Check className="w-6 h-6 stroke-[2.5]" /> : <Upload className="w-6 h-6" />}
          </div>

          <div>
            <div className="text-xs font-bold" style={{ color: 'var(--ink)' }}>
              {file ? file.name : 'Choose a PDF file or drag it here'}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB · max 50 MB` : 'PDF, JPG, or PNG files up to 50 MB'}
            </div>
          </div>
        </div>
      </div>

      {submitting && (
        <div className="rounded-2xl border p-4 space-y-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)' }}>
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: 'var(--ink-muted)' }}>{uploadStatus || 'Preparing upload…'}</span>
            <span className="font-semibold" style={{ color: 'var(--ink)' }}>{uploadProgress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-zinc-200">
            <div className="h-full rounded-full transition-all" style={{ width: `${uploadProgress}%`, backgroundColor: 'var(--sage)' }} />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4 border-t flex items-center justify-end" style={{ borderColor: 'var(--border-light)' }}>
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 rounded-full font-medium text-xs sm:text-sm text-white bg-zinc-900 hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 active:scale-95"
        >
          {submitting ? (
            <span>Submitting document...</span>
          ) : (
            <>
              <span>Submit for Moderation</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </form>
  );
}
