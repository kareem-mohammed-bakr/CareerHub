import { FormEvent, useEffect, useMemo, useState } from 'react';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import { ApiRequestError, apiConfigured, restoreSession } from '../api/client';
import { listMyApplications, type MyApplication } from '../api/jobs';
import { careerHubPhotos, trackerGuidePosterUrl, trackerGuideVideoUrl, unsplashLicenseUrl } from '../data/media';
import { csvCell } from '../core/csv.mjs';
import { formatDate, formatNumber, useLocale } from '../core/i18n';

type Stage = 'Interested' | 'Applied' | 'Interview' | 'Offer' | 'Closed';
type Application = { id: string; role: string; company: string; stage: Stage; appliedOn: string; nextStep: string; note: string };
const stages: Stage[] = ['Interested', 'Applied', 'Interview', 'Offer', 'Closed'];
const storageKey = 'careerhub-application-tracker-v1';
const applicationStatusLabel: Record<MyApplication['status'], string> = {
  SUBMITTED: 'Submitted', REVIEWING: 'In review', SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview', OFFER: 'Offer', REJECTED: 'Rejected', HIRED: 'Hired',
};

function readApplications(): Application[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as unknown;
    return Array.isArray(value) ? value as Application[] : [];
  } catch { return []; }
}

function writeApplications(applications: Application[]) {
  try { localStorage.setItem(storageKey, JSON.stringify(applications)); }
  catch { /* Keep the current session usable if browser storage is unavailable. */ }
}

export function ApplicationTrackerPage() {
  const { locale } = useLocale();
  const [applications, setApplications] = useState<Application[]>(readApplications);
  const [accountApplications, setAccountApplications] = useState<MyApplication[]>([]);
  const [accountStatus, setAccountStatus] = useState<'disabled' | 'loading' | 'signed-out' | 'ready' | 'error'>(() => apiConfigured ? 'loading' : 'disabled');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [stage, setStage] = useState<Stage>('Interested');
  const [appliedOn, setAppliedOn] = useState(new Date().toISOString().slice(0, 10));
  const [nextStep, setNextStep] = useState('');
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState<Stage | 'All'>('All');
  const [query, setQuery] = useState('');
  const visibleApplications = useMemo(() => applications.filter((item) => {
    const matchesStage = filter === 'All' || item.stage === filter;
    const matchesText = `${item.role} ${item.company} ${item.note}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesStage && matchesText;
  }), [applications, filter, query]);
  const activeCount = applications.filter((item) => item.stage !== 'Closed').length;

  useEffect(() => {
    if (!apiConfigured) return;
    let active = true;
    void restoreSession().then(async (hasSession) => {
      if (!active) return;
      if (!hasSession) {
        setAccountStatus('signed-out');
        return;
      }
      try {
        const rows = await listMyApplications();
        if (active) { setAccountApplications(rows); setAccountStatus('ready'); }
      } catch (error) {
        if (!active) return;
        setAccountStatus(error instanceof ApiRequestError && error.status === 401 ? 'signed-out' : 'error');
      }
    }).catch(() => { if (active) setAccountStatus('error'); });
    return () => { active = false; };
  }, []);

  function addApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const item: Application = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role: role.trim(), company: company.trim(), stage, appliedOn, nextStep: nextStep.trim(), note: note.trim(),
    };
    const next = [item, ...applications];
    setApplications(next);
    writeApplications(next);
    setRole(''); setCompany(''); setStage('Interested'); setNextStep(''); setNote('');
  }

  function updateStage(id: string, nextStage: Stage) {
    const next = applications.map((item) => item.id === id ? { ...item, stage: nextStage } : item);
    setApplications(next); writeApplications(next);
  }

  function removeApplication(id: string) {
    const next = applications.filter((item) => item.id !== id);
    setApplications(next); writeApplications(next);
  }

  function exportCsv() {
    const header = locale === 'ar' ? ['الوظيفة', 'الشركة', 'المرحلة', 'تاريخ الإضافة', 'الخطوة التالية', 'ملاحظات'] : ['Role', 'Company', 'Stage', 'Date added', 'Next step', 'Notes'];
    const stageLabel = (value: Stage) => locale === 'ar' ? ({ Interested: 'مهتم', Applied: 'تم التقديم', Interview: 'مقابلة', Offer: 'عرض', Closed: 'مغلقة' }[value]) : value;
    const rows = applications.map((item) => [item.role, item.company, stageLabel(item.stage), formatDate(item.appliedOn, locale), item.nextStep, item.note]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'careerhub-application-tracker.csv'; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="site-shell">
    <SiteHeader active="tracker" />
    <main className="inner-page tracker-page" id="top">
      <section className="tracker-hero">
        <div className="tracker-hero-copy"><p className="section-kicker"><span className="status-pulse" /> YOUR SEARCH, IN ONE PLACE</p><h1>Every opportunity.<br /><span>One clear next step.</span></h1><p>{apiConfigured ? 'Your planning notes stay private in this browser. Applications sent through CareerHub appear in your account status panel below.' : 'Keep track of roles, conversations, and follow-ups without losing the details. Your tracker stays private in this browser.'}</p><a className="button button-primary" href="#add-application">Add an opportunity <span aria-hidden="true">↓</span></a><div className="tracker-hero-proof"><span>✓ No account needed</span><span>✓ Export anytime</span><span>✓ Saved on this device</span></div></div>
        <figure className="tracker-hero-image"><a href={careerHubPhotos.interview.page} target="_blank" rel="noreferrer"><img src={careerHubPhotos.interview.src} alt={careerHubPhotos.interview.alt} /></a><figcaption><span>A good opportunity starts with a conversation.</span><a href={careerHubPhotos.interview.page} target="_blank" rel="noreferrer">Unsplash ↗</a></figcaption><span className="tracker-image-label">CAREERHUB APPLICATION TRACKER</span></figure>
      </section>

      <section className="tracker-guide-section" aria-labelledby="tracker-guide-title">
        <div className="story-heading"><div><p className="section-kicker">KEEP THE NEXT STEP VISIBLE</p><h2 id="tracker-guide-title">A calmer way to follow up.</h2><p className="section-subtitle">A short walkthrough of the application tracker and its stages.</p></div><span className="story-length"><span aria-hidden="true">▶</span> 14-second guide</span></div>
        <div className="story-content"><div className="story-video-frame"><video controls preload="metadata" poster={trackerGuidePosterUrl} aria-label="Short guide to using the CareerHub application tracker"><source src={trackerGuideVideoUrl} type="video/mp4" />Open the <a href={trackerGuideVideoUrl}>application tracker guide</a>.</video></div><ol className="story-chapters"><li><span>01</span><div><strong>Add an opportunity</strong><p>Record the role, company, and date.</p></div></li><li><span>02</span><div><strong>Update the stage</strong><p>Move from interested to interview or offer.</p></div></li><li><span>03</span><div><strong>Choose your next step</strong><p>Keep a follow-up note close at hand.</p></div></li></ol></div>
      </section>

      {apiConfigured && <section className="account-applications" aria-labelledby="account-applications-title">
        <div className="section-heading"><div><p className="section-kicker">ACCOUNT TRACKER</p><h2 id="account-applications-title">Applications submitted through CareerHub.</h2><p className="section-subtitle">These statuses come from your signed-in CareerHub account. Manual planning entries below stay on this device.</p></div></div>
        {accountStatus === 'loading' && <div className="account-applications-state" role="status">Loading account applications…</div>}
        {accountStatus === 'signed-out' && <div className="account-applications-state"><p>Sign in to view applications submitted from your account.</p><a className="text-link" href="./careerhub.html#sign-in">Open CareerHub sign in <span aria-hidden="true">↗</span></a></div>}
        {accountStatus === 'error' && <div className="account-applications-state" role="status">Could not load your account applications.</div>}
        {accountStatus === 'ready' && accountApplications.length === 0 && <div className="account-applications-state">No applications have been submitted from this account yet.</div>}
        {accountStatus === 'ready' && accountApplications.length > 0 && <div className="account-applications-list">{accountApplications.map((item) => <article className="account-application-card" key={item.id}>
          <div><p className="section-kicker">SUBMITTED TO CAREERHUB</p><h3 data-i18n-ignore>{item.job.title}</h3><p data-i18n-ignore>{item.job.company.name}</p></div>
          <span className={`account-application-status account-status-${item.status.toLowerCase()}`}>{applicationStatusLabel[item.status]}</span>
          <time dateTime={item.appliedAt}>{formatDate(item.appliedAt.slice(0, 10), locale)}</time>
        </article>)}</div>}
      </section>}

      <section className="tracker-workspace" id="add-application" aria-labelledby="tracker-title">
        <div className="tracker-workspace-heading"><div><p className="section-kicker">YOUR APPLICATION WORKSPACE</p><h2 id="tracker-title">Move each role forward.</h2><p className="section-subtitle">Add an opportunity once, then update it as things change.</p></div><div className="tracker-actions"><button className="button button-outline" type="button" onClick={exportCsv} disabled={applications.length === 0}>Export CSV <span aria-hidden="true">↓</span></button><a className="text-link" href="./resources.html">Open the career toolkit <span aria-hidden="true">↗</span></a></div></div>

        <div className="tracker-stats" aria-label="Application summary"><article><span>TOTAL OPPORTUNITIES</span><strong>{formatNumber(applications.length, locale)}</strong><small>Every role you add</small></article><article><span>IN PROGRESS</span><strong>{formatNumber(activeCount, locale)}</strong><small>Still moving forward</small></article><article><span>INTERVIEWS</span><strong>{formatNumber(applications.filter((item) => item.stage === 'Interview').length, locale)}</strong><small>Conversations underway</small></article><article><span>OFFERS</span><strong>{formatNumber(applications.filter((item) => item.stage === 'Offer').length, locale)}</strong><small>Celebrate every step</small></article></div>

        <div className="tracker-columns">
          <form className="tracker-form" onSubmit={addApplication}>
            <div className="tracker-form-heading"><span className="tracker-form-mark">＋</span><div><h3>Add an opportunity</h3><p>Capture what you know. You can fill in the rest later.</p></div></div>
            <label>Role title<input required maxLength={100} value={role} onChange={(event) => setRole(event.target.value)} placeholder="e.g. Junior Security Analyst" /></label>
            <label>Company<input required maxLength={100} value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company name" /></label>
            <div className="tracker-form-pair"><label>Current stage<select value={stage} onChange={(event) => setStage(event.target.value as Stage)}>{stages.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Date added<input type="date" value={appliedOn} onChange={(event) => setAppliedOn(event.target.value)} /></label></div>
            <label>Next step<input maxLength={140} value={nextStep} onChange={(event) => setNextStep(event.target.value)} placeholder="e.g. Follow up next Tuesday" /></label>
            <label>Notes<textarea rows={3} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="A detail you want to remember…" /></label>
            <button className="button button-primary tracker-submit" type="submit">Save opportunity <span aria-hidden="true">↗</span></button>
            <p className="tracker-private-note"><span>●</span> Saved only in this browser. Nothing is sent to a server.</p>
          </form>

          <div className="tracker-list-panel">
            <div className="tracker-list-heading"><div><h3>My opportunities <span>{applications.length}</span></h3><p>Your progress at a glance.</p></div><label className="tracker-search"><span aria-hidden="true">⌕</span><input aria-label="Search opportunities" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles" /></label></div>
            <div className="tracker-filter-row" aria-label="Filter opportunities by stage"><button type="button" className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All</button>{stages.map((item) => <button type="button" className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
            {visibleApplications.length > 0 ? <div className="application-list">{visibleApplications.map((item) => <article className="application-card" key={item.id}>
              <div className="application-card-top"><div className="application-mark" data-i18n-ignore>{item.company.slice(0, 1).toUpperCase()}</div><div className="application-title"><h4 data-i18n-ignore>{item.role}</h4><p><span data-i18n-ignore>{item.company}</span><span> · </span>{formatDate(item.appliedOn, locale)}</p></div><button className="application-remove" type="button" onClick={() => removeApplication(item.id)} aria-label={`Remove ${item.role} at ${item.company}`}>×</button></div>
              <div className="application-card-meta"><span className={`application-stage stage-${item.stage.toLowerCase()}`}>{item.stage}</span>{item.nextStep && <span className="application-next-step"><b>NEXT</b> <span data-i18n-ignore>{item.nextStep}</span></span>}</div>
              {item.note && <p className="application-note" data-i18n-ignore>{item.note}</p>}
              <label className="application-stage-control">Update stage<select aria-label={`Stage for ${item.role} at ${item.company}`} value={item.stage} onChange={(event) => updateStage(item.id, event.target.value as Stage)}>{stages.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
            </article>)}</div> : <div className="tracker-empty"><span className="empty-orbit">↗</span><h4>{applications.length ? 'No opportunities match.' : 'Your next move starts here.'}</h4><p>{applications.length ? 'Try another stage or search term.' : 'Add a role to make your search easier to follow.'}</p>{applications.length > 0 && <button type="button" className="text-link" onClick={() => { setFilter('All'); setQuery(''); }}>Clear filters <span aria-hidden="true">→</span></button>}</div>}
          </div>
        </div>
      </section>

      <section className="tracker-bottom-banner"><div className="tracker-banner-art"><img src={careerHubPhotos.professional.src} alt={careerHubPhotos.professional.alt} loading="lazy" decoding="async" /></div><div><p className="section-kicker">ONE STEP AT A TIME</p><h2>Good progress is still progress.</h2><p>Use your tracker alongside the Career Toolkit to prepare for each conversation and keep the details that matter in reach.</p><a className="button button-primary" href="./resources.html">Plan my next step <span aria-hidden="true">↗</span></a></div></section>
      <p className="photo-license-note toolkit-license">Images link to their original Unsplash pages and are used under the <a href={unsplashLicenseUrl} target="_blank" rel="noreferrer">Unsplash License</a>. Your tracker data remains in this browser.</p>
    </main>
    <SiteFooter />
  </div>;
}
