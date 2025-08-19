// assets/js/nav.js
(function(){
  const SITE_BASE = (window.SITE_BASE || "").replace(/\/$/, "");

  async function fetchPartial(paths){
    for (const p of paths) {
      try {
        const r = await fetch(p, { cache: "no-cache" });
        if (r.ok) return await r.text();
      } catch {}
    }
    throw new Error("partials/nav.html not found");
  }

  function resolveHref(path){ return SITE_BASE + path; }

  function setLinksAndActive(root){
    const here = window.location.pathname.replace(/\/$/, "") || "/";
    root.querySelectorAll("a[data-href]").forEach(a => {
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

function addAccountCTA(root){
  const link = document.createElement("a");
  link.id = "account-cta";
  link.textContent = "My Account";
  link.href = resolveHref("/accounts/account.html"); // fallback/default

  // If the identity widget is globally available, make CTA smart:
  function setBehavior(){
    const ni = window.netlifyIdentity;
    if (!ni) return; // leave the simple link fallback

    const user = ni.currentUser();

    if (user) {
      // Logged in → go to Account page
      link.href = resolveHref("/accounts/account.html");
      link.onclick = null;
      link.textContent = "My Account";
    } else {
      // Logged out → open login modal instead of navigating
      link.href = "#";
      link.onclick = (e) => {
        e.preventDefault();
        ni.open("login");
      };
      link.textContent = "My Account";
    }
  }

  root.appendChild(link);

  // Attach listeners if widget exists
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", setBehavior);
    window.netlifyIdentity.on("login", setBehavior);
    window.netlifyIdentity.on("logout", setBehavior);
    // Ensure we run once now too
    setBehavior();
  }
}


  async function init(){
    let mount = document.getElementById("site-nav");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "site-nav";
      document.body.prepend(mount);
    }

    const candidates = [
      "partials/nav.html",
      "../partials/nav.html",
      "../../partials/nav.html",
      SITE_BASE ? SITE_BASE + "/partials/nav.html" : null
    ].filter(Boolean);

    const html = await fetchPartial(candidates);
    mount.innerHTML = html;
    setLinksAndActive(mount);
    addAccountCTA(mount);
  }

  init().catch(console.error);
})();
