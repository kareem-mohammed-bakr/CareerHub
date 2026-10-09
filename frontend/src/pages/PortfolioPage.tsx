import { useEffect, useState } from 'react';
import { WelcomeIntro } from '../components/WelcomeIntro';
import { LocaleToggle } from '../core/i18n';
import { overviewPosterUrl, overviewVideoUrl, profilePortraitUrl, unsplashLicenseUrl } from '../data/media';
import './portfolio.css';

const socials = [
  { name: 'LinkedIn', value: 'Professional profile', href: 'https://linkedin.com/in/kareem-mohammed-591449429', mark: 'in' },
  { name: 'YouTube', value: 'Poddose Arabic', href: 'https://youtube.com/@poddosearabic?si=YmWhmQsuPSd6sOTV', mark: '▶' },
  { name: 'Facebook', value: 'Kareem on Facebook', href: 'https://www.facebook.com/share/19Jsyb1A4f/', mark: 'f' },
  { name: 'Instagram', value: '@kareembkaar', href: 'https://www.instagram.com/kareembkaar?stkn=ZWs2dXYyOHRpejd0', mark: '◎' },
  { name: 'X', value: '@mhmd_krym22430', href: 'https://x.com/mhmd_krym22430', mark: '𝕏' },
  { name: 'Email', value: 'krym08236@gmail.com', href: 'mailto:krym08236@gmail.com?subject=Portfolio%20inquiry', mark: '@' },
];

const skillGroups = [
  { label: '01 · DEVELOPMENT', title: 'Web & programming', note: 'Technologies listed in Kareem’s supplied profile.', skills: ['JavaScript', 'Java', 'Python', 'HTML', 'CSS', 'SQL'] },
  { label: '02 · SYSTEMS', title: 'Networks & security', note: 'Current study and hands-on learning interests.', skills: ['Linux', 'Kali Linux', 'TCP/IP', 'Wireshark', 'Nmap'] },
  { label: '03 · DATA & WORKFLOW', title: 'Tools & exploration', note: 'Tools and areas used or explored in project work.', skills: ['Git', 'GitHub', 'MySQL', 'PostgreSQL', 'AI workflows', 'Prompt design'] },
];

const services = [
  { number: '01', icon: '⌘', title: 'Responsive web prototypes', text: 'Turn a clear brief into a structured, responsive website prototype with thoughtful interactions and accessible foundations.', tags: ['React', 'UI implementation', 'Responsive layouts'] },
  { number: '02', icon: '↗', title: 'Career workflow tools', text: 'Shape practical browser-based tools for planning, tracking, and making a multi-step process easier to follow.', tags: ['Planning tools', 'Dashboards', 'Local-first prototypes'] },
  { number: '03', icon: '✳', title: 'AI-assisted content workflows', text: 'Explore repeatable, human-reviewed workflows for organizing ideas and preparing digital content.', tags: ['Workflow mapping', 'Content systems', 'AI tools'] },
];

const navigation = [
  ['About', '#about'], ['Skills', '#skills'], ['Projects', '#projects'], ['Journey', '#journey'], ['Services', '#services'], ['Contact', '#contact'],
] as const;

export function PortfolioPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('top');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-portfolio-section]'));
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) setActive(current.target.id);
    }, { rootMargin: '-25% 0px -58% 0px', threshold: [0, 0.15, 0.4, 0.7] });
    sections.forEach((section) => observer.observe(section));

    const reveals = Array.from(document.querySelectorAll<HTMLElement>('.portfolio-reveal'));
    const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('portfolio-revealed'); revealObserver.unobserve(entry.target); }
    }), { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    reveals.forEach((element, index) => { element.style.setProperty('--portfolio-delay', `${(index % 4) * 70}ms`); revealObserver.observe(element); });
    return () => { observer.disconnect(); revealObserver.disconnect(); };
  }, []);

  async function copyEmail() {
    try { await navigator.clipboard.writeText('krym08236@gmail.com'); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    catch { window.location.href = 'mailto:krym08236@gmail.com?subject=Portfolio%20inquiry'; }
  }

  return <div className="portfolio-shell" id="top">
    <WelcomeIntro />
    <div className="portfolio-atmosphere" aria-hidden="true"><span className="atmosphere-glow atmosphere-glow-one" /><span className="atmosphere-glow atmosphere-glow-two" /><span className="atmosphere-grid" /><span className="atmosphere-grain" /></div>
    <header className="portfolio-nav">
      <a className="portfolio-monogram" href="#top" aria-label="Kareem Mohamed Bakr portfolio home"><span>KM</span><i /></a>
      <button className="portfolio-menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
      <nav className={menuOpen ? 'portfolio-links portfolio-links-open' : 'portfolio-links'} aria-label="Portfolio sections">
        {navigation.map(([label, href]) => <a key={href} href={href} className={active === href.slice(1) ? 'portfolio-nav-active' : ''} onClick={() => setMenuOpen(false)}>{label}</a>)}
      </nav>
      <a className="portfolio-nav-cta" href="#contact">Let’s talk <span aria-hidden="true">↗</span></a>
      <LocaleToggle compact />
    </header>

    <main>
      <section className="portfolio-hero" data-portfolio-section id="hero">
        <div className="portfolio-hero-copy">
          <p className="portfolio-eyebrow"><span className="portfolio-status-dot" /> COMPUTER SCIENCE & IT · EGYPT</p>
          <h1>Curiosity in.<br /><span>Ideas in motion.</span></h1>
          <p className="portfolio-hero-intro">I’m <strong>Kareem Mohamed Bakr</strong> — a Computer Science student exploring secure systems, useful software, and AI-assisted creative workflows.</p>
          <div className="portfolio-hero-actions"><a className="portfolio-button portfolio-button-primary" href="#projects">Explore my work <span aria-hidden="true">↘</span></a><a className="portfolio-button portfolio-button-quiet" href="#contact">Get in touch <span aria-hidden="true">↗</span></a></div>
          <div className="portfolio-hero-meta"><span>LEARN <b>✳</b> BUILD <b>✳</b> SHARE</span><a href="#about">SCROLL TO EXPLORE <i aria-hidden="true">↓</i></a></div>
        </div>
        <div className="portfolio-hero-art" aria-label="Portrait of Kareem Mohamed Bakr">
          <div className="hero-photo-grid" aria-hidden="true" />
          <div className="hero-photo-halo" aria-hidden="true" />
          <div className="hero-photo-frame">
            <img src={profilePortraitUrl} alt="Kareem Mohamed Bakr" fetchPriority="high" />
            <span className="hero-photo-caption"><small>01 / CAIRO, EGYPT</small><strong>KAREEM MOHAMMED BAKR</strong></span>
          </div>
          <span className="hero-photo-side-note" aria-hidden="true">COMPUTER SCIENCE &amp; IT</span>
        </div>
        <div className="portfolio-hero-index"><span>PORTFOLIO</span><b>2026</b><i>CAIRO · EGYPT</i></div>
      </section>

      <section className="portfolio-about section-frame" data-portfolio-section id="about">
        <div className="portfolio-section-head portfolio-reveal"><p className="portfolio-label">01 / A LITTLE ABOUT ME</p><span className="portfolio-section-line" /></div>
        <div className="portfolio-about-grid">
          <div className="portfolio-portrait-card portfolio-reveal"><div className="portrait-card-frame"><img src={profilePortraitUrl} alt="Kareem Mohamed Bakr, Computer Science and IT student" loading="lazy" /><span className="portrait-frame-glow" /><span className="portrait-card-stamp">KM<br /><small>CAIRO · 2026</small></span><span className="portrait-card-caption">KAREEM MOHAMMED BAKR <i>✳</i></span></div><span className="portrait-orbit portrait-orbit-one" aria-hidden="true" /><span className="portrait-orbit portrait-orbit-two" aria-hidden="true" /></div>
          <div className="portfolio-about-copy portfolio-reveal"><p className="portfolio-label">STUDENT · MAKER · LIFELONG LEARNER</p><h2>Building a foundation for <em>what comes next.</em></h2><p>I’m studying Computer Science and Information Technology while growing my practical foundation in cybersecurity, networking, and software. I enjoy understanding how systems fit together, then turning that understanding into something people can use.</p><p>Outside my studies, I explore AI-assisted content workflows and digital storytelling. CareerHub is a current project where those interests meet product thinking, interface design, and useful browser tools.</p><div className="portfolio-fact-row"><div><b>01</b><span>Current direction</span><strong>Cybersecurity & systems</strong></div><div><b>02</b><span>Also exploring</span><strong>Software · AI · Media</strong></div></div><div className="portfolio-about-actions"><a href="#journey">My learning journey <span>↘</span></a><a href="#contact">Connect with me <span>↗</span></a></div></div>
        </div>
      </section>

      <section className="portfolio-skills section-frame" data-portfolio-section id="skills">
        <div className="portfolio-section-heading portfolio-reveal"><div><p className="portfolio-label">02 / TOOLS & TECHNOLOGIES</p><h2>A toolkit that keeps <em>growing.</em></h2><p>Things I’m studying, practicing, or using in the projects shown here — not a claim of mastery.</p></div><span className="skills-orbit-mark" aria-hidden="true">✳</span></div>
        <div className="portfolio-skills-grid">{skillGroups.map((group, index) => <article className="portfolio-skill-card portfolio-reveal" key={group.label}><div className="skill-card-top"><span>{group.label}</span><b>0{index + 1}</b></div><div className={`skill-card-visual skill-card-visual-${index + 1}`} aria-hidden="true"><div className="skill-visual-ring" /><div className="skill-visual-core">{index === 0 ? '</>' : index === 1 ? '⌘' : '✳'}</div><i>{index === 0 ? 'JS' : index === 1 ? 'TCP' : 'AI'}</i><i>{index === 0 ? 'PY' : index === 1 ? 'LINUX' : 'SQL'}</i><i>{index === 0 ? 'JAVA' : index === 1 ? 'NET' : 'GIT'}</i></div><h3>{group.title}</h3><p>{group.note}</p><div className="portfolio-skill-tags">{group.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></article>)}</div>
      </section>

      <section className="portfolio-projects section-frame" data-portfolio-section id="projects">
        <div className="portfolio-section-heading portfolio-reveal"><div><p className="portfolio-label">03 / SELECTED PROJECT</p><h2>Thoughtful ideas,<br /><em>made tangible.</em></h2></div><a className="portfolio-text-link" href="./careerhub.html">Open CareerHub <span>↗</span></a></div>
        <article className="featured-project-card portfolio-reveal"><div className="featured-project-media"><div className="project-video"><video controls preload="none" poster={overviewPosterUrl} aria-label="CareerHub project walkthrough"><source src={overviewVideoUrl} type="video/mp4" />Your browser does not support this project video.</video></div><span className="project-media-caption">CAREERHUB · PRODUCT PREVIEW</span></div><div className="featured-project-copy"><p className="portfolio-label">CURRENT BUILD · CAREER TOOLS</p><h3>CareerHub</h3><p className="project-lede">A career discovery concept that helps people move from browsing opportunities to taking a clear next step.</p><div className="project-capabilities"><div><b>01</b><span>Explore sample roles with search and filters</span></div><div><b>02</b><span>Plan a focused week with a personal Launchpad</span></div><div><b>03</b><span>Keep applications organized in the browser</span></div></div><div className="project-tech"><span>React</span><span>TypeScript</span><span>Vite</span><span>Express · API foundation</span></div><div className="project-footnote"><span><i /> FRONTEND PREVIEW IS LIVE HERE</span><small>Sample roles only · API is not deployed</small></div><a className="portfolio-button portfolio-button-primary project-cta" href="./careerhub.html">Explore the working preview <span>↗</span></a></div></article>
        <div className="project-integrity-note portfolio-reveal"><span>ⓘ</span><p>The current project has a working frontend showcase and a backend foundation. Live accounts, job listings, and real applications still need a deployed API and database. No public source repository has been supplied for this project.</p></div>
      </section>

      <section className="portfolio-journey section-frame" data-portfolio-section id="journey">
        <div className="portfolio-section-heading portfolio-reveal"><div><p className="portfolio-label">04 / EDUCATION & EXPERIENCE</p><h2>Curiosity is a <em>practice.</em></h2><p>My current learning path, shared as supplied — with room for verified details when they’re ready.</p></div></div>
        <div className="journey-layout"><div className="journey-timeline"><article className="journey-item portfolio-reveal"><span className="journey-point"><i /></span><p>CURRENT STUDIES</p><h3>Computer Science & Information Technology</h3><span className="journey-where">Student · institution and dates not provided</span><p>Building core knowledge in computing while developing a hands-on interest in cybersecurity, networks, software systems, and web applications.</p><div className="journey-tags"><span>Computer science</span><span>Information technology</span><span>Ongoing learning</span></div></article><article className="journey-item journey-project-item portfolio-reveal"><span className="journey-point"><i /></span><p>INDEPENDENT PROJECT</p><h3>CareerHub · interactive product prototype</h3><span className="journey-where">A project in progress · no employment claim</span><p>Designed and built a multi-page browser preview with role discovery, career planning, saved applications, and short walkthrough videos.</p><a href="./careerhub.html">Explore this build <span>↗</span></a></article></div><aside className="journey-note portfolio-reveal"><span className="journey-note-mark">✳</span><p className="portfolio-label">HONEST BY DESIGN</p><h3>Real learning.<br />Real work in progress.</h3><p>No formal job history, graduation date, course provider, or certifications were included in the supplied profile, so none are listed here.</p><a href="#contact">Share an opportunity <span>↗</span></a><div className="journey-note-orbit" aria-hidden="true" /></aside></div>
      </section>

      <section className="portfolio-services section-frame" data-portfolio-section id="services">
        <div className="portfolio-section-heading portfolio-reveal"><div><p className="portfolio-label">05 / WAYS TO COLLABORATE</p><h2>Small, useful things <em>built well.</em></h2><p>Areas Kareem is open to exploring through clear briefs, student projects, and early-stage collaborations.</p></div><span className="services-note">PROJECT COLLABORATIONS<br /><b>NOT A CLAIM OF AGENCY EXPERIENCE</b></span></div>
        <div className="portfolio-services-grid">{services.map((service) => <article className="portfolio-service-card portfolio-reveal" key={service.number}><div className="service-card-head"><span>{service.number}</span><i aria-hidden="true">{service.icon}</i></div><h3>{service.title}</h3><p>{service.text}</p><div className="service-tags">{service.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><a href={`mailto:krym08236@gmail.com?subject=${encodeURIComponent(`Collaboration inquiry: ${service.title}`)}`}>Discuss a project <span>↗</span></a></article>)}</div>
      </section>

      <section className="portfolio-milestone section-frame" aria-label="Project milestones and certifications"><div className="milestone-orbit-art portfolio-reveal"><div><span>CH</span><small>CAREERHUB</small></div><i /><b>✳</b></div><div className="milestone-copy portfolio-reveal"><p className="portfolio-label">PROJECT MILESTONES / CREDENTIALS</p><h2>A product prototype,<br /><em>from idea to interaction.</em></h2><p>One verifiable milestone is a connected browser experience: browse sample roles, save a shortlist, make a seven-day plan, draft an interview story, and track applications locally. It is the project’s current frontend release, not a deployed recruitment service.</p><a href="./careerhub.html">See how it works <span>↗</span></a></div><div className="milestone-stats portfolio-reveal"><div><b>04</b><span>CareerHub pages</span></div><div><b>05</b><span>Career tool areas</span></div><div><b>01</b><span>Ongoing project</span></div><p>No certification details were supplied.</p></div></section>

      <section className="portfolio-contact section-frame" data-portfolio-section id="contact">
        <div className="contact-heading portfolio-reveal"><p className="portfolio-label">06 / CONTACT</p><span className="contact-star" aria-hidden="true">✳</span><h2>Have an idea<br />worth <em>building?</em></h2><p>Open to thoughtful conversations, learning opportunities, and project collaborations.</p><button className="contact-email-button" type="button" onClick={copyEmail}>{copied ? 'Email copied ✓' : 'Copy email address'} <span>{copied ? '' : '↗'}</span></button><a className="contact-email-direct" href="mailto:krym08236@gmail.com?subject=Portfolio%20inquiry">Or write to <b>krym08236@gmail.com</b></a></div>
        <div className="contact-card-grid portfolio-reveal">{socials.map((social) => <a className="portfolio-social-card" key={social.name} href={social.href} target={social.name === 'Email' ? undefined : '_blank'} rel={social.name === 'Email' ? undefined : 'noopener noreferrer'}><span className="portfolio-social-mark">{social.mark}</span><span><small>{social.name}</small><b>{social.value}</b></span><i aria-hidden="true">↗</i></a>)}<a className="portfolio-social-card careerhub-social-card" href="./careerhub.html"><span className="portfolio-social-mark">CH</span><span><small>PROJECT PREVIEW</small><b>Open CareerHub</b></span><i aria-hidden="true">↗</i></a><p className="contact-form-note">Email opens your email application. There is no contact form here because this preview has no message-processing service.</p></div>
      </section>

      <p className="portfolio-photo-credit">Portrait supplied by Kareem. CareerHub editorial imagery links to its sources and is used under the <a href={unsplashLicenseUrl} target="_blank" rel="noreferrer">Unsplash License</a>.</p>
    </main>

    <footer className="portfolio-footer"><a className="portfolio-monogram" href="#top" aria-label="Back to top"><span>KM</span><i /></a><div><b>Kareem Mohamed Bakr</b><span>Learning. Building. Sharing what’s next.</span></div><nav aria-label="Footer navigation">{navigation.slice(0, 4).map(([label, href]) => <a key={href} href={href}>{label}</a>)}<a href="./careerhub.html">CareerHub</a></nav><a className="portfolio-back-top" href="#top">Back to top ↑</a><small>© {new Date().getFullYear()} Kareem Mohamed Bakr · Made with curiosity in Egypt.</small></footer>
  </div>;
}
