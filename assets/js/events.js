(function () {
  // ====== CONFIG ======
  const SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcgOeW0i-7EiDTkN_9rr6hXJSE0nFUsnpKXGSHyPUUudWnja7FQJ0vjvt9x7ktQciDGcZa8OD3VXip/pub?output=csv";

  const WRAP_ID = "eventsList";
  const MODAL_ID = "eventModal";

  const FALLBACK_EVENTS =
    typeof EVENTS !== "undefined" && Array.isArray(EVENTS) ? EVENTS : [];

  // Show/hide past events (wired to #togglePast if present)
  let includePast = false;

  // ====== UTIL ======
  function nl2br(s) {
    return s ? escapeHTML(s).replace(/\r?\n/g, "<br>") : "";
  }

  const toSnakeKeys = (obj) => {
    const out = Object.create(null);
    Object.keys(obj || {}).forEach((k) => {
      const key = String(k || "").toLowerCase().trim().replace(/[\s\-]+/g, "_");
      out[key] = obj[k];
    });
    return out;
  };
  const pick = (map, keys) => {
    for (let i = 0; i < keys.length; i++) {
      const v = map[keys[i]];
      if (v != null && String(v).trim() !== "") return String(v).trim();
    }
    return "";
  };
  const parseDate = (s) => {
    if (!s) return null;
    let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
    if (m) return new Date(+m[3], +m[1] - 1, +m[2]);
    const d = new Date(s);
    return isNaN(d) ? null : d;
  };
  const parseTime = (s) => {
    if (!s) return null;
    const m = /^(\d{1,2})(?::(\d{2}))?\s*([AP]M)?$/i.exec(s);
    if (!m) return null;
    let h = +m[1];
    const min = m[2] ? +m[2] : 0;
    const mer = m[3] ? m[3].toUpperCase() : "";
    if (mer === "PM" && h < 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;
    return { h, m: min };
  };
  const combineDateTime = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const d = parseDate(dateStr);
    if (!d) return null;
    const t = parseTime(timeStr);
    if (t) d.setHours(t.h, t.m, 0, 0);
    return d;
  };
  const escapeHTML = (s) =>
    s
      ? s.replace(/[&<>"']/g, (c) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c])
      : "";

  const formatDateLong = (d) =>
    d.toLocaleString([], { dateStyle: "full", timeStyle: "short" });
  const formatDateShort = (d) =>
    d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const formatTimeShort = (d) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const isUpcoming = (dateEnd) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateEnd >= today;
  };
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  const toICSDateUTC = (date) =>
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z";
  const googleCalLink = ({ title, start, end, location, description }) => {
    const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const dates = `${toICSDateUTC(start)}/${toICSDateUTC(end || start)}`;
    const params = new URLSearchParams({
      text: title || "",
      dates,
      details: description || "",
      location: location || "",
    });
    return `${base}&${params.toString()}`;
  };

  // ====== TAG NORMALIZATION (fixed chip set) ======
  const TAGS_ALLOWED = new Set([
    "meeting",
    "volunteer",
    "professional-development",
    "workshop",
    "event"
  ]);
  const TAG_SYNONYMS = {
    "prof-dev": "professional-development",
    "professional dev": "professional-development",
    "professional": "professional-development",
    "pd": "professional-development",
    "club": "event",
    "club-event": "event",
    "general": "event"
  };
  function normalizeTag(t) {
    if (!t) return null;
    const k = t.trim().toLowerCase().replace(/\s+/g, "-");
    if (TAGS_ALLOWED.has(k)) return k;
    return TAG_SYNONYMS[k] || null;
  }
  function labelForTag(k) {
    switch (k) {
      case "professional-development": return "Professional Development";
      case "meeting": return "Meeting";
      case "volunteer": return "Volunteer";
      case "workshop": return "Workshop";
      case "event": return "Event";
      default: return (k || "").replace(/-/g," ").replace(/\b\w/g, s=>s.toUpperCase());
    }
  }

  // ====== RENDER CARDS ======
  function renderEvents(list) {
    const wrap = document.getElementById(WRAP_ID);
    if (!wrap) return;
    wrap.innerHTML = "";
    if (!list.length) {
      wrap.innerHTML =
        `<p class="subtle">No events match those filters. Try toggling tags or “Include past events”.</p>`;
      return;
    }
    list.forEach((ev) => {
      const card = document.createElement("article");
      card.className = "card event-card";

      const tagsHTML = (ev.tags || [])
        .map((t) => `<span class="badge">${escapeHTML(labelForTag(t))}</span>`)
        .join(" ");

      const imgHTML = ev.image
        ? `<img class="event-thumb" src="${escapeHTML(ev.image)}" alt="" loading="lazy">`
        : "";

      card.innerHTML = `
  ${imgHTML}
  <div class="kicker">${formatDateLong(new Date(ev.dt))}</div>
  <h3>${escapeHTML(ev.title)}</h3>
  <p class="subtle">
    ${ev.location ? `${escapeHTML(ev.location)} · ` : ""}
    ${ev.tags && ev.tags.length ? ev.tags.map(t=>labelForTag(t)).join(", ") : ""}
  </p>
  ${tagsHTML ? `<div class="event-tags">${tagsHTML}</div>` : ""}
  <p class="event-desc">${escapeHTML(ev.description || "")}</p>
  <div class="event-actions">
    <button class="button" data-details="${ev.id}">Details</button>
    <a class="button primary" ${
      ev.signin ? `href="${ev.signin}" target="_blank" rel="noopener"` : `href="#" aria-disabled="true" tabindex="-1"`
    }>Sign&nbsp;In</a>
  </div>
`;

      wrap.appendChild(card);
    });
  }

  // ====== MODAL ======
  function openModalFor(ev) {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;

    const body = modal.querySelector(".modal__body");
    const start = new Date(ev.dt);
    const end = ev._end ? new Date(ev._end) : start;

    const timeRange =
      formatTimeShort(start) !== formatTimeShort(end)
        ? `${formatTimeShort(start)}–${formatTimeShort(end)}`
        : formatTimeShort(start);

    const gcal = googleCalLink({
      title: ev.title,
      start,
      end,
      location: ev.location,
      description: ev.description
    });

    const bigImg = ev.image
      ? `<img class="event-hero" src="${escapeHTML(ev.image)}" alt="" loading="lazy">`
      : "";

    const tagsHTML = (ev.tags || [])
      .map((t) => `<span class="badge">${escapeHTML(labelForTag(t))}</span>`)
      .join(" ");

    const detailsBlock = ev.details
      ? `<div class="event-details">${nl2br(ev.details)}</div>`
      : (ev.description ? `<p class="event-desc">${escapeHTML(ev.description)}</p>` : "");

    body.innerHTML = `
      ${bigImg}
      <h2 id="modalTitle" class="event-title">${escapeHTML(ev.title)}</h2>
      <div class="event-meta">
        <span>${formatDateShort(start)}</span>
        <span>•</span>
        <span>${timeRange}</span>
        ${ev.location ? `<span>•</span><span>${escapeHTML(ev.location)}</span>` : ""}
      </div>
      ${tagsHTML ? `<div class="event-tags">${tagsHTML}</div>` : ""}
      ${detailsBlock}
      <div class="modal-actions">
        <a class="button" href="${gcal}" target="_blank" rel="noopener">Add to Google Calendar</a>
        ${ev.signin ? `<a class="button primary" href="${ev.signin}" target="_blank" rel="noopener">Sign&nbsp;In</a>` : ""}
      </div>
    `;

    modal.hidden = false;
    const firstFocus = modal.querySelector('[data-modal-close]') || modal.querySelector("a,button");
    if (firstFocus) firstFocus.focus();

    function onKey(e){ if (e.key === "Escape") close(); if (e.key === "Tab") trapFocus(e, modal); }
    function close(){
      modal.hidden = true;
      document.removeEventListener("keydown", onKey);
      modal.removeEventListener("click", onClick);
    }
    function onClick(e){
      if (e.target.closest("[data-modal-close]") || e.target.classList.contains("modal__backdrop")) close();
    }
    document.addEventListener("keydown", onKey);
    modal.addEventListener("click", onClick);
  }

  function trapFocus(e, container) {
    const focusables = container.querySelectorAll(
      'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ====== FILTER (chips + toggle) ======
  function setupChips(events) {
    const chips = document.querySelectorAll("[data-filter]");
    const active = new Set(); // none selected => "All"

    // Wire up the "Include past events" toggle if present
    const pastToggle = document.getElementById("togglePast");
    if (pastToggle) {
      includePast = !!pastToggle.checked;
      pastToggle.setAttribute("aria-checked", includePast ? "true" : "false");
      pastToggle.addEventListener("change", () => {
        includePast = !!pastToggle.checked;
        pastToggle.setAttribute("aria-checked", includePast ? "true" : "false");
        applyFilter();
      });
    }

    function applyFilter() {
      const base = includePast
        ? events
        : events.filter((ev) => isUpcoming(new Date(ev._end || ev.dt)));

      const filtered = !active.size
        ? base
        : base.filter((ev) => ev.tags.some((t) => active.has(t)));

      renderEvents(filtered);
      wireDetailButtons(events); // after render
    }

    chips.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tag = btn.dataset.filter;

        if (tag === "all") {
          chips.forEach((b) => b.setAttribute("aria-pressed", "false"));
          active.clear();
          btn.setAttribute("aria-pressed", "true");
          applyFilter();
          return;
        }

        const pressed = btn.getAttribute("aria-pressed") === "true";
        btn.setAttribute("aria-pressed", pressed ? "false" : "true");

        const allChip = document.querySelector('[data-filter="all"]');
        if (allChip) allChip.setAttribute("aria-pressed", "false");

        if (pressed) active.delete(tag);
        else active.add(tag);

        applyFilter();
      });
    });

    applyFilter(); // initial
  }

  function wireDetailButtons(allEvents) {
    document.querySelectorAll("[data-details]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.getAttribute("data-details");
        const ev = allEvents.find((x) => x.id === id);
        if (ev) openModalFor(ev);
      });
    });
  }

  // ====== CSV → EVENTS ======
  function rowsToEvents(rows) {
    const events = [];
    for (const row of rows) {
      const m = toSnakeKeys(row);

      const title = pick(m, ["title", "event_title", "name"]);
      const dtDirect = pick(m, ["dt", "datetime", "date_time", "iso", "start_iso"]);
      const dateStr = pick(m, ["date", "event_date", "day", "date_only"]);
      const start = pick(m, ["start_time", "start", "time_start", "begin_time", "begin", "time"]);
      const end = pick(m, ["end_time", "end", "time_end", "finish_time", "finish"]);
      const location = pick(m, ["location", "where", "place", "venue"]);
      const description = pick(m, ["description", "desc", "details_text", "summary", "about"]);
      const details = pick(m, ["details", "details_url", "more_info", "more_info_url", "link", "url"]);
      const signin = pick(m, ["signin_link", "sign_in_link", "sign_in", "signup", "signup_link", "attendance_link"]);
      const image = pick(m, ["image_url", "image", "img", "photo", "photo_url"]);
      const tagsRaw = pick(m, ["tags", "tag", "labels", "label", "category", "categories"]);

      let startDate = null;
      if (dtDirect) {
        const d = new Date(dtDirect);
        if (!isNaN(d)) startDate = d;
      }
      if (!startDate) startDate = combineDateTime(dateStr, start);
      if (!startDate || !title) continue;

      const endDate = combineDateTime(dateStr, end) || startDate;

      // normalize to fixed tag set
      const tags = Array.from(
        new Set(
          (tagsRaw || "")
            .split(/[;,|]/)
            .map(normalizeTag)
            .filter(Boolean)
        )
      );

      events.push({
        id: pick(m, ["id", "key", "slug"]) || `${title}-${+startDate}`,
        title,
        dt: startDate.toISOString(),
        _end: endDate.toISOString(),
        location,
        tags,
        description,
        details,
        signin,
        image,
      });
    }
    events.sort((a, b) => new Date(a.dt) - new Date(b.dt));
    return events;
  }

  // ====== LOAD & BOOT ======
  function loadFromSheet() {
    const wrap = document.getElementById(WRAP_ID);
    if (wrap) wrap.innerHTML = "<p>Loading events…</p>";

    if (!window.Papa) {
      console.error("PapaParse is required. Add its <script> before events.js.");
      renderFallback();
      return;
    }

    fetch(SHEET_CSV_URL, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then(
        (csv) =>
          new Promise((resolve) => {
            Papa.parse(csv, {
              header: true,
              skipEmptyLines: true,
              complete: (res) => resolve(res.data || []),
            });
          })
      )
      .then((rows) => {
        const events = rowsToEvents(rows);
        if (!events.length) {
          console.warn("Sheet loaded but no events were parsed. Falling back.");
          renderFallback();
          return;
        }
        setupChips(events);
      })
      .catch((err) => {
        console.error("Failed to load sheet:", err);
        renderFallback();
      });
  }

  function renderFallback() {
    const mapped = FALLBACK_EVENTS.map((e) => ({
      id: e.id,
      title: e.title,
      dt: e.dt,
      _end: e.dt,
      location: e.location,
      tags: (e.tags || []).map(normalizeTag).filter(Boolean),
      description: e.description || "",
      details: "",
      signin: "",
      image: e.image || "",
    }));
    setupChips(mapped);
  }

  document.addEventListener("DOMContentLoaded", () => {
    // modal global close (backdrop/close button)
    const modal = document.getElementById(MODAL_ID);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (
          e.target.closest("[data-modal-close]") ||
          e.target.classList.contains("modal__backdrop")
        ) {
          modal.hidden = true;
        }
      });
    }
    loadFromSheet();
  });
})();
