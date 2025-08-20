// Netlify Identity wiring for Account page with E-Board role controls.
(function(){
  if (!window.netlifyIdentity) return;

  const ni = window.netlifyIdentity;

  // Elements
  const statusEl = document.getElementById("ni-status");
  const loginBtn = document.getElementById("ni-login");
  const logoutBtn = document.getElementById("ni-logout");
  const message = document.getElementById("account-message");

  // Profile
  const fullName = document.getElementById("full-name");
  const email = document.getElementById("email");
  const avatarUrl = document.getElementById("avatar-url");
  const avatarPreview = document.getElementById("avatar-preview");
  const accountForm = document.getElementById("account-form");

  // Security
  const passwordForm = document.getElementById("password-form");
  const newPassword = document.getElementById("new-password");
  const recoveryBtn = document.getElementById("password-recovery");

  // E-Board controls
  const toolsTitle = document.getElementById("eboard-tools");
  const toolsNote  = document.getElementById("eboard-note");
  const btnPoints  = document.getElementById("btn-points");
  const btnEvents  = document.getElementById("btn-events");

  function setMsg(t){ if (message) message.textContent = t; }

  function getRoles(user){
    return (user && user.app_metadata && Array.isArray(user.app_metadata.roles))
      ? user.app_metadata.roles : [];
  }

  function hasEboard(user){
    return getRoles(user).includes("eboard");
  }

  function render(){
    const user = ni.currentUser();
    if (!statusEl) return;

    if (!user) {
      statusEl.textContent = "Not signed in";
      if (loginBtn) loginBtn.hidden = false;
      if (logoutBtn) logoutBtn.hidden = true;
      if (accountForm) accountForm.style.display = "none";
      if (passwordForm) passwordForm.style.display = "none";
      if (avatarPreview) { avatarPreview.style.display = "none"; avatarPreview.src = ""; }
      if (toolsTitle) toolsTitle.style.display = "none";
      if (toolsNote)  toolsNote.style.display  = "none";
      if (btnPoints)  btnPoints.hidden = true;
      if (btnEvents)  btnEvents.hidden = true;
      return;
    }

    // Signed-in UI
    statusEl.textContent = `Signed in as ${user.email}`;
    if (loginBtn) loginBtn.hidden = true;
    if (logoutBtn) logoutBtn.hidden = false;
    if (accountForm) accountForm.style.display = "block";
    if (passwordForm) passwordForm.style.display = "block";

    const meta = user.user_metadata || {};
    if (fullName) fullName.value = meta.full_name || "";
    if (email) email.value = user.email || "";
    if (avatarUrl) avatarUrl.value = meta.avatar_url || "";
    if (avatarPreview) {
      const src = meta.avatar_url || "";
      avatarPreview.src = src;
      avatarPreview.style.display = src ? "block" : "none";
    }

    // Role-based UI (only 'eboard' is supported)
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

      const updates = {
        email: (email && email.value) || user.email,
        data: {
          full_name: (fullName && fullName.value) || "",
          avatar_url: (avatarUrl && avatarUrl.value) || ""
        }
      };
      try {
        setMsg("Saving profile…");
        await user.update(updates);
        setMsg("Profile saved.");
        render();
      } catch (err) {
        console.error(err);
        setMsg("Error saving profile.");
      }
    });
  }

  // Password change
  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = ni.currentUser();
      if (!user) return;
      const pw = (newPassword && newPassword.value) || "";
      if (!pw) { setMsg("Enter a new password first."); return; }
      try {
        setMsg("Updating password…");
        await user.update({ password: pw });
        newPassword.value = "";
        setMsg("Password updated.");
      } catch (err) {
        console.error(err);
        setMsg("Error updating password. Try recovery instead.");
      }
    });
  }

  // Recovery via login modal
  if (recoveryBtn) {
    recoveryBtn.addEventListener("click", () => {
      ni.open("login");
      setMsg('Click "Forgot password?" in the login window to receive a recovery email.');
    });
  }

  // E-Board buttons → tool pages
  if (btnPoints) btnPoints.addEventListener("click", () => { window.location.href = "/eboard-dashboard/points-manager.html"; });
  if (btnEvents) btnEvents.addEventListener("click", () => { window.location.href = "/eboard-dashboard/event-manager.html"; });

  // Init
  ni.init();
})();
