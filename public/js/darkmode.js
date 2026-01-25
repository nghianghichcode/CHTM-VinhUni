// Dark mode toggle
(function() {
  const darkCss = document.getElementById('dark-css');
  const toggle = document.getElementById('dark-toggle');
  if (!toggle || !darkCss) return;

  function setDark(on) {
    if (on) {
      darkCss.removeAttribute('disabled');
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', '1');
      toggle.checked = true;
    } else {
      darkCss.setAttribute('disabled', 'true');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', '0');
      toggle.checked = false;
    }
  }

  // Init from storage
  const prefersDark = localStorage.getItem('darkMode') === '1';
  setDark(prefersDark);

  toggle.addEventListener('change', () => {
    setDark(toggle.checked);
  });
})();
