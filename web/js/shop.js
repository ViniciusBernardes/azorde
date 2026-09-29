(function () {
  var root = document.getElementById("catalog");
  if (!root || !window.AzordeStore) return;

  var store = window.AzordeStore;

  function render() {
    if (!store.products.length) {
      root.innerHTML = '<p class="section-lead">Nenhum produto disponível no momento.</p>';
      return;
    }
    root.innerHTML = store.products.map(function (product) {
    var pix = store.pix(product.price);
    return (
      '<article class="piece">' +
        '<div class="piece__media">' +
          '<img src="' + product.image + '" alt="' + product.alt + '" width="800" height="1200" />' +
        "</div>" +
        '<h2 class="piece__name">' + product.name + "</h2>" +
        '<p class="piece__price">' + store.money(product.price) + "</p>" +
        '<p class="piece__pix">' + store.money(pix) + " no Pix</p>" +
        '<div class="piece__actions"><button type="button" class="fav" data-fav="' + product.id + '" aria-label="Salvar nos favoritos">♡</button><button type="button" class="btn" data-add="' + product.id + '">Adicionar</button></div>' +
      "</article>"
    );
  }).join("");
  }

  document.addEventListener("azorde:products", render);
  if (store.ready) render();
})();
