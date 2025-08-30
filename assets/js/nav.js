(function(){
  const SITE_BASE = (window.SITE_BASE || "").replace(/\/$/, "");
  const resolve = (p) => SITE_BASE + p;

  async function inject(selector, paths){
    const host = document.querySelector(selector);
    if (!host) return;
    for (const p of paths){
      try{
        const r = await fetch(resolve(p), { cache: "no-cache" });
        if (r.ok){
          host.outerHTML = await r.text();
          return;
        }
      }catch(e){/* try next */}
    }
  }

  function canonPath(p){
    try{
      p = (p || "/").split("#")[0].split("?")[0];
      if (p === "/" || p === "") return "/home";           // treat root as /home
      if (/\/index(\.html)?$/i.test(p)) return "/home";    // /index or /index.html → /home
      return p.replace(/\.html$/i,"").replace(/\/$/,"");
    }catch(e){ return p || "/home"; }
  }

  function setLinksAndActive(){
    const here = canonPath(location.pathname);

    document.querySelectorAll('nav.site-nav [data-href]').forEach(a => {
      const target = a.getAttribute('data-href');
      if (!target) return;
      const clean = canonPath(target);
      a.setAttribute('href', clean);
      if (canonPath(clean) === here){
        a.classList.add('active');
        a.setAttribute('aria-current','page');
      }
    });
  }

  function wireMenu(){
    const btn = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!btn || !links) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const showing = links.classList.toggle('show');
      btn.setAttribute('aria-expanded', showing ? 'true' : 'false');
    });
  }

  async function boot(){
    await inject('nav.site-nav', ['/partials/nav.html','partials/nav.html']);
    setLinksAndActive();
    wireMenu();
    await inject('footer.site-footer', ['/partials/footer.html','partials/footer.html']);
    setLinksAndActive();
  }
  document.addEventListener('DOMContentLoaded', boot);
})();
