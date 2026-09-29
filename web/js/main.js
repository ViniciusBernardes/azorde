(function () {
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.getElementById("menu");
  var backdrop = document.querySelector(".backdrop");
  var header = document.querySelector(".header");
  var year = document.getElementById("year");
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector("img") : null;

  if (year) year.textContent = String(new Date().getFullYear());

  function setMenu(open) {
    if (!toggle || !drawer || !backdrop) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.querySelector(".visually-hidden").textContent = open ? "Fechar menu" : "Abrir menu";
    drawer.hidden = !open;
    backdrop.hidden = !open;
    document.body.classList.toggle("menu-open", open);
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", function () {
      setMenu(false);
    });
  }

  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setMenu(false);
  });

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function bindGallery() {
    if (!lightbox || !lightboxImg) return;
    document.querySelectorAll(".gallery__item").forEach(function (item) {
      if (item.dataset.bound) return;
      item.dataset.bound = "1";
      item.addEventListener("click", function () {
        lightboxImg.src = item.getAttribute("data-full");
        lightboxImg.alt = item.getAttribute("data-alt") || "";
        lightbox.showModal();
      });
    });
  }

  bindGallery();
  document.addEventListener("azorde:content", bindGallery);

  if (!lightbox) return;

  lightbox.querySelector("[data-close]").addEventListener("click", function () {
    lightbox.close();
  });

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) lightbox.close();
  });
})();
