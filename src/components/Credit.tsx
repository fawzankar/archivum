import { CREDIT } from '@/lib/credit';

/**
 * "Built by Fawzan Kar". Pass `link` where it should be tappable (menu, about);
 * leave it off on the splash, which disappears on its own.
 */
export default function Credit({ link = false, className = '' }: { link?: boolean; className?: string }) {
  return (
    <p className={`credit ${className}`.trim()}>
      <span className="credit-lead">{CREDIT.lead}</span>{' '}
      {link
        ? <a className="credit-name" href={CREDIT.url} target="_blank" rel="noopener noreferrer">{CREDIT.name}</a>
        : <span className="credit-name">{CREDIT.name}</span>}
    </p>
  );
}
