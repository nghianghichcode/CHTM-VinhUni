// Dark mode toggle
(function() {
  const darkCss = document.getElementById('dark-css');
  const toggle = document.getElementById('dark-toggle');
  if (!toggle) return;

  function setDark(on) {
    if (on) {
      if (darkCss) darkCss.removeAttribute('disabled');
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', '1');
      toggle.checked = true;
    } else {
      if (darkCss) darkCss.setAttribute('disabled', 'true');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', '0');
      toggle.checked = false;
    }
  }

  // Init from storage or system
  const stored = localStorage.getItem('darkMode');
  const prefersSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const prefersDark = stored === null ? prefersSystemDark : stored === '1';
  setDark(prefersDark);

  toggle.addEventListener('change', () => {
    setDark(toggle.checked);
  });
})();
