import React from 'react';
import { notFound } from 'next/navigation';
import { getResourceById,getResourceBySlug,getRelatedResources,incrementViewCount,Resource } from '@/lib/resources';
import ResourceDetailClient from './ResourceDetailClient';
import { Metadata } from 'next';
export const revalidate=30;
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{ const {id}=await params; let resource:Resource|null=Number.isNaN(Number(id))?null:await getResourceById(Number(id)); if(!resource)resource=await getResourceBySlug(id); if(!resource||resource.status!=='approved')return{title:'Not found | ARCHIVUM'}; return{title:`${resource.title} | Class ${resource.class_level} ${resource.subject} | ARCHIVUM`,description:resource.description||`Study ${resource.title} for Class ${resource.class_level} JKBOSE on ARCHIVUM.`}; }
export default async function ResourcePage({params}:{params:Promise<{id:string}>}){ const {id}=await params; let resource:Resource|null=Number.isNaN(Number(id))?null:await getResourceById(Number(id)); if(!resource)resource=await getResourceBySlug(id); if(!resource||resource.status!=='approved')notFound();   void incrementViewCount(resource.id);
  const relatedPromise = getRelatedResources(resource, 3);
  const related = await relatedPromise;
  return <ResourceDetailClient resource={{...resource,views:resource.views+1}} relatedResources={related}/>; }
