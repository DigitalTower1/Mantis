const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const animateElements = document.querySelectorAll('[data-animate]');

if (animateElements.length) {
  if (motionQuery.matches) {
    animateElements.forEach((element) => {
      element.classList.add('is-visible');
    });
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    animateElements.forEach((element) => observer.observe(element));

    motionQuery.addEventListener('change', (event) => {
      if (event.matches) {
        animateElements.forEach((element) => element.classList.add('is-visible'));
        observer.disconnect();
      }
    });
  }
}

const renderIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

renderIcons();

document.addEventListener('DOMContentLoaded', () => {
  renderIcons();
  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const slides = carousel.querySelectorAll('[data-slide]');
    const prevButton = carousel.querySelector('[data-prev]');
    const nextButton = carousel.querySelector('[data-next]');
    let index = 0;
    const total = slides.length;

    const updateSlides = () => {
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
        slide.setAttribute('aria-hidden', slideIndex === index ? 'false' : 'true');
      });
    };

    const goTo = (direction) => {
      index = (index + direction + total) % total;
      updateSlides();
    };

    prevButton?.addEventListener('click', () => goTo(-1));
    nextButton?.addEventListener('click', () => goTo(1));

    updateSlides();

    let autoPlay = window.setInterval(() => goTo(1), 7000);

    carousel.addEventListener('mouseenter', () => {
      window.clearInterval(autoPlay);
    });

    carousel.addEventListener('mouseleave', () => {
      autoPlay = window.setInterval(() => goTo(1), 7000);
    });
  }

  const accordion = document.querySelector('[data-accordion]');
  if (accordion) {
    const items = accordion.querySelectorAll('.accordion-item');

    items.forEach((item) => {
      const trigger = item.querySelector('.accordion-trigger');
      const panel = item.querySelector('.accordion-content');
      if (!trigger || !panel) return;

      panel.hidden = !item.classList.contains('is-open');
      trigger.setAttribute('aria-expanded', String(!panel.hidden));

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(isOpen));
        panel.hidden = !isOpen;

        if (isOpen) {
          items.forEach((other) => {
            if (other !== item) {
              other.classList.remove('is-open');
              const otherTrigger = other.querySelector('.accordion-trigger');
              const otherPanel = other.querySelector('.accordion-content');
              if (otherTrigger && otherPanel) {
                otherTrigger.setAttribute('aria-expanded', 'false');
                otherPanel.hidden = true;
              }
            }
          });
        }
      });
    });
  }

  const form = document.querySelector('.js-consulting-form');
  if (form) {
    const message = form.querySelector('.form-message');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let isValid = true;
      const fields = Array.from(form.querySelectorAll('[data-required]'));

      fields.forEach((field) => {
        const input = field;
        const value = input.value.trim();
        let fieldValid = value.length > 0;
        if (fieldValid && input.name === 'email') {
          fieldValid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
        }
        if (fieldValid && input.name === 'telefono') {
          fieldValid = /^[0-9+\s-]{6,}$/.test(value);
        }
        input.setAttribute('aria-invalid', String(!fieldValid));
        if (!fieldValid) {
          isValid = false;
        }
      });

      if (message) {
        if (isValid) {
          message.textContent = 'Grazie! Ti ricontatteremo entro 24 ore con la proposta strategica.';
          message.classList.remove('is-error');
          message.classList.add('is-success');
          form.reset();
        } else {
          message.textContent = 'Controlla di aver compilato correttamente tutti i campi obbligatori.';
          message.classList.remove('is-success');
          message.classList.add('is-error');
        }
      }
    });
  }
});
