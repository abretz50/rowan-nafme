(function(){
  if (!window.netlifyIdentity) return;
  const ni = window.netlifyIdentity;

  // Elements
  const statusEl = document.getElementById("ni-status");
  const loginBtn = document.getElementById("ni-login");
  const logoutBtn = document.getElementById("ni-logout");
  const message = document.getElementById("account-message");

  const displayName = document.getElementById("display-name");
  const displayEmail = document.getElementById("display-email");

  const accountForm = document.getElementById("account-form");
  const fullName = document.getElementById("full-name");
  const email = document.getElementById("email");

  const recoveryBtn = document.getElementById("password-recovery");

  const toolsTitle = document.getElementById("eboard-tools");
  const toolsNote  = document.getElementById("eboard-note");
  const btnPoints  = document.getElementById("btn-points");
  const btnEvents  = document.getElementById("btn-events");

  function setMsg(t){ if (message) message.textContent = t; }

  function getRoles(user){
    return (user && user.app_metadata && Array.isArray(user.app_metadata.roles)) ? user.app_metadata.roles : [];
  }
  function hasEboard(user){ return getRoles(user).includes("eboard"); }

  function render(){
    const user = ni.currentUser();

    if (!user) {
      if (statusEl) statusEl.textContent = "Not signed in";
      if (loginBtn) loginBtn.hidden = false;
      if (logoutBtn) logoutBtn.hidden = true;

      if (displayName) displayName.textContent = "—";
      if (displayEmail) displayEmail.textContent = "—";

      if (accountForm) accountForm.style.display = "none";

      if (toolsTitle) toolsTitle.style.display = "none";
      if (toolsNote)  toolsNote.style.display  = "none";
      if (btnPoints)  btnPoints.hidden = true;
      if (btnEvents)  btnEvents.hidden = true;
      return;
    }

    // Logged in
    if (statusEl) statusEl.textContent = `Signed in as ${user.email}`;
    if (loginBtn) loginBtn.hidden = true;
    if (logoutBtn) logoutBtn.hidden = false;

    const meta = user.user_metadata || {};
    const name = meta.full_name || "";
    if (displayName) displayName.textContent = name || (user.email ? user.email.split("@")[0] : "");
    if (displayEmail) displayEmail.textContent = user.email || "";

    if (accountForm) accountForm.style.display = "block";

    // Eboard role UI
    if (hasEboard(user)) {
      if (toolsTitle) toolsTitle.style.display = "block";
      if (toolsNote)  toolsNote.style.display  = "block";
      if (btnPoints)  btnPoints.hidden = false;
      if (btnEvents)  btnEvents.hidden = false;
    } else {
      if (toolsTitle) toolsTitle.style.display = "none";
      if (toolsNote)  toolsNote.style.display  = "none";
      if (btnPoints)  btnPoints.hidden = true;
      if (btnEvents)  btnEvents.hidden = true;
    }
  }

  // Identity events
  ni.on("init", render);
  ni.on("login", () => { render(); setMsg("Logged in."); });
  ni.on("logout", () => { render(); setMsg("Logged out."); });

  // Buttons
  if (loginBtn)  loginBtn.addEventListener("click", () => ni.open("login"));
  if (logoutBtn) logoutBtn.addEventListener("click", () => ni.logout());

  // Save profile
  if (accountForm) {
    accountForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = ni.currentUser();
      if (!user) return;
      try {
        setMsg("Saving profile…");
        await user.update({
          email: (email && email.value) || user.email,
          data: { full_name: (fullName && fullName.value) || "" }
        });
        setMsg("Profile saved.");
        render();
      } catch (err) {
        console.error(err);
        setMsg("Error saving profile.");
      }
    });
  }

  // Forgot Password → open login modal so user can click "Forgot password?"
  if (recoveryBtn) {
    recoveryBtn.addEventListener("click", () => {
      ni.open("login");
      setMsg('In the login window, click "Forgot password?" to reset your password.');
    });
  }

  // E-Board buttons → tool pages
  if (btnPoints) btnPoints.addEventListener("click", () => { window.location.href = "/eboard-dashboard/points-manager.html"; });
  if (btnEvents) btnEvents.addEventListener("click", () => { window.location.href = "/eboard-dashboard/event-manager.html"; });

  // Init Identity
  ni.init();
})();