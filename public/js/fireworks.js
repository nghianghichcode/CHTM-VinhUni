/* TET: Lightweight canvas fireworks (prefers-reduced-motion aware) */
(() => {
  const canvas = document.getElementById("tet-fireworks-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let running = false;
  let particles = [];
  let lastBurst = 0;
  let nextBurstDelay = 3200;
  let rafId = null;

  const getColors = () => {
    const styles = getComputedStyle(document.documentElement);
    return [
      styles.getPropertyValue("--tet-gold").trim(),
      styles.getPropertyValue("--tet-orange").trim(),
      styles.getPropertyValue("--primary").trim()
    ].filter(Boolean);
  };

  const resize = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const dpr = Math.min(isMobile ? 1.2 : 2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawnBurst = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w < 768;
    const count = isMobile ? 10 : 50;
    const colors = getColors();

    const corners = [
      { x: w - 120, y: 120 },
      { x: 120, y: h - 140 }
    ];

    const origin = corners[Math.floor(Math.random() * corners.length)];

    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.6 + Math.random() * 1.8;
      particles.push({
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        ttl: 40 + Math.random() * 30,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  };

  const update = (timestamp) => {
    if (!running) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (timestamp - lastBurst > nextBurstDelay) {
      spawnBurst();
      lastBurst = timestamp;
      nextBurstDelay = (window.innerWidth < 768 ? 5200 : 3000) + Math.random() * 3000;
    }

    particles = particles.filter((particle) => particle.life < particle.ttl);

    particles.forEach((particle) => {
      particle.life += 1;
      particle.vy += 0.015;
      particle.x += particle.vx;
      particle.y += particle.vy;

      const alpha = 1 - particle.life / particle.ttl;
      ctx.globalAlpha = alpha * 0.6;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, window.innerWidth < 768 ? 1.6 : 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    rafId = window.requestAnimationFrame(update);
  };

  const start = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (running || prefersReduced.matches || isMobile) return;
    running = true;
    lastBurst = performance.now();
    rafId = window.requestAnimationFrame(update);
    canvas.style.display = "block";
  };

  const stop = () => {
    running = false;
    particles = [];
    if (rafId) window.cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    canvas.style.display = "none";
  };

  const init = () => {
    resize();
    window.addEventListener("resize", resize);
    if (!prefersReduced.matches) {
      start();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  const handleReducedChange = (event) => {
    if (event.matches) {
      stop();
    } else {
      start();
    }
  };

  if (typeof prefersReduced.addEventListener === "function") {
    prefersReduced.addEventListener("change", handleReducedChange);
  } else if (typeof prefersReduced.addListener === "function") {
    prefersReduced.addListener(handleReducedChange);
  }
})();
