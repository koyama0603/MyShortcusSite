// Deterministic renderer: window.__render(t) sets the full visual state from
// time t (seconds). No CSS transitions/animations — the recorder steps t and
// screenshots each frame, so output is perfectly smooth and reproducible.
(() => {
  const scenes = Array.from(document.querySelectorAll('.scene'));
  const bar = document.querySelector('.progress__bar');

  const FADE = 0.7;   // cross-dissolve length
  const LEAD = 0.35;  // delay before caption/voice within a scene
  const CAP = 0.7;    // caption rise length

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);

  // default timeline (overridden by window.__timeline if injected)
  let TL = window.__timeline || {
    total: 54,
    scenes: scenes.map((_, i) => ({ start: i * 6.75, dur: 6.75 })),
  };

  function render(t) {
    let active = 0;
    for (let i = 0; i < TL.scenes.length; i++) if (t >= TL.scenes[i].start) active = i;

    scenes.forEach((el, i) => {
      const s = TL.scenes[i];
      const lt = t - s.start;
      let op = 0, z = 0;
      if (i === active) { op = clamp(lt / FADE, 0, 1); z = 20; }
      else if (i === active - 1) { op = 1; z = 10; }
      el.style.opacity = op;
      el.style.zIndex = z;
      if (op <= 0) return;

      const shot = el.querySelector('.shot');
      if (shot) {
        const k = clamp(lt / s.dur, 0, 1);
        shot.style.transform = `scale(${(1.045 + 0.075 * k).toFixed(4)})`;
      }
      const cap = el.querySelector('.cap');
      if (cap) {
        const e = easeOut(clamp((lt - LEAD) / CAP, 0, 1));
        cap.style.opacity = e;
        cap.style.transform = `translateY(${((1 - e) * 24).toFixed(2)}px)`;
      }
      el.querySelectorAll('[data-anim]').forEach((node) => {
        const d = parseFloat(node.dataset.anim) || 0;
        const e = easeOut(clamp((lt - d) / 0.85, 0, 1));
        node.style.opacity = e;
        node.style.transform = `translateY(${((1 - e) * 18).toFixed(2)}px)`;
      });
    });

    if (bar) bar.style.width = `${clamp(t / TL.total, 0, 1) * 100}%`;
  }

  window.__render = render;
  window.__setTimeline = (tl) => { TL = tl; };
  render(0);
})();
