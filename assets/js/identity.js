// assets/js/identity.js
(function(){
  if (!window.netlifyIdentity) return;

  const ni = window.netlifyIdentity;
  const statusEl = document.getElementById("ni-status");
  const loginBtn = document.getElementById("ni-login");
  const logoutBtn = document.getElementById("ni-logout");
  const message = document.getElementById("account-message");

  // Profile fields
  const fullName = document.getElementById("full-name");
  const email = document.getElementById("email");
  const avatarUrl = document.getElementById("avatar-url");
  const avatarPreview = document.getElementById("avatar-preview");
  const accountForm = document.getElementById("account-form");

  // Security fields
  const passwordForm = document.getElementById("password-form");
  const newPassword = document.getElementById("new-password");
  const recoveryBtn = document.getElementById("password-recovery");

  function setMsg(text){
    if (message) { message.textContent = text; }
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
      return;
    }

    // Signed in UI
    statusEl.textContent = `Signed in as ${user.email}`;
    if (loginBtn) loginBtn.hidden = true;
    if (logoutBtn) logoutBtn.hidden = false;
    if (accountForm) accountForm.style.display = "block";
    if (passwordForm) passwordForm.style.display = "block";

    const meta = user.user_metadata || {};

    // Populate fields
    if (fullName) fullName.value = meta.full_name || "";
    if (email) email.value = user.email || "";
    if (avatarUrl) avatarUrl.value = meta.avatar_url || "";

    if (avatarPreview) {
      const src = meta.avatar_url || "";
      avatarPreview.src = src;
      avatarPreview.style.display = src ? "block" : "none";
    }
  }

  // Events from Netlify Identity
  ni.on("init", render);
  ni.on("login", render);
  ni.on("logout", render);

  // Buttons
  if (loginBtn) loginBtn.addEventListener("click", () => ni.open("login"));
  if (logoutBtn) logoutBtn.addEventListener("click", () => ni.logout());

  // Save profile (name, email, avatar)
  if (accountForm) {
    accountForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = ni.currentUser();
      if (!user) return;

      const updates = {
        // Changing email may trigger a confirmation flow
        email: (email && email.value) || user.email,
        data: {
          full_name: (fullName && fullName.value) || "",
          avatar_url: (avatarUrl && avatarUrl.value) || ""
        }
      };

      try {
        setMsg("Saving profile…");
        await user.update(updates);  // uses GoTrue under the hood
        setMsg("Profile saved.");
        render(); // refresh fields (in case server normalized anything)
      } catch (err) {
        console.error(err);
        setMsg("Error saving profile. Check the console for details.");
      }
    });
  }

  // Change password (direct)
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
        setMsg("Error updating password. Try the recovery email instead.");
      }
    });
  }

  // Recovery email (alternative)
  if (recoveryBtn) {
    recoveryBtn.addEventListener("click", () => {
      try {
        ni.open("recovery"); // sends a recovery email flow
        setMsg("Recovery email sent (if your identity settings allow it).");
      } catch (err) {
        console.error(err);
        setMsg("Could not trigger recovery email.");
      }
    });
  }

  // Init
  ni.init();
})();
