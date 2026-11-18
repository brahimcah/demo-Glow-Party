import type { Party } from './config';

export function Artwork({ party, variant = 0 }: { party: Party; variant?: number }) {
  return <div className={`artwork art-${party} art-variant-${variant}`} aria-hidden="true">
    <svg className="art-constellation" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" focusable="false">
      <path d="M31 202C72 77 271 28 370 115M53 253C164 287 314 233 367 162"
        fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 9" />
      <path d="M92 87l4 9 9 4-9 4-4 9-4-9-9-4 9-4zM326 213l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="currentColor" />
      <circle cx="73" cy="246" r="2" fill="currentColor" /><circle cx="308" cy="91" r="3" fill="currentColor" />
    </svg>
    <div className="art-orbit" />
    <div className="art-frame" />
    <span className="spark spark-one">✦</span><span className="spark spark-two">✧</span>
    <span className="spark spark-three">✦</span><span className="spark spark-four">✧</span>
    <i className="confetti confetti-one" /><i className="confetti confetti-two" /><i className="confetti confetti-three" />
    <div className="party-object">
      <div className="candle"><i /></div>
      <div className="cake-top" /><div className="cake-base" /><div className="plate" />
      <div className="bow"><i /><b /><i /></div>
    </div>
    <div className="gift"><i /></div>
  </div>;
}
