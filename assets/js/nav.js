(function () {
  const navRoot = document.querySelector('.site-nav');
  if (!navRoot) return;

  // Render the nav with clean, extensionless routes
  navRoot.innerHTML = `
    <div class="nav-inner">
      <a class="brand" href="/home">
        <img src="/images/logo.png" alt="Rowan NAfME" height="28">
        <span>Rowan NAfME</span>
      </a>
      <div class="links">
        <a href="/home"        data-slug="home">Home</a>
        <a href="/events"      data-slug="events">Events</a>
        <a href="/convention"  data-slug="convention">Convention</a>
        <a href="/eboard"      data-slug="eboard">E-Board</a>
        <a href="/resources"   data-slug="resources">Resources</a>
        <a href="/gallery"     data-slug="gallery">Gallery</a>
        <a href="/contact"     data-slug="contact">Contact</a>
      </div>
    </div>
  `;

  // Work out the slug from the current URL, tolerant of many forms
  const path = window.location.pathname;               // e.g., /events, /events.html, /events/index.html, /
  const parts = path.split('/').filter(Boolean);       // ["events"] or ["events","index.html"] or []
  let slug = (parts[0] || 'home').toLowerCase();       // default to 'home' when at '/'
  if (slug.endsWith('.html')) slug = slug.replace(/\.html$/, '');
  if (slug === 'index') slug = 'home';                 // handle '/index.html'
  if (parts.length >= 2 && (parts[1] === 'index' || parts[1] === 'index.html')) {
    slug = parts[0].toLowerCase();                     // '/X/index(.html)?' → slug = X
  }

  // Mark the matching link as active & accessible
  const active = navRoot.querySelector(`a[data-slug="${slug}"]`);
  if (active) {
    active.classList.add('active');
    active.setAttribute('aria-current', 'page');
  }
})();