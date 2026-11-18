import { useId, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Party } from './config';

const paths = [
  { left: '8%', size: 64, drift: 19, delay: 100, duration: 4600 },
  { left: '22%', size: 48, drift: -24, delay: 540, duration: 4350 },
  { left: '36%', size: 61, drift: 27, delay: 230, duration: 4900 },
  { left: '51%', size: 52, drift: -19, delay: 720, duration: 4200 },
  { left: '65%', size: 72, drift: 21, delay: 80, duration: 4700 },
  { left: '78%', size: 50, drift: -26, delay: 440, duration: 4600 },
  { left: '91%', size: 64, drift: 18, delay: 290, duration: 4850 },
];
const colors = {
  beauty: ['#ca5284', '#a575cf', '#ea916d', '#d779a9'],
  glow: ['#f56dce', '#9d75ff', '#68ead5', '#dbf078'],
};

export function Balloons({ party, replayLabel }: { party: Party; replayLabel: string }) {
  const prefix = useId();
  const [launch, setLaunch] = useState(0);

  return <>
    <div key={launch} className="balloons-container" aria-hidden="true">
      {paths.map(({ left, size, drift, delay, duration }, index) => {
        const color = colors[party][index % colors[party].length];
        const gradient = `${prefix}-balloon-${index}`;
        return <div className="balloon-wrapper" key={left} style={{
          left,
          color,
          '--size': `${size}px`,
          '--drift': `${drift}px`,
          '--delay': `${delay}ms`,
          '--flight': `${duration}ms`,
        } as CSSProperties}>
          <svg viewBox="0 0 50 88" className="balloon-svg" focusable="false">
            <defs>
              <radialGradient id={gradient} cx="31%" cy="25%" r="80%">
                <stop offset="0" stopColor="#fff" stopOpacity=".95" />
                <stop offset=".26" stopColor={color} />
                <stop offset="1" stopColor={color} stopOpacity=".76" />
              </radialGradient>
            </defs>
            <path d="M25 49 Q18 57 25 65 T24 86" fill="none" stroke="currentColor" strokeOpacity=".72" strokeWidth="1.25" />
            <path d="M25 43 L21 51 Q25 53 29 51 Z" fill="currentColor" />
            <path d="M25 3 C12 3 4 11 4 23 C4 34 14 46 25 48 C36 46 46 34 46 23 C46 11 38 3 25 3Z" fill={`url(#${gradient})`} />
            <path d="M12 21 Q13 12 22 10" fill="none" stroke="white" strokeOpacity=".68" strokeWidth="2.25" strokeLinecap="round" />
          </svg>
        </div>;
      })}
    </div>
    <button type="button" className="balloon-relaunch-btn" onClick={() => setLaunch(value => value + 1)}>
      <span aria-hidden="true">✧</span> {replayLabel}
    </button>
  </>;
}
