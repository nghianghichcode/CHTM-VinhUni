/* TET: Lantern float background (SVG) */
(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const layer = document.getElementById("tet-lantern-layer");
  if (!layer) return;

  const renderLanterns = () => {
    layer.innerHTML = "";
    if (prefersReduced.matches) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const count = isMobile ? 4 : Math.floor(Math.random() * 5) + 6; // mobile: 4, desktop: 6-10
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
      const lantern = document.createElement("div");
      lantern.className = "tet-2026-lantern";

      const size = 36 + Math.random() * 26;
      const left = Math.random() * 100;
      const delay = Math.random() * 6;
      const duration = (isMobile ? 26 : 18) + Math.random() * (isMobile ? 18 : 20);
      const opacity = 0.12 + Math.random() * 0.1;

      lantern.style.width = `${size}px`;
      lantern.style.height = `${size * 1.3}px`;
      lantern.style.left = `${left}%`;
      lantern.style.top = "-18%";
      lantern.style.animationDuration = `${duration}s`;
      lantern.style.animationDelay = `${delay}s`;
      lantern.style.opacity = opacity.toFixed(2);

      lantern.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 80 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="tet-lantern-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--tet-red)" stop-opacity="0.85" />
              <stop offset="100%" stop-color="var(--tet-orange)" stop-opacity="0.7" />
            </linearGradient>
          </defs>
          <rect x="18" y="18" width="44" height="70" rx="22" fill="url(#tet-lantern-grad)" />
          <rect x="26" y="8" width="28" height="14" rx="7" fill="var(--tet-gold)" />
          <rect x="30" y="88" width="20" height="10" rx="5" fill="var(--tet-gold)" />
          <line x1="40" y1="98" x2="40" y2="108" stroke="var(--tet-gold)" stroke-width="2" stroke-linecap="round" />
        </svg>
      `;

      fragment.appendChild(lantern);
    }

    layer.appendChild(fragment);
  };

  const init = () => {
    renderLanterns();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  const handleReducedChange = () => {
    renderLanterns();
  };

  if (typeof prefersReduced.addEventListener === "function") {
    prefersReduced.addEventListener("change", handleReducedChange);
  } else if (typeof prefersReduced.addListener === "function") {
    prefersReduced.addListener(handleReducedChange);
  }
})();
