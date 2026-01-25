// Accordion FAQ + reveal animations
document.addEventListener('DOMContentLoaded', function() {
  document.documentElement.classList.add('js-animate');
  const typewriterTargets = Array.from(document.querySelectorAll('[data-typewriter]'));
  const runTypewriter = (list, idx = 0) => {
    if (idx >= list.length) return;
    const el = list[idx];
    if (!el || el.dataset.typed === '1') {
      runTypewriter(list, idx + 1);
      return;
    }
    const rawText = el.getAttribute('data-text') || el.textContent || '';
    const fullText = rawText.replace(/\\n/g, '\n');
    const isTitle = el.getAttribute('data-typewriter') === 'hero-title';
    el.textContent = '';
    el.dataset.typed = '1';

    const segments = [];
    let remaining = fullText;
    const tokenRegex = /\[(accent|strong):([^\]]+)\]/;
    while (remaining.length) {
      const match = remaining.match(tokenRegex);
      if (!match) {
        segments.push({ type: 'text', text: remaining });
        break;
      }
      const before = remaining.slice(0, match.index);
      if (before) segments.push({ type: 'text', text: before });
      segments.push({ type: match[1], text: match[2] });
      remaining = remaining.slice(match.index + match[0].length);
    }

    const expanded = [];
    segments.forEach(seg => {
      if (seg.type === 'text') {
        seg.text.split(/(\n)/).forEach(part => {
          if (part === '\n') expanded.push({ type: 'br' });
          else if (part) expanded.push({ type: 'text', text: part });
        });
      } else {
        expanded.push(seg);
      }
    });

    const delay = isTitle ? 18 : 12;
    const startDelay = isTitle ? 80 : 120;
    let segIndex = 0;
    let charIndex = 0;
    let currentNode = null;

    const ensureNode = (seg) => {
      if (seg.type === 'accent') {
        const span = document.createElement('span');
        span.className = 'accent';
        el.appendChild(span);
        return span;
      }
      if (seg.type === 'strong') {
        const strong = document.createElement('strong');
        el.appendChild(strong);
        return strong;
      }
      if (seg.type === 'text') {
        const textNode = document.createTextNode('');
        el.appendChild(textNode);
        return textNode;
      }
      return null;
    };

    const typeNext = () => {
      if (segIndex >= expanded.length) {
        runTypewriter(list, idx + 1);
        return;
      }
      const seg = expanded[segIndex];
      if (seg.type === 'br') {
        el.appendChild(document.createElement('br'));
        segIndex += 1;
        charIndex = 0;
        currentNode = null;
        setTimeout(typeNext, delay);
        return;
      }

      if (!currentNode) currentNode = ensureNode(seg);
      const text = seg.text || '';
      const nextChar = text.charAt(charIndex);
      if (currentNode && nextChar) {
        currentNode.textContent += nextChar;
      }
      charIndex += 1;

      if (charIndex >= text.length) {
        segIndex += 1;
        charIndex = 0;
        currentNode = null;
      }

      setTimeout(typeNext, delay);
    };

    setTimeout(typeNext, startDelay);
  };

  if (typewriterTargets.length) {
    typewriterTargets.forEach(el => {
      el.textContent = '';
    });

    const immediateTargets = typewriterTargets.filter(el => {
      return ['hero-title', 'hero-desc'].includes(el.getAttribute('data-typewriter'));
    });

    const lazyTargets = typewriterTargets.filter(el => {
      return !['hero-title', 'hero-desc'].includes(el.getAttribute('data-typewriter'));
    });

    if (immediateTargets.length) {
      runTypewriter(immediateTargets);
    }

    if (lazyTargets.length && 'IntersectionObserver' in window) {
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            lazyObserver.unobserve(entry.target);
            runTypewriter(lazyTargets.filter(el => el.dataset.typed !== '1'));
          }
        });
      }, { threshold: 0.2 });

      lazyTargets.forEach(el => lazyObserver.observe(el));
    } else if (lazyTargets.length) {
      runTypewriter(lazyTargets);
    }
  }

  const sloganEl = document.getElementById('logo-slogan');
  if (sloganEl) {
    const primaryText = sloganEl.textContent.trim();
    const altText = sloganEl.dataset.alt || 'Chúc mừng năm mới';
    let showAlt = false;

    // Start with primary, then quickly show yellow alt, then continue toggling
    sloganEl.textContent = primaryText;
    sloganEl.classList.remove('slogan-alt');

    const swap = () => {
      sloganEl.classList.add('slogan-fade');
      setTimeout(() => {
        sloganEl.textContent = showAlt ? primaryText : altText;
        sloganEl.classList.toggle('slogan-alt', !showAlt);
        showAlt = !showAlt;
        sloganEl.classList.remove('slogan-fade');
      }, 300);
    };

    // Show the yellow alt within ~1.2s, then every 5s
    setTimeout(swap, 1200);
    setInterval(swap, 5000);
  }
  const timeEl = document.getElementById('header-time');
  const dateEl = document.getElementById('header-date');
  const tempEl = document.getElementById('header-temp');
  const weatherIconEl = document.getElementById('header-weather-icon');

  const updateClock = () => {
    if (!timeEl || !dateEl) return;
    const now = new Date();
    timeEl.textContent = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(now);
    dateEl.textContent = new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(now);
  };

  updateClock();
  if (timeEl || dateEl) setInterval(updateClock, 1000);

  const setTempText = (text) => {
    if (tempEl) tempEl.textContent = text;
  };

  const setWeatherIcon = (code) => {
    if (!weatherIconEl) return;
    if (typeof code !== 'number') {
      weatherIconEl.textContent = '⛅';
      return;
    }
    if (code === 0) weatherIconEl.textContent = '☀️';
    else if (code === 1 || code === 2) weatherIconEl.textContent = '🌤️';
    else if (code === 3) weatherIconEl.textContent = '☁️';
    else if (code === 45 || code === 48) weatherIconEl.textContent = '🌫️';
    else if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) weatherIconEl.textContent = '🌦️';
    else if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67) weatherIconEl.textContent = '🌧️';
    else if (code === 71 || code === 73 || code === 75 || code === 77) weatherIconEl.textContent = '🌨️';
    else if (code === 80 || code === 81 || code === 82) weatherIconEl.textContent = '🌧️';
    else if (code === 85 || code === 86) weatherIconEl.textContent = '🌨️';
    else if (code === 95 || code === 96 || code === 99) weatherIconEl.textContent = '⛈️';
    else weatherIconEl.textContent = '⛅';
  };

  const fetchTemperature = (lat, lon) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&current_weather=true&timezone=auto`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const temp =
          typeof data?.current?.temperature_2m === 'number'
            ? data.current.temperature_2m
            : data?.current_weather?.temperature;
        const code =
          typeof data?.current?.weather_code === 'number'
            ? data.current.weather_code
            : data?.current_weather?.weathercode;

        if (typeof temp === 'number') {
          setTempText(`${Math.round(temp)}°C`);
        } else {
          setTempText('--°C');
        }
        setWeatherIcon(typeof code === 'number' ? code : undefined);
      })
      .catch(() => {
        setTempText('--°C');
        setWeatherIcon(undefined);
      });
  };

  if (tempEl) {
    fetchTemperature(18.6734, 105.6923);
  }
  document.querySelectorAll('.accordion-title').forEach(btn => {
    btn.onclick = function() {
      const item = btn.closest('.accordion-item');
      if (!item) return;
      item.classList.toggle('open');
    };
  });

  const revealTargets = document.querySelectorAll(
    '.hero-content, .section-head, .card, .info-card, .stat-card, .highlight-card, .moment-card, .intro-panel, .accordion, .steps li, .tags a'
  );

  const swipeTargets = document.querySelectorAll(
    'h1, h2, h3, .section-head p, .hero-content p, .intro-panel p'
  );

  revealTargets.forEach(el => el.classList.add('reveal'));
  swipeTargets.forEach(el => el.classList.add('swipe-in'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(el => observer.observe(el));
    swipeTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in-view'));
    swipeTargets.forEach(el => el.classList.add('in-view'));
  }

  // Moments slider
  document.querySelectorAll('[data-slider="moments"]').forEach(slider => {
    const track = slider.querySelector('.moments-track');
    const prev = slider.querySelector('.slider-btn.prev');
    const next = slider.querySelector('.slider-btn.next');
    if (!track || !prev || !next) return;

    const scrollByAmount = () => {
      const card = track.querySelector('.moment-card');
      if (!card) return track.clientWidth * 0.8;
      const cardWidth = card.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0');
      return cardWidth + (isNaN(gap) ? 0 : gap);
    };

    prev.addEventListener('click', () => {
      track.scrollBy({ left: -scrollByAmount(), behavior: 'smooth' });
    });

    next.addEventListener('click', () => {
      track.scrollBy({ left: scrollByAmount(), behavior: 'smooth' });
    });

    const stepOnce = () => {
      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      const step = Math.max(1, scrollByAmount());
      const nextLeft = track.scrollLeft + step;
      track.scrollTo({
        left: nextLeft >= maxScrollLeft ? 0 : nextLeft,
        behavior: 'smooth'
      });
    };

    let autoTimer = null;

    const stopAuto = () => {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    };
    const startAuto = () => {
      if (!autoTimer) {
        autoTimer = setInterval(stepOnce, 4500);
      }
    };

    // Start after layout settles
    setTimeout(startAuto, 500);

    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);
    track.addEventListener('touchstart', stopAuto, { passive: true });
    track.addEventListener('touchend', startAuto);
    window.addEventListener('resize', () => {
      stopAuto();
      startAuto();
    });
  });

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const navOverlay = document.querySelector('.nav-overlay');
  const drawerClose = document.querySelector('.drawer-close');
  const docRoot = document.documentElement;
  let scrollLockY = 0;

  const isMobile = () => window.innerWidth <= 1024;

  if (menuToggle && mainNav) {
    const setMenuState = (open) => {
      const shouldOpen = open && isMobile();
      if (shouldOpen) {
        scrollLockY = window.scrollY || window.pageYOffset;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollLockY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        if (docRoot) docRoot.style.overflow = 'hidden';
      } else {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (docRoot) docRoot.style.overflow = '';
        if (scrollLockY) window.scrollTo(0, scrollLockY);
      }
      mainNav.classList.toggle('active', shouldOpen);
      menuToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      menuToggle.innerHTML = shouldOpen ? '✕' : '☰';
      document.body.classList.toggle('menu-open', shouldOpen);
      if (docRoot) docRoot.classList.toggle('menu-open', shouldOpen);
      if (navOverlay) navOverlay.classList.toggle('show', shouldOpen);
    };

    menuToggle.addEventListener('click', () => {
      const isActive = mainNav.classList.contains('active');
      setMenuState(!isActive);
    });

    // Close menu when clicking outside or on overlay
    document.addEventListener('click', (e) => {
      const isOpen = mainNav.classList.contains('active');
      if (!isOpen) return;
      if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
        setMenuState(false);
      }
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', () => setMenuState(false));
    }

    if (drawerClose) {
      drawerClose.addEventListener('click', () => setMenuState(false));
    }

    window.addEventListener('resize', () => {
      if (!isMobile()) {
        setMenuState(false);
      }
    });
  }

  const initFireworks = () => {
    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];
    let fireworks = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const randomColor = () => {
      // Broad palette (gold, red, teal, blue, magenta, lime, violet, white)
      const palette = [
        [45, 92, 62],   // gold
        [10, 90, 60],   // red-orange
        [205, 85, 62],  // blue
        [310, 90, 66],  // magenta
        [160, 80, 60],  // teal
        [125, 82, 60],  // lime
        [270, 86, 64],  // violet
        [55, 94, 70],   // soft yellow
      ];
      const pick = palette[Math.floor(Math.random() * palette.length)];
      // Small random jitter for natural variation
      const hue = pick[0] + (Math.random() - 0.5) * 10;
      const sat = Math.min(100, Math.max(78, pick[1] + (Math.random() - 0.5) * 8));
      const light = Math.min(78, Math.max(52, pick[2] + (Math.random() - 0.5) * 10));
      return `hsl(${hue}, ${sat}%, ${light}%)`;
    };

    class Firework {
      constructor() {
        this.x = (0.12 + Math.random() * 0.76) * width; // avoid edges so bursts are visible
        this.y = height * 0.9 + 20;
        this.targetY = height * (0.08 + Math.random() * 0.16); // burst near top area
        this.speed = 2.2 + Math.random() * 1.8;
        this.color = randomColor();
        this.exploded = false;
      }
      update() {
        this.y -= this.speed;
        if (this.y <= this.targetY) {
          this.exploded = true;
          explode(this.x, this.y, this.color);
        }
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4.6;
        this.vy = (Math.random() - 0.6) * 4.6;
        this.alpha = 1.08;
        this.decay = 0.009 + Math.random() * 0.016;
        this.color = color;
        this.size = 2.4 + Math.random() * 0.9;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.02;
        this.alpha -= this.decay;
      }
      draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const explode = (x, y, color) => {
      const count = 34 + Math.floor(Math.random() * 22);
      for (let i = 0; i < count; i += 1) {
        particles.push(new Particle(x, y, color));
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      if (Math.random() < 0.02) {
        fireworks.push(new Firework());
      }

      fireworks.forEach(fw => fw.update());
      fireworks = fireworks.filter(fw => !fw.exploded);
      fireworks.forEach(fw => {
        ctx.save();
        ctx.shadowColor = fw.color;
        ctx.shadowBlur = 12;
        fw.draw();
        ctx.restore();
      });

      particles.forEach(p => p.update());
      particles = particles.filter(p => p.alpha > 0);
      particles.forEach(p => p.draw());

      requestAnimationFrame(loop);
    };

    loop();
  };

  initFireworks();
});
