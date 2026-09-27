import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { getResourceById, incrementDownloadCount } from '@/lib/resources';
import { getR2Client, r2KeyFromUrl } from '@/lib/storage';
export const dynamic='force-dynamic';
export const runtime='nodejs';

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  try {
    const {id}=await params;
    const resourceId=Number(id);
    if(!Number.isInteger(resourceId)||resourceId<=0)return NextResponse.json({error:'Invalid resource ID'},{status:400});
    const resource=await getResourceById(resourceId);
    if(!resource||resource.status!=='approved')return NextResponse.json({error:'Resource not found'},{status:404});
    const body=await request.json().catch(()=>({}));
    const sessionId=String(body.sessionId||'anonymous_session');
    const counted=await incrementDownloadCount(resource.id,sessionId);
    const fresh=await getResourceById(resource.id);

    let downloadUrl = resource.file_url;
    const key = resource.storage_key || r2KeyFromUrl(resource.file_url);
    const client = getR2Client();
    if (key && client && process.env.R2_BUCKET_NAME) {
      downloadUrl = await getSignedUrl(client, new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ResponseContentDisposition: `attachment; filename=\"${(resource.file_name || resource.title).replace(/[^a-zA-Z0-9._ -]/g,'-')}\"`,
      }), { expiresIn: 900 });
    } else if (resource.file_url.startsWith('r2://')) {
      return NextResponse.json({error:'Cloudflare R2 is not configured on the server.'},{status:503});
    }

    return NextResponse.json({success:true,counted,downloads:fresh?.downloads??resource.downloads,file_url:downloadUrl,download_url:downloadUrl});
  } catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Download could not be started'},{status:500});}
}
