import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import { careerHubPhotos, creatorIntroPosterUrl, creatorIntroVideoUrl, profilePortraitUrl, unsplashLicenseUrl } from '../data/media';

const publicContacts = [
  { label: 'LinkedIn', detail: 'Professional profile', href: 'https://linkedin.com/in/kareem-mohammed-591449429', mark: 'in' },
  { label: 'YouTube', detail: 'Poddose Arabic', href: 'https://youtube.com/@poddosearabic', mark: '▶' },
  { label: 'Instagram', detail: '@kareembkaar', href: 'https://www.instagram.com/kareembkaar/', mark: '◎' },
  { label: 'Facebook', detail: 'Kareem on Facebook', href: 'https://www.facebook.com/share/19Jsyb1A4f/', mark: 'f' },
  { label: 'X', detail: '@mhmd_krym22430', href: 'https://x.com/mhmd_krym22430', mark: '𝕏' },
  { label: 'Email', detail: 'krym08236@gmail.com', href: 'mailto:krym08236@gmail.com', mark: '@' },
];

const focusAreas = [
  {
    number: '01', label: 'SECURITY & NETWORKS', title: 'Learning how systems stay safer.',
    description: 'Building a cybersecurity foundation through Linux, network defense, traffic analysis, and responsible security testing.',
    image: careerHubPhotos.cyber, tags: ['Linux', 'Networking', 'Wireshark', 'Nmap'],
  },
  {
    number: '02', label: 'SOFTWARE & WEB', title: 'Turning ideas into useful systems.',
    description: 'Exploring structured web applications, programming, databases, and the tools that bring a product together.',
    image: careerHubPhotos.developer, tags: ['Java', 'JavaScript', 'Python', 'SQL'],
  },
  {
    number: '03', label: 'AI & AUTOMATION', title: 'Making repeatable work flow.',
    description: 'Designing prompt-led workflows and connecting AI tools to practical content and everyday processes.',
    image: careerHubPhotos.ai, tags: ['Prompt design', 'AI tools', 'Workflow automation'],
  },
  {
    number: '04', label: 'CONTENT & MEDIA', title: 'Building stories for digital spaces.',
    description: 'Creating short-form media workflows, editing pipelines, and clear visual content for online audiences.',
    image: careerHubPhotos.creatorStudio, tags: ['Short-form video', 'Editing', 'Digital storytelling'],
  },
];

const technologyGroups = [
  { title: 'Languages & web', items: ['Java', 'JavaScript', 'Python', 'HTML', 'CSS', 'SQL'] },
  { title: 'Systems & security', items: ['Linux', 'Kali Linux', 'Wireshark', 'Nmap', 'TCP/IP'] },
  { title: 'Data & building', items: ['PostgreSQL', 'MySQL', 'Git', 'GitHub', 'AI workflows'] },
];

export function AboutPage() {
  return <div className="site-shell">
    <SiteHeader active="about" />
    <main className="inner-page about-page" id="top">
      <section className="profile-hero">
        <div className="profile-hero-copy">
          <p className="section-kicker"><span className="status-pulse" /> THE PERSON BEHIND CAREERHUB</p>
          <h1>Curious by nature.<br /><span>Building with purpose.</span></h1>
          <p className="profile-lede">Kareem Mohamed Bakr is a Computer Science student and aspiring software developer interested in practical digital products, modern web applications, artificial intelligence, and cybersecurity. Through CareerHub, he aims to make career discovery clearer and help people navigate their professional journeys.</p>
          <div className="profile-tags"><span>Cybersecurity in training</span><span>Software & systems</span><span>AI workflows</span></div>
          <div className="profile-hero-actions"><a className="button button-primary" href="#focus">Explore my focus <span aria-hidden="true">↓</span></a><a className="button button-outline" href="#connect">Let’s connect <span aria-hidden="true">↗</span></a></div>
          <div className="profile-signal"><span className="signal-mark">✳</span><span>Computer Science & Information Technology</span></div>
        </div>
        <div className="profile-visual">
          <div className="profile-photo-glow" />
          <span className="portrait-orbit portrait-orbit-one" aria-hidden="true" />
          <span className="portrait-orbit portrait-orbit-two" aria-hidden="true" />
          <div className="profile-visual-photo">
            <img src={profilePortraitUrl} alt="Portrait of Kareem Mohamed Bakr wearing a black shirt and glasses" />
            <span className="portrait-image-sheen" aria-hidden="true" />
            <span className="portrait-image-scan" aria-hidden="true" />
          </div>
          <div className="profile-image-label"><span className="status-pulse" /> CREATOR PORTRAIT</div>
          <div className="profile-id-card"><span className="profile-monogram">KM</span><div><small>COMPUTER SCIENCE & IT</small><strong>Kareem Mohamed Bakr</strong><span lang="ar" dir="rtl">كريم محمد بكر</span></div><span className="profile-card-mark">✳</span></div>
          <div className="profile-floating-chip"><span>01</span> Learn · Build · Share</div>
        </div>
      </section>

      <div className="about-marquee" aria-label="Kareem's fields of interest"><div><span>CYBERSECURITY</span><b>✳</b><span>SOFTWARE SYSTEMS</span><b>✳</b><span>AI WORKFLOWS</span><b>✳</b><span>DIGITAL STORYTELLING</span><b>✳</b><span>CYBERSECURITY</span><b>✳</b><span>SOFTWARE SYSTEMS</span><b>✳</b><span>AI WORKFLOWS</span><b>✳</b><span>DIGITAL STORYTELLING</span><b>✳</b></div></div>

      <section className="about-intro-grid">
        <div className="about-intro-copy"><p className="section-kicker">A LITTLE ABOUT ME</p><h2>Technology is where I learn to <span>solve real problems.</span></h2></div>
        <div className="about-intro-body"><p>I’m studying Computer Science and Information Technology while building an engineering-level foundation in cybersecurity, network security, and software systems. My learning is hands-on: understand how a system works, make something useful, then improve it.</p><p>Outside core technology, I explore AI-assisted content systems and short-form media workflows. CareerHub brings those interests into one project: a clear, useful place for people taking their next career step.</p></div>
      </section>

      <section className="focus-section" id="focus" aria-labelledby="focus-title">
        <div className="section-heading"><div><p className="section-kicker">WHAT I’M EXPLORING</p><h2 id="focus-title">Four connected ways I like to build.</h2><p className="section-subtitle">A learning journey across safer systems, useful software, automation, and digital media.</p></div><span className="section-count">01 — 04</span></div>
        <div className="focus-grid">{focusAreas.map((area) => <article className="focus-card" key={area.number}>
          <a className="focus-card-image" href={area.image.page} target="_blank" rel="noreferrer" aria-label={`Open image source for ${area.label}`}><img src={area.image.src} alt={area.image.alt} loading="lazy" decoding="async" /><span className="focus-image-credit">PHOTO ↗</span></a>
          <div className="focus-card-body"><div className="focus-card-meta"><span>{area.number}</span><span>{area.label}</span></div><h3>{area.title}</h3><p>{area.description}</p><div className="focus-tags">{area.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
        </article>)}</div>
      </section>

      <section className="technology-section" aria-labelledby="technology-title">
        <div className="technology-visual"><div className="tech-ring tech-ring-one" /><div className="tech-ring tech-ring-two" /><div className="tech-core"><span>KM</span><small>LEARN / BUILD</small></div><span className="orbit-label orbit-label-one">LINUX</span><span className="orbit-label orbit-label-two">JAVA</span><span className="orbit-label orbit-label-three">AI</span></div>
        <div className="technology-copy"><p className="section-kicker">TOOLS IN MY ECOSYSTEM</p><h2 id="technology-title">A foundation that keeps <span>growing.</span></h2><p className="section-subtitle">Technologies and tools I’m studying, practicing, and using across my projects.</p>{technologyGroups.map((group) => <div className="tech-group" key={group.title}><h3>{group.title}</h3><div className="tech-chips">{group.items.map((item) => <span key={item}>{item}</span>)}</div></div>)}</div>
      </section>

      <section className="about-project-feature">
        <a className="about-project-image" href={careerHubPhotos.interview.page} target="_blank" rel="noreferrer"><img src={careerHubPhotos.interview.src} alt={careerHubPhotos.interview.alt} loading="lazy" decoding="async" /><span>MY CURRENT PROJECT ↗</span></a>
        <div className="about-project-copy"><p className="section-kicker">CURRENT PROJECT · CAREERHUB</p><h2>Building a clearer route to the next opportunity.</h2><p>CareerHub is a job-discovery concept for searching with focus, saving promising roles, and preparing a thoughtful next step. The preview includes sample listings and a practical career toolkit.</p><div className="about-project-actions"><a className="button button-primary" href="./careerhub.html#roles">Explore CareerHub <span aria-hidden="true">↗</span></a><a className="text-link" href="./resources.html">Open the career toolkit <span aria-hidden="true">→</span></a></div></div>
      </section>

      <section className="creator-film-section" aria-labelledby="creator-film-title">
        <div className="story-heading"><div><p className="section-kicker">A SHORT INTRODUCTION</p><h2 id="creator-film-title">My path, and what I’m building.</h2><p className="section-subtitle">A custom, captioned motion story introducing my background, focus areas, and current project.</p></div><span className="story-length"><span aria-hidden="true">▶</span> 18-second introduction</span></div>
        <div className="story-content"><div className="story-video-frame"><video controls preload="metadata" poster={creatorIntroPosterUrl} aria-label="A visual introduction to Kareem Mohamed Bakr"><source src={creatorIntroVideoUrl} type="video/mp4" />Open the <a href={creatorIntroVideoUrl}>Kareem introduction video</a>.</video></div>
          <aside className="creator-video-note"><span className="note-icon">KM</span><p className="creator-label">KAREEM MOHAMMED BAKR</p><h3>Learn carefully. Build things that help.</h3><p>A student profile, a cybersecurity learning journey, and a growing interest in AI and digital storytelling — brought together through CareerHub.</p><a href="#connect">Find me online ↗</a></aside></div>
      </section>

      <section className="connect-section" id="connect" aria-labelledby="connect-title">
        <div className="connect-heading"><p className="section-kicker">OPEN CHANNELS</p><h2 id="connect-title">Let’s connect.</h2><p className="section-subtitle">Follow the work, watch my videos, or send me a message.</p><div className="connect-note"><span className="status-pulse" /> Public profiles shared by Kareem</div></div>
        <div className="connect-grid">{publicContacts.map((contact) => <a className="connect-card" href={contact.href} key={contact.label} target={contact.label === 'Email' ? undefined : '_blank'} rel={contact.label === 'Email' ? undefined : 'noreferrer'}><span className="connect-mark">{contact.mark}</span><span className="connect-card-copy"><small>{contact.label}</small><strong>{contact.detail}</strong></span><span className="connect-arrow" aria-hidden="true">↗</span></a>)}</div>
      </section>

      <p className="photo-license-note about-license">Personal portrait supplied by Kareem. Editorial technology and workplace photos are used under the <a href={unsplashLicenseUrl} target="_blank" rel="noreferrer">Unsplash License</a> and link to their source pages.</p>
    </main>
    <SiteFooter />
  </div>;
}
