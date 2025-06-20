
document.addEventListener('DOMContentLoaded', () => {
  const tags = document.querySelectorAll('.tag');
  const input = document.getElementById('searchInput');
  const container = document.getElementById('eventsContainer');

  const events = [
    {
      title: "Fall Recital",
      type: "performance",
      time: "October 15, 2025 - 7 PM",
      location: "Pfleeger Concert Hall",
      preview: "Come hear NAfME students perform.",
    },
    {
      title: "Service at School",
      type: "volunteer",
      time: "November 2, 2025 - 10 AM",
      location: "Local Middle School",
      preview: "Join us in giving back to our community through music.",
    }
  ];

  function render(eventsToRender) {
    container.innerHTML = "";
    eventsToRender.forEach(e => {
      const div = document.createElement("div");
      div.className = "event-card";
      div.innerHTML = \`
        <h3>\${e.title}</h3>
        <p><strong>When:</strong> \${e.time}</p>
        <p><strong>Where:</strong> \${e.location}</p>
        <p>\${e.preview}</p>
      \`;
      container.appendChild(div);
    });
  }

  render(events);

  input.addEventListener("input", () => {
    const term = input.value.toLowerCase();
    const filtered = events.filter(e => e.title.toLowerCase().includes(term));
    render(filtered);
  });

  tags.forEach(tag => {
    tag.addEventListener("click", () => {
      const type = tag.getAttribute("data-type");
      const filtered = events.filter(e => e.type === type);
      render(filtered);
    });
  });
});
