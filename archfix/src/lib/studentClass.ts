import { cookies } from 'next/headers';

export async function getPreferredClass() {
  const value = Number((await cookies()).get('archivum_class')?.value || '');
  return [9,10,11,12].includes(value) ? value : undefined;
}
