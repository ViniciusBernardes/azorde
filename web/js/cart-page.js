(function () {
  var root = document.getElementById("cart");
  if (!root || !window.AzordeStore) return;
  var store = window.AzordeStore;
  var freight = { cep: "", quotes: [], selected: null, error: "", loading: false, signature: "" };

  function signature(lines) {
    return lines.map(function (line) { return line.product.id + ":" + line.qty; }).join("|");
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    var lines = store.lines();
    var nextSignature = signature(lines);
    if (freight.signature && freight.signature !== nextSignature) {
      freight.quotes = [];
      freight.selected = null;
    }
    freight.signature = nextSignature;
    if (!lines.length) {
      root.innerHTML =
        '<div class="cart__empty">' +
          "<h2>Seu carrinho está vazio</h2>" +
          "<p>Escolha uma peça do ateliê para começar o pedido.</p>" +
          '<a class="btn btn--inline" href="/produtos/">Ver peças</a>' +
        "</div>";
      return;
    }

    var subtotal = store.total();
    var shipping = freight.selected ? freight.selected.price : 0;
    var grand = subtotal + shipping;
    var pix = store.pix(subtotal) + shipping;
    var quoteHtml = "";
    if (freight.loading) {
      quoteHtml = '<p class="cart__note">Consultando os Correios…</p>';
    } else if (freight.error) {
      quoteHtml = '<p class="cart__error">' + String(freight.error).replace(/</g, "") + "</p>";
    } else if (freight.quotes.length) {
      quoteHtml = '<div class="cart__quotes" role="radiogroup" aria-label="Opções de frete">' + freight.quotes.map(function (quote, index) {
        var selected = freight.selected && freight.selected.code === quote.code;
        var days = quote.days ? "até " + quote.days + (quote.days > 1 ? " dias úteis" : " dia útil") : "prazo a confirmar";
        return '<label class="cart__quote' + (selected ? " is-selected" : "") + '"><input type="radio" name="frete" value="' + index + '"' + (selected ? " checked" : "") + " /><span><strong>" + esc(quote.name) + "</strong><small>" + days + "</small></span><em>" + store.money(quote.price) + "</em></label>";
      }).join("") + "</div>";
    }
    var count = store.count();
    root.innerHTML =
      '<section class="cart__bag" aria-label="Peças do pedido">' +
        '<p class="cart__count">' + count + (count === 1 ? " peça" : " peças") + "</p>" +
        '<ul class="cart__list">' +
        lines.map(function (line) {
          var product = line.product;
          return (
            '<li class="cart__item">' +
              '<img src="' + esc(product.image) + '" alt="' + esc(product.name) + '" width="140" height="176" />' +
              '<div class="cart__info">' +
                '<div class="cart__info-top">' +
                  "<h2>" + esc(product.name) + "</h2>" +
                  '<button type="button" class="cart__remove" data-remove="' + esc(product.id) + '">Remover</button>' +
                "</div>" +
                '<p class="cart__unit">' + store.money(product.price) + " cada</p>" +
                '<div class="cart__row">' +
                  '<div class="cart__qty">' +
                    '<button type="button" data-qty="' + esc(product.id) + '" data-delta="-1" aria-label="Diminuir quantidade">−</button>' +
                    "<span>" + line.qty + "</span>" +
                    '<button type="button" data-qty="' + esc(product.id) + '" data-delta="1" aria-label="Aumentar quantidade">+</button>' +
                  "</div>" +
                  '<p class="cart__line">' + store.money(line.total) + "</p>" +
                "</div>" +
              "</div>" +
            "</li>"
          );
        }).join("") +
        "</ul>" +
        '<a class="cart__continue" href="/produtos/">Continuar vendo peças</a>' +
      "</section>" +
      '<aside class="cart__summary">' +
        "<h2>Resumo</h2>" +
        '<form class="cart__cep" id="cart-cep">' +
          '<label for="cep-destino">Entrega</label>' +
          '<div class="cart__cep-row">' +
            '<input id="cep-destino" name="cep" inputmode="numeric" autocomplete="postal-code" maxlength="9" placeholder="CEP 00000-000" value="' + esc(freight.cep) + '" />' +
            '<button type="submit" class="btn btn--quiet"' + (freight.loading ? " disabled" : "") + ">" + (freight.loading ? "Calculando" : "Calcular") + "</button>" +
          "</div>" +
          '<p class="cart__hint">PAC e SEDEX pelos Correios, a partir do CEP.</p>' +
        "</form>" +
        quoteHtml +
        '<dl class="cart__totals">' +
          "<div><dt>Subtotal</dt><dd>" + store.money(subtotal) + "</dd></div>" +
          "<div><dt>Frete</dt><dd>" + (freight.selected ? store.money(shipping) : "a calcular") + "</dd></div>" +
          '<div class="is-grand"><dt>Total</dt><dd>' + (freight.selected ? store.money(grand) : store.money(subtotal)) + "</dd></div>" +
        "</dl>" +
        '<p class="cart__pix">No Pix: <strong>' + (freight.selected ? store.money(pix) : store.money(store.pix(subtotal))) + "</strong><span>desconto só nas peças</span></p>" +
        '<a class="btn" href="/conta/finalizar">Concluir pedido</a>' +
        '<a class="btn btn--ghost" id="cart-whatsapp" href="#">Enviar pelo WhatsApp</a>' +
        '<p class="cart__note">Os valores das peças são ilustrativos. O frete exibido é o calculado pelos Correios.</p>' +
      "</aside>";

    var link = document.getElementById("cart-whatsapp");
    var text = lines.map(function (line) {
      return line.qty + "× " + line.product.name + " — " + store.money(line.total);
    }).join("\n");
    text = "Olá! Quero este pedido do AZORDE:\n" + text;
    if (freight.selected) {
      text += "\nFrete " + freight.selected.name + " para " + freight.cep + ": " + store.money(freight.selected.price);
      text += "\nTotal: " + store.money(grand);
    } else {
      text += "\nTotal das peças: " + store.money(subtotal);
    }
    link.href = "https://wa.me/5538997351632?text=" + encodeURIComponent(text);

    var form = document.getElementById("cart-cep");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      freight.cep = form.cep.value;
      freight.loading = true;
      freight.error = "";
      freight.quotes = [];
      freight.selected = null;
      render();
      fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          cep: freight.cep,
          items: lines.map(function (line) { return { id: Number(line.product.id), qty: line.qty }; })
        })
      }).then(function (response) {
        return response.json().then(function (body) {
          if (!response.ok) throw new Error(body.message || "Não foi possível calcular o frete.");
          return body;
        });
      }).then(function (body) {
        freight.quotes = body.quotes || [];
        freight.selected = freight.quotes[0] || null;
        freight.loading = false;
        sessionStorage.setItem("azorde-frete", JSON.stringify({ cep: freight.cep, selected: freight.selected }));
        render();
      }).catch(function (error) {
        freight.loading = false;
        freight.error = error.message || "Não foi possível calcular o frete.";
        render();
      });
    });

    root.querySelectorAll('input[name="frete"]').forEach(function (input) {
      input.addEventListener("change", function () {
        freight.selected = freight.quotes[Number(input.value)] || null;
        sessionStorage.setItem("azorde-frete", JSON.stringify({ cep: freight.cep, selected: freight.selected }));
        render();
      });
    });
  }

  root.addEventListener("input", function (event) {
    if (event.target.id !== "cep-destino") return;
    var digits = event.target.value.replace(/\D/g, "").slice(0, 8);
    event.target.value = digits.length > 5 ? digits.slice(0, 5) + "-" + digits.slice(5) : digits;
    freight.cep = event.target.value;
  });

  root.addEventListener("click", function (event) {
    var qty = event.target.closest("[data-qty]");
    var remove = event.target.closest("[data-remove]");
    if (qty) {
      var id = qty.getAttribute("data-qty");
      var current = store.lines().filter(function (line) { return String(line.product.id) === String(id); })[0];
      store.setQty(id, (current ? current.qty : 0) + Number(qty.getAttribute("data-delta")));
    }
    if (remove) store.setQty(remove.getAttribute("data-remove"), 0);
  });

  document.addEventListener("azorde:cart", render);
  document.addEventListener("azorde:products", render);
  if (store.ready) render();
})();