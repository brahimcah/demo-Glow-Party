import { useRef, useState } from 'react';
import { Artwork } from './Artwork';
import { config } from './config';
import type { Media, Party } from './config';
import type { Language, Translation } from './copy';

const illustrations = [
  { party: 'beauty', variant: 0 }, { party: 'beauty', variant: 1 },
  { party: 'glow', variant: 1 }, { party: 'glow', variant: 0 },
] as const;

export function Gallery({ t, lang }: { t: Translation; lang: Language }) {
  const [filter, setFilter] = useState<Party | 'all'>('all');
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = (config.authorizedMedia.length
    ? config.authorizedMedia.map((media: Media) => ({ party: media.party, label: media.alt[lang], src: media.src, variant: 0 }))
    : illustrations.map((item, index) => ({ ...item, label: t.scenes[index], src: '' })))
    .filter(item => filter === 'all' || item.party === filter);
  const selected = items[active];
  const turn = (delta: number) => setActive(index => (index + delta + items.length) % items.length);

  return <section className="section wrap" id="galeria">
    <div className="section-head"><div><h2>{t.gallery}</h2>{!config.authorizedMedia.length && <p>{t.galleryNote}</p>}</div>
      <div className="filter" role="group" aria-label={t.gallery}>
        {(['all', 'beauty', 'glow'] as const).map(value => <button key={value} aria-pressed={filter === value} onClick={() => { setFilter(value); setActive(0); }}>
          {value === 'all' ? t.all : config.experiences[value].name}
        </button>)}
      </div>
    </div>
    <div className="gallery-grid">{items.map((item, index) => <button key={item.label} className="gallery-tile" onClick={event => {
      trigger.current = event.currentTarget;
      setActive(index);
      dialog.current?.showModal();
    }}>
      {item.src ? <img src={item.src} loading="lazy" alt="" /> : <Artwork party={item.party} variant={item.variant} />}
      <span>{item.label} <span aria-hidden="true">↗</span></span>
    </button>)}</div>
    <dialog ref={dialog} aria-labelledby="gallery-title" onClose={() => trigger.current?.focus()} onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        turn(event.key === 'ArrowLeft' ? -1 : 1);
      }
    }}>
      <button className="text-button dialog-close" autoFocus onClick={() => dialog.current?.close()}>{t.close} ×</button>
      {selected && <>
        {selected.src ? <img src={selected.src} alt="" /> : <Artwork party={selected.party} variant={selected.variant} />}
        <h3 id="gallery-title" aria-live="polite">{selected.label}</h3>
        {items.length > 1 && <div className="actions"><button className="button secondary" onClick={() => turn(-1)}>← {t.previous}</button><button className="button secondary" onClick={() => turn(1)}>{t.next} →</button></div>}
      </>}
    </dialog>
  </section>;
}
