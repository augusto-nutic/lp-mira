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
  const nativeFormSubmit = HTMLFormElement.prototype.submit;
  const submitButton = form.querySelector("button[type='submit']");
  const defaultButtonLabel =
    submitButton?.dataset.defaultLabel || submitButton?.textContent?.trim() || "Enviar";
  const loadingButtonLabel =
    submitButton?.dataset.loadingLabel || "Enviando...";
  const defaultFeedbackMessage = feedback.textContent;
  const validationFeedbackMessage = "Revise os campos destacados e tente novamente.";
  const formspreeEndpoint =
    form.dataset.formspreeEndpoint?.trim() ||
    form.getAttribute("action")?.trim() ||
    "";
  const validationFields = [
    form.querySelector("#nome"),
    form.querySelector("#email"),
    form.querySelector("#whatsapp"),
    form.querySelector("#empresa"),
  ].filter(Boolean);

  function setFeedbackState(message, state = "default") {
    feedback.textContent = message;
    feedback.classList.remove("is-loading", "is-success", "is-error");

    if (state !== "default") {
      feedback.classList.add(`is-${state}`);
    }
  }

  function setSubmittingState(isSubmitting) {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting
      ? loadingButtonLabel
      : defaultButtonLabel;
  }

  function setHiddenFieldValue(fieldName, value) {
    const field = form.querySelector(`[name="${fieldName}"]`);

    if (field) {
      field.value = value;
    }
  }

  function normalizeText(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function sanitizePhoneDigits(value) {
    let digits = value.replace(/\D/g, "");

    if (digits.length > 11 && digits.startsWith("55")) {
      digits = digits.slice(2);
    }

    return digits.slice(0, 11);
  }

  function formatWhatsapp(value) {
    const digits = sanitizePhoneDigits(value);

    if (!digits) {
      return "";
    }

    if (digits.length < 3) {
      return `(${digits}`;
    }

    if (digits.length < 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length < 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  function getFieldErrorElement(field) {
    const errorId = field.getAttribute("aria-describedby");

    return errorId ? document.getElementById(errorId) : null;
  }

  function setFieldError(field, message = "") {
    const errorElement = getFieldErrorElement(field);
    const hasError = Boolean(message);

    field.classList.toggle("is-invalid", hasError);
    field.setAttribute("aria-invalid", hasError ? "true" : "false");

    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function clearValidationState() {
    validationFields.forEach((field) => {
      setFieldError(field);
    });
  }

  function sanitizeFieldValue(field, mode = "submit") {
    if (field.name === "whatsapp") {
      field.value = formatWhatsapp(field.value);
      return;
    }

    if (mode === "blur" || mode === "submit") {
      if (field.name === "nome" || field.name === "empresa") {
        field.value = normalizeText(field.value);
      }

      if (field.name === "email") {
        field.value = field.value.trim();
      }
    }
  }

  function validateField(field, mode = "submit") {
    sanitizeFieldValue(field, mode);

    let message = "";

    if (field.name === "nome") {
      const normalizedName = normalizeText(field.value);

      if (!normalizedName) {
        message = "Informe seu nome.";
      } else if (normalizedName.length < 3) {
        message = "Digite pelo menos 3 letras.";
      } else if (!/^[\p{L}' -]+$/u.test(normalizedName)) {
        message = "Use apenas letras, espacos, apostrofo e hifen.";
      }
    }

    if (field.name === "email") {
      const normalizedEmail = field.value.trim();

      if (!normalizedEmail) {
        message = "Informe seu email.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(normalizedEmail)) {
        message = "Digite um email valido.";
      }
    }

    if (field.name === "whatsapp") {
      const phoneDigits = sanitizePhoneDigits(field.value);

      if (!phoneDigits) {
        message = "Informe seu WhatsApp.";
      } else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        message = "Digite um numero com DDD.";
      } else if (/^0/.test(phoneDigits)) {
        message = "Digite um WhatsApp valido.";
      }
    }

    if (field.name === "empresa") {
      const normalizedCompany = normalizeText(field.value);

      if (!normalizedCompany) {
        message = "Informe o nome da empresa.";
      } else if (normalizedCompany.length < 2) {
        message = "Digite pelo menos 2 caracteres.";
      } else if (!/[\p{L}\d]/u.test(normalizedCompany)) {
        message = "Digite um nome de empresa valido.";
      }
    }

    setFieldError(field, message);

    if (
      !message &&
      feedback.textContent === validationFeedbackMessage &&
      !validationFields.some((input) => input.classList.contains("is-invalid"))
    ) {
      setFeedbackState(defaultFeedbackMessage);
    }

    return !message;
  }

  function validateForm() {
    let firstInvalidField = null;

    validationFields.forEach((field) => {
      const isValid = validateField(field, "submit");

      if (!isValid && !firstInvalidField) {
        firstInvalidField = field;
      }
    });

    if (firstInvalidField) {
      setFeedbackState(validationFeedbackMessage, "error");
      firstInvalidField.focus();
      return false;
    }

    return true;
  }

  function populateLeadContext() {
    const searchParams = new URLSearchParams(window.location.search);
    const trackedParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];

    setHiddenFieldValue("origem_pagina", window.location.href);
    setHiddenFieldValue("origem_referrer", document.referrer || "direto");

    trackedParams.forEach((paramName) => {
      setHiddenFieldValue(paramName, searchParams.get(paramName) || "");
    });
  }

  function trackLeadSubmission(formData) {
    if (typeof window.plausible !== "function") {
      return;
    }

    window.plausible("Lead Form Submitted", {
      props: {
        form: "rodape",
        source: formData.get("utm_source") || "direto",
        campaign: formData.get("utm_campaign") || "sem_campanha",
      },
    });
  }

  const formspreeConfigured =
    /^https:\/\/formspree\.io\/f\/[\w-]+$/i.test(formspreeEndpoint);

  validationFields.forEach((field) => {
    if (field.name === "whatsapp") {
      field.addEventListener("input", () => {
        sanitizeFieldValue(field, "input");

        if (field.classList.contains("is-invalid")) {
          validateField(field, "input");
        }
      });
    } else {
      field.addEventListener("input", () => {
        if (field.classList.contains("is-invalid")) {
          validateField(field, "input");
        }
      });
    }

    field.addEventListener("blur", () => {
      validateField(field, "blur");
    });
  });

  populateLeadContext();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!formspreeConfigured) {
      setFeedbackState(
        "Configure o endpoint real do Formspree em index.html antes de publicar este formulario.",
        "error",
      );
      return;
    }

    populateLeadContext();
    setHiddenFieldValue("submitted_at", new Date().toISOString());

    const formData = new FormData(form);
    const nome = formData.get("nome")?.toString().trim() || "Seu time";

    setSubmittingState(true);
    setFeedbackState("Enviando seu pedido...", "loading");

    try {
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(
          responseBody || `Formspree returned ${response.status}`,
        );
      }

      trackLeadSubmission(formData);
      setFeedbackState(
        `${nome}, recebemos seu pedido. Nossa equipe vai entrar em contato em breve pelo email ou WhatsApp informado.`,
        "success",
      );
      form.reset();
      clearValidationState();
      populateLeadContext();
    } catch (error) {
      const errorMessage = String(error?.message || "");
      const networkBlocked =
        error instanceof TypeError ||
        /Failed to fetch|Load failed|NetworkError/i.test(errorMessage);

      if (networkBlocked) {
        setFeedbackState(
          "Seu navegador bloqueou o envio em background. Vamos enviar pelo modo padrao para garantir a entrega.",
          "loading",
        );
        nativeFormSubmit.call(form);
        return;
      }

      setFeedbackState(
        "Nao foi possivel enviar agora. Tente novamente em alguns instantes.",
        "error",
      );
    } finally {
      setSubmittingState(false);
    }
  });
}
