
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
      await loadEvents();
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

  async function loadEvents(){
    const res = await fetch("/.netlify/functions/events");
    const data = await res.json();
    const tbody = document.querySelector("#events tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    (data.data || []).forEach((ev) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${ev.name || ""}</td>
        <td>${ev.preview || ""}</td>
        <td>${ev.date || ""}</td>
        <td>${ev.start_time || ""}</td>
        <td>${ev.end_time || ""}</td>
        <td>${ev.location || ""}</td>
        <td>${ev.points ?? 0}</td>
        <td>${ev.attendance ?? 0}</td>
        <td>${ev.tag || ""}</td>
        <td>${ev.volunteers_per_hour ?? ""}</td>
        <td>
          <button data-edit="${ev.id}">Edit</button>
          <button data-del="${ev.id}">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });

    // Wire edit/delete buttons
    tbody.querySelectorAll("button[data-edit]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-edit");
        const ev = (await (await fetch(`/.netlify/functions/events/${id}`)).json()).data;
        if (!ev) return;
        fillForm(ev);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
    tbody.querySelectorAll("button[data-del]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-del");
        if (!confirm("Delete this event?")) return;
        const token = await freshJwt();
        const res = await fetch(`/.netlify/functions/events/${id}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token }
        });
        const json = await res.json();
        if (!json.ok) { alert(json.error || "Delete failed"); return; }
        await loadEvents();
        clearForm();
      });
    });
  }

  function getFormData(){
    const g = id => document.getElementById(id)?.value?.trim() || null;
    const toInt = v => { const n = parseInt(v,10); return Number.isFinite(n) ? n : null; };
    return {
      id: g("ev-id"), // hidden for edits
      name: g("ev-name"),
      description: g("ev-description"),
      preview: g("ev-preview"),
      date: g("ev-date"),
      start_time: g("ev-start-time"),
      end_time: g("ev-end-time"),
      location: g("ev-location"),
      image_url: g("ev-image-url"),
      points: toInt(g("ev-points")) ?? 0,
      attendance: toInt(g("ev-attendance")) ?? 0,
      tag: g("ev-tag"),
      volunteers_per_hour: toInt(g("ev-vph"))
    };
  }

  function fillForm(ev){
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ""; };
    set("ev-id", ev.id || "");
    set("ev-name", ev.name);
    set("ev-description", ev.description);
    set("ev-preview", ev.preview);
    set("ev-date", ev.date);
    set("ev-start-time", ev.start_time);
    set("ev-end-time", ev.end_time);
    set("ev-location", ev.location);
    set("ev-image-url", ev.image_url);
    set("ev-points", ev.points);
    set("ev-attendance", ev.attendance);
    set("ev-tag", ev.tag);
    set("ev-vph", ev.volunteers_per_hour);
    document.getElementById("save-btn").textContent = "Update Event";
    document.getElementById("cancel-btn").style.display = "inline-block";
  }

  function clearForm(){
    ["ev-id","ev-name","ev-description","ev-preview","ev-date","ev-start-time","ev-end-time","ev-location","ev-image-url","ev-points","ev-attendance","ev-tag","ev-vph"].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = "";
    });
    document.getElementById("save-btn").textContent = "Create Event";
    document.getElementById("cancel-btn").style.display = "none";
  }

  async function saveEvent(e){
    e.preventDefault();
    const data = getFormData();
    if (!data.name) { alert("Event name is required"); return; }
    const token = await freshJwt();

    if (data.id) {
      const id = data.id; delete data.id;
      const res = await fetch(`/.netlify/functions/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!json.ok) { alert(json.error || "Update failed"); return; }
    } else {
      const res = await fetch("/.netlify/functions/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!json.ok) { alert(json.error || "Create failed"); return; }
    }
    clearForm();
    await loadEvents();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("event-form");
    if (form) form.addEventListener("submit", saveEvent);
    const cancel = document.getElementById("cancel-btn");
    if (cancel) cancel.addEventListener("click", (e)=>{ e.preventDefault(); clearForm(); });
    const refresh = document.getElementById("refresh-btn");
    if (refresh) refresh.addEventListener("click", loadEvents);
  });
})();
