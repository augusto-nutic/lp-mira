const revealItems = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 70, 320)}ms`;
      observer.observe(item);
    });

    const heroMessages = [...document.querySelectorAll("#hero-chat .bubble")];

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

    const form = document.getElementById("lead-form");
    const feedback = document.getElementById("form-feedback");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const nome = formData.get("nome")?.toString().trim() || "Seu time";
      feedback.textContent = `${nome}, recebemos seu pedido. Nossa equipe vai entrar em contato em breve pelo email ou WhatsApp informado.`;
      feedback.style.color = "#0a6e48";
      form.reset();
    });

