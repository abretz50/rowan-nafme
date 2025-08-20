(function(){
  const ni = window.netlifyIdentity;

  function getRoles(user) {
    return (user && user.app_metadata && Array.isArray(user.app_metadata.roles))
      ? user.app_metadata.roles : [];
  }
  function hasRole(user, role) {
    return getRoles(user).includes(role);
  }
  function getProviders(user) {
    return Array.isArray(user?.identities) ? user.identities.map(i => i?.provider) : [];
  }
  function hasPasswordProvider(user) {
    return getProviders(user).includes("email");
  }

  function render() {
    const user = ni.currentUser();
    const securityHelp = document.getElementById("security-help");
    const changeBtn = document.getElementById("change-password");

    if (!user) {
      if (securityHelp) securityHelp.textContent = "Sign in to manage your password.";
      if (changeBtn) changeBtn.disabled = true;
      return;
    }

    if (securityHelp) {
      if (hasPasswordProvider(user)) {
        securityHelp.textContent = 'To change your password, enter a new one below and click “Change Password.” If you forgot your current password, click “Password Recovery” to receive a reset link via email.';
        if (changeBtn) changeBtn.disabled = false;
      } else {
        securityHelp.textContent = 'Your account uses Single Sign-On (Google/GitHub). You don’t have a site-specific password yet. Click “Password Recovery” to set one via email, or continue using Single Sign-On.';
        if (changeBtn) changeBtn.disabled = true;
      }
    }

    // Eboard role buttons
    const toolsTitle = document.getElementById("eboard-tools");
    const toolsNote  = document.getElementById("eboard-note");
    const btnPoints  = document.getElementById("btn-points");
    const btnEvents  = document.getElementById("btn-events");

    if (hasRole(user, "eboard")) {
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

  if (ni) {
    ni.on("init", render);
    ni.on("login", render);
    ni.on("logout", render);
    ni.init();
  }

  // Password form
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("password-form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const pw = document.getElementById("new-password").value;
        const user = ni.currentUser();
        if (user && pw) {
          await user.update({ password: pw });
          alert("Password updated.");
        }
      });
    }

    const recoveryBtn = document.getElementById("recovery-email");
    if (recoveryBtn) {
      recoveryBtn.addEventListener("click", () => {
        ni.open("login"); // includes Forgot Password link
      });
    }

    const btnPoints  = document.getElementById("btn-points");
    const btnEvents  = document.getElementById("btn-events");
    if (btnPoints) {
      btnPoints.addEventListener("click", () => window.location.href = "/eboard-dashboard/points-manager.html");
    }
    if (btnEvents) {
      btnEvents.addEventListener("click", () => window.location.href = "/eboard-dashboard/event-manager.html");
    }
  });
})();