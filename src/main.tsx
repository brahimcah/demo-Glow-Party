import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Artwork } from './Artwork';
import { MotionConfig, motion, useReducedMotion, useScroll } from 'framer-motion';
import { Experiences, FAQ, Hero, Process } from './Scenes';
import '@fontsource-variable/plus-jakarta-sans';
import { Gallery } from './Gallery';
import { Inquiry } from './Inquiry';
import { config } from './config';
import type { Choice, Party } from './config';
import { copy } from './copy';
import type { Language } from './copy';
import './style.css';

const sections = ['festes', 'com-funciona', 'galeria', 'preguntes', 'contacte'];

function App() {
  const [lang, setLang] = useState<Language>('ca');
  const [party, setParty] = useState<Party>('beauty');
  const [choice, setChoice] = useState<Choice>('beauty');
  const [menu, setMenu] = useState(false);
  const [detail, setDetail] = useState<Party>('beauty');
  const details = useRef<HTMLDialogElement>(null);
  const detailTrigger = useRef<HTMLButtonElement>(null);
  const t = copy[lang];
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  function select(value: Choice) {
    setChoice(value);
    if (value !== 'undecided') setParty(value);
  }

  return <div className="site" data-party={party}>
    <div id="top" />
    {!reduced && <motion.div className="scroll-progress" aria-hidden="true" style={{ scaleX: scrollYProgress }} />}
    <a className="skip" href="#contingut">{t.skip}</a>
    <header className="header">
      <div className="wrap header-row">
        <a className="brand" href="#top"><span aria-hidden="true">✦</span>{config.brandName}</a>
        <button className="menu-toggle button secondary" aria-expanded={menu} aria-controls="nav" onClick={() => setMenu(!menu)}>{t.menu} {menu ? '×' : '☰'}</button>
        <nav id="nav" className={menu ? 'open' : ''} onKeyDown={event => { if (event.key === 'Escape') { setMenu(false); document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus(); } }}>
          {sections.map((id, index) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>{t.nav[index]}</a>)}
        </nav>
        <div className="filter languages" role="group" aria-label={t.language}>
          {(['ca', 'es'] as const).map(value => <button key={value} lang={value} aria-label={value === 'ca' ? 'Català' : 'Castellano'} aria-pressed={lang === value} onClick={() => setLang(value)}>{value.toUpperCase()}</button>)}
        </div>
        <a className="button primary header-cta" href="#consulta">{t.dateCta}</a>
      </div>
    </header>
    <main id="contingut">
      <Hero t={t} party={party} select={select} />
      <Experiences t={t} select={select} openDetails={(value, target) => {
        detailTrigger.current = target;
        setDetail(value);
        details.current?.showModal();
      }} />
      <Process t={t} />
      <Gallery t={t} lang={lang} />
      <Inquiry t={t} lang={lang} choice={choice} choose={select} />
      <FAQ t={t} />
      <section className="closing section" id="contacte"><div className="wrap">
        <p className="eyebrow">✦ {config.serviceArea} ✦</p><h2>{t.closing}</h2>
        <div className="actions"><a className="button primary" href="#consulta">{t.dateCta} →</a><a className="button secondary" href={config.instagramUrl} target="_blank" rel="noreferrer">@beautykidsparty28 ↗</a></div>
      </div></section>
    </main>
    <footer className="wrap footer"><a className="brand" href="#top"><span aria-hidden="true">✦</span>{config.brandName}</a><span>{config.serviceArea}</span></footer>
    <div className="mobile-cta"><a href="#consulta" className="button primary">{t.dateCta} →</a></div>
    <dialog ref={details} aria-labelledby="detail-title" onClose={() => detailTrigger.current?.focus()}>
      <button className="text-button dialog-close" autoFocus onClick={() => details.current?.close()}>{t.close} ×</button>
      <Artwork party={detail} />
      <h3 id="detail-title">{config.experiences[detail].name}</h3><p>{t.descriptions[detail]}</p>
      {config.experiences[detail].verifiedActivities.length > 0 && <ul>{config.experiences[detail].verifiedActivities.map(item => <li key={item}>{item}</li>)}</ul>}
      <a className="button primary" href="#consulta" onClick={() => { select(detail); details.current?.close(); }}>{t.want} →</a>
    </dialog>
  </div>;
}

createRoot(document.getElementById('root')!).render(<MotionConfig reducedMotion="user"><App /></MotionConfig>);
