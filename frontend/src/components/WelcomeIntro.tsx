import { useEffect, useState } from 'react';

export function WelcomeIntro() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem('kareem-portfolio-welcome') === 'seen'; } catch { alreadySeen = true; }
    if (reduceMotion || alreadySeen) return;
    setVisible(true);
    const close = window.setTimeout(() => finish(), 1120);
    return () => window.clearTimeout(close);
  }, []);

  function finish() {
    try { sessionStorage.setItem('kareem-portfolio-welcome', 'seen'); } catch { /* Private browsing may disable storage. */ }
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 300);
  }

  if (!visible) return null;
  return <div className={`welcome-intro ${leaving ? 'welcome-intro-leaving' : ''}`} aria-label="Welcome to Kareem's portfolio">
    <span className="welcome-intro-orbit welcome-intro-orbit-one" aria-hidden="true" />
    <span className="welcome-intro-orbit welcome-intro-orbit-two" aria-hidden="true" />
    <p className="welcome-intro-kicker">KAREEM MOHAMMED BAKR · PORTFOLIO</p>
    <h1 aria-label="Welcome"><span aria-hidden="true">{'WELCOME'.split('').map((letter, index) => <i key={`${letter}-${index}`} style={{ animationDelay: `${index * 55}ms` }}>{letter}</i>)}</span></h1>
    <button type="button" onClick={finish}>Skip intro <span aria-hidden="true">↗</span></button>
  </div>;
}
