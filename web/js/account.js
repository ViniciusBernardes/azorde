(function () {
  function apply(data) {
    var link = document.querySelector("[data-account]");
    if (link && data.user) link.textContent = data.user.name;
    var ids = (data.favorites || []).map(String);
    document.querySelectorAll("[data-fav]").forEach(function (button) {
      button.textContent = ids.indexOf(String(button.getAttribute("data-fav"))) >= 0 ? "♥" : "♡";
    });
    window.AzordeAccount = { csrf: data.csrf, user: data.user };
  }

  fetch("/conta/eu", { headers: { Accept: "application/json" }, credentials: "same-origin" })
    .then(function (response) { return response.json(); })
    .then(apply)
    .catch(function () {});

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-fav]");
    if (!button) return;
    var state = window.AzordeAccount || {};
    if (!state.user) {
      window.location = "/conta/entrar";
      return;
    }
    fetch("/conta/favoritos/" + button.getAttribute("data-fav"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "X-CSRF-TOKEN": state.csrf,
        "X-Requested-With": "XMLHttpRequest"
      },
      credentials: "same-origin"
    }).then(function (response) {
      if (response.status === 401 || response.status === 419) {
        window.location = "/conta/entrar";
        return null;
      }
      return response.json();
    }).then(function (body) {
      if (!body) return;
      button.textContent = body.favorite ? "♥" : "♡";
    });
  });
})();