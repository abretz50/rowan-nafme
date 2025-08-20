// Loads nav partial elsewhere; this file only handles the Account CTA text/behavior if you mount it yourself.
// If you already use a loader that injects the partial and calls addAccountCTA, keep that.
// This variant exports addAccountCTA if you want to call it manually.
(function(global){
  const SITE_BASE = (window.SITE_BASE || "").replace(/\/$/, "");

  function resolveHref(path){ return SITE_BASE + path; }

  function addAccountCTA(root){
    const link = document.createElement("a");
    link.id = "account-cta";
    link.href = resolveHref("/accounts/account.html");
    link.textContent = "Log In"; // default label when logged out
    root.appendChild(link);

    function displayName(user){
      const meta = user && (user.user_metadata || {});
      if (meta.full_name && meta.full_name.trim()) return meta.full_name.trim();
      if (user && user.email) return user.email.split("@")[0];
      return "My Account";
    }
    function applyUser(user){
      if (user) {
        link.textContent = displayName(user);
      } else {
        link.textContent = "Log In";
      }
      link.setAttribute("href", resolveHref("/accounts/account.html"));
    }

    if (window.netlifyIdentity) {
      window.netlifyIdentity.on("init", applyUser);
      window.netlifyIdentity.on("login", applyUser);
      window.netlifyIdentity.on("logout", applyUser);
      applyUser(window.netlifyIdentity.currentUser());
    }
  }

  // expose for use by your existing nav loader
  global.__addAccountCTA = addAccountCTA;
})(window);
