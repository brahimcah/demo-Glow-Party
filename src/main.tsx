import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Artwork } from './Artwork';
import { Balloons } from './Balloons';
import { Gallery } from './Gallery';
import { Inquiry } from './Inquiry';
import { config } from './config';
import type { Choice, Party } from './config';
import { copy } from './copy';
import type { Language } from './copy';
import './style.css';

const parties = ['beauty', 'glow'] as const;
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

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  function select(value: Choice) {
    setChoice(value);
    if (value !== 'undecided') setParty(value);
  }

  return <div className="site" data-party={party}>
    <Balloons />
    <div className="scroll-progress" aria-hidden="true" />
    <a className="skip" href="#contingut">{t.skip}</a>
    <header className="header" id="top">
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
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-content">
            <p className="eyebrow"><span aria-hidden="true">✦</span> {config.serviceArea}</p>
            <h1>{t.hero[party][0]}<br /><em>{t.hero[party][1]}</em></h1>
            <p className="intro">{t.intro}</p>
            <div className="theme-picker" role="group" aria-label={t.mood}>
              {parties.map(value => <button key={value} aria-pressed={party === value} onClick={() => select(value)}><span aria-hidden="true">{value === 'beauty' ? '✿' : '✦'}</span> {config.experiences[value].name}</button>)}
            </div>
            <div className="actions"><a className="button primary" href="#festes">{t.explore} <span aria-hidden="true">↘</span></a><a className="button secondary" href="#consulta">{t.check}</a></div>
          </div>
          <div className="hero-stage">
            <div className="hero-art">
              {parties.map(value => <div key={value} className={party === value ? 'visible' : ''}><Artwork party={value} /></div>)}
            </div>
          </div>
        </div>
      </section>
      <section className="section wrap" id="festes">
        <p className="eyebrow">{t.partiesLabel}</p><h2>{t.parties}</h2>
        <div className="parties-grid">{parties.map(value => <article className={`party-card card-${value}`} key={value}>
          <Artwork party={value} variant={1} />
          <div className="card-copy">
            <h3>{config.experiences[value].name}</h3><p>{t.descriptions[value]}</p>
            <div className="actions">
              <a className="button primary" href="#consulta" onClick={() => select(value)}>{t.want} →</a>
              <button className="text-button" onClick={event => { detailTrigger.current = event.currentTarget; setDetail(value); details.current?.showModal(); }}>{t.details}</button>
            </div>
          </div>
        </article>)}</div>
        <div className="compare">
          <h3>{t.compare}</h3>
          <dl>{parties.map(value => <div key={value}><dt>{config.experiences[value].name}</dt><dd>{t.descriptions[value]}</dd></div>)}</dl>
          <a href="#consulta" className="button secondary" onClick={() => select('undecided')}>{t.help} →</a>
        </div>
      </section>
      <section className="process section" id="com-funciona"><div className="wrap">
        <div className="process-intro"><h2>{t.process}</h2><p>{t.confirmation}</p></div>
        <ol className="steps">{t.steps.map((step, index) => <li key={step}><span aria-hidden="true">0{index + 1}</span>{step}</li>)}</ol>
      </div></section>
      <Gallery t={t} lang={lang} />
      <Inquiry t={t} lang={lang} choice={choice} choose={select} />
      <section className="section wrap faq" id="preguntes">
        <h2>{t.faq}</h2>
        <div>{t.questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      </section>
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

createRoot(document.getElementById('root')!).render(<App />);
