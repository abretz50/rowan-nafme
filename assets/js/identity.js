// assets/js/identity.js
(function(){
  if (!window.netlifyIdentity) return;

  const statusEl = document.getElementById("ni-status");
  const loginBtn = document.getElementById("ni-login");
  const logoutBtn = document.getElementById("ni-logout");
  const afterLoginRedirect = "/accounts/account.html"; // <- change or set to "" to disable

  function render(){
    const user = netlifyIdentity.currentUser();
    if (statusEl) statusEl.textContent = user
      ? ("Signed in as " + (user.email || user.user_metadata?.full_name || "user"))
      : "Not signed in";
    if (loginBtn) loginBtn.hidden = !!user;
    if (logoutBtn) logoutBtn.hidden = !user;
  }

  netlifyIdentity.on("init", render);
  netlifyIdentity.on("login", user => {
    render();
    if (afterLoginRedirect) window.location.href = afterLoginRedirect;
  });
  netlifyIdentity.on("logout", render);

  if (loginBtn) loginBtn.addEventListener("click", () => netlifyIdentity.open("login"));
  if (logoutBtn) logoutBtn.addEventListener("click", () => netlifyIdentity.logout());
})();
