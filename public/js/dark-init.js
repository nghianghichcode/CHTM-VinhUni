(function() {
  try {
    var stored = localStorage.getItem('darkMode');
    var prefersSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var prefersDark = stored === null ? prefersSystemDark : stored === '1';
    var doc = document.documentElement;
    if (prefersDark) doc.classList.add('dark');
    else doc.classList.remove('dark');
    var link = document.getElementById('dark-css');
    if (link) {
      if (prefersDark) link.removeAttribute('disabled');
      else link.setAttribute('disabled', 'true');
    }
  } catch (e) {
    /* fail quietly if storage blocked */
  }
})();
