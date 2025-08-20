console.log("Rowan NAfME site loaded");

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-links a");
  const currentPath = window.location.pathname;
  const hash = window.location.hash;

  // Clear active state initially
  navLinks.forEach(link => link.classList.remove("active"));

  // Set active state based on pathname for regular pages
  navLinks.forEach(link => {
    const linkHref = link.getAttribute("href");
    if (currentPath.endsWith(linkHref) && !linkHref.includes("#")) {
      link.classList.add("active");
    }
  });

  // Scroll-based highlight for #our-chapter
  const chapterLink = document.querySelector('.nav-links a[href$="#our-chapter"]');
  const chapterSection = document.getElementById("our-chapter");

  if (chapterLink && chapterSection) {
    window.addEventListener("scroll", () => {
      const rect = chapterSection.getBoundingClientRect();
      const inView = rect.top <= window.innerHeight * 0.5 && rect.bottom >= 0;
      chapterLink.classList.toggle("active", inView);
    });
  }

  // 🔍 Search + Filter logic for Events page
  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterSelect");
  const eventCards = document.querySelectorAll(".event-card");

  function filterEvents() {
    const query = searchInput?.value.toLowerCase() || "";
    const selectedType = filterSelect?.value || "";

    eventCards.forEach(card => {
      const textMatch = card.textContent.toLowerCase().includes(query);
      const typeMatch = !selectedType || card.dataset.type === selectedType;
      card.style.display = textMatch && typeMatch ? "block" : "none";
    });
  }

  if (searchInput && filterSelect && eventCards.length > 0) {
    searchInput.addEventListener("input", filterEvents);
    filterSelect.addEventListener("change", filterEvents);
  }
});

