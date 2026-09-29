import React from 'react';
import Art from './Art';

const tones = { sun: 'ph-sun', peri: 'ph-peri', blush: 'ph-blush', mint: 'ph-mint' } as const;

export default function PageHead({ title, art, tone = 'sun', children }: { title: string; art: string; tone?: keyof typeof tones; children?: React.ReactNode }) {
  return <header className={`ph ${tones[tone]}`}>
    <div className="ph-copy"><h1>{title}</h1>{children && <p>{children}</p>}</div>
    <Art name={art} className="ph-art" />
  </header>;
}
