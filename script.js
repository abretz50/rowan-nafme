document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const tags = document.querySelectorAll(".tag");
  const eventsContainer = document.getElementById("eventsContainer");

  const events = [
    { name: "Fall Concert", type: "Performances" },
    { name: "Community Cleanup", type: "Volunteer" },
    { name: "Monthly Meeting", type: "General Meeting" },
    { name: "Resume Workshop", type: "Professional Development" }
  ];

  function renderEvents(filterText = "", filterTag = "") {
    eventsContainer.innerHTML = "";
    const filtered = events.filter(e =>
      (!filterText || e.name.toLowerCase().includes(filterText.toLowerCase())) &&
      (!filterTag || e.type === filterTag)
    );
    filtered.forEach(e => {
      const div = document.createElement("div");
      div.textContent = `${e.name} (${e.type})`;
      div.className = "event-entry";
      eventsContainer.appendChild(div);
    });
  }

  searchInput.addEventListener("input", () => {
    renderEvents(searchInput.value);
  });

  tags.forEach(tag => {
    tag.addEventListener("click", () => {
      const type = tag.textContent;
      renderEvents(searchInput.value, type);
    });
  });

  renderEvents();
});