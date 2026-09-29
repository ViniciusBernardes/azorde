(function () {
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function breaks(value) {
    return esc(value).replace(/\n/g, "<br>");
  }

  function text(selector, value) {
    var el = document.querySelector(selector);
    if (el && value != null) el.textContent = value;
  }

  function money(cents) {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  fetch("/api/site")
    .then(function (response) { if (!response.ok) throw new Error(); return response.json(); })
    .then(function (data) {
      var s = data.settings || {};
      text(".announce", s.announce);
      text(".story__text .eyebrow", s.about_eyebrow);
      var title = document.getElementById("atelie-titulo");
      if (title && s.about_title) title.innerHTML = breaks(s.about_title);
      var about = document.querySelector(".story__text");
      if (about && s.about_text) {
        about.querySelectorAll("p:not(.eyebrow)").forEach(function (node) { node.remove(); });
        var button = about.querySelector("a");
        s.about_text.split(/\n\s*\n/).forEach(function (paragraph) {
          var p = document.createElement("p");
          p.textContent = paragraph.trim();
          about.insertBefore(p, button);
        });
      }
      var aboutImg = document.querySelector(".story__figure img");
      if (aboutImg && s.about_image) aboutImg.src = s.about_image;

      text("#processo-titulo", s.process_title);
      text("#processo .section-lead", s.process_lead);
      var processImg = document.querySelector(".process__photo img");
      if (processImg && s.process_image) processImg.src = s.process_image;
      if (data.process && data.process.length) {
        var list = document.querySelector(".steps");
        if (list) {
          list.innerHTML = data.process.map(function (step) {
            return "<li><span>" + esc(step.label) + "</span><h3>" + esc(step.title) + "</h3><p>" + esc(step.body) + "</p></li>";
          }).join("");
        }
      }

      text(".band .eyebrow", s.band_eyebrow);
      var bandTitle = document.getElementById("mesa-titulo");
      if (bandTitle && s.band_title) bandTitle.innerHTML = breaks(s.band_title);
      var bandText = document.querySelector(".band__copy p:not(.eyebrow)");
      if (bandText && s.band_text) bandText.textContent = s.band_text;
      var bandImg = document.querySelector(".band__media img");
      if (bandImg && s.band_image) bandImg.src = s.band_image;
      var quote = document.querySelector(".quote img");
      if (quote && s.quote_image) quote.src = s.quote_image;

      text("#galeria-titulo", s.gallery_title);
      text("#galeria .section-lead", s.gallery_lead);
      if (data.gallery && data.gallery.length) {
        var grid = document.querySelector(".gallery__grid");
        if (grid) {
          grid.innerHTML = data.gallery.map(function (item) {
            return '<button type="button" class="gallery__item" data-full="' + esc(item.image) + '" data-alt="' + esc(item.alt) + '"><img src="' + esc(item.image) + '" alt="' + esc(item.alt) + '"></button>';
          }).join("");
          document.dispatchEvent(new CustomEvent("azorde:content"));
        }
      }

      text("#contato .eyebrow", s.contact_eyebrow);
      text("#contato-titulo", s.contact_title);
      var contactText = document.querySelector("#contato .visit__grid > div > p:not(.eyebrow)");
      if (contactText && s.contact_text) contactText.textContent = s.contact_text;
      var address = document.querySelector(".visit__info p");
      if (address && s.address) address.innerHTML = breaks(s.address);
      var mail = document.querySelector('.visit__info a[href^="mailto:"]');
      if (mail && s.email) { mail.textContent = s.email; mail.href = "mailto:" + s.email; }
      var instagram = document.querySelector('.visit__info a[href*="instagram.com"]');
      if (instagram && s.instagram) instagram.href = s.instagram;
      var hours = document.querySelectorAll(".visit__info p");
      if (hours.length && s.hours) hours[hours.length - 1].textContent = s.hours;
      text(".footer__grid p", s.footer_tagline);

      var wa = String(s.whatsapp || "").replace(/\D/g, "");
      if (wa) {
        document.querySelectorAll('a[href*="wa.me"]').forEach(function (link) {
          var url = new URL(link.href);
          link.href = "https://wa.me/" + wa + (url.search || "");
        });
      }

      var pieces = document.querySelector("#pecas .pieces");
      var store = window.AzordeStore;
      if (pieces && data.featured && data.featured.length && store) {
        pieces.innerHTML = data.featured.map(function (product) {
          return '<article class="piece"><a class="piece__media" href="/produtos/"><img src="' + esc(product.image) + '" alt="' + esc(product.alt) + '"></a><h2 class="piece__name"><a href="/produtos/">' + esc(product.name) + "</a></h2><p class=\"piece__price\">" + store.money(product.price) + '</p><button type="button" class="btn" data-add="' + esc(product.id) + '">Adicionar</button></article>';
        }).join("");
      }
    })
    .catch(function () {});
})();
