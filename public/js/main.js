// Accordion FAQ + reveal animations
document.addEventListener('DOMContentLoaded', function() {
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

  revealTargets.forEach(el => el.classList.add('reveal'));

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
  } else {
    revealTargets.forEach(el => el.classList.add('in-view'));
  }
});
