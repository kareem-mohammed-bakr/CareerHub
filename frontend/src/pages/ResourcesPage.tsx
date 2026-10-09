import { useState } from 'react';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import { careerHubPhotos, searchGuidePosterUrl, searchGuideVideoUrl, unsplashLicenseUrl } from '../data/media';
import { formatNumber, translateText, useLocale } from '../core/i18n';

const searchSteps = [
  'Choose one target role and two related alternatives.',
  'List the skills and strengths you want your next role to use.',
  'Set your preferred locations and work styles before searching.',
  'Save a small shortlist, then compare responsibilities and requirements.',
  'Tailor your CV for one promising role and write down your next action.',
];

const checklistKey = 'careerhub-search-plan-v1';
const storyKey = 'careerhub-star-story-v1';

type StoryDraft = { situation: string; task: string; action: string; result: string };
const emptyStory: StoryDraft = { situation: '', task: '', action: '', result: '' };

function readSavedStory(): StoryDraft {
  try {
    return { ...emptyStory, ...JSON.parse(localStorage.getItem(storyKey) ?? '{}') as Partial<StoryDraft> };
  } catch {
    return emptyStory;
  }
}

function readSavedSteps() {
  try {
    const saved = JSON.parse(localStorage.getItem(checklistKey) ?? '[]') as boolean[];
    return searchSteps.map((_, index) => saved[index] === true);
  } catch {
    return searchSteps.map(() => false);
  }
}

export function ResourcesPage() {
  const { locale } = useLocale();
  const [completed, setCompleted] = useState<boolean[]>(readSavedSteps);
  const [story, setStory] = useState<StoryDraft>(readSavedStory);
  const [copied, setCopied] = useState(false);
  const doneCount = completed.filter(Boolean).length;
  const progress = Math.round((doneCount / searchSteps.length) * 100);
  const checklistTitle = locale === 'ar' ? 'قائمة CareerHub الأسبوعية للبحث عن وظيفة' : 'CareerHub weekly search checklist';
  const checklistText = `${checklistTitle}\n\n${searchSteps.map((step) => `- [ ] ${translateText(step, locale)}`).join('\n')}\n`;

  function toggleStep(index: number) {
    setCompleted((current) => {
      const next = current.map((value, itemIndex) => itemIndex === index ? !value : value);
      localStorage.setItem(checklistKey, JSON.stringify(next));
      return next;
    });
  }

  function resetPlan() {
    const next = searchSteps.map(() => false);
    localStorage.setItem(checklistKey, JSON.stringify(next));
    setCompleted(next);
  }

  function updateStory(field: keyof StoryDraft, value: string) {
    setStory((current) => {
      const next = { ...current, [field]: value };
      localStorage.setItem(storyKey, JSON.stringify(next));
      return next;
    });
  }

  const storyParts = [
    ['Situation', story.situation], ['Task', story.task], ['Action', story.action], ['Result', story.result],
  ].filter((part) => part[1].trim());
  const storyText = storyParts.map(([label, value]) => `${translateText(label, locale)}: ${value}`).join('\n\n');

  async function copyStory() {
    if (!storyText) return;
    try {
      await navigator.clipboard.writeText(storyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function resetStory() {
    localStorage.removeItem(storyKey);
    setStory(emptyStory);
    setCopied(false);
  }

  return <div className="site-shell">
    <SiteHeader active="resources" />
    <main className="inner-page resources-page" id="top">
      <section className="toolkit-hero">
        <div className="toolkit-hero-copy"><p className="section-kicker">CAREER TOOLKIT</p><h1>A search plan you can <span>come back to.</span></h1><p>Practical prompts for finding relevant roles, building a thoughtful shortlist, and preparing for the next conversation. Your checklist stays in this browser.</p><a className="button button-primary" href="#weekly-plan">Build my search plan <span aria-hidden="true">↓</span></a></div>
        <figure className="toolkit-hero-photo"><a href={careerHubPhotos.creative.page} target="_blank" rel="noreferrer"><img src={careerHubPhotos.creative.src} alt={careerHubPhotos.creative.alt} /></a><figcaption><span>Make space for focused work.</span><a href={careerHubPhotos.creative.page} target="_blank" rel="noreferrer">Photo by Vitaly Gariev ↗</a></figcaption></figure>
      </section>

      <section className="toolkit-film-section" aria-labelledby="search-film-title">
        <div className="story-heading"><div><p className="section-kicker">A BETTER SEARCH, STEP BY STEP</p><h2 id="search-film-title">Turn a big search into small actions.</h2><p className="section-subtitle">A short visual guide to getting focused and moving forward.</p></div><span className="story-length"><span aria-hidden="true">▶</span> 18-second guide</span></div>
        <div className="story-content">
          <div className="story-video-frame"><video controls preload="metadata" poster={searchGuidePosterUrl} aria-label="Short guide to planning a focused job search"><source src={searchGuideVideoUrl} type="video/mp4" />Open the <a href={searchGuideVideoUrl}>CareerHub search guide video</a>.</video></div>
          <ol className="story-chapters" aria-label="Job search guide chapters">
            <li><span>01</span><div><strong>Choose a direction</strong><p>Set a target role, location, and work style.</p></div></li>
            <li><span>02</span><div><strong>Make a shortlist</strong><p>Compare a few relevant opportunities with care.</p></div></li>
            <li><span>03</span><div><strong>Prepare one next step</strong><p>Focus your CV and notes on a single opportunity.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="weekly-plan-section" id="weekly-plan" aria-labelledby="weekly-plan-title">
        <div className="plan-heading"><div><p className="section-kicker">YOUR PERSONAL SEARCH PLAN</p><h2 id="weekly-plan-title">Five small steps. Your pace.</h2><p className="section-subtitle">Tick off a step as you go. Progress is saved only in this browser.</p></div><a className="button button-outline checklist-download" href={`data:text/markdown;charset=utf-8,${encodeURIComponent(checklistText)}`} download="careerhub-search-checklist.md">Download checklist <span aria-hidden="true">↓</span></a></div>
        <div className="plan-card">
          <div className="plan-progress-row"><div><strong>{doneCount} of {searchSteps.length} steps complete</strong><span>Start with the next step that feels useful.</span></div><button className="plan-reset" type="button" onClick={resetPlan} disabled={doneCount === 0}>Reset</button></div>
          <div className="plan-progress-track" role="progressbar" aria-label="Search plan progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
          <div className="plan-checklist">{searchSteps.map((step, index) => <label className={`plan-step ${completed[index] ? 'plan-step-complete' : ''}`} key={step}><input type="checkbox" checked={completed[index]} onChange={() => toggleStep(index)} /><span className="plan-step-number">{String(index + 1).padStart(2, '0')}</span><span>{step}</span></label>)}</div>
        </div>
      </section>

      <section className="story-lab-section" id="story-lab" aria-labelledby="story-lab-title">
        <div className="story-lab-intro"><span className="story-lab-orb" aria-hidden="true"><b>STAR</b></span><p className="section-kicker">INTERVIEW STORY STUDIO</p><h2 id="story-lab-title">Make your experience <span>easy to follow.</span></h2><p>Shape one real example into a clear interview answer. Your draft saves in this browser and stays on this device.</p><a className="text-link" href="#toolkit-cards-title">Explore more career prompts <span aria-hidden="true">↓</span></a></div>
        <div className="story-lab-workspace">
          <div className="story-lab-fields">
            <label><span><b>S</b> Situation</span><small>What was happening?</small><textarea value={story.situation} onChange={(event) => updateStory('situation', event.target.value)} placeholder="Set the scene in one or two sentences." rows={3} /></label>
            <label><span><b>T</b> Task</span><small>What needed to be done?</small><textarea value={story.task} onChange={(event) => updateStory('task', event.target.value)} placeholder="Describe your responsibility or goal." rows={3} /></label>
            <label><span><b>A</b> Action</span><small>What did you do?</small><textarea value={story.action} onChange={(event) => updateStory('action', event.target.value)} placeholder="Focus on the steps you personally took." rows={3} /></label>
            <label><span><b>R</b> Result</span><small>What changed?</small><textarea value={story.result} onChange={(event) => updateStory('result', event.target.value)} placeholder="Share the outcome, evidence, or lesson." rows={3} /></label>
          </div>
          <aside className="story-lab-preview" aria-live="polite">
            <div className="story-lab-preview-top"><span className="preview-orbit-mark">✳</span><span>DRAFT PREVIEW</span><span>{formatNumber(storyText.length, locale)} chars</span></div>
            <h3>Your interview story</h3>
            {storyParts.length ? <div className="story-lab-output">{storyParts.map(([label, value]) => <p key={label}><b>{label}</b><span data-i18n-ignore>{value}</span></p>)}</div> : <p className="story-lab-empty">Your answer takes shape here as you add each part. Start with a real moment you can explain clearly.</p>}
            <div className="story-lab-actions"><button className="button button-primary" type="button" onClick={copyStory} disabled={!storyText}>{copied ? 'Copied to clipboard ✓' : 'Copy my answer ↗'}</button><button className="story-lab-reset" type="button" onClick={resetStory} disabled={!storyText}>Clear draft</button></div>
            <small className="story-lab-privacy">Saved locally in this browser · No account needed</small>
          </aside>
        </div>
      </section>

      <section className="toolkit-cards-section" aria-labelledby="toolkit-cards-title">
        <div className="section-heading"><div><p className="section-kicker">TOOLS FOR THE NEXT STEP</p><h2 id="toolkit-cards-title">Useful prompts, not more noise.</h2><p className="section-subtitle">Use these cards as a starting point and adapt them to your own search.</p></div></div>
        <div className="toolkit-card-grid">
          <article className="toolkit-card"><a className="toolkit-card-image" href={careerHubPhotos.professional.page} target="_blank" rel="noreferrer"><img src={careerHubPhotos.professional.src} alt={careerHubPhotos.professional.alt} loading="lazy" decoding="async" /></a><div className="toolkit-card-body"><span className="toolkit-card-label">CV FOCUS</span><h3>Make the first page count.</h3><p>Move the most relevant experience, skills, and results close to the role you want.</p><ul><li>Mirror the language of the role honestly.</li><li>Show outcomes, not only responsibilities.</li><li>Keep a tailored copy for each application.</li></ul></div></article>
          <article className="toolkit-card"><a className="toolkit-card-image" href={careerHubPhotos.interview.page} target="_blank" rel="noreferrer"><img src={careerHubPhotos.interview.src} alt={careerHubPhotos.interview.alt} loading="lazy" decoding="async" /></a><div className="toolkit-card-body"><span className="toolkit-card-label">INTERVIEW STORIES</span><h3>Prepare examples you can explain.</h3><p>Use a simple structure to make your experience easy to follow.</p><div className="star-grid"><span><b>S</b> Situation</span><span><b>T</b> Task</span><span><b>A</b> Action</span><span><b>R</b> Result</span></div></div></article>
          <article className="toolkit-card"><a className="toolkit-card-image" href={careerHubPhotos.creative.page} target="_blank" rel="noreferrer"><img src={careerHubPhotos.creative.src} alt={careerHubPhotos.creative.alt} loading="lazy" decoding="async" /></a><div className="toolkit-card-body"><span className="toolkit-card-label">ROLE COMPARISON</span><h3>Compare the work, not just the title.</h3><p>Check the responsibilities, must-have skills, work style, and growth path before you decide.</p><a className="text-link" href="./careerhub.html#roles">Explore sample roles <span aria-hidden="true">→</span></a></div></article>
        </div>
      </section>

      <section className="toolkit-image-strip" aria-label="CareerHub community at work"><a href={careerHubPhotos.interview.page} target="_blank" rel="noreferrer"><img src={careerHubPhotos.interview.src} alt={careerHubPhotos.interview.alt} loading="lazy" decoding="async" /></a><div><p className="section-kicker">MAKE YOUR NEXT MOVE WITH INTENTION</p><h2>Focus on the work that fits.</h2><p>Explore illustrative roles in CareerHub, save a few, and use this toolkit to prepare your next step.</p><div className="toolkit-end-actions"><a className="button button-primary" href="./careerhub.html#roles">Explore the preview <span aria-hidden="true">↗</span></a><a className="text-link" href="./tracker.html">Track applications <span aria-hidden="true">→</span></a></div></div></section>
      <p className="photo-license-note toolkit-license">Photography links open the original Unsplash pages. Images are used under the <a href={unsplashLicenseUrl} target="_blank" rel="noreferrer">Unsplash License</a>.</p>
    </main>
    <SiteFooter />
  </div>;
}
