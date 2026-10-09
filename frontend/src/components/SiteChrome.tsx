import { useEffect, useState } from 'react';
import { LocaleToggle } from '../core/i18n';

export type ActivePage = 'jobs' | 'about' | 'resources' | 'tracker';

const navItems = [
  { label: 'Portfolio', href: './index.html', page: null },
  { label: 'Find a job', href: './careerhub.html#roles', page: 'jobs' },
  { label: 'How it works', href: './careerhub.html#how-it-works', page: 'jobs' },
  { label: 'Career Launchpad', href: './careerhub.html#launchpad', page: 'jobs' },
  { label: 'Career toolkit', href: './resources.html', page: 'resources' },
  { label: 'Application tracker', href: './tracker.html', page: 'tracker' },
  { label: 'About me', href: './about.html', page: 'about' },
  { label: 'For teams', href: './careerhub.html#for-teams', page: 'jobs' },
] as const;

const activeHref: Record<ActivePage, string> = {
  jobs: './careerhub.html#roles', about: './about.html', resources: './resources.html', tracker: './tracker.html',
};

export function SiteHeader({ active, onSignIn, onJoin }: {
  active: ActivePage;
  onSignIn?: () => void;
  onJoin?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    root.classList.add('motion-ready');
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
      root.style.setProperty('--page-progress', `${progress}%`);
    };
    const updateAmbientLight = (event: PointerEvent) => {
      root.style.setProperty('--pointer-x', `${event.clientX}px`);
      root.style.setProperty('--pointer-y', `${event.clientY}px`);
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', updateAmbientLight, { passive: true });
    }
    updateProgress();

    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(
      'main section, .value-strip, .job-card, .quick-tool-card, .photo-card, .focus-card, .toolkit-card, .connect-card, .step-card, .story-chapters',
    ));
    revealTargets.forEach((element, index) => {
      element.classList.add('motion-reveal');
      element.style.setProperty('--reveal-delay', `${(index % 5) * 65}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('motion-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });
    revealTargets.forEach((element) => observer.observe(element));

    const tiltTargets = Array.from(document.querySelectorAll<HTMLElement>(
      '.hero-profile-card, .hero-cgi-stage, .job-card, .quick-tool-card, .focus-card, .toolkit-card, .connect-card',
    ));
    const handleTilt = (event: PointerEvent) => {
      const element = event.currentTarget as HTMLElement;
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      element.style.setProperty('--tilt-x', `${-y * 3.2}deg`);
      element.style.setProperty('--tilt-y', `${x * 3.8}deg`);
    };
    const clearTilt = (event: PointerEvent) => {
      const element = event.currentTarget as HTMLElement;
      element.style.setProperty('--tilt-x', '0deg');
      element.style.setProperty('--tilt-y', '0deg');
    };

    if (window.matchMedia('(pointer: fine)').matches) {
      tiltTargets.forEach((element) => {
        element.classList.add('motion-tilt');
        element.addEventListener('pointermove', handleTilt);
        element.addEventListener('pointerleave', clearTilt);
      });
    }

    return () => {
      observer.disconnect();
      root.classList.remove('motion-ready');
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      window.removeEventListener('pointermove', updateAmbientLight);
      root.style.removeProperty('--page-progress');
      root.style.removeProperty('--pointer-x');
      root.style.removeProperty('--pointer-y');
      tiltTargets.forEach((element) => {
        element.removeEventListener('pointermove', handleTilt);
        element.removeEventListener('pointerleave', clearTilt);
      });
    };
  }, []);

  return <>
    <div className="preview-bar"><span className="preview-dot" />CareerHub preview <span className="preview-divider">·</span> A clearer path from search to next step</div>
    <header className="site-header">
      <a className="brand" href="./careerhub.html#top" aria-label="CareerHub home"><span className="brand-mark">C</span><span>career<span>hub</span></span></a>
      <nav className={`main-nav ${menuOpen ? 'main-nav-open' : ''}`} aria-label="Main navigation">
        {navItems.map((item) => <a key={item.label} className={item.href === activeHref[active] ? 'nav-active' : ''} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
      </nav>
      <div className="header-actions">
        {onSignIn ? <>
          <button className="button button-quiet" onClick={onSignIn}>Sign in</button>
          <button className="button button-dark" onClick={onJoin}>Create account <span aria-hidden="true">↗</span></button>
        </> : <a className="button button-dark" href="./careerhub.html#roles">Explore roles <span aria-hidden="true">↗</span></a>}
      </div>
      <LocaleToggle />
      <button className="nav-toggle" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
    </header>
  </>;
}

export function SiteFooter() {
  return <footer className="site-footer">
    <a className="brand footer-brand" href="./careerhub.html#top"><span className="brand-mark">C</span><span>career<span>hub</span></span></a>
    <span>Thoughtful work starts with a thoughtful search.</span>
    <span><a href="./index.html">Kareem’s portfolio</a><b>·</b><a href="./about.html">About Kareem</a><b>·</b><a href="./resources.html">Career toolkit</a><b>·</b><a href="./tracker.html">Application tracker</a><b>·</b>© 2026 CareerHub</span>
  </footer>;
}
