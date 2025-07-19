
<script src="https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js"></script>
<script>
  let auth0Client;

  async function configureClient() {
    auth0Client = await createAuth0Client({
      domain: "dev-fav7jedash5z3wvg.us.auth0.com",
      client_id: "0vab4Dot0RjPm9AXkbVRuLL5dnwrDYIG",
      authorizationParams: { redirect_uri: window.location.origin },
      cacheLocation: "localstorage"
    });
  }

  async function updateLoginButton() {
    const isAuthenticated = await auth0Client.isAuthenticated();
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");

    if (loginBtn) {
      loginBtn.textContent = "My Account";
      loginBtn.onclick = () => {
        if (isAuthenticated) {
          window.location.href = "/my-account.html";
        } else {
          window.location.href = "/login.html";
        }
      };
      loginBtn.style.display = "inline-block";
    }

    if (logoutBtn) {
      logoutBtn.style.display = isAuthenticated ? "inline-block" : "none";
    }
  }

  async function login() {
    await auth0Client.loginWithRedirect();
  }

  async function logout() {
    await auth0Client.logout({ logoutParams: { returnTo: window.location.origin } });
  }

  async function isEboardMember() {
    const user = await auth0Client.getUser();
    return user && user['https://rowan-nafme.org/roles']?.includes("Eboard");
  }

  async function protectEboardPage() {
    await configureClient();
    const isAuthenticated = await auth0Client.isAuthenticated();
    if (!isAuthenticated || !(await isEboardMember())) {
      window.location.href = "/unauthorized.html";
    }
  }

  window.onload = async () => {
    await configureClient();
    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
      await auth0Client.handleRedirectCallback();
      window.history.replaceState({}, document.title, "/");
    }
    updateLoginButton();
  };
</script>
