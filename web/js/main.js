(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  var header = document.querySelector(".site-header");
  var yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function setHeaderScrolled() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  setHeaderScrolled();
  window.addEventListener("scroll", setHeaderScrolled, { passive: true });

  if (!toggle || !nav) return;

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!open);
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 899px)").matches) {
        setOpen(false);
      }
    });
  });

  window.addEventListener("resize", function () {
    if (window.matchMedia("(min-width: 900px)").matches) {
      setOpen(false);
    }
  });
})();

(function () {
  var PIX_KEY = "38997351632";
  var API_BASE = (window.AZORDE_API_BASE || "http://localhost:3000").replace(/\/$/, "");

  var modal = document.getElementById("enroll-modal");
  var form = document.getElementById("enroll-form");
  if (!modal || !form || typeof modal.showModal !== "function") return;

  var summaryCourse = document.getElementById("enroll-summary-course");
  var summaryTurma = document.getElementById("enroll-summary-turma");
  var telInput = document.getElementById("enroll-telefone");
  var cancelBtn = document.getElementById("enroll-cancel");
  var pixCopyBtn = document.getElementById("enroll-pix-copy");
  var feedbackEl = document.getElementById("enroll-feedback");
  var submitBtn = document.getElementById("enroll-submit");

  var turmaRadioName = "";

  function digitsOnly(s) {
    return String(s || "").replace(/\D/g, "");
  }

  function formatPhoneBR(d) {
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) {
      return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    }
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7, 11);
  }

  function getTurmaFromRadio(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    if (!el) return "";
    var label = el.closest("label");
    if (!label) return "";
    var span = label.querySelector("span");
    return span ? span.textContent.replace(/\s+/g, " ").trim() : "";
  }

  var cursoIdInput = document.getElementById("enroll-curso-id");
  var turmaIdInput = document.getElementById("enroll-turma-id");

  function refreshTurmaInModal() {
    if (turmaRadioName) {
      var t = getTurmaFromRadio(turmaRadioName);
      if (t && summaryTurma) summaryTurma.textContent = t;
      var el = document.querySelector(
        'input[name="' + turmaRadioName + '"]:checked'
      );
      var tid = el && el.getAttribute("data-turma-id");
      if (turmaIdInput) turmaIdInput.value = tid || "";
    }
  }

  function bindAzordeEnrollButtons(container) {
    var scope = container || document;
    scope.querySelectorAll(".js-open-enroll").forEach(function (btn) {
      if (btn.dataset.azordeEnrollBound) return;
      btn.dataset.azordeEnrollBound = "1";
      btn.addEventListener("click", function () {
        var course = btn.getAttribute("data-enroll-course") || "";
        var fixed = btn.getAttribute("data-enroll-turma") || "";
        turmaRadioName = btn.getAttribute("data-enroll-turma-radio") || "";
        var cid = btn.getAttribute("data-curso-id") || "";
        var tidFixed = btn.getAttribute("data-turma-id") || "";

        var turma = fixed;
        if (turmaRadioName) turma = getTurmaFromRadio(turmaRadioName) || turma;

        if (summaryCourse) summaryCourse.textContent = course;
        if (summaryTurma) summaryTurma.textContent = turma;

        form.reset();
        if (cursoIdInput) cursoIdInput.value = cid;
        if (turmaIdInput) {
          turmaIdInput.value = turmaRadioName ? "" : tidFixed;
        }
        if (turmaRadioName) refreshTurmaInModal();

        if (feedbackEl) {
          feedbackEl.hidden = true;
          feedbackEl.textContent = "";
          feedbackEl.classList.remove(
            "enroll-modal__feedback--error",
            "enroll-modal__feedback--ok"
          );
        }

        modal.showModal();
        setTimeout(function () {
          var first = form.querySelector("#enroll-nome");
          if (first) first.focus();
        }, 0);
      });
    });
  }

  window.bindAzordeEnrollButtons = bindAzordeEnrollButtons;

  if (telInput) {
    telInput.addEventListener("input", function () {
      var d = digitsOnly(telInput.value).slice(0, 11);
      telInput.value = formatPhoneBR(d);
    });
  }

  bindAzordeEnrollButtons(document);

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      modal.close();
      form.reset();
    });
  }

  modal.addEventListener("close", function () {
    form.reset();
  });

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t || t.type !== "radio" || !t.name || t.name.indexOf("turma-") !== 0) {
      return;
    }
    if (modal.open && turmaRadioName && t.name === turmaRadioName) {
      refreshTurmaInModal();
    }
  });

  if (pixCopyBtn) {
    pixCopyBtn.addEventListener("click", function () {
      var label = pixCopyBtn.textContent;
      function done() {
        pixCopyBtn.textContent = "Copiado!";
        setTimeout(function () {
          pixCopyBtn.textContent = label;
        }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(PIX_KEY).then(done).catch(function () {});
      }
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (turmaRadioName) refreshTurmaInModal();

    var course = summaryCourse ? summaryCourse.textContent.trim() : "";
    var turma = summaryTurma ? summaryTurma.textContent.trim() : "";
    if (turmaRadioName) {
      var tr = getTurmaFromRadio(turmaRadioName);
      if (tr) turma = tr;
      if (summaryTurma) summaryTurma.textContent = turma;
    }

    var turmaIdVal = (turmaIdInput && turmaIdInput.value) || "";
    var cursoIdVal = (cursoIdInput && cursoIdInput.value) || "";

    var nome = (document.getElementById("enroll-nome") || {}).value;
    var email = (document.getElementById("enroll-email") || {}).value;
    var telDigits = digitsOnly((telInput || {}).value);
    var fileInput = document.getElementById("enroll-comprovante");
    var file = fileInput && fileInput.files && fileInput.files[0];

    if (!nome || !email || telDigits.length < 10 || !file) {
      form.reportValidity();
      return;
    }

    var telDisplay = telInput ? telInput.value : telDigits;
    var btn = submitBtn || form.querySelector('[type="submit"]');
    var prevText = btn ? btn.textContent : "";

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Enviando...";
    }
    if (feedbackEl) {
      feedbackEl.hidden = true;
      feedbackEl.textContent = "";
      feedbackEl.classList.remove("enroll-modal__feedback--error", "enroll-modal__feedback--ok");
    }

    var fd = new FormData();
    if (turmaIdVal) {
      fd.append("turmaId", turmaIdVal);
      if (cursoIdVal) fd.append("cursoId", cursoIdVal);
    } else {
      fd.append("courseName", course);
      fd.append("turma", turma);
    }
    fd.append("nome", nome.trim());
    fd.append("telefone", telDisplay);
    fd.append("email", email.trim());
    fd.append("pixKey", PIX_KEY);
    fd.append("comprovante", file);

    var url = API_BASE + "/enrollments";

    fetch(url, {
      method: "POST",
      body: fd,
    })
      .then(function (res) {
        return res
          .json()
          .then(function (data) {
            return { res: res, data: data };
          })
          .catch(function () {
            return { res: res, data: null };
          });
      })
      .then(function (out) {
        if (out.res.ok) {
          if (feedbackEl) {
            feedbackEl.textContent =
              (out.data && out.data.message) || "Inscrição registrada com sucesso.";
            feedbackEl.classList.add("enroll-modal__feedback--ok");
            feedbackEl.classList.remove("enroll-modal__feedback--error");
            feedbackEl.hidden = false;
          }
          form.reset();
          setTimeout(function () {
            modal.close();
          }, 2000);
          return;
        }
        var msg = "Não foi possível enviar. Tente novamente.";
        if (out.data && out.data.message) {
          msg = Array.isArray(out.data.message) ? out.data.message.join(" ") : String(out.data.message);
        }
        if (feedbackEl) {
          feedbackEl.textContent = msg;
          feedbackEl.classList.add("enroll-modal__feedback--error");
          feedbackEl.classList.remove("enroll-modal__feedback--ok");
          feedbackEl.hidden = false;
        }
      })
      .catch(function () {
        if (feedbackEl) {
          feedbackEl.textContent =
            "Erro de conexão. Confira se a API está no ar (via /api no mesmo site ou AZORDE_API_BASE).";
          feedbackEl.classList.add("enroll-modal__feedback--error");
          feedbackEl.classList.remove("enroll-modal__feedback--ok");
          feedbackEl.hidden = false;
        }
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = prevText;
        }
      });
  });
})();
