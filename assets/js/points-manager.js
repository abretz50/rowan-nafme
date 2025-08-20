(function(){
  // Guard: only eboard role may view this page
  function bounce(){ window.location.href = "/accounts/account.html"; }

  document.addEventListener("DOMContentLoaded", () => {
    const ni = window.netlifyIdentity;
    if (!ni) { bounce(); return; }

    function hasEboard(user){
      const roles = (user && user.app_metadata && Array.isArray(user.app_metadata.roles)) ? user.app_metadata.roles : [];
      return roles.includes("eboard");
    }

    function onInit(){
      const user = ni.currentUser();
      if (!user || !hasEboard(user)) { bounce(); return; }
      initUI();
      loadLeaderboard();
    }

    ni.on("init", onInit);
    ni.on("login", onInit);
    ni.on("logout", bounce);
    ni.init();
  });

  async function jwt(){
    return await window.netlifyIdentity.currentUser().jwt();
  }

  async function loadLeaderboard(){
    const res = await fetch("/.netlify/functions/leaderboard");
    const data = await res.json();
    const tbody = document.querySelector("#leaderboard tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    (data.data || []).forEach((row, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${idx+1}</td><td>${row.full_name || ""}</td><td>${row.email}</td><td>${row.points}</td>`;
      tbody.appendChild(tr);
    });
  }

  async function postPoints(payload){
    const token = await jwt();
    const res = await fetch("/.netlify/functions/points", {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": "Bearer " + token },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }

  function initUI(){
    // Increment
    const incForm = document.getElementById("inc-form");
    if (incForm) {
      incForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("inc-email").value.trim();
        const delta = parseInt(document.getElementById("inc-amount").value, 10);
        if (!email || !Number.isFinite(delta)) return;
        const res = await postPoints({ action: "increment", email, delta });
        if (!res.ok) alert(res.error || "Failed");
        await loadLeaderboard();
      });
    }
    // Set
    const setForm = document.getElementById("set-form");
    if (setForm) {
      setForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("set-email").value.trim();
        const points = parseInt(document.getElementById("set-points").value, 10);
        if (!email || !Number.isFinite(points)) return;
        const res = await postPoints({ action: "set", email, points });
        if (!res.ok) alert(res.error || "Failed");
        await loadLeaderboard();
      });
    }
    // Sync current user row (helpful if not created yet)
    if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
      window.netlifyIdentity.currentUser().jwt().then(token =>
        fetch("/.netlify/functions/sync-user", { method: "POST", headers: { authorization: "Bearer " + token } })
      ).catch(() => {});
    }
  }
})();
