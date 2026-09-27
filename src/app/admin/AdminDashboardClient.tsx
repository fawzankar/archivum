'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Resource } from '@/lib/resources';
import PdfViewerModal from '@/components/PdfViewerModal';
import { useToast } from '@/components/ToastContext';
import { 
  Shield, 
  LogOut, 
  FileText, 
  Check, 
  X, 
  Trash2, 
  Star, 
  Download, 
  Eye, 
  Search, 
  Clock, 
  Layers,
  Lightbulb,
  HardDrive
} from 'lucide-react';

interface AdminDashboardProps {
  initialResources: Resource[];
  adminUsername: string;
}

export default function AdminDashboardClient({ initialResources, adminUsername }: AdminDashboardProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'resources' | 'tips' | 'guidelines'>('overview');
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [activePdf, setActivePdf] = useState<Resource | null>(null);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [pendingTips, setPendingTips] = useState<any[]>([]);

  // Table filters
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState<number | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetch('/api/admin/reviews').then((res) => res.ok ? res.json() : { reviews: [] }).then((data) => setPendingReviews(data.reviews || [])).catch(() => {});
    fetch('/api/admin/tips').then((res) => res.ok ? res.json() : { tips: [] }).then((data) => setPendingTips(data.tips || [])).catch(() => {});
  }, [fetchStats]);

  const handleReviewAction = async (id: number, status: 'approved' | 'rejected') => {
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) {
      setPendingReviews((prev) => prev.filter((item) => item.id !== id));
      showToast(status === 'approved' ? 'Review published.' : 'Review rejected.', status === 'approved' ? 'success' : 'info');
    } else showToast('Could not update review.', 'error');
  };


  const handleTipAction = async (id: number, status: 'approved' | 'rejected') => {
    const res = await fetch('/api/admin/tips', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id,status}) });
    if (res.ok) { setPendingTips((prev) => prev.filter((item) => item.id !== id)); showToast(status === 'approved' ? 'Tip published.' : 'Tip rejected.', status === 'approved' ? 'success' : 'info'); }
    else showToast('Could not update tip.', 'error');
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    showToast('Logged out of admin portal');
    router.push('/admin/login');
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Resource approved and published! ✓');
        setResources((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
        fetchStats();
      } else {
        showToast(data.error || 'Approval failed', 'error');
      }
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Internal rejection reason (optional):', 'Metadata non-compliance or poor legibility');
    if (reason === null) return;

    try {
      const res = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Resource rejected', 'info');
        setResources((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected', rejection_reason: reason } : r)));
        fetchStats();
      } else {
        showToast(data.error || 'Rejection failed', 'error');
      }
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const handleDelete = async (id: number, permanent = false) => {
    if (!confirm(`Are you sure you want to ${permanent ? 'PERMANENTLY' : 'soft'} delete this resource?`)) return;

    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, permanent }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Resource ${permanent ? 'permanently' : 'soft'} deleted`);
        if (permanent) {
          setResources((prev) => prev.filter((r) => r.id !== id));
        } else {
          setResources((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'deleted' } : r)));
        }
        fetchStats();
      } else {
        showToast(data.error || 'Delete failed', 'error');
      }
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const handleToggleFeature = async (id: number, currentFeatured: number) => {
    try {
      const newFeatured = currentFeatured === 1 ? 0 : 1;
      const res = await fetch('/api/admin/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, featured: newFeatured }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(newFeatured ? 'Resource marked as Featured ⭐' : 'Removed from Featured');
        setResources((prev) => prev.map((r) => (r.id === id ? { ...r, featured: newFeatured } : r)));
      } else {
        showToast(data.error || 'Feature update failed', 'error');
      }
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const pendingQueue = useMemo(() => {
    return resources.filter((r) => r.status === 'pending');
  }, [resources]);

  const tableResources = useMemo(() => {
    return resources.filter((r) => {
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterClass && r.class_level !== filterClass) return false;
      if (filterType && r.resource_type !== filterType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          (r.school_name && r.school_name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [resources, filterStatus, filterClass, filterType, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
            <Shield className="w-3.5 h-3.5" />
            <span>ARCHIVUM CONTROL CENTRE</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-zinc-100">
            Content Management
          </h1>
          <p className="text-xs text-zinc-500">
            Logged in as <span className="font-semibold text-zinc-800 dark:text-zinc-200">{adminUsername}</span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Stats Counter Row (Styled in 4 pastel blocks matching reference) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div
          className="p-5 rounded-3xl flex flex-col justify-between"
          style={{ backgroundColor: 'var(--accent-light)' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-950">
            Approved Resources
          </span>
          <div className="font-display font-bold text-3xl text-sky-950 mt-2">
            {stats ? stats.published : '...'}
          </div>
        </div>

        <div
          className="p-5 rounded-3xl flex flex-col justify-between"
          style={{ backgroundColor: 'var(--card-peach-bg)' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-950">
            Pending Moderation
          </span>
          <div className="font-display font-bold text-3xl text-rose-950 mt-2">
            {pendingQueue.length}
          </div>
        </div>

        <div
          className="p-5 rounded-3xl flex flex-col justify-between"
          style={{ backgroundColor: 'var(--card-lavender-bg)' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider ">
            Total Downloads
          </span>
          <div className="font-display font-bold text-3xl  mt-2">
            {stats ? stats.totalDownloads : '...'}
          </div>
        </div>

        <div
          className="p-5 rounded-3xl flex flex-col justify-between"
          style={{ backgroundColor: 'var(--card-sky-bg)' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider ">
            Total Views
          </span>
          <div className="font-display font-bold text-3xl  mt-2">
            {stats ? stats.totalViews : '...'}
          </div>
        </div>
        <div
          className="p-5 rounded-3xl flex flex-col justify-between"
          style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)' }}
        >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Storage</span>
          <HardDrive className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        </div>
        <div className="font-display font-bold text-2xl mt-2">
          {stats?.storage ? `${stats.storage.used} / ${stats.storage.limit}` : '...'}
        </div>
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Number(stats?.storage?.percent ?? 0))}%`, background: 'var(--accent)' }} />
        </div>
        <div className="text-[10px] mt-2" style={{ color: 'var(--ink-muted)' }}>
          {stats?.storage ? `${stats.storage.remaining} remaining` : 'Checking quota…'}
        </div>
      </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b" style={{ borderColor: 'var(--border-light)' }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'pending', label: `Pending Queue (${pendingQueue.length})` },
          { id: 'resources', label: `All Resources (${resources.length})` },
          { id: 'tips', label: `Tips (${pendingTips.length})` },
          { id: 'guidelines', label: 'Admin Guidelines' },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer border-b-2"
              style={{
                borderColor: active ? 'var(--sage)' : 'transparent',
                color: active ? 'var(--ink)' : 'var(--ink-muted)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">
              Needs Attention: Pending Submissions
            </h3>
            <button
              onClick={() => setActiveTab('pending')}
              className="text-xs font-semibold hover:underline"
              style={{ color: 'var(--sage)' }}
            >
              Open Queue ({pendingQueue.length}) →
            </button>
          </div>

          {pendingQueue.length > 0 ? (
            <div className="space-y-3">
              {pendingQueue.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-semibold">
                      <span className="px-2 py-0.5 rounded-md border text-zinc-600 dark:text-zinc-400" style={{ borderColor: 'var(--border)' }}>
                        Class {r.class_level} · {r.subject}
                      </span>
                      <span className="text-zinc-400">·</span>
                      <span className="text-zinc-400">{r.resource_type}</span>
                    </div>
                    <h4 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100">
                      {r.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActivePdf(r)}
                      className="px-3 py-1.5 rounded-full border text-xs font-medium hover:bg-black/5 cursor-pointer"
                      style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
                    >
                      Inspect PDF
                    </button>
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold text-white cursor-pointer"
                      style={{ backgroundColor: 'var(--sage)' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      className="px-3 py-1.5 rounded-full border text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-12 rounded-2xl border text-xs text-zinc-500"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              🎉 Queue is clear! All submitted resources are reviewed.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pending Queue */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{pendingQueue.length} items awaiting publication</span>
          </div>

          {pendingQueue.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider border text-zinc-600 dark:text-zinc-400" style={{ borderColor: 'var(--border)' }}>
                    Class {r.class_level}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                    {r.subject} {r.chapter ? `· ${r.chapter}` : ''}
                  </span>
                </div>
                <h4 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  {r.title}
                </h4>
                {r.description && (
                  <p className="text-xs text-zinc-500 line-clamp-1">{r.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActivePdf(r)}
                  className="px-3 py-2 rounded-full border text-xs font-medium hover:bg-black/5 cursor-pointer"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
                >
                  View PDF
                </button>
                <button
                  onClick={() => handleApprove(r.id)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: 'var(--sage)' }}
                >
                  Publish Resource
                </button>
                <button
                  onClick={() => handleReject(r.id)}
                  className="px-3 py-2 rounded-full border text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: All Resources Table */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div
            className="p-4 rounded-2xl border flex flex-wrap items-center gap-3"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, subject, school..."
                className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border bg-transparent font-medium outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>

            <select
              value={filterClass || ''}
              onChange={(e) => setFilterClass(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="text-xs py-2 px-3 rounded-xl border bg-transparent font-medium outline-none cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <option value="">All Classes</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border bg-transparent font-medium outline-none cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          {/* Table */}
          <div
            className="rounded-2xl border overflow-hidden shadow-sm"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider border-b"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--surface-raised)' }}
                >
                  <tr>
                    <th className="py-3 px-4">Title & Classification</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Downloads</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                  {tableResources.map((item) => (
                    <tr key={item.id} className="hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          Class {item.class_level} · {item.subject} · {item.resource_type}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                        {item.downloads}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{item.average_rating ? item.average_rating.toFixed(1) : '—'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleFeature(item.id, item.featured)}
                            title={item.featured ? 'Unfeature' : 'Feature on homepage'}
                            className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                              item.featured ? 'bg-amber-50 border-amber-300 text-amber-600' : 'border-zinc-200 text-zinc-400'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>

                          <button
                            onClick={() => setActivePdf(item)}
                            title="Inspect PDF"
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id, false)}
                            title="Delete"
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Guidelines */}
      {activeTab === 'tips' && (
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[.18em]" style={{ color:'var(--accent)' }}>EXAM PLAYBOOK</span>
            <h2 className="font-display font-bold text-2xl" style={{ color:'var(--ink)' }}>Tip moderation</h2>
            <p className="text-xs" style={{ color:'var(--ink-muted)' }}>Approve practical, class-specific study tips before they enter the public archive.</p>
          </div>
          {pendingTips.length === 0 ? <div className="rounded-2xl border border-dashed p-8 text-center text-xs" style={{borderColor:'var(--border)',color:'var(--ink-muted)'}}>No pending tips.</div> : pendingTips.map((item) => (
            <div key={item.id} className="rounded-2xl border p-5" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
              <div className="flex items-start justify-between gap-4"><div><span className="text-[10px] font-bold uppercase tracking-wider" style={{color:'var(--accent)'}}>Class {item.class_level}</span><h3 className="font-display font-bold text-lg mt-1">{item.title}</h3></div><Lightbulb className="w-5 h-5" style={{color:'var(--accent)'}}/></div>
              <p className="text-sm leading-relaxed mt-3" style={{color:'var(--ink-muted)'}}>{item.body}</p>
              <p className="text-[10px] mt-3" style={{color:'var(--ink-faint)'}}>Submitted by {item.author || 'SJS student'}</p>
              <div className="flex gap-2 mt-4"><button onClick={()=>handleTipAction(item.id,'approved')} className="px-3 py-2 rounded-xl text-xs font-bold" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>Publish</button><button onClick={()=>handleTipAction(item.id,'rejected')} className="px-3 py-2 rounded-xl border text-xs font-bold" style={{borderColor:'var(--border)',color:'var(--ink)'}}>Reject</button></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'guidelines' && (
        <div
          className="rounded-3xl border p-6 sm:p-8 space-y-4 shadow-sm text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Administrative Moderation Principles
          </h3>
          <p>
            When moderating submitted documents, verify that:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The PDF is readable, oriented correctly, and legible on both mobile screens and desktops.</li>
            <li>The title is concise and accurately mentions the class, subject, and chapter or paper topic.</li>
            <li>Examination papers clearly list the school name and calendar year.</li>
            <li>Duplicate uploads of identical content are rejected with an explanatory note to keep the repository clean.</li>
          </ul>
        </div>
      )}

      {/* PDF Modal */}
      <PdfViewerModal resource={activePdf} onClose={() => setActivePdf(null)} />
    </div>
  );
}
