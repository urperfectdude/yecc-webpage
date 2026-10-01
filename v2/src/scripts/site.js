// Mobile menu + dropdowns
const header = document.querySelector(".header");
document.querySelector(".menu-btn").addEventListener("click", (e) => {
  const open = header.classList.toggle("menu-open");
  e.currentTarget.setAttribute("aria-expanded", open);
});
document.querySelectorAll(".nav-item > button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    document.querySelectorAll(".nav-item.open").forEach((o) => o !== item && o.classList.remove("open"));
    btn.setAttribute("aria-expanded", item.classList.toggle("open"));
  });
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav-item")) document.querySelectorAll(".nav-item.open").forEach((o) => o.classList.remove("open"));
  if (e.target.closest(".header-panel a")) header.classList.remove("menu-open");
});

// Accordion feature: one item open at a time, matching visual on the stage.
// The progress bar under the stage shows the time left before the next tab opens. It waits while the
// pointer or keyboard focus is on the section, and stops for good once the visitor picks a tab.
document.querySelectorAll("[data-accordion]").forEach((root) => {
  const DWELL = 4500;
  const items = root.querySelectorAll(".acc-item");
  const mocks = root.querySelectorAll(".mock");
  const bars = [...root.querySelector(".progress").children];
  let current = 0;
  let elapsed = 0;
  let paused = false;
  let auto = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const show = (i) => {
    current = i;
    elapsed = 0;
    items.forEach((el, j) => {
      el.classList.toggle("on", i === j);
      el.querySelector("button").setAttribute("aria-expanded", i === j);
    });
    mocks.forEach((el, j) => el.classList.toggle("on", i === j));
    bars.forEach((el, j) => {
      el.classList.toggle("on", i === j);
      el.classList.toggle("done", j < i);
      el.style.setProperty("--p", auto ? 0 : 1);
    });
  };
  let last = 0;
  const tick = (now) => {
    if (!auto) return;
    if (!paused && last) elapsed += Math.min(now - last, 100); // cap so a background tab does not skip ahead
    last = now;
    if (elapsed >= DWELL) show((current + 1) % items.length);
    bars[current].style.setProperty("--p", elapsed / DWELL);
    requestAnimationFrame(tick);
  };
  items.forEach((item, i) => {
    item.querySelector("button").addEventListener("click", () => {
      auto = false;
      show(i);
    });
  });
  ["mouseenter", "focusin"].forEach((e) => root.addEventListener(e, () => (paused = true)));
  ["mouseleave", "focusout"].forEach((e) => root.addEventListener(e, () => (paused = false)));
  show(0);
  requestAnimationFrame(tick);
});

// Horizontal scroller: arrows and dots move one card at a time; one dot per scroll stop
document.querySelectorAll("[data-scroller]").forEach((root) => {
  const track = root.querySelector(".scroller-track");
  const prev = root.querySelector(".prev");
  const next = root.querySelector(".next");
  const dots = root.querySelector(".dots");
  const step = () => track.firstElementChild.getBoundingClientRect().width + 16;
  const max = () => track.scrollWidth - track.clientWidth;
  const go = (i) => track.scrollTo({ left: i * step(), behavior: "smooth" });
  const current = () => (track.scrollLeft > max() - 4 ? dots.children.length - 1 : Math.round(track.scrollLeft / step()));
  const sync = () => {
    const i = current();
    prev.disabled = i === 0;
    next.disabled = i === dots.children.length - 1;
    [...dots.children].forEach((d, j) => d.classList.toggle("on", i === j));
  };
  const build = () => {
    const stops = Math.ceil(max() / step() - 0.05) + 1;
    dots.innerHTML = "";
    for (let i = 0; i < stops; i++) {
      const d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
      d.addEventListener("click", () => go(i));
      dots.appendChild(d);
    }
    sync();
  };
  prev.addEventListener("click", () => go(current() - 1));
  next.addEventListener("click", () => go(current() + 1));
  track.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", build);
  build();
});

// There is no form backend, so submitting opens a pre-filled email to sales.
const form = document.querySelector("form[data-mailto]");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const body = ["name", "company", "email", "role", "interest", "message"].map((k) => `${k}: ${d.get(k)}`).join("\n");
    location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent("YECC discussion request")}&body=${encodeURIComponent(body)}`;
  });
}

// Course page: sections fade in as they come into view
const reveals = document.querySelectorAll(".reveal");
if (reveals.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

// Course page: "Read more" on the description, hidden when the text already fits
document.querySelectorAll("[data-more]").forEach((root) => {
  const text = root.querySelector("p");
  const btn = root.querySelector("button");
  if (text.scrollHeight <= text.clientHeight + 4) {
    root.classList.add("open");
    btn.hidden = true;
    return;
  }
  btn.addEventListener("click", () => {
    const open = root.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
    btn.querySelector("span").textContent = open ? "Show less" : "Read more";
  });
});

// Course page: expand or collapse every module at once
const expandAll = document.querySelector("[data-expand-all]");
if (expandAll) {
  const modules = [...document.querySelectorAll("details.module")];
  const sync = () => (expandAll.textContent = modules.every((m) => m.open) ? "Collapse all" : "Expand all");
  expandAll.addEventListener("click", () => {
    const open = !modules.every((m) => m.open);
    modules.forEach((m) => (m.open = open));
    sync();
  });
  modules.forEach((m) => m.addEventListener("toggle", sync));
  sync();
}

// Course page on small screens: a buy bar slides up once the card's buy button has scrolled away
const buyAnchor = document.querySelector("[data-buy-anchor]");
const buyBar = document.querySelector(".buy-bar");
if (buyAnchor && buyBar && "IntersectionObserver" in window) {
  new IntersectionObserver(([e]) => {
    const show = !e.isIntersecting && e.boundingClientRect.top < 0;
    buyBar.classList.toggle("show", show);
    buyBar.inert = !show;
  }).observe(buyAnchor);
}
