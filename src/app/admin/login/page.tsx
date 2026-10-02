'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Please enter your username and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Welcome back!');
        router.push('/admin');
      } else {
        showToast(data.error || 'Those details don’t match. Please try again.', 'error');
      }
    } catch {
      showToast('Couldn’t reach the server. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      <div
        className="rounded-3xl border p-8 sm:p-10 shadow-sm text-center space-y-6"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center"
          style={{ backgroundColor: '#EAF1E8', color: 'var(--sage)' }}
        >
          <Shield className="w-6 h-6 stroke-[2]" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
            ADMIN ACCESS
          </span>
          <h1 className="font-display font-bold text-2xl text-zinc-900 dark:text-zinc-100">
            Admin sign in
          </h1>
          <p className="text-xs text-zinc-500">Review submissions and manage the archive</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ink-muted)' }}>
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--ink-faint)' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full py-2.5 pl-10 pr-3 text-xs rounded-xl border bg-transparent font-medium outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ink-muted)' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--ink-faint)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 pl-10 pr-3 text-xs rounded-xl border bg-transparent font-medium outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full font-medium text-xs text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {loading ? 'Signing in…' : 'Sign in'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
