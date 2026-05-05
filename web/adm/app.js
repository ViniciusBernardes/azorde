(function () {
  var API = (window.AZORDE_API_BASE || "").replace(/\/$/, "");
  var TOKEN_KEY = "azorde_adm_jwt";

  var elLogin = document.getElementById("adm-login");
  var elApp = document.getElementById("adm-app");
  var formLogin = document.getElementById("form-login");
  var loginMsg = document.getElementById("login-msg");
  var appMsg = document.getElementById("app-msg");
  var tabAlunos = document.getElementById("tab-alunos");
  var tabCursos = document.getElementById("tab-cursos");
  var panelAlunos = document.getElementById("panel-alunos");
  var panelCursos = document.getElementById("panel-cursos");
  var tbodyAlunos = document.getElementById("tbody-alunos");
  var listaCursos = document.getElementById("lista-cursos");
  var cursoFormHost = document.getElementById("curso-form-host");
  var btnNovoCurso = document.getElementById("btn-novo-curso");
  var btnLogout = document.getElementById("btn-logout");
  var admUserLabel = document.getElementById("adm-user-label");
  var filterCurso = document.getElementById("filter-curso");
  var filterTurma = document.getElementById("filter-turma");
  var modalExcluirAluno = document.getElementById("modal-excluir-aluno");
  var modalExcluirAlunoMsg = document.getElementById("modal-excluir-aluno-msg");
  var modalExcluirAlunoConfirm = document.getElementById(
    "modal-excluir-aluno-confirm"
  );
  var pendingExcluirAlunoId = null;
  var alunosRowsAll = [];

  function token() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function authJsonHeaders() {
    var h = { "Content-Type": "application/json" };
    var t = token();
    if (t) h.Authorization = "Bearer " + t;
    return h;
  }

  function showMsg(box, text, isErr) {
    if (!box) return;
    if (!text) {
      box.hidden = true;
      return;
    }
    box.textContent = text;
    box.className = "adm-msg " + (isErr ? "adm-msg--err" : "adm-msg--ok");
    box.hidden = false;
  }

  function fmtDate(d) {
    if (!d) return "—";
    var x = new Date(d);
    return isNaN(x.getTime()) ? String(d) : x.toLocaleString("pt-BR");
  }

  function fmtDay(d) {
    if (!d) return "";
    var x = new Date(d);
    return isNaN(x.getTime()) ? "" : x.toISOString().slice(0, 10);
  }

  function showApp(username) {
    elLogin.hidden = true;
    elApp.hidden = false;
    admUserLabel.textContent = "Logado como " + username;
    loadAlunos();
    loadCursosParaCadastroAluno();
    loadCursos();
  }

  function showLogin() {
    sessionStorage.removeItem(TOKEN_KEY);
    elApp.hidden = true;
    elLogin.hidden = false;
  }

  if (token()) {
    elLogin.hidden = true;
    elApp.hidden = false;
    admUserLabel.textContent = "Sessão ativa";
    loadAlunos();
    loadCursosParaCadastroAluno();
    loadCursos();
  }

  formLogin.addEventListener("submit", function (e) {
    e.preventDefault();
    showMsg(loginMsg, "", false);
    var u = document.getElementById("user").value.trim();
    var p = document.getElementById("pass").value;
    fetch(API + "/adm/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (out) {
        if (!out.ok) {
          showMsg(
            loginMsg,
            (out.data && out.data.message) || "Falha no login.",
            true
          );
          return;
        }
        sessionStorage.setItem(TOKEN_KEY, out.data.access_token);
        showApp(out.data.user && out.data.user.username ? out.data.user.username : u);
      })
      .catch(function () {
        showMsg(loginMsg, "Erro de rede.", true);
      });
  });

  btnLogout.addEventListener("click", showLogin);

  var formNovoAluno = document.getElementById("form-novo-aluno");
  var novoAlunoCursoTurma = document.getElementById("novo-aluno-curso-turma");
  var detalheNovoAluno = document.getElementById("adm-novo-aluno");
  var cursosParaCadastroAluno = [];

  tabAlunos.addEventListener("click", function () {
    tabAlunos.classList.add("is-active");
    tabCursos.classList.remove("is-active");
    panelAlunos.hidden = false;
    panelCursos.hidden = true;
    loadAlunos();
    loadCursosParaCadastroAluno();
  });

  tabCursos.addEventListener("click", function () {
    tabCursos.classList.add("is-active");
    tabAlunos.classList.remove("is-active");
    panelCursos.hidden = false;
    panelAlunos.hidden = true;
    loadCursos();
  });

  function cursoFilterKey(a) {
    return a.cursoId ? String(a.cursoId) : "__sem_curso__";
  }

  function turmaFilterKey(a) {
    return a.turmaId ? String(a.turmaId) : "__sem_turma__";
  }

  function fillCursoFilterFromCatalog() {
    if (!filterCurso) return;
    var prev = filterCurso.value;
    var html = '<option value="">Todos os cursos</option>';
    var seen = {};
    var sorted = cursosParaCadastroAluno.slice().sort(function (a, b) {
      return (a.nome || "").localeCompare(b.nome || "", "pt-BR");
    });
    sorted.forEach(function (c) {
      seen[c.id] = true;
      html +=
        '<option value="' +
        escAttr(c.id) +
        '">' +
        esc(c.nome) +
        "</option>";
    });
    alunosRowsAll.forEach(function (a) {
      var id = a.cursoId ? String(a.cursoId) : null;
      if (id && !seen[id]) {
        seen[id] = true;
        var label =
          (a.curso && a.curso.nome) ||
          a.courseName ||
          "Curso (não listado no cadastro atual)";
        html +=
          '<option value="' +
          escAttr(id) +
          '">' +
          esc(label) +
          "</option>";
      }
    });
    if (alunosRowsAll.some(function (a) { return !a.cursoId; })) {
      html +=
        '<option value="__sem_curso__">' +
        esc("Sem curso vinculado") +
        "</option>";
    }
    filterCurso.innerHTML = html;
    if (
      prev &&
      Array.prototype.some.call(filterCurso.options, function (o) {
        return o.value === prev;
      })
    ) {
      filterCurso.value = prev;
    }
  }

  function fillTurmaFilterListing(cursoVal) {
    if (!filterTurma) return;
    var prev = filterTurma.value;
    var map = {};

    if (cursoVal === "__sem_curso__") {
      alunosRowsAll.forEach(function (a) {
        if (cursoFilterKey(a) !== "__sem_curso__") return;
        var tid = turmaFilterKey(a);
        if (!map[tid]) {
          map[tid] =
            a.turma ||
            (tid === "__sem_turma__"
              ? "Sem turma no sistema"
              : "Turma");
        }
      });
    } else if (cursoVal) {
      var curso = null;
      for (var i = 0; i < cursosParaCadastroAluno.length; i++) {
        if (cursosParaCadastroAluno[i].id === cursoVal) {
          curso = cursosParaCadastroAluno[i];
          break;
        }
      }
      var turmasCat = curso && curso.turmas ? curso.turmas.slice() : [];
      turmasCat.sort(function (a, b) {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
      turmasCat.forEach(function (t) {
        var lab =
          (t.titulo || "Turma") + (t.resumo ? " — " + t.resumo : "");
        map[t.id] = lab;
      });
    } else {
      cursosParaCadastroAluno.forEach(function (c) {
        var nomeC = c.nome || "";
        (c.turmas || []).forEach(function (t) {
          var lab =
            (nomeC ? nomeC + " — " : "") +
            (t.titulo || "Turma") +
            (t.resumo ? " — " + t.resumo : "");
          map[t.id] = lab;
        });
      });
    }

    alunosRowsAll.forEach(function (a) {
      if (cursoVal && cursoFilterKey(a) !== cursoVal) return;
      var tid = turmaFilterKey(a);
      if (!map[tid]) {
        map[tid] =
          a.turma ||
          (tid === "__sem_turma__" ? "Sem turma no sistema" : "Turma");
      }
    });

    var keys = Object.keys(map).sort(function (ka, kb) {
      return map[ka].localeCompare(map[kb], "pt-BR");
    });
    var html = '<option value="">Todas as turmas</option>';
    keys.forEach(function (k) {
      html +=
        '<option value="' +
        escAttr(k) +
        '">' +
        esc(map[k]) +
        "</option>";
    });
    filterTurma.innerHTML = html;
    if (
      prev &&
      Array.prototype.some.call(filterTurma.options, function (o) {
        return o.value === prev;
      })
    ) {
      filterTurma.value = prev;
    } else {
      filterTurma.value = "";
    }
  }

  function refreshAlunosFilterDropdowns() {
    fillCursoFilterFromCatalog();
    fillTurmaFilterListing(filterCurso ? filterCurso.value : "");
    applyAlunosFilters();
  }

  function applyAlunosFilters() {
    var c = filterCurso ? filterCurso.value : "";
    var t = filterTurma ? filterTurma.value : "";
    var filtered = alunosRowsAll.filter(function (a) {
      if (c && cursoFilterKey(a) !== c) return false;
      if (t && turmaFilterKey(a) !== t) return false;
      return true;
    });
    renderAlunosRows(filtered);
  }

  function openExcluirAlunoModal(id, nome) {
    if (!modalExcluirAluno || !modalExcluirAlunoMsg || !id) return;
    pendingExcluirAlunoId = id;
    modalExcluirAlunoMsg.textContent =
      'Tem certeza que deseja excluir a inscrição de "' +
      (nome || "este aluno") +
      '"? O registro será apagado e a vaga deixará de contar nas estatísticas. Esta ação não pode ser desfeita.';
    modalExcluirAluno.hidden = false;
    modalExcluirAluno.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (modalExcluirAlunoConfirm) modalExcluirAlunoConfirm.focus();
  }

  function closeExcluirAlunoModal() {
    if (!modalExcluirAluno) return;
    pendingExcluirAlunoId = null;
    modalExcluirAluno.hidden = true;
    modalExcluirAluno.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function alunoTemComprovanteArquivo(a) {
    var s = a.receiptStoredName && String(a.receiptStoredName).trim();
    return !!s && s !== "adm-manual";
  }

  function abrirComprovanteAluno(id) {
    if (!id || !token()) {
      showLogin();
      return;
    }
    showMsg(appMsg, "", false);
    fetch(API + "/adm/alunos/" + id + "/comprovante", {
      headers: { Authorization: "Bearer " + token() },
    })
      .then(function (r) {
        if (r.status === 401) {
          showLogin();
          return null;
        }
        if (!r.ok) {
          return r.json().then(function (d) {
            var m = d.message || "Não foi possível abrir o anexo.";
            showMsg(
              appMsg,
              Array.isArray(m) ? m.join(" ") : String(m),
              true
            );
            return null;
          });
        }
        return r.blob();
      })
      .then(function (blob) {
        if (!blob) return;
        var u = URL.createObjectURL(blob);
        window.open(u, "_blank", "noopener,noreferrer");
        setTimeout(function () {
          URL.revokeObjectURL(u);
        }, 120000);
      })
      .catch(function () {
        showMsg(appMsg, "Erro de rede ao baixar o anexo.", true);
      });
  }

  function renderAlunosRows(rows) {
    if (!rows.length) {
      tbodyAlunos.innerHTML =
        '<tr><td colspan="7" class="adm-table-empty">Nenhum aluno com estes filtros.</td></tr>';
      return;
    }
    tbodyAlunos.innerHTML = rows
      .map(function (a) {
        var cursoT =
          (a.courseName || "") +
          (a.turma ? " · " + a.turma : "");
        var confCell = a.confirmado
          ? '<span class="adm-badge adm-badge--ok">Sim</span>'
          : '<span class="adm-badge">Não</span>';
        var partConfirm = "";
        if (a.confirmado || !a.turmaId) {
          if (!a.confirmado) {
            partConfirm =
              '<span class="adm-hint-inline">Sem turma no sistema</span>';
          }
        } else {
          partConfirm =
            '<button type="button" class="adm-btn adm-btn--sm adm-confirm-aluno" data-aluno-id="' +
            esc(a.id) +
            '">Confirmar pagamento</button>';
        }
        var btnExcluir =
          '<button type="button" class="adm-btn adm-btn--sm adm-btn--danger adm-excluir-aluno" data-aluno-id="' +
          escAttr(a.id) +
          '" data-aluno-nome="' +
          escAttr(a.nome) +
          '">Excluir</button>';
        var acao =
          '<div class="adm-aluno-acoes">' + partConfirm + btnExcluir + "</div>";
        var nomeAnexo = a.receiptOriginalName || "Comprovante";
        var anexoCell = alunoTemComprovanteArquivo(a)
          ? '<button type="button" class="adm-btn adm-btn--sm adm-btn--ghost adm-btn--icon adm-ver-comprovante" data-aluno-id="' +
            escAttr(a.id) +
            '" title="' +
            escAttr(nomeAnexo) +
            '" aria-label="' +
            escAttr("Ver anexo: " + nomeAnexo) +
            '"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>'
          : '<span class="adm-hint-inline">—</span>';
        return (
          "<tr><td>" +
          fmtDate(a.createdAt) +
          "</td><td>" +
          esc(a.nome) +
          "</td><td>" +
          esc(a.email) +
          "<br />" +
          esc(a.telefone) +
          "</td><td>" +
          esc(cursoT) +
          "</td><td>" +
          confCell +
          "</td><td>" +
          anexoCell +
          "</td><td>" +
          acao +
          "</td></tr>"
        );
      })
      .join("");
    tbodyAlunos.querySelectorAll(".adm-confirm-aluno").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-aluno-id");
        if (!id || !confirm("Confirmar esta inscrição? A vaga passará a contar como ocupada no site.")) {
          return;
        }
        fetch(API + "/adm/alunos/" + id + "/confirmar", {
          method: "PATCH",
          headers: authJsonHeaders(),
        })
          .then(function (r) {
            if (r.status === 401) {
              showLogin();
              return;
            }
            return r.json().then(function (data) {
              return { ok: r.ok, data: data };
            });
          })
          .then(function (out) {
            if (!out) return;
            if (out.ok) {
              showMsg(appMsg, "Inscrição confirmada.", false);
              loadAlunos();
            } else {
              var msg =
                (out.data && out.data.message) ||
                "Não foi possível confirmar.";
              alert(Array.isArray(msg) ? msg.join(" ") : msg);
            }
          })
          .catch(function () {
            alert("Erro de rede.");
          });
      });
    });
    tbodyAlunos.querySelectorAll(".adm-excluir-aluno").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-aluno-id");
        var nome = btn.getAttribute("data-aluno-nome") || "";
        openExcluirAlunoModal(id, nome);
      });
    });
    tbodyAlunos
      .querySelectorAll(".adm-ver-comprovante")
      .forEach(function (btn) {
        btn.addEventListener("click", function () {
          abrirComprovanteAluno(btn.getAttribute("data-aluno-id"));
        });
      });
  }

  function loadAlunos() {
    if (!token()) return;
    fetch(API + "/adm/alunos", { headers: authJsonHeaders() })
      .then(function (r) {
        if (r.status === 401) {
          showLogin();
          return null;
        }
        return r.json();
      })
      .then(function (rows) {
        if (!rows) return;
        alunosRowsAll = rows;
        refreshAlunosFilterDropdowns();
      })
      .catch(function () {
        showMsg(appMsg, "Não foi possível carregar alunos.", true);
      });
  }

  if (filterCurso && filterTurma) {
    filterCurso.addEventListener("change", function () {
      fillTurmaFilterListing(filterCurso.value);
      applyAlunosFilters();
    });
    filterTurma.addEventListener("change", applyAlunosFilters);
  }

  if (modalExcluirAluno) {
    modalExcluirAluno
      .querySelectorAll("[data-modal-dismiss]")
      .forEach(function (el) {
        el.addEventListener("click", function (e) {
          e.preventDefault();
          closeExcluirAlunoModal();
        });
      });
    if (modalExcluirAlunoConfirm) {
      modalExcluirAlunoConfirm.addEventListener("click", function () {
        var id = pendingExcluirAlunoId;
        if (!id) return;
        modalExcluirAlunoConfirm.disabled = true;
        fetch(API + "/adm/alunos/" + id, {
          method: "DELETE",
          headers: authJsonHeaders(),
        })
          .then(function (r) {
            if (r.status === 401) {
              modalExcluirAlunoConfirm.disabled = false;
              closeExcluirAlunoModal();
              showLogin();
              return null;
            }
            return r.json().then(function (data) {
              return { ok: r.ok, data: data };
            });
          })
          .then(function (out) {
            modalExcluirAlunoConfirm.disabled = false;
            if (!out) return;
            if (out.ok) {
              closeExcluirAlunoModal();
              showMsg(appMsg, "Inscrição excluída.", false);
              loadAlunos();
            } else {
              var msg =
                (out.data && out.data.message) ||
                "Não foi possível excluir.";
              alert(Array.isArray(msg) ? msg.join(" ") : msg);
            }
          })
          .catch(function () {
            modalExcluirAlunoConfirm.disabled = false;
            alert("Erro de rede.");
          });
      });
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (modalExcluirAluno && !modalExcluirAluno.hidden) {
      closeExcluirAlunoModal();
    }
  });

  function rebuildNovoAlunoCursoTurmaSelect() {
    if (!novoAlunoCursoTurma) return;
    var sel = novoAlunoCursoTurma;
    var prevTurma = sel.value;
    var sorted = cursosParaCadastroAluno.slice().sort(function (a, b) {
      return (a.nome || "").localeCompare(b.nome || "", "pt-BR");
    });
    var html = '<option value="">Selecione o curso e a turma…</option>';
    if (!sorted.length) {
      html +=
        '<option disabled value="">Nenhum curso cadastrado — use a aba Cursos</option>';
    }
    sorted.forEach(function (c) {
      var turmas = (c.turmas || []).slice();
      turmas.sort(function (a, b) {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
      var labelGrupo = c.nome || "Curso";
      html += '<optgroup label="' + escAttr(labelGrupo) + '">';
      if (!turmas.length) {
        html +=
          '<option disabled value="">— Sem turmas neste curso —</option>';
      } else {
        turmas.forEach(function (t) {
          var lab =
            (t.titulo || "Turma") + (t.resumo ? " — " + t.resumo : "");
          html +=
            '<option value="' +
            escAttr(t.id) +
            '" data-curso-id="' +
            escAttr(c.id) +
            '">' +
            esc(lab) +
            "</option>";
        });
      }
      html += "</optgroup>";
    });
    sel.innerHTML = html;
    if (prevTurma) {
      var ok = false;
      for (var i = 0; i < sel.options.length; i++) {
        var o = sel.options[i];
        if (
          o.value === prevTurma &&
          o.getAttribute("data-curso-id")
        ) {
          sel.selectedIndex = i;
          ok = true;
          break;
        }
      }
      if (!ok) sel.selectedIndex = 0;
    }
  }

  function loadCursosParaCadastroAluno() {
    if (!token() || !novoAlunoCursoTurma) return;
    fetch(API + "/adm/cursos", { headers: authJsonHeaders() })
      .then(function (r) {
        if (r.status === 401) {
          showLogin();
          return null;
        }
        return r.json();
      })
      .then(function (list) {
        if (!list) return;
        if (!Array.isArray(list)) {
          showMsg(
            appMsg,
            "Não foi possível interpretar a lista de cursos da API.",
            true
          );
          return;
        }
        cursosParaCadastroAluno = list;
        rebuildNovoAlunoCursoTurmaSelect();
        refreshAlunosFilterDropdowns();
      })
      .catch(function () {
        showMsg(
          appMsg,
          "Não foi possível carregar cursos e turmas. Verifique a API e a rede.",
          true
        );
      });
  }

  if (detalheNovoAluno) {
    detalheNovoAluno.addEventListener("toggle", function () {
      if (detalheNovoAluno.open && token()) {
        loadCursosParaCadastroAluno();
      }
    });
  }

  if (formNovoAluno && novoAlunoCursoTurma) {
    formNovoAluno.addEventListener("submit", function (e) {
      e.preventDefault();
      showMsg(appMsg, "", false);
      var sel = novoAlunoCursoTurma;
      var opt = sel.options[sel.selectedIndex];
      var turmaId = sel.value;
      var cursoId = opt ? opt.getAttribute("data-curso-id") : null;
      var nome = document.getElementById("novo-aluno-nome").value.trim();
      var telefone = document.getElementById("novo-aluno-telefone").value.trim();
      var email = document.getElementById("novo-aluno-email").value.trim();
      var pixKey = document.getElementById("novo-aluno-pix").value.trim();
      var confirmado = document.getElementById("novo-aluno-confirmado").checked;
      if (!turmaId || !cursoId) {
        showMsg(
          appMsg,
          "Selecione uma turma válida (listada sob o curso correspondente).",
          true
        );
        return;
      }
      var body = {
        turmaId: turmaId,
        cursoId: cursoId,
        nome: nome,
        telefone: telefone,
        email: email,
        confirmado: confirmado,
      };
      if (pixKey) body.pixKey = pixKey;
      fetch(API + "/adm/alunos", {
        method: "POST",
        headers: authJsonHeaders(),
        body: JSON.stringify(body),
      })
        .then(function (r) {
          if (r.status === 401) {
            showLogin();
            return null;
          }
          return r.json().then(function (data) {
            return { ok: r.ok, data: data };
          });
        })
        .then(function (out) {
          if (!out) return;
          if (out.ok) {
            showMsg(appMsg, "Aluno cadastrado.", false);
            formNovoAluno.reset();
            loadCursosParaCadastroAluno();
            loadAlunos();
          } else {
            var msg =
              (out.data && out.data.message) || "Não foi possível cadastrar.";
            showMsg(
              appMsg,
              Array.isArray(msg) ? msg.join(" ") : String(msg),
              true
            );
          }
        })
        .catch(function () {
          showMsg(appMsg, "Erro de rede.", true);
        });
    });
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escAttr(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function loadCursos() {
    if (!token()) return;
    fetch(API + "/adm/cursos", { headers: authJsonHeaders() })
      .then(function (r) {
        if (r.status === 401) {
          showLogin();
          return null;
        }
        return r.json();
      })
      .then(function (list) {
        if (!list) return;
        listaCursos.innerHTML = list.map(renderCursoCard).join("");
        bindCursoActions();
      })
      .catch(function () {
        showMsg(appMsg, "Não foi possível carregar cursos.", true);
      });
  }

  function renderCursoCard(c) {
    var turmas = (c.turmas || [])
      .slice()
      .sort(function (a, b) {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
    var turmasHtml = turmas
      .map(function (t) {
        return (
          '<div class="adm-turma-row" data-turma-id="' +
          esc(t.id) +
          '">' +
          "<div><strong>" +
          esc(t.titulo) +
          "</strong><br />" +
          esc(t.resumo || "") +
          "</div>" +
          "<div>1º: " +
          esc(fmtDay(t.dataEncontro1)) +
          " · 2º: " +
          esc(fmtDay(t.dataEncontro2)) +
          "<br />Horário: " +
          esc(t.horarioInicio || "—") +
          " – " +
          esc(t.horarioFim || "—") +
          '<br /><button type="button" class="adm-btn adm-btn--danger adm-del-turma" style="margin-top:0.35rem;padding:0.35rem 0.75rem;font-size:0.75rem">Excluir turma</button></div></div>'
        );
      })
      .join("");
    return (
      '<div class="adm-curso-card" data-curso-id="' +
      esc(c.id) +
      '"><h3>' +
      esc(c.nome) +
      "</h3>" +
      "<p style=\"margin:0;font-size:0.8125rem;color:var(--adm-muted)\">Slug: " +
      esc(c.slug) +
      " · Vagas/turma: " +
      esc(c.maxAlunos) +
      " · " +
      (c.ativo ? "Ativo" : "Inativo") +
      "</p>" +
      '<p style="margin:0.5rem 0 0;font-size:0.8125rem">Imagem: ' +
      esc(c.imagemPath) +
      " · Mídia: " +
      esc(c.midiaTipo) +
      "</p>" +
      "<p style=\"margin:0.5rem 0 0;font-size:0.8125rem;white-space:pre-wrap\">" +
      esc((c.descricao || "").slice(0, 220)) +
      ((c.descricao || "").length > 220 ? "…" : "") +
      "</p>" +
      "<div class=\"adm-row-actions\">" +
      '<button type="button" class="adm-btn adm-btn--ghost adm-edit-curso">Editar</button>' +
      '<button type="button" class="adm-btn adm-btn--danger adm-del-curso">Excluir curso</button>' +
      "</div>" +
      "<h4 style=\"margin:1rem 0 0.35rem;font-size:0.875rem\">Turmas</h4>" +
      turmasHtml +
      '<div class="adm-field" style="margin-top:1rem">' +
      "<label>Nova turma — título</label>" +
      '<input type="text" class="adm-nt-titulo" placeholder="Turma 1" />' +
      "</div>" +
      '<div class="adm-field"><label>Resumo (texto na página)</label>' +
      '<input type="text" class="adm-nt-resumo" placeholder="Turma 1 — 12/05 e 19/05" /></div>' +
      '<div class="adm-turma-row"><div class="adm-field"><label>Data 1º encontro</label>' +
      '<input type="date" class="adm-nt-d1" /></div>' +
      '<div class="adm-field"><label>Data 2º encontro</label>' +
      '<input type="date" class="adm-nt-d2" /></div></div>' +
      '<div class="adm-turma-row"><div class="adm-field"><label>Início</label>' +
      '<input type="time" class="adm-nt-hi" /></div>' +
      '<div class="adm-field"><label>Fim</label>' +
      '<input type="time" class="adm-nt-hf" /></div></div>' +
      '<button type="button" class="adm-btn adm-add-turma" style="margin-top:0.5rem">Adicionar turma</button>' +
      "</div>"
    );
  }

  function bindCursoActions() {
    listaCursos.querySelectorAll(".adm-edit-curso").forEach(function (btn) {
      btn.onclick = function () {
        var card = btn.closest(".adm-curso-card");
        var id = card.getAttribute("data-curso-id");
        openCursoForm(id);
      };
    });
    listaCursos.querySelectorAll(".adm-del-curso").forEach(function (btn) {
      btn.onclick = function () {
        var card = btn.closest(".adm-curso-card");
        var id = card.getAttribute("data-curso-id");
        if (!confirm("Excluir este curso e todas as turmas?")) return;
        fetch(API + "/adm/cursos/" + id, {
          method: "DELETE",
          headers: authJsonHeaders(),
        }).then(function (r) {
          if (r.status === 401) showLogin();
          else loadCursos();
        });
      };
    });
    listaCursos.querySelectorAll(".adm-add-turma").forEach(function (btn) {
      btn.onclick = function () {
        var card = btn.closest(".adm-curso-card");
        var cid = card.getAttribute("data-curso-id");
        var body = {
          titulo: card.querySelector(".adm-nt-titulo").value.trim() || "Turma",
          resumo: card.querySelector(".adm-nt-resumo").value.trim() || null,
          dataEncontro1: card.querySelector(".adm-nt-d1").value || null,
          dataEncontro2: card.querySelector(".adm-nt-d2").value || null,
          horarioInicio: card.querySelector(".adm-nt-hi").value
            ? card.querySelector(".adm-nt-hi").value + ":00"
            : null,
          horarioFim: card.querySelector(".adm-nt-hf").value
            ? card.querySelector(".adm-nt-hf").value + ":00"
            : null,
        };
        fetch(API + "/adm/cursos/" + cid + "/turmas", {
          method: "POST",
          headers: authJsonHeaders(),
          body: JSON.stringify(body),
        }).then(function (r) {
          if (r.status === 401) showLogin();
          else if (r.ok) loadCursos();
          else r.json().then(function (d) {
            alert(d.message || "Erro ao criar turma");
          });
        });
      };
    });
    listaCursos.querySelectorAll(".adm-del-turma").forEach(function (btn) {
      btn.onclick = function () {
        var row = btn.closest(".adm-turma-row");
        var tid = row.getAttribute("data-turma-id");
        if (!confirm("Excluir esta turma?")) return;
        fetch(API + "/adm/turmas/" + tid, {
          method: "DELETE",
          headers: authJsonHeaders(),
        }).then(function (r) {
          if (r.status === 401) showLogin();
          else loadCursos();
        });
      };
    });
  }

  function openCursoForm(id) {
    cursoFormHost.hidden = false;
    if (id) {
      fetch(API + "/adm/cursos/" + id, { headers: authJsonHeaders() }).then(
        function (r) {
          return r.json();
        }
      ).then(function (c) {
        cursoFormHost.innerHTML = formHtml(c);
        bindCursoFormSubmit(c.id);
      });
    } else {
      cursoFormHost.innerHTML = formHtml(null);
      bindCursoFormSubmit(null);
    }
    cursoFormHost.scrollIntoView({ behavior: "smooth" });
  }

  function formHtml(c) {
    var isNew = !c;
    return (
      '<div class="adm-editor">' +
      '<header class="adm-editor__header">' +
      "<h2 class=\"adm-editor__title\">" +
      (isNew ? "Novo curso" : "Editar curso") +
      '</h2><p class="adm-editor__lede">' +
      (isNew
        ? "Preencha os blocos abaixo. O texto da descrição aparece na página pública; vagas limitam inscrições por turma."
        : "Alterações são refletidas no site após salvar. Verifique slug e imagem antes de publicar.") +
      "</p></header>" +
      '<form id="form-curso" class="adm-editor__form" novalidate>' +
      '<input type="hidden" name="id" value="' +
      (c ? esc(c.id) : "") +
      '" />' +
      '<section class="adm-editor__section">' +
      '<h3 class="adm-editor__section-title">Identificação</h3>' +
      '<div class="adm-editor__grid adm-editor__grid--2">' +
      '<div class="adm-field"><label for="f-nome">Nome do curso</label>' +
      '<input id="f-nome" name="nome" required autocomplete="off" placeholder="Ex.: Oficina de cerâmica — Kit café da manhã" value="' +
      (c ? esc(c.nome) : "") +
      '" />' +
      '<p class="adm-field-hint">Título exibido no site e na inscrição.</p></div>' +
      '<div class="adm-field"><label for="f-slug">Slug (URL interna)</label>' +
      '<input id="f-slug" name="slug" required placeholder="kit-cafe-manha" value="' +
      (c ? esc(c.slug) : "") +
      '" />' +
      '<p class="adm-field-hint">Apenas letras minúsculas, números e hífens. Ex.: <code>petisqueira-porta-vinho</code></p></div>' +
      "</div></section>" +
      '<section class="adm-editor__section">' +
      '<h3 class="adm-editor__section-title">Conteúdo no site</h3>' +
      '<div class="adm-field adm-field--descricao"><label for="f-desc">Descrição completa</label>' +
      '<textarea id="f-desc" name="descricao" required rows="12" placeholder="Texto que aparece na página do curso (pode usar quebras de linha).">' +
      (c ? esc(c.descricao) : "") +
      "</textarea>" +
      '<p class="adm-field-hint">Inclua o que está incluso, observações e valores se quiser que apareçam na página.</p></div>' +
      '<div class="adm-field"><label for="f-end">Endereço do estúdio</label>' +
      '<input id="f-end" name="endereco" placeholder="Rua, número, bairro, cidade" value="' +
      (c && c.endereco ? esc(c.endereco) : "") +
      '" /></div>' +
      "</section>" +
      '<section class="adm-editor__section">' +
      '<h3 class="adm-editor__section-title">Vagas e publicação</h3>' +
      '<div class="adm-editor__grid adm-editor__grid--2">' +
      '<div class="adm-field"><label for="f-max">Máx. alunos por turma</label>' +
      '<input id="f-max" name="maxAlunos" type="number" min="1" max="500" required value="' +
      (c ? esc(c.maxAlunos) : "6") +
      '" />' +
      '<p class="adm-field-hint">Cada turma deste curso aceita até esta quantidade de inscrições confirmadas.</p></div>' +
      '<div class="adm-field"><label for="f-ord">Ordem na listagem</label>' +
      '<input id="f-ord" name="sortOrder" type="number" min="0" step="1" value="' +
      (c ? esc(c.sortOrder) : "0") +
      '" />' +
      '<p class="adm-field-hint">Número menor aparece primeiro na página de oficinas.</p></div>' +
      "</div>" +
      '<div class="adm-checkbox-row">' +
      '<input type="checkbox" name="ativo" id="curso-ativo" ' +
      (!c || c.ativo ? "checked" : "") +
      " />" +
      '<label for="curso-ativo" class="adm-checkbox-row__label"><strong>Curso ativo no site</strong><span class="adm-checkbox-row__sub">Desmarque para ocultar oficinas encerradas ou em rascunho.</span></label></div>' +
      "</section>" +
      '<section class="adm-editor__section">' +
      '<h3 class="adm-editor__section-title">Imagem e turmas no formulário</h3>' +
      '<div class="adm-editor__grid adm-editor__grid--2">' +
      '<div class="adm-field"><label for="f-img">Caminho da imagem</label>' +
      '<input id="f-img" name="imagemPath" required placeholder="assets/nome-do-arquivo.png" value="' +
      (c ? esc(c.imagemPath) : "") +
      '" />' +
      '<p class="adm-field-hint">Relativo à pasta do site (mesmos arquivos em <code>/assets</code>).</p></div>' +
      '<div class="adm-field"><label for="f-media">Tipo de exibição</label>' +
      '<select id="f-media" name="midiaTipo">' +
      '<option value="img"' +
      (!c || c.midiaTipo === "img" ? " selected" : "") +
      ">Imagem principal (bloco com foto)</option>" +
      '<option value="logo-bg"' +
      (c && c.midiaTipo === "logo-bg" ? " selected" : "") +
      ">Fundo com foto + logo (estilo kit sushi)</option></select>" +
      '<p class="adm-field-hint">O segundo modo usa a imagem como fundo e o logo AZORDE sobreposto.</p></div>' +
      "</div>" +
      '<div class="adm-field"><label for="f-radio">Chave dos grupos de turma (opcional)</label>' +
      '<input id="f-radio" name="chaveRadioTurmas" placeholder="turma-kit-cafe" value="' +
      (c && c.chaveRadioTurmas ? esc(c.chaveRadioTurmas) : "") +
      '" />' +
      '<p class="adm-field-hint">Só quando há várias turmas com botões de opção na página. Deve ser único entre cursos (ex.: <code>turma-kit-cafe</code>).</p></div>' +
      "</section>" +
      '<footer class="adm-editor__footer">' +
      '<button type="button" class="adm-btn adm-btn--ghost" id="btn-cancel-curso">Cancelar</button>' +
      '<button type="submit" class="adm-btn adm-btn--primary">' +
      (isNew ? "Criar curso" : "Salvar alterações") +
      "</button>" +
      "</footer></form></div>"
    );
  }

  function bindCursoFormSubmit(id) {
    var f = document.getElementById("form-curso");
    document.getElementById("btn-cancel-curso").onclick = function () {
      cursoFormHost.innerHTML = "";
      cursoFormHost.hidden = true;
    };
    f.onsubmit = function (e) {
      e.preventDefault();
      var fd = new FormData(f);
      var body = {
        nome: fd.get("nome"),
        slug: fd.get("slug"),
        descricao: fd.get("descricao"),
        endereco: fd.get("endereco") || null,
        maxAlunos: Number(fd.get("maxAlunos")),
        imagemPath: fd.get("imagemPath"),
        midiaTipo: fd.get("midiaTipo"),
        chaveRadioTurmas: fd.get("chaveRadioTurmas") || null,
        ativo: (document.getElementById("curso-ativo") || f.querySelector('[name="ativo"]')).checked,
        sortOrder: Number(fd.get("sortOrder") || 0),
      };
      var method = id ? "PATCH" : "POST";
      var url = id ? API + "/adm/cursos/" + id : API + "/adm/cursos";
      fetch(url, {
        method: method,
        headers: authJsonHeaders(),
        body: JSON.stringify(body),
      }).then(function (r) {
        if (r.status === 401) showLogin();
        else if (r.ok) {
          cursoFormHost.innerHTML = "";
          cursoFormHost.hidden = true;
          showMsg(appMsg, "Curso salvo.", false);
          loadCursos();
        } else {
          r.json().then(function (d) {
            alert(
              (d.message && (Array.isArray(d.message) ? d.message.join(" ") : d.message)) ||
                "Erro ao salvar"
            );
          });
        }
      });
    };
  }

  btnNovoCurso.addEventListener("click", function () {
    openCursoForm(null);
  });
})();
