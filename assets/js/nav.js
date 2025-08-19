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
  link.href = resolveHref("/accounts/account.html");
  link.textContent = "My Account"; // default when logged out
  root.appendChild(link);

  // If Netlify Identity is loaded, personalize the link
  function displayName(user){
    // Prefer full name, then email before the @
    const meta = user && (user.user_metadata || {});
    if (meta.full_name && meta.full_name.trim()) return meta.full_name.trim();
    if (user && user.email) return user.email.split("@")[0];
    return "My Account";
    }

  function applyUser(user){
    link.textContent = user ? displayName(user) : "My Account";
    link.setAttribute("href", resolveHref("/accounts/account.html"));
  }

  if (window.netlifyIdentity) {
    // Initialize and react to changes
    window.netlifyIdentity.on("init", applyUser);
    window.netlifyIdentity.on("login", applyUser);
    window.netlifyIdentity.on("logout", applyUser);
    // Run once immediately if possible
    applyUser(window.netlifyIdentity.currentUser());
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
