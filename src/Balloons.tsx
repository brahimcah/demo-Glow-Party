import { useEffect, useState } from 'react';

interface BalloonItem {
  id: number;
  left: number;
  size: number;
  color: string;
  shineColor: string;
  stringColor: string;
  duration: number;
  delay: number;
  swayDuration: number;
  swayDist: number;
  wobbleDir: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  speed: number;
}

const PALETTE = [
  { color: '#ff2a85', shine: '#ff90bf', string: 'rgba(255, 42, 133, 0.45)' }, // Neon Pink
  { color: '#9d4edd', shine: '#e0aaff', string: 'rgba(157, 78, 221, 0.45)' }, // Glow Purple
  { color: '#00f0ff', shine: '#a6fbff', string: 'rgba(0, 240, 255, 0.45)' }, // Neon Cyan
  { color: '#ffbe0b', shine: '#fef08a', string: 'rgba(255, 190, 11, 0.45)' }, // Party Gold
  { color: '#ff006e', shine: '#ff80b5', string: 'rgba(255, 0, 110, 0.45)' }, // Hot Magenta
  { color: '#06d6a0', shine: '#a7f3d0', string: 'rgba(6, 214, 160, 0.45)' }, // Electric Mint
  { color: '#fb5607', shine: '#fed7aa', string: 'rgba(251, 86, 7, 0.45)' }, // Sunset Orange
];

function createBalloons(count = 20): BalloonItem[] {
  return Array.from({ length: count }, (_, i) => {
    const pal = PALETTE[i % PALETTE.length];
    const columnSpan = 92 / count;
    const baseLeft = 4 + i * columnSpan;
    const jitter = (Math.random() - 0.5) * columnSpan * 0.8;
    return {
      id: Date.now() + i,
      left: Math.max(3, Math.min(95, Math.round(baseLeft + jitter))),
      size: Math.round(44 + Math.random() * 26),
      color: pal.color,
      shineColor: pal.shine,
      stringColor: pal.string,
      duration: Number((6.5 + Math.random() * 3.5).toFixed(1)),
      delay: Number((i * 0.12 + Math.random() * 0.4).toFixed(2)),
      swayDuration: Number((2.2 + Math.random() * 1.6).toFixed(1)),
      swayDist: Math.round(14 + Math.random() * 18),
      wobbleDir: Math.random() > 0.5 ? 1 : -1,
    };
  });
}

export function Balloons() {
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    // Lanzar globos al abrir la web
    setBalloons(createBalloons(18));

    // Desactivar automáticamente después de que todos hayan subido
    const timer = setTimeout(() => {
      setActive(false);
    }, 12000);

    return () => clearTimeout(timer);
  }, []);

  function launchMore() {
    setActive(true);
    setBalloons(createBalloons(18));
  }

  function popBalloon(event: React.MouseEvent, balloon: BalloonItem) {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 3;

    // Crear partículas de confeti/pop
    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: Math.random(),
      x,
      y,
      color: i % 2 === 0 ? balloon.color : balloon.shineColor,
      angle: (i / 12) * Math.PI * 2,
      speed: 40 + Math.random() * 45,
    }));

    setParticles(prev => [...prev, ...newParticles]);
    setBalloons(prev => prev.filter(b => b.id !== balloon.id));

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 800);
  }

  return (
    <>
      {active && balloons.length > 0 && (
        <div className="balloons-container" aria-hidden="true">
          {balloons.map(b => (
            <div
              key={b.id}
              className="balloon-wrapper"
              style={{
                left: `${b.left}%`,
                animationDuration: `${b.duration}s`,
                animationDelay: `${b.delay}s`,
                '--sway-dist': `${b.swayDist * b.wobbleDir}px`,
                '--sway-dur': `${b.swayDuration}s`,
              } as React.CSSProperties}
              onClick={e => popBalloon(e, b)}
              title="¡Toca para explotar!"
            >
              <svg
                width={b.size}
                height={b.size * 1.55}
                viewBox="0 0 50 78"
                className="balloon-svg"
              >
                <defs>
                  <radialGradient id={`shine-${b.id}`} cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor={b.shineColor} stopOpacity="0.9" />
                    <stop offset="40%" stopColor={b.color} />
                    <stop offset="100%" stopColor={b.color} stopOpacity="0.85" />
                  </radialGradient>
                  <filter id={`glow-${b.id}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={b.color} floodOpacity="0.4" />
                  </filter>
                </defs>

                {/* Hilo del globo ondeante */}
                <path
                  d="M25 48 Q22 56 27 64 T24 76"
                  fill="none"
                  stroke={b.stringColor}
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />

                {/* Nudo */}
                <polygon
                  points="23,45 27,45 26,49 24,49"
                  fill={b.color}
                />

                {/* Cuerpo del globo */}
                <ellipse
                  cx="25"
                  cy="24"
                  rx="22"
                  ry="24"
                  fill={`url(#shine-${b.id})`}
                  filter={`url(#glow-${b.id})`}
                />

                {/* Brillo especular 3D */}
                <ellipse
                  cx="18"
                  cy="14"
                  rx="6"
                  ry="9"
                  transform="rotate(-28 18 14)"
                  fill="#ffffff"
                  opacity="0.45"
                />
                <circle
                  cx="14"
                  cy="25"
                  r="2"
                  fill="#ffffff"
                  opacity="0.3"
                />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* Partículas de confeti cuando explota un globo */}
      {particles.length > 0 && (
        <div className="balloon-particles-container" aria-hidden="true">
          {particles.map(p => (
            <span
              key={p.id}
              className="balloon-particle"
              style={{
                left: `${p.x}px`,
                top: `${p.y}px`,
                backgroundColor: p.color,
                '--dx': `${Math.cos(p.angle) * p.speed}px`,
                '--dy': `${Math.sin(p.angle) * p.speed}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Botón flotante para volver a lanzar globos cuando se desee */}
      <button
        type="button"
        className="balloon-relaunch-btn"
        onClick={launchMore}
        aria-label="Lanzar globos de fiesta"
        title="¡Lanzar más globos!"
      >
        <span aria-hidden="true">🎈</span>
      </button>
    </>
  );
}
