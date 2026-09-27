import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { getStorageUsageBytes, getStorageQuotaStatus } from '@/lib/storage';
export async function GET(){
  if(!(await getAdminSession())) return NextResponse.json({error:'Unauthorized admin access'},{status:401});
  const [pending,published,rejected,deleted,totalDownloads,totalViews,avgRating,totalRatings,mostDownloaded,recentlyAdded,storageUsedBytes]=await Promise.all([
    queryOne<{count:number}>("SELECT COUNT(*) AS count FROM resources WHERE status='pending'"),queryOne<{count:number}>("SELECT COUNT(*) AS count FROM resources WHERE status='approved'"),queryOne<{count:number}>("SELECT COUNT(*) AS count FROM resources WHERE status='rejected'"),queryOne<{count:number}>("SELECT COUNT(*) AS count FROM resources WHERE status='deleted'"),queryOne<{sum:number}>('SELECT COALESCE(SUM(downloads),0) AS sum FROM resources'),queryOne<{sum:number}>('SELECT COALESCE(SUM(views),0) AS sum FROM resources'),queryOne<{avg:number}>('SELECT COALESCE(AVG(average_rating),0) AS avg FROM resources WHERE rating_count>0'),queryOne<{count:number}>('SELECT COUNT(*) AS count FROM ratings'),query("SELECT id,title,class_level,subject,resource_type,downloads,average_rating FROM resources WHERE status='approved' ORDER BY downloads DESC LIMIT 5"),query("SELECT id,title,class_level,subject,resource_type,created_at,status FROM resources ORDER BY created_at DESC LIMIT 5"),
    getStorageUsageBytes()
  ]);
  const storage = getStorageQuotaStatus(Number(storageUsedBytes ?? 0));
  return NextResponse.json({storage, pending:Number(pending?.count??0),published:Number(published?.count??0),rejected:Number(rejected?.count??0),deleted:Number(deleted?.count??0),totalDownloads:Number(totalDownloads?.sum??0),totalViews:Number(totalViews?.sum??0),avgRating:Math.round(Number(avgRating?.avg??0)*10)/10,totalRatings:Number(totalRatings?.count??0),mostDownloaded,recentlyAdded});
}
