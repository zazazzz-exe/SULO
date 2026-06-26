import { useEffect } from 'react';

import { useSettings } from '@/services/settingsService';

/**
 * SULO's signature web cursor: the pointer becomes a small amber flame with a
 * breathing glow that trails behind it, flickers softly, and flares on click —
 * "a torch in the dark." Pure DOM + requestAnimationFrame (no CSS keyframes),
 * mounted once at the app root. Disabled on touch devices and on reduced motion.
 */
export function TorchCursor() {
  const { settings } = useSettings();
  const enabled = settings.torchCursor;
  const reduce = settings.reduceMotion;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const finePointer = window.matchMedia?.('(pointer: fine)').matches ?? true;
    if (!enabled || !finePointer) return;

    // --- Build the cursor layers ----------------------------------------
    const glow = document.createElement('div');
    glow.style.cssText = [
      'position:fixed',
      'left:0',
      'top:0',
      'width:160px',
      'height:160px',
      'border-radius:50%',
      'pointer-events:none',
      'z-index:2147483646',
      'opacity:0',
      'transition:opacity 220ms ease',
      'will-change:transform,opacity',
      'background:radial-gradient(circle, rgba(224,123,0,0.42) 0%, rgba(224,123,0,0.16) 40%, rgba(224,123,0,0) 70%)',
    ].join(';');

    const flame = document.createElement('div');
    flame.style.cssText = [
      'position:fixed',
      'left:0',
      'top:0',
      'width:26px',
      'height:34px',
      'pointer-events:none',
      'z-index:2147483647',
      'opacity:0',
      'transition:opacity 180ms ease',
      'will-change:transform',
      'filter:drop-shadow(0 0 6px rgba(224,123,0,0.65))',
    ].join(';');
    flame.innerHTML = `
      <svg width="26" height="34" viewBox="0 0 26 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sulo-flame" x1="13" y1="0" x2="13" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#FFD9A0"/>
            <stop offset="0.45" stop-color="#E07B00"/>
            <stop offset="1" stop-color="#B25E00"/>
          </linearGradient>
        </defs>
        <path d="M13 0.5C13 0.5 4 8 4 18C4 25 8.5 33.5 13 33.5C17.5 33.5 22 25 22 18C22 14 19.5 11 18 13C18.5 8 13 0.5 13 0.5Z" fill="url(#sulo-flame)"/>
        <path d="M13 33.5C9.5 33.5 7 28 8 22C9.5 27 12 25 12 21C12 18 14 16 14 16C14 16 18 20 18 25C18 30 15.5 33.5 13 33.5Z" fill="#FFE7BE" opacity="0.85"/>
      </svg>`;

    document.body.appendChild(glow);
    document.body.appendChild(flame);
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = 'none';

    // --- Animate ---------------------------------------------------------
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let gx = mx;
    let gy = my;
    let down = 0; // click-flare envelope (0..1)
    let visible = false;
    let raf = 0;

    const show = () => {
      if (visible) return;
      visible = true;
      glow.style.opacity = '1';
      flame.style.opacity = '1';
    };
    const hide = () => {
      visible = false;
      glow.style.opacity = '0';
      flame.style.opacity = '0';
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      // Glue the flame to the pointer on the event itself so it tracks even if
      // rAF is throttled (e.g. background tab). rAF adds the flicker on top.
      flame.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -78%)`;
      show();
    };
    const onDown = () => {
      down = 1;
    };
    const onLeave = () => hide();
    const onEnter = () => show();

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    const tick = (t: number) => {
      // Glow trails the pointer; flame stays crisp on it.
      const ease = reduce ? 1 : 0.2;
      gx += (mx - gx) * ease;
      gy += (my - gy) * ease;

      // Soft flicker + click flare (no flicker under reduced motion).
      const flicker = reduce
        ? 1
        : 0.92 + Math.sin(t * 0.012) * 0.05 + Math.sin(t * 0.043) * 0.03;
      down *= 0.86; // decay the flare
      const flare = 1 + down * 0.6;

      flame.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -78%) scale(${flicker})`;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%) scale(${(reduce ? 1 : flicker) * flare})`;

      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      glow.remove();
      flame.remove();
      document.body.style.cursor = prevCursor;
    };
  }, [enabled, reduce]);

  return null;
}
