
const EVENTS = [
  {
    id: "pd-001",
    title: "First Meeting & Welcome",
    dt: "2025-09-05T18:00:00",
    location: "Wilson Hall, RM 123",
    tags: ["meeting"],
    description: "Kick off the semester, meet the e-board, and learn about upcoming opportunities."
  },
  {
    id: "ws-002",
    title: "Lesson Planning Workshop",
    dt: "2025-09-19T17:30:00",
    location: "Boyd Recital Hall",
    tags: ["workshop","professional-development"],
    description: "Hands-on clinic on building engaging lesson plans for K–12 music."
  },
  {
    id: "vol-003",
    title: "Instrument Petting Zoo",
    dt: "2025-10-04T10:00:00",
    location: "Glassboro Public Library",
    tags: ["volunteer"],
    description: "Community outreach event. Help kids try instruments. Earn volunteer hours."
  },
  {
    id: "meet-004",
    title: "State Conference Info Night",
    dt: "2025-10-15T19:00:00",
    location: "Wilson Hall, RM 245",
    tags: ["meeting","convention"],
    description: "Travel, housing, and funding overview for the state NAfME conference."
  }
];

function formatDate(iso){
  const d = new Date(iso);
  return d.toLocaleString([], { dateStyle: "full", timeStyle: "short" });
}

function renderEvents(list){
  const wrap = document.getElementById("eventsList");
  wrap.innerHTML = "";
  if (!list.length){
    wrap.innerHTML = `<p class="subtle">No events match those filters yet. Try clearing a tag.</p>`;
    return;
  }
  list.forEach(ev => {
    const card = document.createElement("article");
    card.className = "card event-card";
    card.innerHTML = `
      <div class="kicker">${ev.tags.map(t => `<span class="badge">${t}</span>`).join(" ")}</div>
      <div class="event-title">${ev.title}</div>
      <div class="event-meta">
        <span>${formatDate(ev.dt)}</span>
        <span>•</span>
        <span>${ev.location}</span>
      </div>
      <p>${ev.description || ""}</p>
      <div class="event-actions">
        <a class="button" href="#"
           aria-disabled="true">Details</a>
        <a class="button primary" href="#" aria-disabled="true">RSVP (soon)</a>
      </div>
    `;
    wrap.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const chips = document.querySelectorAll("[data-filter]");
  let active = new Set();
  chips.forEach(btn => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.filter;
      if (btn.getAttribute("aria-pressed") === "true"){
        btn.setAttribute("aria-pressed","false");
        active.delete(tag);
      } else {
        btn.setAttribute("aria-pressed","true");
        active.add(tag);
      }
      const filtered = !active.size ? EVENTS :
        EVENTS.filter(ev => ev.tags.some(t => active.has(t)));
      renderEvents(filtered);
    });
  });
  renderEvents(EVENTS);
});
