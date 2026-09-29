'use client';
import React from 'react';
import SearchBar from '@/components/SearchBar';
export default function HomeClient({ initialSearch = '' }: { initialSearch?: string }) {
  return <SearchBar initialValue={initialSearch} />;
}
