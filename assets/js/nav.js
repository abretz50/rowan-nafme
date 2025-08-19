// assets/js/nav.js — loads partials/nav.html & highlights active link.
(function(){
  const SITE_BASE = (window.SITE_BASE || "").replace(/\/$/, "");

  async function fetchPartial(paths) {
    for (const p of paths) {
      try { const r = await fetch(p, {cache:"no-cache"}); if (r.ok) return await r.text(); } catch(e){}
    }
    throw new Error("partials/nav.html not found");
  }

  function resolveHref(path){ return (SITE_BASE + path) || path; }

  function setLinksAndActive(root){
    const here = window.location.pathname.replace(/\/$/, "") || "/";
    root.querySelectorAll("a[data-href]").forEach(a=>{
      const target = a.getAttribute("data-href");
      const href = resolveHref(target);
      a.setAttribute("href", href);
      const normTarget = (target.replace(/\/$/, "") || "/");
      if (here === normTarget || (normTarget !== "/" && here.startsWith(normTarget))) {
        a.classList.add("active");
        a.setAttribute("aria-current","page");
      }
    });
  }

  async function init(){
    let mount = document.getElementById("site-nav");
    if(!mount){ mount = document.createElement("div"); mount.id="site-nav"; document.body.prepend(mount); }

    const candidates = [
      "partials/nav.html",
      "../partials/nav.html",
      "../../partials/nav.html",
      (SITE_BASE? SITE_BASE + "/partials/nav.html" : null)
    ].filter(Boolean);

    const html = await fetchPartial(candidates);
    mount.innerHTML = html;
    setLinksAndActive(mount);
  }

  init().catch(console.error);
})();
