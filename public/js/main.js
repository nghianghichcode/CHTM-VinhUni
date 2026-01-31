// Accordion FAQ + reveal animations
document.addEventListener('DOMContentLoaded', function() {
  const disableReveal = document.body.classList.contains('tip-detail-page');
  if (!disableReveal) {
    document.documentElement.classList.add('js-animate');
  }
  const root = document.documentElement;
  let stopFireworks = null;
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

  const initTetExtras = () => {
    const greetingEl = document.getElementById('tet-greeting');
    const greetings = [
      'Đón Tết an tâm – Máy tính khỏe – Học tập và làm việc suôn sẻ.',
      'Khởi đầu năm mới với hệ thống ổn định và dữ liệu an toàn.',
      'Tết vui trọn vẹn khi máy khỏe và mọi thứ vận hành mượt mà.',
      'An toàn số – dữ liệu sạch – khởi sắc năm mới.',
      'Máy khỏe – Tết vui – học tập và làm việc không gián đoạn.'
    ];
    if (greetingEl) {
      greetingEl.textContent = greetings[Math.floor(Math.random() * greetings.length)];
    }

    const countdownEls = {
      days: document.getElementById('cd-days'),
      hours: document.getElementById('cd-hours'),
      minutes: document.getElementById('cd-minutes'),
      seconds: document.getElementById('cd-seconds')
    };
    const targetDate = new Date('2026-02-16T23:59:59+07:00');
    const updateCountdown = () => {
      if (!countdownEls.days) return;
      const now = new Date();
      const diff = Math.max(0, targetDate.getTime() - now.getTime());
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      countdownEls.days.textContent = String(days).padStart(2, '0');
      countdownEls.hours.textContent = String(hours).padStart(2, '0');
      countdownEls.minutes.textContent = String(minutes).padStart(2, '0');
      countdownEls.seconds.textContent = String(seconds).padStart(2, '0');
    };
    updateCountdown();
    if (countdownEls.days) setInterval(updateCountdown, 1000);

    const deviceEls = {
      type: document.getElementById('device-type'),
      os: document.getElementById('device-os'),
      browser: document.getElementById('device-browser'),
      grid: document.getElementById('device-grid'),
      advOpen: document.getElementById('advanced-scan-open')
    };

    if (Object.values(deviceEls).some(Boolean)) {
      const getProfile = async () => {
        const ua = navigator.userAgent || '';
        const platform = navigator.userAgentData?.platform || navigator.platform || '';

        let os = 'Không rõ';
        if (/Windows NT 10\.0/i.test(ua)) os = 'Windows 10/11';
        else if (/Windows NT 6\.3/i.test(ua)) os = 'Windows 8.1';
        else if (/Windows NT 6\.2/i.test(ua)) os = 'Windows 8';
        else if (/Windows NT 6\.1/i.test(ua)) os = 'Windows 7';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS/iPadOS';
        else if (/Mac OS X/i.test(ua) || /Mac/i.test(platform)) os = 'macOS';
        else if (/Linux/i.test(ua) || /Linux/i.test(platform)) os = 'Linux';

        let browser = 'Không rõ';
        let browserVersion = '';

        const brandList = navigator.userAgentData?.brands || navigator.userAgentData?.uaList || [];
        const brandMap = [
          { key: 'CocCoc', name: 'Cốc Cốc' },
          { key: 'Microsoft Edge', name: 'Edge' },
          { key: 'Opera', name: 'Opera' },
          { key: 'Samsung Browser', name: 'Samsung Internet' },
          { key: 'Firefox', name: 'Firefox' },
          { key: 'Safari', name: 'Safari' },
          { key: 'Google Chrome', name: 'Chrome' },
          { key: 'Chromium', name: 'Chromium' }
        ];

        for (const brand of brandMap) {
          const found = brandList.find(item => (item.brand || '').includes(brand.key));
          if (found) {
            browser = brand.name;
            browserVersion = found.version || '';
            break;
          }
        }

        const uaLower = ua.toLowerCase();
        if (browser === 'Không rõ') {
          if (/CocCoc\//i.test(ua) || /coc_coc_browser/i.test(ua) || /coccoc/i.test(uaLower)) browser = 'Cốc Cốc';
          else if (/Edg\//i.test(ua)) browser = 'Edge';
          else if (/OPR\//i.test(ua)) browser = 'Opera';
          else if (/SamsungBrowser\//i.test(ua)) browser = 'Samsung Internet';
          else if (/UCBrowser\//i.test(ua)) browser = 'UC Browser';
          else if (/MiuiBrowser\//i.test(ua)) browser = 'Mi Browser';
          else if (/HUAWEI\//i.test(ua)) browser = 'Huawei Browser';
          else if (/Firefox\//i.test(ua)) browser = 'Firefox';
          else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua) && !/OPR\//i.test(ua)) browser = 'Chrome';
          else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';

          const verMatch =
            ua.match(/CocCoc\/([\d.]+)/) ||
            ua.match(/coc_coc_browser\/([\d.]+)/i) ||
            ua.match(/Edg\/([\d.]+)/) ||
            ua.match(/OPR\/([\d.]+)/) ||
            ua.match(/SamsungBrowser\/([\d.]+)/) ||
            ua.match(/UCBrowser\/([\d.]+)/) ||
            ua.match(/MiuiBrowser\/([\d.]+)/) ||
            ua.match(/HUAWEI\/([\d.]+)/) ||
            ua.match(/Chrome\/([\d.]+)/) ||
            ua.match(/Firefox\/([\d.]+)/) ||
            ua.match(/Version\/([\d.]+).*Safari/);
          if (verMatch) browserVersion = verMatch[1];
        }

        if (navigator.userAgentData?.getHighEntropyValues) {
          try {
            const he = await navigator.userAgentData.getHighEntropyValues([
              'platform', 'platformVersion', 'architecture', 'model', 'uaFullVersion', 'bitness', 'wow64'
            ]);
            if (he?.platform) {
              if (he.platform === 'Windows' && he.platformVersion) {
                const major = parseInt(String(he.platformVersion).split('.')[0], 10);
                os = Number.isFinite(major) && major >= 13 ? 'Windows 11' : 'Windows 10';
              } else {
                os = he.platform + (he.platformVersion ? ` ${he.platformVersion}` : '');
              }
            }
          } catch {}
        }

        const deviceType = /Mobi|Android|iPhone|iPod/i.test(ua)
          ? 'Điện thoại'
          : (/iPad|Tablet/i.test(ua) ? 'Máy tính bảng' : 'Máy tính');

        return {
          type: deviceType,
          os,
          browser: browserVersion ? `${browser} ${browserVersion}` : browser
        };
      };

      const applyProfile = (profile) => {
        if (deviceEls.type) deviceEls.type.textContent = profile.type;
        if (deviceEls.os) deviceEls.os.textContent = profile.os;
        if (deviceEls.browser) deviceEls.browser.textContent = profile.browser;
      };

      const loadAndShow = async () => {
        const profile = await getProfile();
        applyProfile(profile);
      };
      loadAndShow();
    }

    const luckyBtn = document.getElementById('lucky-btn');
    const luckyResult = document.getElementById('lucky-result');
    if (luckyBtn && luckyResult) {
      const tips = [
        'Mẹo: Dọn file tạm bằng Disk Cleanup để giải phóng dung lượng.',
        'Mẹo: Gỡ app không dùng để tăng tốc khởi động.',
        'Mẹo: Cập nhật Windows để vá lỗi bảo mật trước Tết.'
      ];
      const shortcuts = [
        'Shortcut: Win + V mở lịch sử clipboard.',
        'Shortcut: Win + Shift + S chụp màn hình nhanh.',
        'Shortcut: Ctrl + Shift + Esc mở Task Manager.'
      ];
      const wishes = [
        'Chúc năm mới an khang, dữ liệu an toàn, công việc suôn sẻ.',
        'Chúc Tết vui khỏe, máy tính chạy mượt cả năm.',
        'Chúc bạn một năm mới bình an và sáng tạo không giới hạn.'
      ];
      luckyBtn.addEventListener('click', () => {
        const pool = [tips, shortcuts, wishes];
        const pick = pool[Math.floor(Math.random() * pool.length)];
        const item = pick[Math.floor(Math.random() * pick.length)];
        luckyResult.textContent = item;
      });
    }

    // Tet effects always on in light/dark modes; no toggle.
  };
  document.querySelectorAll('.accordion-title').forEach(btn => {
    btn.onclick = function() {
      const item = btn.closest('.accordion-item');
      if (!item) return;
      item.classList.toggle('open');
    };
  });

  if (!disableReveal) {
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
    const hero = document.querySelector('.hero');
    if (!canvas || !hero) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let running = false;
    let rafId = 0;
    let stopTimer = 0;
    let fireworks = [];
    let particles = [];

    const maxParticles = 180;
    const maxFireworks = 4;

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const palette = ['#C81D25', '#F4C430', '#F59E0B', '#3B82F6', '#ffffff'];
    const randomColor = () => palette[Math.floor(Math.random() * palette.length)];

    class Firework {
      constructor() {
        this.x = (0.15 + Math.random() * 0.7) * width;
        this.y = height + 10;
        this.targetY = height * (0.1 + Math.random() * 0.2);
        this.speed = 2.2 + Math.random() * 1.6;
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
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.6) * 4;
        this.alpha = 1;
        this.decay = 0.012 + Math.random() * 0.014;
        this.color = color;
        this.size = 2 + Math.random() * 0.8;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.03;
        this.alpha -= this.decay;
      }
      draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const explode = (x, y, color) => {
      const count = 26 + Math.floor(Math.random() * 18);
      for (let i = 0; i < count; i += 1) {
        particles.push(new Particle(x, y, color));
      }
      if (particles.length > maxParticles) {
        particles = particles.slice(-maxParticles);
      }
    };

    const loop = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      if (Math.random() < 0.03 && fireworks.length < maxFireworks) {
        fireworks.push(new Firework());
      }

      fireworks.forEach(fw => fw.update());
      fireworks = fireworks.filter(fw => !fw.exploded);
      fireworks.forEach(fw => fw.draw());

      particles.forEach(p => p.update());
      particles = particles.filter(p => p.alpha > 0.02);
      particles.forEach(p => p.draw());

      rafId = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      fireworks = [];
      particles = [];
      if (rafId) cancelAnimationFrame(rafId);
      if (stopTimer) clearTimeout(stopTimer);
      ctx.clearRect(0, 0, width, height);
    };

    const start = (duration = 7200) => {
      resize();
      if (running) return;
      running = true;
      loop();
      stopTimer = setTimeout(stop, duration);
    };

    stopFireworks = stop;

    const buttons = document.querySelectorAll('[data-fireworks-trigger]');
    buttons.forEach(btn => btn.addEventListener('click', () => start(7600)));

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            start(6800);
            observer.disconnect();
          }
        });
      }, { threshold: 0.4 });
      observer.observe(hero);
    }

    window.addEventListener('resize', resize);
  };

  initTetExtras();
  initFireworks();

  // Tip image viewer (lightbox)
  const initImageViewer = () => {
    const selector = '.tip-content img, .tip-detail-thumb';
    let viewer = document.querySelector('.image-viewer');
    let viewerImg = null;
    let lastFocus = null;

    const ensureViewer = () => {
      if (viewer) return;
      viewer = document.createElement('div');
      viewer.className = 'image-viewer';
      viewer.setAttribute('role', 'dialog');
      viewer.setAttribute('aria-modal', 'true');
      viewer.setAttribute('aria-hidden', 'true');

      const backdrop = document.createElement('div');
      backdrop.className = 'image-viewer-backdrop';
      viewerImg = document.createElement('img');
      viewerImg.className = 'image-viewer-img';
      const closeBtn = document.createElement('button');
      closeBtn.className = 'image-viewer-close';
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', 'Đóng ảnh');
      closeBtn.textContent = '×';

      viewer.appendChild(backdrop);
      viewer.appendChild(viewerImg);
      viewer.appendChild(closeBtn);
      document.body.appendChild(viewer);

      const close = () => {
        viewer.classList.remove('open');
        viewer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('image-viewer-open');
        if (lastFocus) lastFocus.focus();
      };

      backdrop.addEventListener('click', close);
      closeBtn.addEventListener('click', close);
      viewer.addEventListener('click', (e) => {
        if (e.target === viewer) close();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && viewer.classList.contains('open')) close();
      });
    };

    const open = (img) => {
      ensureViewer();
      lastFocus = document.activeElement;
      const src = img.getAttribute('data-full') || img.currentSrc || img.src;
      viewerImg.src = src;
      viewerImg.alt = img.alt || 'Ảnh minh họa';
      viewer.classList.add('open');
      viewer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('image-viewer-open');
      viewerImg.focus?.();
    };

    document.addEventListener('click', (e) => {
      const targetImg = e.target.closest(selector);
      if (!targetImg) return;
      e.preventDefault();
      open(targetImg);
    });
  };

  initImageViewer();

  const initToasts = () => {
    const toasts = document.querySelectorAll('.alert.toast');
    if (!toasts.length) return;
    toasts.forEach((toast) => {
      requestAnimationFrame(() => toast.classList.add('show'));
      if (toast.dataset.autohide !== 'true') return;
      const hide = () => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
      };
      setTimeout(hide, 3000);
    });
  };

  initToasts();
});
