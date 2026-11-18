import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { config } from './config';
import type { Choice } from './config';
import type { Language, Translation } from './copy';

const fields = { date: '', guests: '', time: '', name: '', contact: '', town: '', note: '' };
type Field = keyof typeof fields;
type ErrorField = keyof Translation['errors'];

export function Inquiry({ t, lang, choice, choose }: { t: Translation; lang: Language; choice: Choice; choose: (value: Choice) => void }) {
  const [data, setData] = useState(fields);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<ErrorField[]>([]);
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(new Date());
  const experience = choice === 'undecided' ? t.undecided : config.experiences[choice].name;
  const formattedDate = data.date ? new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(data.date)) : '';
  const timeOptions = { morning: t.morning, afternoon: t.afternoon, evening: t.evening };
  const summary = [
    experience, formattedDate, data.guests && `${t.guests}: ${data.guests}`,
    timeOptions[data.time as keyof typeof timeOptions], data.town, data.name, data.contact, data.note,
  ].filter(Boolean).join('\n');

  function move(next: number, showPreview = false) {
    setErrors([]);
    setStatus('');
    setStep(next);
    setPreview(showPreview);
    requestAnimationFrame(() => heading.current?.focus());
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid: ErrorField[] = [];
    if (step === 1) {
      if (!data.date || data.date < today) invalid.push('date');
      if (!Number.isSafeInteger(Number(data.guests)) || Number(data.guests) < 1) invalid.push('guests');
    }
    if (step === 2) {
      if (!data.name.trim()) invalid.push('name');
      const value = data.contact.trim();
      const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const phone = /^\+?[\d ()-]+$/.test(value) && /^\d{7,15}$/.test(value.replace(/\D/g, ''));
      if (!email && !phone) invalid.push('contact');
    }
    if (invalid.length) {
      setErrors(invalid);
      document.getElementById(invalid[0])?.focus();
      return;
    }
    move(Math.min(step + 1, 2), step === 2);
  }

  function change(field: Field, value: string) {
    setData({ ...data, [field]: value });
    setErrors(errors.filter(error => error !== field));
  }

  function input(field: Field, type = 'text', autocomplete?: string) {
    const invalid = errors.includes(field as ErrorField);
    return <div className="field">
      <label htmlFor={field}>{t[field]}</label>
      <input id={field} type={type} autoComplete={autocomplete} value={data[field]}
        min={field === 'date' ? today : field === 'guests' ? '1' : undefined}
        step={field === 'guests' ? '1' : undefined}
        aria-invalid={invalid || undefined} aria-describedby={invalid ? `${field}-error` : undefined}
        aria-required={['date', 'guests', 'name', 'contact'].includes(field) || undefined}
        onChange={event => change(field, event.target.value)} />
      {invalid && <span className="error" id={`${field}-error`}>{t.errors[field as ErrorField]}</span>}
    </div>;
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setStatus('copied');
    } catch {
      setStatus('copyError');
    }
  }

  return <section className="inquiry section" id="consulta">
    <div className="wrap inquiry-grid">
      <div>
        <h2>{t.form}</h2>
        <p>{t.confirmation}</p>
        <aside className={`invitation invite-${choice}`}>
          <span aria-hidden="true">✦</span>
          <h3>{t.invitation}</h3>
          <p>{experience}</p>
          <p>{formattedDate || t.empty}</p>
          {data.guests && <p>{t.guests} · {data.guests}</p>}
          <span aria-hidden="true">✧</span>
        </aside>
      </div>
      <div className="form-panel">
        {preview ? <>
          <h3 tabIndex={-1} ref={heading}>{t.preview}</h3>
          {config.demoMode && <p>{t.pending}</p>}
          <pre className="summary">{summary}</pre>
          <div className="actions">
            <button className="button primary" onClick={copySummary}>{t.copy}</button>
            <a className="button secondary" href={config.instagramUrl} target="_blank" rel="noreferrer">{t.instagram} ↗</a>
            {config.whatsappNumber && <a className="button secondary" href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(summary)}`} target="_blank" rel="noreferrer">{t.whatsapp} ↗</a>}
          </div>
          <p role="status">{status ? t[status as 'copied' | 'copyError'] : ''}</p>
          <button className="text-button" onClick={() => move(2)}>{t.edit}</button>
          <div className="celebrate" aria-hidden="true">✦　✧　✦　✧</div>
        </> : <form noValidate onSubmit={submit}>
          <div className="progress" aria-label={`${t.progress} ${step + 1} ${t.of} 3`}>
            {[0, 1, 2].map(index => <span key={index} className={index <= step ? 'filled' : ''} />)}
          </div>
          <p className="eyebrow">{t.progress} {step + 1} {t.of} 3</p>
          <h3 tabIndex={-1} ref={heading}>{t.formSteps[step]}</h3>
          {step === 0 && <fieldset className="choices" aria-label={t.formSteps[0]}>
            {(['beauty', 'glow', 'undecided'] as const).map(value => <label key={value}>
              <input type="radio" name="experience" checked={choice === value} onChange={() => choose(value)} />
              {value === 'undecided' ? t.undecided : config.experiences[value].name}
            </label>)}
          </fieldset>}
          {step === 1 && <>
            {input('date', 'date')}{input('guests', 'number')}
            <div className="field"><label htmlFor="time">{t.time}</label>
              <select id="time" value={data.time} onChange={event => change('time', event.target.value)}>
                <option value="">{t.optional}</option>
                {Object.entries(timeOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </>}
          {step === 2 && <>
            {input('name', 'text', 'name')}{input('contact')}{input('town', 'text', 'address-level2')}
            <div className="field"><label htmlFor="note">{t.note}</label>
              <textarea id="note" rows={3} maxLength={400} value={data.note} onChange={event => change('note', event.target.value)} />
            </div>
          </>}
          <div className="actions">
            {step > 0 && <button type="button" className="button secondary" onClick={() => move(step - 1)}>{t.back}</button>}
            <button className="button primary" type="submit">{step === 2 ? t.preview : t.next} <span aria-hidden="true">→</span></button>
          </div>
        </form>}
      </div>
    </div>
  </section>;
}
