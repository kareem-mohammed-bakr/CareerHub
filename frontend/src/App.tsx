import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ApiRequestError, apiConfigured, restoreSession, setAccessToken } from './api/client';
import { login, register, type Role } from './api/auth';
import { applyToJob, listJobCategories, listJobs, type PublishedJob } from './api/jobs';
import { SiteFooter, SiteHeader } from './components/SiteChrome';
import { CareerLaunchpad } from './components/CareerLaunchpad';
import { AboutPage } from './pages/AboutPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ApplicationTrackerPage } from './pages/ApplicationTrackerPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { CareerGuide } from './components/CareerGuide';
import { careerHubPhotos, heroRooftopPosterUrl, heroRooftopSourceUrl, heroRooftopVideoUrl, overviewPosterUrl, overviewVideoUrl, profilePortraitUrl, unsplashLicenseUrl } from './data/media';
import { formatNumber, normalizeSearchTerm, translateText, useLocale, type Locale } from './core/i18n';
import './styles.css';

type Job = {
  id: string;
  title: string;
  company: string;
  initials: string;
  category: string;
  location: string;
  workplace: 'Remote' | 'Hybrid' | 'On-site';
  type: string;
  level: string;
  salary: string;
  posted: string;
  accent: string;
  featured?: boolean;
  tags: string[];
  summary: string;
  responsibilities: string[];
  requirements?: string | null;
  image?: string;
  imageAlt?: string;
  imagePage?: string;
  companyLogo?: string | null;
  isPublished?: boolean;
};

const sampleJobs: Job[] = [
  {
    id: 'product-designer', title: 'Senior Product Designer', company: 'Numa Studio', initials: 'N',
    category: 'Design', location: 'Cairo, Egypt', workplace: 'Hybrid', type: 'Full-time', level: 'Senior',
    salary: 'EGP 55k–75k / month', posted: '2 days ago', accent: 'lilac', featured: true,
    tags: ['Product design', 'Figma', 'Design systems'], image: careerHubPhotos.creative.src, imageAlt: careerHubPhotos.creative.alt, imagePage: careerHubPhotos.creative.page,
    summary: 'Shape simple, thoughtful experiences for products used by people across the region. You will partner closely with product and engineering from early discovery through launch.',
    responsibilities: ['Turn customer insights into clear journeys and polished interfaces.', 'Build and evolve a design system with the product team.', 'Prototype ideas, test them with users, and share what you learn.']
  },
  {
    id: 'frontend-engineer', title: 'Frontend Engineer', company: 'Orbit Health', initials: 'O',
    category: 'Engineering', location: 'Remote · MENA', workplace: 'Remote', type: 'Full-time', level: 'Mid-level',
    salary: 'EGP 45k–65k / month', posted: '1 day ago', accent: 'mint', featured: true,
    tags: ['React', 'TypeScript', 'Accessibility'], image: careerHubPhotos.professional.src, imageAlt: careerHubPhotos.professional.alt, imagePage: careerHubPhotos.professional.page,
    summary: 'Help make everyday healthcare easier to navigate. You will build fast, accessible product experiences alongside a small, supportive engineering team.',
    responsibilities: ['Deliver responsive features with React and TypeScript.', 'Work with design to turn prototypes into reliable interfaces.', 'Improve accessibility, performance, and frontend quality.']
  },
  {
    id: 'product-manager', title: 'Product Manager, Marketplace', company: 'Northstar', initials: 'N',
    category: 'Product', location: 'Dubai, UAE', workplace: 'Hybrid', type: 'Full-time', level: 'Mid-level',
    salary: 'AED 18k–24k / month', posted: '3 days ago', accent: 'blue',
    tags: ['Roadmapping', 'Analytics', 'Marketplace'], image: careerHubPhotos.interview.src, imageAlt: careerHubPhotos.interview.alt, imagePage: careerHubPhotos.interview.page,
    summary: 'Bring buyers and independent makers together in a more useful marketplace. You will own a focused product area and make progress visible to the whole team.',
    responsibilities: ['Set goals and priorities with design, engineering, and operations.', 'Use research and product data to identify opportunities.', 'Ship improvements and measure their impact.']
  },
  {
    id: 'data-analyst', title: 'Data Analyst', company: 'Atlas Finance', initials: 'A',
    category: 'Data', location: 'Cairo, Egypt', workplace: 'On-site', type: 'Full-time', level: 'Entry level',
    salary: 'EGP 28k–38k / month', posted: '4 days ago', accent: 'sand',
    tags: ['SQL', 'Dashboards', 'Business insights'], image: careerHubPhotos.professional.src, imageAlt: careerHubPhotos.professional.alt, imagePage: careerHubPhotos.professional.page,
    summary: 'Turn customer and business data into decisions people can act on. This is a hands-on role for a curious analyst who enjoys asking clear questions.',
    responsibilities: ['Build trusted dashboards and recurring reports.', 'Explore data with SQL and communicate the story behind it.', 'Partner with teams to define useful success measures.']
  },
  {
    id: 'content-strategist', title: 'Content Strategist', company: 'Brightside', initials: 'B',
    category: 'Marketing', location: 'Remote · MENA', workplace: 'Remote', type: 'Full-time', level: 'Mid-level',
    salary: 'EGP 32k–45k / month', posted: '5 days ago', accent: 'rose',
    tags: ['Content design', 'SEO', 'Storytelling'], image: careerHubPhotos.creative.src, imageAlt: careerHubPhotos.creative.alt, imagePage: careerHubPhotos.creative.page,
    summary: 'Create useful stories that help people understand their options and take the next step. You will work across product, brand, and growth.',
    responsibilities: ['Plan and write clear content for digital channels.', 'Shape content strategy around real audience needs.', 'Use performance insights to improve what we publish.']
  },
  {
    id: 'customer-success', title: 'Customer Success Associate', company: 'RelayCloud', initials: 'R',
    category: 'Operations', location: 'Amman, Jordan', workplace: 'Hybrid', type: 'Full-time', level: 'Entry level',
    salary: 'JOD 900–1,200 / month', posted: '1 week ago', accent: 'peach',
    tags: ['Customer care', 'Onboarding', 'Communication'], image: careerHubPhotos.interview.src, imageAlt: careerHubPhotos.interview.alt, imagePage: careerHubPhotos.interview.page,
    summary: 'Help growing teams get real value from their tools. You will guide new customers through onboarding and make sure their feedback reaches the right people.',
    responsibilities: ['Welcome customers and guide their first steps.', 'Answer questions with care and follow through on open issues.', 'Spot patterns in feedback and share them with the team.']
  }
];

const categories = ['All roles', 'Engineering', 'Design', 'Product', 'Data', 'Marketing', 'Operations'];

function toPublishedJob(job: PublishedJob, locale: Locale): Job {
  const currency = job.currency.toUpperCase();
  const formatMoney = (value: number) => {
    try { return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value); }
    catch { return `${currency} ${new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en').format(value)}`; }
  };
  const salary = job.salaryMin !== null || job.salaryMax !== null
    ? [job.salaryMin === null ? '' : formatMoney(job.salaryMin), job.salaryMax === null ? '' : formatMoney(job.salaryMax)].filter(Boolean).join(' – ')
    : 'Salary not listed';
  const accentSet = ['lilac', 'mint', 'blue', 'sand', 'rose', 'peach'];
  const accentIndex = [...job.id].reduce((value, character) => value + character.charCodeAt(0), 0) % accentSet.length;
  const workplace: Record<PublishedJob['workplaceType'], Job['workplace']> = { REMOTE: 'Remote', HYBRID: 'Hybrid', ONSITE: 'On-site' };
  const employment: Record<PublishedJob['employmentType'], string> = {
    FULL_TIME: 'Full-time', PART_TIME: 'Part-time', CONTRACT: 'Contract', INTERNSHIP: 'Internship', FREELANCE: 'Freelance',
  };
  const experience: Record<PublishedJob['experienceLevel'], string> = {
    ENTRY: 'Entry level', JUNIOR: 'Junior', MID: 'Mid-level', SENIOR: 'Senior', LEAD: 'Lead', EXECUTIVE: 'Executive',
  };
  const requirements = job.requirements?.trim() ?? '';
  const tags = requirements.split(/[\r\n,;•]+/).map((item) => item.replace(/^[-*\s]+/, '').trim()).filter(Boolean).slice(0, 4);
  const publishedOn = job.publishedAt ? new Date(job.publishedAt) : null;

  return {
    id: job.id,
    title: job.title,
    company: job.company.name,
    initials: job.company.name.trim().slice(0, 1).toUpperCase() || 'C',
    category: job.category,
    location: job.location || 'Location not specified',
    workplace: workplace[job.workplaceType],
    type: employment[job.employmentType],
    level: experience[job.experienceLevel],
    salary,
    posted: publishedOn && !Number.isNaN(publishedOn.getTime())
      ? new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en', { dateStyle: 'medium' }).format(publishedOn)
      : '',
    accent: accentSet[accentIndex],
    tags,
    summary: job.description,
    responsibilities: [],
    requirements,
    companyLogo: job.company.logoUrl,
    isPublished: true,
  };
}

function App() {
  const path = window.location.pathname.toLowerCase();
  if (!path.endsWith('.html') || path.endsWith('/index.html')) return <PortfolioPage />;
  const page = path.endsWith('/careerhub.html') ? <HomePage />
    : path.endsWith('/about.html') ? <AboutPage />
      : path.endsWith('/resources.html') ? <ResourcesPage />
        : path.endsWith('/tracker.html') ? <ApplicationTrackerPage />
          : <PortfolioPage />;
  return <>{page}<CareerGuide /></>;
}

function HomePage() {
  const { locale } = useLocale();
  useEffect(() => {
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    if (!targetId) return;
    requestAnimationFrame(() => {
      if (targetId === 'sign-in') openAuth('login');
      else document.getElementById(targetId)?.scrollIntoView();
    });
  }, []);

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('All roles');
  const [workplace, setWorkplace] = useState('All work styles');
  const [jobs, setJobs] = useState<Job[]>(() => apiConfigured ? [] : sampleJobs);
  const [jobStatus, setJobStatus] = useState<'preview' | 'loading' | 'ready' | 'error'>(() => apiConfigured ? 'loading' : 'preview');
  const [apiCategories, setApiCategories] = useState<string[]>([]);
  const [jobRefresh, setJobRefresh] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('careerhub-saved-jobs') ?? '[]') as string[]; }
    catch { return []; }
  });
  const [savedOnly, setSavedOnly] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('JOB_SEEKER');
  const [authMessage, setAuthMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!apiConfigured) return;
    const controller = new AbortController();
    listJobCategories(controller.signal).then(setApiCategories).catch(() => setApiCategories([]));
    restoreSession().then(setSignedIn).catch(() => setSignedIn(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!apiConfigured) return;
    const controller = new AbortController();
    setJobStatus('loading');
    const timer = window.setTimeout(() => {
      void listJobs({
        q: normalizeSearchTerm(query, locale),
        location: normalizeSearchTerm(location, locale),
        category: category === 'All roles' ? undefined : category,
      }, controller.signal).then((results) => {
        setJobs(results.map((job) => toPublishedJob(job, locale)));
        setJobStatus('ready');
      }).catch(() => {
        if (!controller.signal.aborted) {
          setJobs([]);
          setJobStatus('error');
        }
      });
    }, 240);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, location, category, locale, jobRefresh]);

  const filteredJobs = useMemo(() => {
    const term = normalizeSearchTerm(query, locale);
    const place = normalizeSearchTerm(location, locale);
    return jobs.filter((job) => {
      const localizedValues = [job.title, job.category, job.workplace, job.location, ...job.tags].map((value) => translateText(value, locale));
      const matchesText = !term || [job.title, job.company, job.category, ...job.tags, ...localizedValues].join(' ').toLowerCase().includes(term);
      const matchesLocation = !place || `${job.location} ${translateText(job.location, locale)}`.toLowerCase().includes(place);
      const matchesCategory = category === 'All roles' || job.category === category;
      const matchesWorkplace = workplace === 'All work styles' || job.workplace === workplace;
      const matchesSaved = !savedOnly || savedIds.includes(job.id);
      return matchesText && matchesLocation && matchesCategory && matchesWorkplace && matchesSaved;
    });
  }, [jobs, query, location, category, workplace, savedOnly, savedIds, locale]);

  const categoryOptions = apiConfigured
    ? ['All roles', ...apiCategories]
    : categories;

  function toggleSaved(jobId: string) {
    setSavedIds((current) => {
      const next = current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId];
      localStorage.setItem('careerhub-saved-jobs', JSON.stringify(next));
      return next;
    });
  }

  function openAuth(mode: 'register' | 'login' = 'register') {
    setAuthMode(mode);
    setAuthMessage('');
    setAuthOpen(true);
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiConfigured) {
      setAuthMessage('This showcase is running in preview mode. Account access will be available when the API is deployed.');
      return;
    }
    setAuthLoading(true);
    setAuthMessage('');
    try {
      const data = authMode === 'register' ? await register(email, password, role) : await login(email, password);
      setAccessToken(data.accessToken ?? null);
      if (authMode === 'login') {
        setSignedIn(true);
        setAuthOpen(false);
        setPassword('');
      } else {
        setAuthMessage('Account created. Email verification delivery is not configured, so sign-in is unavailable until that service is connected.');
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function submitApplication() {
    if (!activeJob?.isPublished) return;
    setApplicationMessage('');
    if (!signedIn) {
      setAuthMode('login');
      setAuthMessage('Sign in with a job-seeker account before applying.');
      setAuthOpen(true);
      return;
    }
    setApplicationLoading(true);
    try {
      await applyToJob(activeJob.id);
      setAppliedJobIds((current) => current.includes(activeJob.id) ? current : [...current, activeJob.id]);
      setApplicationMessage('Application submitted. You can review its status in your application tracker.');
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        setSignedIn(false);
        setAuthMode('login');
        setAuthMessage('Your session has expired. Sign in again before applying.');
        setAuthOpen(true);
      } else {
        setApplicationMessage(error instanceof Error ? error.message : 'The application could not be submitted. Please try again.');
      }
    } finally {
      setApplicationLoading(false);
    }
  }

  return (
    <div className="site-shell">
      <SiteHeader active="jobs" onSignIn={() => openAuth('login')} onJoin={() => openAuth('register')} />

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="sparkle">✳</span> A SPACE FOR WHAT’S NEXT</div>
            <h1 className="hero-title">Find work that<br /><span className="hero-word-window" aria-label="moves you forward"><span className="hero-word-track"><span>moves you forward.</span><span>feels like you.</span><span>fits your future.</span><span>moves you forward.</span></span></span></h1>
            <p className="hero-description">A more thoughtful way to find your next opportunity. Explore roles, save the ones you love, and take your next step with confidence.</p>
            <form className="search-panel" onSubmit={(event) => { event.preventDefault(); document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <label className="search-field"><span className="search-icon" aria-hidden="true">⌕</span><input aria-label="Search jobs, skills, or companies" placeholder="Job title, skill, or company" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
              <span className="search-separator" />
              <label className="search-field location-field"><span className="pin-icon" aria-hidden="true">⌖</span><input aria-label="Location" placeholder="City or remote" value={location} onChange={(event) => setLocation(event.target.value)} /></label>
              <button className="button button-primary search-button" type="submit">Find a role <span aria-hidden="true">→</span></button>
            </form>
            <div className="hero-note"><span className="note-check">✓</span> {apiConfigured ? 'Search published CareerHub roles with filters that respond as you type.' : 'Search the preview instantly — your filters stay on this page.'}</div>
            <a className="hero-launchpad-link" href="#launchpad"><span>✦</span> Build my 7-day career plan <b aria-hidden="true">↘</b></a>
          </div>
          <figure className="hero-art hero-film-art">
            <div className="hero-film-frame">
              <video className="hero-film-video" muted autoPlay loop playsInline preload="metadata" poster={heroRooftopPosterUrl} aria-label={locale === 'ar' ? 'شخص يقف أمام أفق المدينة ليلًا' : 'A lone figure looking out over a city at night'}>
                <source src={heroRooftopVideoUrl} type="video/mp4" />
              </video>
              <div className="hero-film-caption"><span>CAREERHUB · {locale === 'ar' ? 'فصلك القادم' : 'YOUR NEXT CHAPTER'}</span><strong>{locale === 'ar' ? 'انطلق نحو فرصتك.' : 'Find your way forward.'}</strong><small>{locale === 'ar' ? 'كل فرصة جديدة تبدأ بخطوة.' : 'A cinematic view of ambition and possibility.'}</small></div>
              <a className="hero-film-credit" href={heroRooftopSourceUrl} target="_blank" rel="noreferrer">Film by Pat Whelen · Pexels ↗</a>
              <span className="hero-film-index" aria-hidden="true">01 <i /> 03</span>
            </div>
          </figure>
        </section>

        <section className="value-strip" aria-label="CareerHub benefits">
          <div><span className="value-icon">⌕</span><p><strong>Search with purpose</strong><small>Find roles that match what matters to you.</small></p></div>
          <div><span className="value-icon value-icon-green">♡</span><p><strong>Save for later</strong><small>Keep your shortlist in one simple place.</small></p></div>
          <div><span className="value-icon value-icon-orange">↗</span><p><strong>Take the next step</strong><small>Move from discovery to action with clarity.</small></p></div>
        </section>

        <section className="jobs-section" id="roles">
          <div className="section-heading">
            <div><p className="section-kicker">A GOOD PLACE TO START</p><h2>Roles with room to grow.</h2><p className="section-subtitle">{apiConfigured ? 'Browse published roles from the CareerHub job database, then narrow the list to fit your search.' : 'A hand-picked set of sample opportunities to explore how CareerHub works.'}</p></div>
            <button className={`saved-toggle ${savedOnly ? 'saved-toggle-active' : ''}`} onClick={() => setSavedOnly((value) => !value)} aria-pressed={savedOnly}><span>♡</span> Saved <b>{savedIds.length}</b></button>
          </div>
          <div className="filter-row" aria-label="Filter roles by category">
            {categoryOptions.map((item) => <button key={item} className={`filter-chip ${category === item ? 'filter-chip-active' : ''}`} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}
            <label className="workplace-select"><span className="sr-only">Work style</span><select value={workplace} onChange={(event) => setWorkplace(event.target.value)}><option value="All work styles">All work styles</option><option value="Remote">Remote</option><option value="Hybrid">Hybrid</option><option value="On-site">On-site</option></select><span aria-hidden="true">⌄</span></label>
          </div>
          <div className="results-line"><span><strong>{formatNumber(filteredJobs.length, locale)}</strong> {jobStatus === 'preview' ? 'sample roles' : 'published roles'}</span><span className="sample-label"><span className="sample-label-dot" />{jobStatus === 'preview' ? 'Illustrative listings' : 'Live CareerHub listings'}</span></div>
          {jobStatus === 'loading' ? <div className="empty-state job-loading" role="status"><span className="loading-orbit" aria-hidden="true">✦</span><h3>Loading published CareerHub roles…</h3><p>Searching the live job listings with your current filters.</p></div>
            : filteredJobs.length ? <div className="job-grid">{filteredJobs.map((job) => <JobCard key={job.id} job={job} saved={savedIds.includes(job.id)} onSave={() => toggleSaved(job.id)} onOpen={() => { setActiveJob(job); setApplicationMessage(''); }} />)}</div>
              : <div className="empty-state"><span>⌕</span><h3>{jobStatus === 'error' ? 'Could not load published roles.' : 'No roles match those filters.'}</h3><p>{jobStatus === 'error' ? 'The live job service could not be reached. Try again in a moment.' : 'Try another title, location, or category to see more opportunities.'}</p>{jobStatus === 'error' && <button className="button button-primary" onClick={() => setJobRefresh((value) => value + 1)}>Try again</button>}<button className="button button-outline" onClick={() => { setQuery(''); setLocation(''); setCategory('All roles'); setWorkplace('All work styles'); setSavedOnly(false); }}>Clear filters</button></div>}
          {jobStatus === 'preview' && <p className="sample-disclaimer">Preview content only. These sample roles are fictional and are not current job openings.</p>}
        </section>

        <section className="steps-section" id="how-it-works">
          <div className="steps-intro"><p className="section-kicker">A BETTER WAY TO MOVE FORWARD</p><h2>Less scrolling.<br /><span>More direction.</span></h2><p>CareerHub brings the job search into focus, so you can spend less time sorting through noise and more time making your next move.</p><a className="text-link" href="#roles">Explore the preview <span aria-hidden="true">→</span></a></div>
          <div className="steps-list">
            <article className="step-card"><span className="step-number">01</span><div><h3>Find your kind of work</h3><p>Search by role, skill, location, or work style to get to relevant options faster.</p></div><span className="step-symbol">⌕</span></article>
            <article className="step-card"><span className="step-number">02</span><div><h3>Build a thoughtful shortlist</h3><p>Save promising roles and come back when you are ready to take a closer look.</p></div><span className="step-symbol step-symbol-green">♡</span></article>
            <article className="step-card"><span className="step-number">03</span><div><h3>Move with confidence</h3><p>Get the details you need to decide whether an opportunity is right for you.</p></div><span className="step-symbol step-symbol-orange">↗</span></article>
          </div>
        </section>

        <CareerLaunchpad />

        <section className="story-section" id="project-story" aria-labelledby="story-title">
          <div className="story-heading">
            <div><p className="section-kicker">A QUICK LOOK AT CAREERHUB</p><h2 id="story-title">A clearer way to find your next move.</h2><p className="section-subtitle">A short, custom-made walkthrough of the idea behind the project.</p></div>
            <span className="story-length"><span aria-hidden="true">▶</span> 22-second overview · captions on screen</span>
          </div>
          <div className="story-content">
          <div className="story-video-frame">
              <video controls preload="metadata" poster={overviewPosterUrl} aria-label="CareerHub project overview video">
                <source src={overviewVideoUrl} type="video/mp4" />
                Your browser does not support embedded video. <a href={overviewVideoUrl}>Open the CareerHub overview video.</a>
              </video>
            </div>
            <ol className="story-chapters" aria-label="What the video covers">
              <li><span>01</span><div><strong>Discover with focus</strong><p>Search by role, skill, location, and work style.</p></div></li>
              <li><span>02</span><div><strong>Keep a useful shortlist</strong><p>Save interesting roles and return to them later.</p></div></li>
              <li><span>03</span><div><strong>Understand the opportunity</strong><p>Review role details before choosing a next step.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="inspiration-section" aria-labelledby="inspiration-title">
          <div className="story-heading inspiration-heading">
            <div><p className="section-kicker">PEOPLE AND POSSIBILITIES</p><h2 id="inspiration-title">Work is personal. The search can feel clearer.</h2><p className="section-subtitle">Editorial workplace photography chosen to reflect the people and teams CareerHub is designed for.</p></div>
          </div>
          <div className="photo-grid">
            <figure className="photo-card photo-card-wide">
              <a href="https://unsplash.com/photos/man-working-on-laptop-in-modern-office-space-IKgE2DyCIoE" target="_blank" rel="noreferrer" aria-label="Open the original photo on Unsplash">
                <img src={careerHubPhotos.professional.src} alt={careerHubPhotos.professional.alt} loading="lazy" decoding="async" />
              </a>
              <figcaption><span>For every next chapter</span><a href="https://unsplash.com/photos/man-working-on-laptop-in-modern-office-space-IKgE2DyCIoE" target="_blank" rel="noreferrer">Photo by Vitaly Gariev on Unsplash ↗</a></figcaption>
            </figure>
            <figure className="photo-card">
              <a href="https://unsplash.com/photos/woman-working-on-laptop-in-busy-modern-office-xgrP2icJduE" target="_blank" rel="noreferrer" aria-label="Open the original photo on Unsplash">
                <img src={careerHubPhotos.creative.src} alt={careerHubPhotos.creative.alt} loading="lazy" decoding="async" />
              </a>
              <figcaption><span>Built around real work</span><a href="https://unsplash.com/photos/woman-working-on-laptop-in-busy-modern-office-xgrP2icJduE" target="_blank" rel="noreferrer">Photo by Vitaly Gariev on Unsplash ↗</a></figcaption>
            </figure>
            <figure className="photo-card">
              <a href={careerHubPhotos.interview.page} target="_blank" rel="noreferrer" aria-label="Open the original interview photo on Unsplash">
                <img src={careerHubPhotos.interview.src} alt={careerHubPhotos.interview.alt} loading="lazy" decoding="async" />
              </a>
              <figcaption><span>Better conversations, clearer roles</span><a href={careerHubPhotos.interview.page} target="_blank" rel="noreferrer">Open photo source on Unsplash ↗</a></figcaption>
            </figure>
          </div>
          <p className="photo-license-note">Images are used under the <a href={unsplashLicenseUrl} target="_blank" rel="noreferrer">Unsplash License</a>.</p>
        </section>

        <section className="teams-cta" id="for-teams">
          <div className="teams-icon">✳</div><div><p className="section-kicker">HIRING FOR YOUR TEAM?</p><h2>Meet people ready for their next chapter.</h2><p>CareerHub is being built for candidates and the teams looking for them.</p></div><button className="button button-light" onClick={() => openAuth('register')}>Join the preview <span aria-hidden="true">↗</span></button>
        </section>

        <section className="quick-tools-section" aria-labelledby="quick-tools-title">
          <div className="section-heading"><div><p className="section-kicker">TOOLS FOR THE WHOLE SEARCH</p><h2 id="quick-tools-title">From first idea to final follow-up.</h2><p className="section-subtitle">CareerHub gives your search a few useful places to land.</p></div></div>
          <div className="quick-tools-grid">
            <a className="quick-tool-card" href="./resources.html"><img src={careerHubPhotos.creative.src} alt={careerHubPhotos.creative.alt} loading="lazy" decoding="async" /><div><span>01 · CAREER TOOLKIT</span><h3>Make a plan you can actually follow.</h3><p>Prepare your search, sharpen your CV, and get ready for a conversation.</p><b>Open toolkit <span aria-hidden="true">↗</span></b></div></a>
            <a className="quick-tool-card" href="./tracker.html"><img src={careerHubPhotos.professional.src} alt={careerHubPhotos.professional.alt} loading="lazy" decoding="async" /><div><span>02 · APPLICATION TRACKER</span><h3>Keep every next step in reach.</h3><p>Track roles, stages, notes, and follow-ups in a private browser workspace.</p><b>Track applications <span aria-hidden="true">↗</span></b></div></a>
            <a className="quick-tool-card" href="#launchpad"><img src={careerHubPhotos.cyber.src} alt="Abstract digital light representing a focused career plan" loading="lazy" decoding="async" /><div><span>03 · CAREER LAUNCHPAD</span><h3>Turn a goal into a real week of action.</h3><p>Generate a seven-day plan for role discovery, your CV, interviews, or networking.</p><b>Build my plan <span aria-hidden="true">↘</span></b></div></a>
          </div>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title">
          <div className="about-copy"><p className="section-kicker">ABOUT THE PROJECT</p><h2 id="about-title">Meet <span>CareerHub.</span></h2><p>CareerHub is a job discovery and hiring platform concept that helps people find relevant opportunities with less noise. Search by role, skills, location, and work style, then save roles and review clear details before deciding what to do next.</p><div className="about-points"><span><b>01</b> Focused job discovery</span><span><b>02</b> A personal shortlist</span><span><b>03</b> Clear role information</span></div></div>
          <aside className="creator-card" aria-label="Project creator">
            <img className="creator-avatar creator-avatar-photo" src={profilePortraitUrl} alt="Portrait of CareerHub creator Kareem Mohamed Bakr" /><div><p className="creator-label">CREATED BY</p><h3>Kareem Mohamed Bakr</h3><p className="creator-name-ar" lang="ar" dir="rtl">كريم محمد بكر</p><p className="creator-note">A Computer Science student and aspiring software developer interested in practical digital products, modern web applications, AI, and cybersecurity. CareerHub is a project to help people navigate their professional journeys.</p><a className="text-link" href="./about.html">Meet the creator <span aria-hidden="true">→</span></a></div>
          </aside>
        </section>
      </main>

      <SiteFooter />

      {activeJob && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveJob(null); }}><section className="job-modal" role="dialog" aria-modal="true" aria-labelledby="job-modal-title"><button className="modal-close" aria-label="Close role details" onClick={() => setActiveJob(null)}>×</button><div className={`company-mark company-mark-${activeJob.accent}`}>{activeJob.companyLogo ? <img src={activeJob.companyLogo} alt="" /> : activeJob.initials}</div><span className="modal-preview-pill">{activeJob.isPublished ? 'PUBLISHED CAREERHUB ROLE' : 'SAMPLE ROLE'}</span><h2 id="job-modal-title">{activeJob.title}</h2><p className="modal-company">{activeJob.company} <span>·</span> {activeJob.location}</p><div className="modal-meta"><span>{activeJob.workplace}</span><span>{activeJob.type}</span><span>{activeJob.level}</span><span>{activeJob.salary}</span></div><h3>{activeJob.isPublished ? 'About this role' : 'Role overview'}</h3><p className="modal-summary">{activeJob.summary}</p>{activeJob.responsibilities.length > 0 && <><h3>What you will do</h3><ul>{activeJob.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></>}{activeJob.requirements && <><h3>{activeJob.isPublished ? 'Requirements' : 'Good to know'}</h3><p className="modal-summary modal-requirements" data-i18n-ignore>{activeJob.requirements}</p></>}<div className="tag-row">{activeJob.tags.map((tag) => <span className="skill-tag" key={tag} data-i18n-ignore>{tag}</span>)}</div><div className="modal-actions">{activeJob.isPublished ? <button className="button button-primary" disabled={applicationLoading || appliedJobIds.includes(activeJob.id)} onClick={() => void submitApplication()}>{applicationLoading ? 'Submitting…' : appliedJobIds.includes(activeJob.id) ? 'Application submitted' : signedIn ? 'Submit application' : 'Sign in to apply'} <span aria-hidden="true">→</span></button> : <a className="button button-primary" href="./resources.html">Prepare to apply <span aria-hidden="true">↗</span></a>}<button className="button button-outline" onClick={() => toggleSaved(activeJob.id)}>{savedIds.includes(activeJob.id) ? 'Saved to your list' : 'Save role'}</button></div>{applicationMessage && <p className="application-feedback" role="status">{applicationMessage}{appliedJobIds.includes(activeJob.id) && <> <a href="./tracker.html">Open your application tracker</a></>}</p>}<p className="modal-disclaimer">{activeJob.isPublished ? 'Applications are sent to this company through CareerHub and require a signed-in job-seeker account.' : 'This opportunity is an illustrative sample and cannot accept applications.'}</p></section></div>}

      {authOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthOpen(false); }}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="modal-close" aria-label="Close account dialog" onClick={() => setAuthOpen(false)}>×</button><span className="brand-mark">C</span><p className="section-kicker">YOUR NEXT MOVE STARTS HERE</p><h2 id="auth-title">{authMode === 'register' ? 'Create your account' : 'Welcome back'}</h2><p className="auth-intro">Save roles and keep your search moving at your own pace.</p><div className="auth-tabs"><button className={authMode === 'register' ? 'auth-tab-active' : ''} onClick={() => { setAuthMode('register'); setAuthMessage(''); }}>Create account</button><button className={authMode === 'login' ? 'auth-tab-active' : ''} onClick={() => { setAuthMode('login'); setAuthMessage(''); }}>Sign in</button></div><form className="auth-form" onSubmit={submitAuth}><label>Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label>Password<input required minLength={12} type="password" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 12 characters" /></label>{authMode === 'register' && <label>I am here as<select value={role} onChange={(event) => setRole(event.target.value as Role)}><option value="JOB_SEEKER">A job seeker</option><option value="COMPANY">A hiring team</option></select></label>}<button className="button button-primary auth-submit" disabled={authLoading}>{authLoading ? 'Please wait…' : authMode === 'register' ? 'Create account' : 'Sign in'} <span aria-hidden="true">→</span></button></form>{authMessage && <p className="auth-message" role="status">{authMessage}</p>}{!apiConfigured && <p className="preview-auth-note">Preview mode: account creation and applications are not connected yet. Your saved roles stay in this browser.</p>}</section></div>}
    </div>
  );
}

function JobCard({ job, saved, onSave, onOpen }: { job: Job; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return <article className={`job-card ${job.featured ? 'job-card-featured' : ''}`}>
    {job.image && job.imagePage && <a className="job-card-image" href={job.imagePage} target="_blank" rel="noreferrer" aria-label="View the source photo"><img src={job.image} alt={job.imageAlt ?? ''} loading="lazy" decoding="async" /><span>Career context photo · Unsplash ↗</span></a>}
    {!job.image && <div className="job-card-image job-card-company-image" aria-label="CareerHub job listing">{job.companyLogo ? <img src={job.companyLogo} alt="" loading="lazy" decoding="async" /> : <span className={`company-mark company-mark-${job.accent}`}>{job.initials}</span>}<span>CAREERHUB LISTING</span></div>}
    <div className="job-card-top"><div className={`company-mark company-mark-${job.accent}`}>{job.initials}</div><button className={`bookmark-button ${saved ? 'bookmark-active' : ''}`} aria-label={saved ? `Remove ${job.title} from saved roles` : `Save ${job.title}`} aria-pressed={saved} onClick={onSave}>{saved ? '♥' : '♡'}</button></div>
    <div className="job-company-line"><span>{job.company}</span>{job.featured && <span className="featured-label">FEATURED</span>}</div>
    <h3><button className="job-title-button" onClick={onOpen}>{job.title}</button></h3>
    <div className="job-details"><span>⌖ {job.location}</span><span>◷ {job.workplace}</span></div>
    <div className="tag-row">{job.tags.slice(0, 2).map((tag) => <span className="skill-tag" key={tag}>{tag}</span>)}</div>
    <div className="job-card-bottom"><span className="job-salary">{job.salary}</span><button className="view-role-button" onClick={onOpen} aria-label="View role details">View role <span aria-hidden="true">↗</span></button></div>
    {job.posted && <div className="job-posted">Posted {job.posted}</div>}
  </article>;
}

export default App;
