// assets/js/nav.js
(function () {
  const SITE_BASE = (window.SITE_BASE || "").replace(/\/$/, "");

  function resolveHref(path) {
    return SITE_BASE + path;
  }

  async function fetchPartial(paths) {
    for (const p of paths) {
      try {
        const r = await fetch(p, { cache: "no-cache" });
        if (r.ok) return await r.text();
      } catch {}
    }
    throw new Error("partials/nav.html not found");
  }

  function setLinksAndActive(root) {
    const here = (window.location.pathname || "/").replace(/\/$/, "") || "/";
    root.querySelectorAll("a[data-href]").forEach((a) => {
      const target = a.getAttribute("data-href");
      const href = resolveHref(target);
      a.setAttribute("href", href);

      const normTarget = (target.replace(/\/$/, "") || "/");
      if (here === normTarget || (normTarget !== "/" && here.startsWith(normTarget))) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
    });
  }

  function addAccountCTA(root) {
    const link = document.createElement("a");
    link.id = "account-cta";
    link.textContent = "My Account";
    link.href = "/.netlify/identity"; // safe fallback if widget missing
    root.appendChild(link);

    const displayName = (user) => {
      const meta = user && (user.user_metadata || {});
      if (meta.full_name && meta.full_name.trim()) return meta.full_name.trim();
      if (user && user.email) return user.email.split("@")[0];
      return "My Account";
    };

    const openLogin = (e) => {
      if (window.netlifyIdentity && typeof window.netlifyIdentity.open === "function") {
        e.preventDefault();
        window.netlifyIdentity.open("login");
      }
    };

    const applyUser = (user) => {
      if (user) {
        link.textContent = displayName(user);
        link.setAttribute("href", resolveHref("/accounts/account.html"));
        link.removeEventListener("click", openLogin);
      } else {
        link.textContent = "My Account";
        link.setAttribute("href", "/.netlify/identity");
        link.addEventListener("click", openLogin);
      }
    };

    // Wire up Identity (init first so events are consistent)
    if (window.netlifyIdentity) {
      try {
        // Ensure init only once
        if (!window.__ni_inited__) {
          window.__ni_inited__ = true;
          window.netlifyIdentity.init();
        }
      } catch {}

      window.netlifyIdentity.on("init", applyUser);
      window.netlifyIdentity.on("login", (user) => {
        applyUser(user);
        // Optional: auto-redirect to account page after login
        // window.location.href = resolveHref("/accounts/account.html");
      });
      window.netlifyIdentity.on("logout", () => applyUser(null));

      // If already initialized, apply immediately
      try {
        applyUser(window.netlifyIdentity.currentUser());
      } catch {
        applyUser(null);
      }
    } else {
      // Widget not loaded—still allow a route to Identity
      applyUser(null);
    }
  }

  async function init() {
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
      SITE_BASE ? SITE_BASE + "/partials/nav.html" : null,
    ].filter(Boolean);

    try {
      const html = await fetchPartial(candidates);
      mount.innerHTML = html;
    } catch (err) {
      // Fail gracefully—at least show an empty bar so CTA can mount
      mount.innerHTML = "<nav></nav>";
      console.error(err);
    }

    setLinksAndActive(mount);
    addAccountCTA(mount);
  }

  init().catch(console.error);
})();
