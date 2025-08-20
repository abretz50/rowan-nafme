
(function(){
  function bounce(){ window.location.href = "/accounts/account.html"; }

  document.addEventListener("DOMContentLoaded", () => {
    const ni = window.netlifyIdentity;
    if (!ni) { bounce(); return; }

    function hasEboard(user){
      const roles = (user && user.app_metadata && Array.isArray(user.app_metadata.roles)) ? user.app_metadata.roles : [];
      return roles.includes("eboard");
    }

    async function onInit(){
      const user = ni.currentUser();
      if (!user || !hasEboard(user)) { bounce(); return; }
      initUI();
      await loadLeaderboard();
    }

    ni.on("init", onInit);
    ni.on("login", onInit);
    ni.on("logout", bounce);
    ni.init();
  });

  async function freshJwt(){
    const u = window.netlifyIdentity.currentUser();
    if (!u) throw new Error("Not logged in");
    try { return await u.jwt(true); } catch { return await u.jwt(); }
  }

  async function loadLeaderboard(){
    const res = await fetch("/.netlify/functions/leaderboard");
    const data = await res.json();
    const tbody = document.querySelector("#leaderboard tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    (data.data || []).forEach((row, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${idx+1}</td><td>${row.full_name || ""}</td><td>${row.points}</td>`;
      tbody.appendChild(tr);
    });
  }

  async function postPoints(payload){
    const token = await freshJwt();
    const res = await fetch("/.netlify/functions/points", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }

  function initUI(){
    // Increment by name
    const incForm = document.getElementById("inc-form");
    if (incForm) {
      incForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("inc-name").value.trim();
        const delta = parseInt(document.getElementById("inc-amount").value, 10);
        if (!name || !Number.isFinite(delta)) return;
        const res = await postPoints({ action: "increment", name, delta });
        if (!res.ok) alert(res.error || "Failed");
        await loadLeaderboard();
      });
    }
    // Set by name
    const setForm = document.getElementById("set-form");
    if (setForm) {
      setForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("set-name").value.trim();
        const points = parseInt(document.getElementById("set-points").value, 10);
        if (!name || !Number.isFinite(points)) return;
        const res = await postPoints({ action: "set", name, points });
        if (!res.ok) alert(res.error || "Failed");
        await loadLeaderboard();
      });
    }
    // Refresh leaderboard
    const refreshBtn = document.getElementById("btn-refresh");
    if (refreshBtn) refreshBtn.addEventListener("click", loadLeaderboard);
  }
})();
