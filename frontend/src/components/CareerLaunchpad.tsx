import { useState, type CSSProperties, type FormEvent } from 'react';
import { formatNumber, useLocale } from '../core/i18n';

type Focus = 'discover' | 'cv' | 'interview' | 'network';
type LaunchpadPlan = { role: string; focus: Focus; hours: number; completed: number[] };

const storageKey = 'careerhub-launchpad-plan-v1';
const focusOptions: Array<{ value: Focus; label: string; actions: string[] }> = [
  { value: 'discover', label: 'Find roles that fit', actions: [
    'Write down what a good workday looks like in this role.',
    'Search for 5 roles using the title and its closest alternatives.',
    'Compare responsibilities across 3 promising role descriptions.',
    'Choose 2 roles that match your skills and preferred work style.',
    'Save the strongest opportunity and note what makes it a fit.',
    'Identify one skill that appears often and plan how to practice it.',
    'Review your shortlist and choose one clear next step.',
  ] },
  { value: 'cv', label: 'Improve my CV', actions: [
    'Collect 3 role descriptions and highlight repeated requirements.',
    'Rewrite your CV headline for the kind of role you want.',
    'Move the most relevant skills and experience to the first page.',
    'Turn one responsibility into a clear result or achievement.',
    'Tailor a CV copy to one real role and check the details.',
    'Ask someone you trust to review the first page for clarity.',
    'Save the tailored version and record which role it supports.',
  ] },
  { value: 'interview', label: 'Prepare for interviews', actions: [
    'Choose one project or experience related to your target role.',
    'Draft the situation and task in two short sentences.',
    'Write the specific actions you personally took.',
    'Add the result, evidence, or lesson you can confidently explain.',
    'Prepare a concise answer to “Tell me about yourself.”',
    'Practice one answer aloud and note where it feels unclear.',
    'Prepare two thoughtful questions for a hiring conversation.',
  ] },
  { value: 'network', label: 'Build professional connections', actions: [
    'Write a one-sentence introduction focused on your target role.',
    'List 3 communities, events, or professional groups to explore.',
    'Find 2 people whose work connects to the path you want.',
    'Write a short, personal message with one clear question.',
    'Share a project, lesson, or useful update on your profile.',
    'Follow up with one person or group you already know.',
    'Reflect on what you learned and decide who to contact next.',
  ] },
];

function readPlan(): LaunchpadPlan | null {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as LaunchpadPlan | null;
    return stored && typeof stored.role === 'string' && Array.isArray(stored.completed) ? stored : null;
  } catch {
    return null;
  }
}

export function CareerLaunchpad() {
  const { locale } = useLocale();
  const saved = readPlan();
  const [role, setRole] = useState(saved?.role ?? '');
  const [focus, setFocus] = useState<Focus>(saved?.focus ?? 'discover');
  const [hours, setHours] = useState(saved?.hours ?? 4);
  const [plan, setPlan] = useState<LaunchpadPlan | null>(saved);
  const focusData = focusOptions.find((option) => option.value === (plan?.focus ?? focus)) ?? focusOptions[0];
  const doneCount = plan?.completed.length ?? 0;
  const progress = Math.round((doneCount / 7) * 100);
  const taskMinutes = Math.max(10, Math.round(((plan?.hours ?? hours) * 60) / 7));
  const downloadText = plan
    ? `CareerHub · 7-day launch plan\nTarget: ${plan.role}\nFocus: ${focusOptions.find((option) => option.value === plan.focus)?.label}\nTime: ${plan.hours} hours this week\n\n${focusOptions.find((option) => option.value === plan.focus)?.actions.map((action, index) => `${plan.completed.includes(index) ? '[x]' : '[ ]'} Day ${index + 1}: ${action}`).join('\n')}\n`
    : '';

  function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: LaunchpadPlan = { role: role.trim(), focus, hours: Number(hours), completed: [] };
    setPlan(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Keep the working plan in memory if storage is unavailable. */ }
  }

  function toggleDay(index: number) {
    setPlan((current) => {
      if (!current) return current;
      const completed = current.completed.includes(index)
        ? current.completed.filter((day) => day !== index)
        : [...current.completed, index].sort((a, b) => a - b);
      const next = { ...current, completed };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Keep the working plan in memory if storage is unavailable. */ }
      return next;
    });
  }

  function clearPlan() {
    try { localStorage.removeItem(storageKey); } catch { /* No persistent plan exists to remove. */ }
    setPlan(null);
  }

  return <section className="launchpad-section" id="launchpad" aria-labelledby="launchpad-title">
    <div className="launchpad-heading"><p className="section-kicker">CAREER LAUNCHPAD · A PLAN THAT MOVES WITH YOU</p><h2 id="launchpad-title">Turn your next goal into <span>seven clear steps.</span></h2><p className="section-subtitle">Choose a direction, set a realistic weekly pace, and get a practical plan you can check off as you go.</p></div>
    <div className="launchpad-layout">
      <div className="launchpad-visual" aria-hidden="true">
        <div className="launchpad-planet"><span>7</span><small>DAY PLAN</small></div>
        <span className="launchpad-orbit launchpad-orbit-one" /><span className="launchpad-orbit launchpad-orbit-two" />
        <span className="launchpad-satellite launchpad-satellite-one">01</span><span className="launchpad-satellite launchpad-satellite-two">↗</span>
        <div className="launchpad-float-card"><span className="launchpad-float-dot" /><div><b>One step at a time</b><small>Your plan · your pace</small></div></div>
        <span className="launchpad-star launchpad-star-one">✳</span><span className="launchpad-star launchpad-star-two">✦</span>
      </div>

      <div className="launchpad-builder">
        <form className="launchpad-form" onSubmit={createPlan}>
          <label>Target role<input required maxLength={70} value={role} onChange={(event) => setRole(event.target.value)} placeholder="e.g. Junior Frontend Developer" /></label>
          <div className="launchpad-form-row">
            <label>My main focus<select value={focus} onChange={(event) => setFocus(event.target.value as Focus)}>{focusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label>Time this week<select value={hours} onChange={(event) => setHours(Number(event.target.value))}><option value={2}>2 hours</option><option value={4}>4 hours</option><option value={6}>6 hours</option><option value={8}>8 hours</option></select></label>
          </div>
          <button className="button button-primary launchpad-generate" type="submit">{plan ? 'Refresh my 7-day plan' : 'Build my 7-day plan'} <span aria-hidden="true">✦</span></button>
          <p className="launchpad-local-note"><span>◈</span> Your plan stays in this browser. No account or upload.</p>
        </form>

        {plan ? <div className="launchpad-plan" aria-live="polite">
          <div className="launchpad-plan-top"><div><span className="section-kicker">YOUR PERSONAL LAUNCHPAD</span><h3 data-i18n-ignore>{plan.role}</h3><p>{focusOptions.find((option) => option.value === plan.focus)?.label} · about {formatNumber(taskMinutes, locale)} minutes a day</p></div><span className="launchpad-progress-orb" style={{ '--launchpad-progress': `${progress}%` } as CSSProperties}><b>{formatNumber(doneCount, locale)}</b><small>/ {formatNumber(7, locale)}</small></span></div>
          <div className="launchpad-progress-track" role="progressbar" aria-label="Seven-day plan progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
          <ol className="launchpad-days">{focusData.actions.map((action, index) => <li className={plan.completed.includes(index) ? 'launchpad-day-done' : ''} key={`${focusData.value}-${index}`}><label><input type="checkbox" checked={plan.completed.includes(index)} onChange={() => toggleDay(index)} /><span className="launchpad-day-number">{formatNumber(index + 1, locale).padStart(locale === 'ar' ? 2 : 2, locale === 'ar' ? '٠' : '0')}</span><span className="launchpad-day-copy"><b>Day {formatNumber(index + 1, locale)}</b><span>{action}</span></span></label></li>)}</ol>
          <div className="launchpad-plan-actions"><a className="button button-outline" href={`data:text/markdown;charset=utf-8,${encodeURIComponent(downloadText)}`} download="careerhub-7-day-launch-plan.md">Download my plan ↓</a><button type="button" className="launchpad-reset" onClick={clearPlan}>Start over</button></div>
        </div> : <div className="launchpad-empty"><span>01 — 07</span><h3>Your week, with a little more direction.</h3><p>Pick a goal and a focus. CareerHub will lay out seven practical steps you can adjust by completing them at your own pace.</p><span className="launchpad-empty-line"><i /><i /><i /><i /><i /><i /><i /></span></div>}
      </div>
    </div>
  </section>;
}
