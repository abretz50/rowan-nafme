
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
});
