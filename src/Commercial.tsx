import { motion, useReducedMotion } from 'framer-motion';
import { config } from './config';
import type { PackageId } from './config';
import type { Language, Translation } from './copy';

export function Packages({ t, lang, selected, onSelect }: {
  t: Translation;
  lang: Language;
  selected?: PackageId;
  onSelect: (value: PackageId) => void;
}) {
  const reduced = useReducedMotion();

  return <section className="section packages" id="packs">
    <div className="wrap">
      <div className="section-head packages-head">
        <div><p className="eyebrow">{t.packagesLabel}</p><h2>{t.packages}</h2></div>
        <p>{t.packagesIntro}</p>
      </div>
      <div className="packages-grid">
        {config.packages.map((item, index) => <motion.article className={`package-card${item.featured ? ' featured' : ''}${selected === item.id ? ' selected' : ''}`} key={item.id}
          initial={reduced ? false : { opacity: 0.55, y: 24, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : index * 0.08 }}>
          {item.featured && <span className="package-badge">{t.featuredPackage}</span>}
          <h3>{item.name[lang]}</h3>
          <p className="package-price">{item.price?.[lang] || t.toConfirm}</p>
          <dl>
            <div><dt>{t.duration}</dt><dd>{item.duration?.[lang] || t.toConfirm}</dd></div>
            <div><dt>{t.participants}</dt><dd>{item.participants?.[lang] || t.toConfirm}</dd></div>
            <div><dt>{t.included}</dt><dd>{item.included.length ? item.included.map(value => value[lang]).join(' · ') : t.toConfirm}</dd></div>
            <div><dt>{t.extras}</dt><dd>{item.extras.length ? item.extras.map(value => value[lang]).join(' · ') : t.toConfirm}</dd></div>
          </dl>
          <a className="button secondary" href="#consulta" aria-pressed={selected === item.id}
            onClick={() => onSelect(item.id)}>{selected === item.id ? t.packageSelected : t.askPackage} →</a>
        </motion.article>)}
      </div>
      <p className="packages-note">{t.packagesNote}</p>
    </div>
  </section>;
}

export function Testimonials({ t, lang }: { t: Translation; lang: Language }) {
  const testimonials = config.testimonials.filter(item => item.verified);
  if (!testimonials.length) return null;

  return <section className="section testimonials" aria-labelledby="testimonials-title">
    <div className="wrap">
      <p className="eyebrow">{t.testimonialsLabel}</p><h2 id="testimonials-title">{t.testimonials}</h2>
      <div className="testimonials-grid">{testimonials.map((item, index) => <figure key={`${item.author}-${index}`}>
        <blockquote>“{item.quote[lang]}”</blockquote>
        <figcaption>{item.author}{item.source ? ` · ${item.source}` : ''}</figcaption>
      </figure>)}</div>
    </div>
  </section>;
}
