// Simple line-art outdoor pictos, in the spirit of the Phoenix Races IGN-map aesthetic.
// Deliberately hand-drawn / sparse rather than a generic icon-library look.

type IconProps = { className?: string };

export function HeadlampIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="9" r="4" />
      <path d="M8.5 6.5 3 4" strokeLinecap="round" />
      <path d="M15.5 6.5 21 4" strokeLinecap="round" />
      <path d="M12 13v7" strokeLinecap="round" />
      <circle cx="12" cy="9" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CompassIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 5.5L8 16l2-5.5L15 9z" strokeLinejoin="round" />
    </svg>
  );
}

export function TentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 19 12 4l9 15" strokeLinejoin="round" />
      <path d="M9 19 12 11l3 8" strokeLinejoin="round" />
      <path d="M3 19h18" strokeLinecap="round" />
    </svg>
  );
}

export function BottleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M10 3h4v3.2c1.2.7 2 2 2 3.5V19a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9.7c0-1.5.8-2.8 2-3.5V3z" />
      <path d="M9 13h6" strokeLinecap="round" />
    </svg>
  );
}
