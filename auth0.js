
let auth0Client;

async function configureClient() {
  console.log("Configuring Auth0 Client...");
  auth0Client = await createAuth0Client({
    domain: "dev-fav7jedash5z3wvg.us.auth0.com",
    client_id: "0vab4Dot0RjPm9AXkbVRuLL5dnwrDYIG",
    authorizationParams: { redirect_uri: "https://rowannafme.org/login.html" },
    cacheLocation: "localstorage"
  });
  console.log("Auth0 Client Configured");
}

async function updateLoginButton() {
  const isAuthenticated = await auth0Client.isAuthenticated();
  console.log("User authenticated:", isAuthenticated);
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  if (loginBtn) {
    loginBtn.textContent = "My Account";
    loginBtn.onclick = () => {
      console.log("Login/My Account button clicked");
      if (isAuthenticated) {
        window.location.href = "/my-account.html";
      } else {
        login();
      }
    };
    loginBtn.style.display = "inline-block";
  }

  if (logoutBtn) {
    logoutBtn.style.display = isAuthenticated ? "inline-block" : "none";
  }
}

async function login() {
  console.log("Redirecting to Auth0 login...");
  await auth0Client.loginWithRedirect();
}

async function logout() {
  console.log("Logging out...");
  await auth0Client.logout({ logoutParams: { returnTo: "https://rowannafme.org/" } });
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
    console.log("Handling Auth0 redirect callback...");
    await auth0Client.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/my-account.html");
  }
  updateLoginButton();
};
