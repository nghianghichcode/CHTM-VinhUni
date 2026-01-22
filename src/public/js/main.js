// Accordion FAQ
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.accordion-title').forEach(btn => {
    btn.onclick = function() {
      const content = btn.nextElementSibling;
      content.style.display = content.style.display === 'block' ? 'none' : 'block';
    };
  });
});
