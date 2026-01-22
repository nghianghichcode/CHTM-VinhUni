// Dark mode toggle
(function() {
  const darkCss = document.getElementById('dark-css');
  function setDark(on) {
    if (on) {
      darkCss.removeAttribute('disabled');
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', '1');
    } else {
      darkCss.setAttribute('disabled', 'true');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', '0');
    }
  }
  document.getElementById('dark-toggle').onclick = function() {
    setDark(!document.documentElement.classList.contains('dark'));
  };
  if (localStorage.getItem('darkMode') === '1') setDark(true);
})();
