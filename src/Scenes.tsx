import { useEffect, useId, useRef, useState } from 'react';
import {
  AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform,
} from 'framer-motion';
import { Artwork } from './Artwork';
import { Balloons } from './Balloons';
import { config } from './config';
import type { Choice, Party } from './config';
import type { Translation } from './copy';

export const parties = ['beauty', 'glow'] as const;
const ease = [0.22, 1, 0.36, 1] as const;
const spring = { stiffness: 160, damping: 32, mass: 0.55 };
const stickyViewport = '(min-height: 640px)';
type SelectParty = (party: Choice) => void;

export function Hero({ t, party, celebration, select }: { t: Translation; party: Party; celebration: number; select: (party: Party) => void }) {
  const hero = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const progress = useSpring(scrollYProgress, spring);
  const textY = useTransform(progress, [0, 0.75], [0, -76]);
  const textOpacity = useTransform(progress, [0, 0.18, 0.85], [1, 1, 0.26]);
  const artScale = useTransform(progress, [0, 0.85], [1, 1.08]);
  const artY = useTransform(progress, [0, 0.88], [0, 58]);

  return <section className="hero" ref={hero}>
    <div className="wrap hero-grid">
      <motion.div className="hero-content" style={reduced ? undefined : { y: textY, opacity: textOpacity }}>
        <p className="eyebrow"><span aria-hidden="true">✦</span> {config.serviceArea}</p>
        <div className="hero-title">
          <AnimatePresence initial={!reduced} mode="wait">
            <motion.h1 key={party} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.28 }}
              exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.12 } }}>
              {t.hero[party].map((line, index) => <span className="hero-line" key={index}>
                <motion.span initial={reduced ? false : { y: '95%', filter: 'blur(10px)' }}
                  animate={{ y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: reduced ? 0 : 0.75, delay: reduced ? 0 : index * 0.1, ease }}>
                  {index === 0 ? line : <em>{line}</em>}
                </motion.span>
              </span>)}
            </motion.h1>
          </AnimatePresence>
        </div>
        <p className="intro">{t.intro}</p>
        <div className="theme-picker" role="group" aria-label={t.mood}>
          {parties.map(value => <button key={value} aria-pressed={party === value} onClick={() => select(value)}>
            <span aria-hidden="true">{value === 'beauty' ? '✿' : '✦'}</span> {config.experiences[value].name}
          </button>)}
        </div>
        <div className="actions"><a className="button primary" href="#festes">{t.explore} <span aria-hidden="true">↘︎</span></a><a className="button secondary" href="#consulta">{t.check}</a></div>
      </motion.div>
      <div className="hero-stage">
        <motion.div className="hero-art" style={reduced ? undefined : { scale: artScale, y: artY }}>
          {parties.map(value => <div key={value} className={party === value ? 'visible' : ''}><Artwork party={value} /></div>)}
        </motion.div>
        <Balloons key={celebration} party={party} replayLabel={t.replayBalloons} />
      </div>
    </div>
  </section>;
}

export function Experiences({ t, select, onSceneChange, openDetails }: {
  t: Translation;
  select: SelectParty;
  onSceneChange: (party: Party) => void;
  openDetails: (party: Party, target: HTMLButtonElement) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [roomForSticky, setRoomForSticky] = useState(() => window.matchMedia?.(stickyViewport).matches ?? false);
  const [active, setActive] = useState<Party>('beauty');
  const lastScene = useRef<Party>('beauty');
  const { scrollYProgress } = useScroll({ target: track, offset: ['start 15%', 'end end'] });
  const progress = useSpring(scrollYProgress, spring);
  const beautyOpacity = useTransform(progress, [0, 0.40, 0.57], [1, 1, 0]);
  const glowOpacity = useTransform(progress, [0.44, 0.60, 1], [0, 1, 1]);
  const beautyY = useTransform(progress, [0.38, 0.62], [0, -38]);
  const glowY = useTransform(progress, [0.43, 0.66], [38, 0]);
  const beautyScale = useTransform(progress, [0, 0.43, 0.6], [0.94, 1.05, 1.02]);
  const glowScale = useTransform(progress, [0.45, 0.94], [0.94, 1.05]);
  const beautyTextX = useTransform(progress, [0, 0.17], [-16, 0]);
  const glowTextX = useTransform(progress, [0.44, 0.66], [20, 0]);
  const cinematic = !reduced && roomForSticky;

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(stickyViewport);
    const update = () => setRoomForSticky(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useMotionValueEvent(progress, 'change', value => {
    const scene = lastScene.current;
    const next = scene === 'beauty' && value >= 0.53 ? 'glow'
      : scene === 'glow' && value <= 0.47 ? 'beauty' : scene;
    if (next === scene) return;
    lastScene.current = next;
    setActive(next);
    onSceneChange(next);
  });

  return <section id="festes" className="experiences">
    <div className={`story-track${cinematic ? ' cinematic' : ''}`} ref={track}>
      <div className="story-stage">
        <motion.div className="story-ambient" aria-hidden="true" style={cinematic ? { opacity: glowOpacity } : { opacity: 0 }} />
        <div className="wrap story-inner">
          <div className="story-heading">
            <p className="eyebrow">{t.partiesLabel}</p><h2>{t.parties}</h2>
          </div>
          <div className="story-scenes">{parties.map(value => {
            const beauty = value === 'beauty';
            const hidden = cinematic && active !== value;
            return <motion.article className={`party-card story-card card-${value}`} key={value}
              inert={hidden} aria-hidden={hidden || undefined}
              style={cinematic ? { opacity: beauty ? beautyOpacity : glowOpacity, y: beauty ? beautyY : glowY } : undefined}>
              <motion.div className="story-art" style={cinematic ? { scale: beauty ? beautyScale : glowScale } : undefined}>
                <Artwork party={value} variant={1} />
              </motion.div>
              <motion.div className="card-copy" style={cinematic ? { x: beauty ? beautyTextX : glowTextX } : undefined}>
                <h3>{config.experiences[value].name}</h3><p>{t.descriptions[value]}</p>
                <div className="actions">
                  <a className="button primary" href="#consulta" tabIndex={hidden ? -1 : undefined} onClick={() => select(value)}>{t.want} →</a>
                  <button className="text-button" tabIndex={hidden ? -1 : undefined} onClick={event => openDetails(value, event.currentTarget)}>{t.details}</button>
                </div>
              </motion.div>
            </motion.article>;
          })}</div>
          {cinematic && <div className="story-meter" aria-hidden="true"><motion.span style={{ scaleX: progress }} /></div>}
        </div>
      </div>
    </div>
    <div className="wrap compare">
      <h3>{t.compare}</h3>
      <div className="compare-grid">
        {parties.map(value => <motion.article key={value} className={`compare-card card-${value}`}
          initial={reduced ? false : { scale: 0.94, y: 22 }}
          whileInView={{ scale: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: reduced ? 0 : 0.62, ease }}>
          <span className="compare-symbol" aria-hidden="true">{value === 'beauty' ? '✿' : '✦'}</span>
          <h4>{config.experiences[value].name}</h4>
          <p>{t.descriptions[value]}</p>
          <a className="button secondary" href="#consulta" onClick={() => select(value)}
            aria-label={`${t.want} · ${config.experiences[value].name}`}>{t.want} →</a>
        </motion.article>)}
      </div>
      <a href="#consulta" className="text-button" onClick={() => select('undecided')}>{t.help} →</a>
    </div>
  </section>;
}

function ProcessStep({ text, index }: { text: string; index: number }) {
  const card = useRef<HTMLLIElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: card, offset: ['start 90%', 'center center', 'end 15%'] });
  const progress = useSpring(scrollYProgress, spring);
  const opacity = useTransform(progress, [0, 0.5, 1], [0.68, 1, 0.72]);
  const scale = useTransform(progress, [0, 0.5, 1], [0.95, 1, 0.97]);
  const glow = useTransform(progress, [0.15, 0.5, 0.85], [0, 1, 0]);

  return <motion.li ref={card} style={reduced ? undefined : { opacity, scale }}>
    <motion.i className="step-glow" aria-hidden="true" style={reduced ? undefined : { opacity: glow }} />
    <span aria-hidden="true">0{index + 1}</span>{text}
  </motion.li>;
}

export function Process({ t }: { t: Translation }) {
  const list = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: list, offset: ['start center', 'end center'] });
  const progress = useSpring(scrollYProgress, spring);

  return <section className="process section" id="com-funciona"><div className="wrap process-grid">
    <div className="process-intro"><h2>{t.process}</h2><p>{t.confirmation}</p></div>
    <div className="steps-track">
      <div className="steps-line" aria-hidden="true"><motion.span style={reduced ? undefined : { scaleY: progress }} /></div>
      <ol className="steps" ref={list}>{t.steps.map((step, index) => <ProcessStep key={index} text={step} index={index} />)}</ol>
    </div>
  </div></section>;
}

export function FAQ({ t }: { t: Translation }) {
  const prefix = useId();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number[]>([]);

  function toggle(index: number) {
    setOpen(current => current.includes(index) ? current.filter(item => item !== index) : [...current, index]);
  }

  return <section className="section wrap faq" id="preguntes">
    <h2>{t.faq}</h2>
    <div>{t.questions.map(([question, answer], index) => {
      const expanded = open.includes(index);
      const panel = `${prefix}-${index}`;
      return <div className="faq-item" key={index}>
        <h3><button aria-expanded={expanded} aria-controls={panel} onClick={() => toggle(index)}>
          {question}<span aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button></h3>
        <div id={panel} aria-hidden={!expanded}>
          <AnimatePresence initial={false}>
            {expanded && <motion.div className="faq-answer" initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.36, ease }}><p>{answer}</p></motion.div>}
          </AnimatePresence>
        </div>
      </div>;
    })}</div>
  </section>;
}
