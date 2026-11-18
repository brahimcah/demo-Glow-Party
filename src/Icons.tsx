export function InstagramIcon({ size = 22 }: { size?: number }) {
  return <svg className="instagram-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.4" cy="6.8" r="1.1" fill="currentColor" />
  </svg>;
}
