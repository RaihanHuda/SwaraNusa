const modulo = (value, length) => ((value % length) + length) % length;

// Take turns between provinces so neighbouring suggestions come from different places.
export function mixEntries(entries, provinces, random = Math.random) {
  const shuffle = items => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const groups = shuffle(provinces).map(p => shuffle(entries.filter(e => e.provinceId === p.id)));
  const result = [];
  while (groups.some(group => group.length)) {
    for (const group of groups) if (group.length) result.push(group.shift());
  }
  return result;
}

function mountCarousel(root) {
  const track = root.querySelector('[data-carousel-track]');
  const originals = [...track.children];
  const counter = root.querySelector('[data-carousel-count]');
  const announcer = root.querySelector('[data-carousel-announcement]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = [];
  let slides = [], stops = [], origin = 0, cycleWidth = 0, current = 0;
  let visible = false, rebuilding = false;
  let timer = 0, settleTimer = 0, resizeTimer = 0, frame = 0, destroyed = false;
  let drag = null, suppressClickUntil = 0;
  const delay = 3000;
  const on = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    listeners.push(() => target.removeEventListener(event, handler, options));
  };
  const clearTimer = () => { clearTimeout(timer); timer = 0; };
  const schedule = () => {
    clearTimer();
    const keyboardFocus = root.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
    if (!motion.matches && visible && !keyboardFocus && !drag && !document.hidden && !destroyed && !rebuilding && originals.length > 1) {
      timer = setTimeout(() => move(1), delay);
    }
  };
  const sync = () => {
    let nearest = 0;
    for (let i = 1; i < stops.length; i++) {
      if (Math.abs(stops[i] - track.scrollLeft) < Math.abs(stops[nearest] - track.scrollLeft)) nearest = i;
    }
    current = Number(slides[nearest]?.dataset.carouselIndex || 0);
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(originals.length).padStart(2, '0')}`;
    root.dataset.activeIndex = String(current);
    root.dataset.activeId = originals[current].dataset.slideId;
    const bounds = track.getBoundingClientRect();
    for (const slide of slides) {
      const rect = slide.getBoundingClientRect();
      const exposed = Math.min(rect.right, bounds.right) - Math.max(rect.left, bounds.left) > rect.width * .45;
      slide.setAttribute('aria-hidden', String(!exposed));
      slide.querySelectorAll('a').forEach(a => { a.tabIndex = exposed ? 0 : -1; });
    }
  };
  const settle = () => {
    if (destroyed || rebuilding || drag?.moved) return;
    const focusedCopy = document.activeElement?.closest('[data-carousel-clone]');
    const previousLeft = track.scrollLeft;
    // The copies at each edge look identical, so this reset has no visible jump.
    if (track.scrollLeft < origin - 1) track.scrollLeft += cycleWidth;
    else if (track.scrollLeft >= origin + cycleWidth - 1) track.scrollLeft -= cycleWidth;
    sync();
    if (focusedCopy && Math.abs(track.scrollLeft - previousLeft) > cycleWidth / 2) {
      originals[Number(focusedCopy.dataset.carouselIndex)].querySelector('a')?.focus({ preventScroll: true });
    }
    schedule();
  };
  const move = (direction, manual = false) => {
    clearTimer();
    const target = slides.find((slide, i) => Number(slide.dataset.carouselIndex) === current && stops[i] >= origin - 1 && stops[i] < origin + cycleWidth - 1);
    const index = slides.indexOf(target);
    const stop = stops[index + direction];
    if (stop === undefined) return;
    track.scrollTo({ left: stop, behavior: motion.matches ? 'instant' : 'smooth' });
    if (manual) {
      const wanted = modulo(current + direction, originals.length);
      announcer.textContent = `${originals[wanted].dataset.slideLabel}. ${wanted + 1} dari ${originals.length}.`;
    }
  };
  const rebuild = () => {
    rebuilding = true;
    clearTimer();
    track.querySelectorAll('[data-carousel-clone]').forEach(el => el.remove());
    for (const [index, slide] of originals.entries()) slide.dataset.carouselIndex = String(index);
    const width = originals[0].getBoundingClientRect().width;
    const copies = Math.min(originals.length, Math.ceil(track.clientWidth / Math.max(1, width)) + 1);
    const clone = slide => {
      const copy = slide.cloneNode(true);
      copy.dataset.carouselClone = 'true';
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('a').forEach(a => { a.tabIndex = -1; });
      return copy;
    };
    track.prepend(...originals.slice(-copies).map(clone));
    track.append(...originals.slice(0, copies).map(clone));
    slides = [...track.children];
    stops = slides.map(slide => slide.offsetLeft);
    origin = stops[copies];
    cycleWidth = stops[copies + originals.length] - origin;
    track.scrollLeft = stops[copies + current];
    sync();
    rebuilding = false;
    schedule();
  };

  // Pointer hover does not stop rotation. Keyboard focus pauses it until focus leaves.
  on(root, 'focusin', schedule);
  on(root, 'focusout', () => queueMicrotask(() => { if (!destroyed) schedule(); }));
  on(track, 'keydown', event => {
    if(event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1, true);
    }
  });
  on(track, 'scroll', () => {
    if (rebuilding) return;
    clearTimer();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(sync);
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 160);
  }, { passive: true });
  on(track, 'wheel', event => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey) schedule();
  }, { passive: true });
  on(track, 'dragstart', event => event.preventDefault());
  on(track, 'pointerdown', event => {
    if (event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: track.scrollLeft, type: event.pointerType, moved: false };
    clearTimer();
  });
  on(track, 'pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      drag.moved = true;
      clearTimer();
      if (drag.type === 'mouse') {
        track.classList.add('is-dragging');
        track.setPointerCapture(event.pointerId);
      }
    }
    if (drag.moved && drag.type === 'mouse') {
      event.preventDefault();
      track.scrollLeft = drag.left - dx;
    }
  });
  const finishDrag = event => {
    if (!drag || drag.id !== event.pointerId) return;
    const moved = drag.moved, mouse = drag.type === 'mouse';
    drag = null;
    track.classList.remove('is-dragging');
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    if (moved) {
      suppressClickUntil = Date.now() + 450;
      if (mouse) {
        const nearest = stops.reduce((best, stop) => Math.abs(stop - track.scrollLeft) < Math.abs(best - track.scrollLeft) ? stop : best, stops[0]);
        track.scrollTo({ left: nearest, behavior: motion.matches ? 'instant' : 'smooth' });
      }
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 180);
    } else schedule();
  };
  on(track, 'pointerup', finishDrag);
  on(track, 'pointercancel', finishDrag);
  on(window, 'pointerup', finishDrag);
  on(track, 'click', event => {
    if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  on(document, 'visibilitychange', schedule);
  on(window, 'resize', () => {
    rebuilding = true;
    clearTimer();
    clearTimeout(settleTimer);
    cancelAnimationFrame(frame);
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuild, 120);
  }, { passive: true });
  on(motion, 'change', schedule);

  rebuild();
  const observer = new IntersectionObserver(records => {
    visible = records[0].isIntersecting && records[0].intersectionRatio >= .2;
    schedule();
  }, { threshold: [0, .2, .5] });
  observer.observe(root);
  return () => {
    destroyed = true;
    clearTimer(); clearTimeout(settleTimer); clearTimeout(resizeTimer); cancelAnimationFrame(frame);
    observer.disconnect();
    for (const remove of listeners) remove();
  };
}

export function mountCarousels(root) {
  const cleanups = [...root.querySelectorAll('[data-carousel]')].map(mountCarousel);
  return () => cleanups.forEach(cleanup => cleanup());
}
