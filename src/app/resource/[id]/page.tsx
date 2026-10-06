import React from 'react';
import { notFound } from 'next/navigation';
import { getResourceById, getResourceBySlug, getRelatedResources, incrementViewCount, Resource } from '@/lib/resources';
import ResourceDetailClient from './ResourceDetailClient';
import { Metadata } from 'next';
import { SITE_NAME, SITE_URL, OG_IMAGE, absoluteUrl, jsonLd } from '@/lib/site';

export const revalidate = 30;

async function loadResource(id: string): Promise<Resource | null> {
  let resource: Resource | null = Number.isNaN(Number(id)) ? null : await getResourceById(Number(id));
  if (!resource) resource = await getResourceBySlug(id);
  return resource && resource.status === 'approved' ? resource : null;
}

const canonicalPath = (resource: Resource) => `/resource/${encodeURIComponent(resource.slug || String(resource.id))}`;
const kindOf = (resource: Resource) => (resource.resource_type === 'Previous Year Paper' || Boolean(resource.paper_type) ? 'Question Paper' : 'Notes');

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const resource = await loadResource(id);
  if (!resource) return { title: 'Not Found', robots: { index: false, follow: false } };

  const kind = kindOf(resource);
  const board = resource.board || 'JKBOSE';
  const title = `${resource.subject} ${kind}`;
  const description = (resource.description && resource.description.trim().length > 20
    ? resource.description.trim()
    : `Free Class ${resource.class_level} ${resource.subject} ${kind.toLowerCase()}${resource.chapter ? ` on ${resource.chapter}` : ''} (${board}). Read online or download the PDF from ARCHIVUM.`
  ).slice(0, 300);
  const keywords = [
    resource.title, `class ${resource.class_level} ${resource.subject}`, `class ${resource.class_level} ${resource.subject} ${kind.toLowerCase()}`,
    board, `${board} class ${resource.class_level}`, resource.chapter, resource.topic, resource.school_name, resource.year ? `${resource.subject} ${resource.year} paper` : null,
    ...(resource.tags ? resource.tags.split(',').map(t => t.trim()) : []),
  ].filter((k): k is string => Boolean(k));
  const path = canonicalPath(resource);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      type: 'article', siteName: SITE_NAME, url: path, title, description, images: [OG_IMAGE],
      publishedTime: resource.approved_at || resource.created_at, modifiedTime: resource.updated_at || undefined,
      section: resource.subject, tags: keywords.slice(0, 8),
    },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE.url] },
  };
}

export default async function ResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = await loadResource(id);
  if (!resource) notFound();
  void incrementViewCount(resource.id);
  const related = await getRelatedResources(resource, 3);

  const url = absoluteUrl(canonicalPath(resource));
  const structured = [
    {
      '@context': 'https://schema.org', '@type': 'LearningResource', '@id': `${url}#resource`, url, name: resource.title,
      description: resource.description || `${resource.subject} ${kindOf(resource).toLowerCase()} for Class ${resource.class_level}`,
      learningResourceType: kindOf(resource), educationalLevel: `Class ${resource.class_level}`, teaches: resource.chapter || resource.topic || resource.subject,
      about: resource.subject, inLanguage: 'en', isAccessibleForFree: true, encodingFormat: 'application/pdf',
      datePublished: resource.approved_at || resource.created_at, dateModified: resource.updated_at || undefined,
      author: resource.contributor_name ? { '@type': 'Person', name: resource.contributor_name } : undefined,
      publisher: { '@id': `${SITE_URL}/#organization` }, isPartOf: { '@id': `${SITE_URL}/#website` },
      interactionStatistic: [
        { '@type': 'InteractionCounter', interactionType: 'https://schema.org/ViewAction', userInteractionCount: resource.views },
        { '@type': 'InteractionCounter', interactionType: 'https://schema.org/DownloadAction', userInteractionCount: resource.downloads },
      ],
      ...(resource.rating_count > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(resource.average_rating.toFixed(1)), ratingCount: resource.rating_count, bestRating: 5, worstRating: 1 } } : {}),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: kindOf(resource) === 'Notes' ? 'Notes' : 'Previous Papers', item: absoluteUrl(kindOf(resource) === 'Notes' ? '/notes' : '/previous-papers') },
        { '@type': 'ListItem', position: 3, name: resource.title, item: url },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <ResourceDetailClient resource={{ ...resource, views: resource.views + 1 }} relatedResources={related} />
    </>
  );
}
