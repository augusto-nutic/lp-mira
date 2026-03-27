const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileViewport = window.matchMedia("(max-width: 720px)");

const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.getElementById("site-nav");
const navLinks = [
  ...document.querySelectorAll(".site-nav a[href^='#'], .mobile-dock a[href^='#']"),
];

function closeNav() {
  if (!siteHeader || !navToggle) {
    return;
  }

  siteHeader.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

if (siteHeader && navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", (event) => {
    if (!mobileViewport.matches || !siteHeader.classList.contains("nav-open")) {
      return;
    }

    if (!siteHeader.contains(event.target)) {
      closeNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });

  const handleViewportChange = (event) => {
    if (!event.matches) {
      closeNav();
    }
  };

  if (typeof mobileViewport.addEventListener === "function") {
    mobileViewport.addEventListener("change", handleViewportChange);
  } else {
    mobileViewport.addListener(handleViewportChange);
  }
}

function setActiveNavLink(id) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
  });
}

const sectionIds = [...new Set(navLinks.map((link) => link.getAttribute("href")?.slice(1)).filter(Boolean))];
const trackedSections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

if (trackedSections.length) {
  setActiveNavLink(trackedSections[0].id);

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]) {
          setActiveNavLink(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-22% 0px -45% 0px",
        threshold: [0.2, 0.45, 0.7],
      },
    );

    trackedSections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }
}

const revealItems = document.querySelectorAll("[data-reveal]");

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 },
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 70, 320)}ms`;
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("revealed"));
}

const heroMessages = [...document.querySelectorAll("#hero-chat .bubble")];

if (!prefersReducedMotion && heroMessages.length) {
  function playHeroChat() {
    heroMessages.forEach((message) => message.classList.remove("show"));
    let heroIndex = 0;

    function showNext() {
      if (heroIndex >= heroMessages.length) {
        setTimeout(playHeroChat, 2200);
        return;
      }

      heroMessages[heroIndex].classList.add("show");
      heroIndex += 1;
      setTimeout(showNext, 900);
    }

    showNext();
  }

  playHeroChat();
} else {
  heroMessages.forEach((message) => message.classList.add("show"));
}

const form = document.getElementById("lead-form");
const feedback = document.getElementById("form-feedback");

if (form && feedback) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const nome = formData.get("nome")?.toString().trim() || "Seu time";
    feedback.textContent = `${nome}, recebemos seu pedido. Nossa equipe vai entrar em contato em breve pelo email ou WhatsApp informado.`;
    feedback.style.color = "#0a6e48";
    form.reset();
  });
}
