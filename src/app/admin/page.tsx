import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getResources } from '@/lib/resources';
import AdminDashboardClient from './AdminDashboardClient';

export const revalidate = 0;

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const allResources = (await getResources({ status: '', limit: 500 })).items;

  return (
    <div className="space-y-6 pb-12">
      <AdminDashboardClient initialResources={allResources} adminUsername={session.username} />
    </div>
  );
}
