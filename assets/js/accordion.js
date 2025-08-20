
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".accordion-item .accordion-summary").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".accordion-item");
      const open = item.hasAttribute("open");
      // allow multiple open; just toggle current
      if (open) item.removeAttribute("open"); else item.setAttribute("open","");
    });
  });
});
