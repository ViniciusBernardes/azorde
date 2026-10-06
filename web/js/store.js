(function () {
  var KEY = "azorde-cart";
  var products = [];
  var pixPercent = 5;
  var shippingFrom = 0;

  function money(cents) {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function same(a, b) {
    return String(a) === String(b);
  }

  function find(id) {
    return products.filter(function (product) { return same(product.id, id); })[0] || null;
  }

  function read() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(data)) return [];
      return data.filter(function (item) {
        return item && find(item.id) && Number(item.qty) > 0;
      });
    } catch (err) {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent("azorde:cart"));
  }

  function lines() {
    return read().map(function (item) {
      var product = find(item.id);
      var qty = Number(item.qty);
      return { product: product, qty: qty, total: product.price * qty };
    });
  }

  function count() {
    return read().reduce(function (sum, item) { return sum + Number(item.qty); }, 0);
  }

  function total() {
    return lines().reduce(function (sum, line) { return sum + line.total; }, 0);
  }

  function add(id) {
    if (!find(id)) return;
    var items = read();
    var current = items.filter(function (item) { return same(item.id, id); })[0];
    if (current) current.qty += 1;
    else items.push({ id: String(id), qty: 1 });
    write(items);
  }

  function setQty(id, qty) {
    var next = Math.max(0, Number(qty) || 0);
    var found = false;
    var items = read().filter(function (item) {
      if (!same(item.id, id)) return true;
      found = true;
      if (next < 1) return false;
      item.qty = next;
      return true;
    });
    if (!found && next > 0) items.push({ id: String(id), qty: next });
    write(items);
  }

  function paintCount() {
    var totalQty = count();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = String(totalQty);
      el.hidden = totalQty < 1;
    });
  }

  window.AzordeStore = {
    products: products,
    ready: false,
    money: money,
    lines: lines,
    count: count,
    total: total,
    add: add,
    setQty: setQty,
    shippingFrom: function () { return shippingFrom; },
    pix: function (cents) { return Math.round(cents * (100 - pixPercent) / 100); }
  };

  document.addEventListener("azorde:cart", paintCount);
  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-add]");
    if (!button) return;
    add(button.getAttribute("data-add"));
    var previous = button.textContent;
    button.textContent = "Adicionado";
    window.setTimeout(function () { button.textContent = previous === "Adicionado" ? "Adicionar" : previous; }, 900);
  });

  fetch("/api/products")
    .then(function (response) { if (!response.ok) throw new Error(); return response.json(); })
    .then(function (payload) {
      var list = Array.isArray(payload) ? payload : payload.products || [];
      products.splice(0, products.length);
      list.forEach(function (product) { products.push(product); });
      if (payload && payload.pixPercent != null) pixPercent = Number(payload.pixPercent) || pixPercent;
      if (payload && payload.shippingFromCents != null) shippingFrom = Math.max(0, Number(payload.shippingFromCents) || 0);
      window.AzordeStore.ready = true;
      paintCount();
      document.dispatchEvent(new CustomEvent("azorde:products"));
    })
    .catch(function () {
      window.AzordeStore.ready = true;
      document.dispatchEvent(new CustomEvent("azorde:products"));
    });
})();
