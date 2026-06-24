// Subtle scroll-reveal + nav state. Gentle by design — respects reduced motion.
(() => {
  const nav = document.getElementById('nav');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav gains a hairline border once the page scrolls.
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Reveal elements as they enter the viewport, with a soft stagger per section.
  const items = Array.from(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = Array.from(el.parentElement.querySelectorAll(':scope > .reveal'));
        const idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = `${Math.min(idx * 90, 270)}ms`;
        el.classList.add('is-in');
        io.unobserve(el);
      });
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
  );
  items.forEach((el) => io.observe(el));
})();

// "動画で見る" chip → start playback.
(() => {
  const trigger = document.getElementById('videoPlay');
  const video = document.querySelector('.videosec video');
  const iframe = document.querySelector('.videosec iframe');
  if (!trigger || (!video && !iframe)) return;
  const play = () => {
    const player = video || iframe;
    player.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (video) {
      video.play().catch(() => {});
      return;
    }
    const src = new URL(iframe.src);
    src.searchParams.set('autoplay', '1');
    iframe.src = src.toString();
  };
  trigger.addEventListener('click', play);
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
  });
})();
