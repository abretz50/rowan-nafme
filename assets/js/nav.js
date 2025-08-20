// assets/js/nav.js
(function(){
  const SITE_BASE = (window.SITE_BASE || "").replace(/\/$/, "");

  async function fetchPartial(paths){
    for (const p of paths) {
      try {
        const r = await fetch(p, { cache: "no-cache" });
        if (r.ok) return await r.text();
      } catch(e){ /* ignore */ }
    }
    throw new Error("partials not found");
  }

  function resolveHref(path){ 
    // Ensure leading slash and prepend SITE_BASE
    const target = (path || "/").replace(/^\.?\/?/, "/");
    return SITE_BASE + target;
  }

  function setLinksAndActive(root){
    const here = (window.location.pathname || "/").replace(/\/$/, "") || "/";
    root.querySelectorAll("a[data-href]").forEach(a => {
      const target = a.getAttribute("data-href");
      const href = resolveHref(target);
      a.setAttribute("href", href);

      const normTarget = (target || "/").replace(/\/$/, "") || "/";
      if (here === normTarget || (normTarget !== "/" && here.startsWith(normTarget))) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
    });
  }

  function wireToggles(root){
    const btn = root.querySelector('[data-nav-toggle]');
    const menu = root.querySelector('[data-nav-menu]');
    if (!btn || !menu) return;
    btn.addEventListener('click', ()=>{
      const open = menu.getAttribute('data-open') === 'true';
      const next = (!open).toString();
      menu.setAttribute('data-open', next);
      btn.setAttribute('aria-expanded', next);
    });
  }

  function addAccountCTA(root){
    // Optional Netlify Identity integration; degrade gracefully.
    const slot = root.querySelector('[data-account-slot]');
    if (!slot) return;
    try {
      if (window.netlifyIdentity) {
        window.netlifyIdentity.on('init', user => {
          render(user);
        });
        window.netlifyIdentity.on('login', user => { render(user); });
        window.netlifyIdentity.on('logout', () => { render(null); });
        render(window.netlifyIdentity.currentUser());
      } else {
        render(null);
      }
    } catch(e){ /* noop */ }

    function render(user){
      slot.innerHTML = "";
      const a = document.createElement("a");
      a.className = "btn account";
      if (user) {
        a.textContent = "Account";
        a.href = resolveHref("/eboard.html");
      } else {
        a.textContent = "Log in";
        a.href = "#";
        a.addEventListener("click", (ev)=>{
          ev.preventDefault();
          if (window.netlifyIdentity) window.netlifyIdentity.open();
        });
      }
      slot.appendChild(a);
    }
  }

  async function mountPartials(){
    const navHost = document.querySelector("[data-partial='nav']");
    const footerHost = document.querySelector("[data-partial='footer']");
    const basePaths = ["partials", "/partials", "./partials"];

    if (navHost){
      const navHtml = await fetchPartial(basePaths.map(b => `${b}/nav.html`));
      navHost.innerHTML = navHtml;
      setLinksAndActive(navHost);
      wireToggles(navHost);
      addAccountCTA(navHost);
    }
    if (footerHost){
      const footerHtml = await fetchPartial(basePaths.map(b => `${b}/footer.html`));
      footerHost.innerHTML = footerHtml;
      setLinksAndActive(footerHost);
    }
  }

  // Defer until DOM ready
  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", mountPartials);
  } else {
    mountPartials();
  }
})();