import type { Party } from './config';

export function Artwork({ party, variant = 0 }: { party: Party; variant?: number }) {
  return <div className={`artwork art-${party} art-variant-${variant}`} aria-hidden="true">
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
