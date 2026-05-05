(function () {
  var API_BASE = (window.AZORDE_API_BASE || "").replace(/\/$/, "");
  var root = document.getElementById("cursos-lista");
  if (!root || !API_BASE) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cssUrl(path) {
    var p = String(path || "").replace(/["'()]/g, "");
    if (!p || p.indexOf("..") >= 0) return "";
    return "url('" + esc(p).replace(/'/g, "") + "')";
  }

  function renderCurso(c) {
    var slug = esc(c.slug || c.id);
    var mediaCol = "";
    if (c.midiaTipo === "logo-bg") {
      var bg = cssUrl(c.imagemPath);
      mediaCol =
        '<div class="course-feature__col-media">' +
        '<div class="course-feature__media-bg" style="background-image: ' +
        bg +
        ';">' +
        '<span class="visually-hidden">' +
        esc(c.nome) +
        "</span>" +
        '<img class="course-feature__media-bg-logo" src="assets/logo-azorde-estudio.png" width="98" height="27" alt="AZORDE Estúdio" loading="lazy" />' +
        "</div></div>";
    } else {
      mediaCol =
        '<div class="course-feature__col-media">' +
        '<img class="course-feature__img-primary" src="' +
        esc(c.imagemPath) +
        '" width="720" height="900" alt="' +
        esc(c.nome) +
        '" loading="lazy" />' +
        "</div>";
    }

    var turmas = (c.turmas || []).slice().sort(function (a, b) {
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    function turmaAberta(t) {
      return (
        t.podeInscrever === true ||
        t.podeInscrever === 1 ||
        t.podeInscrever === "true"
      );
    }

    function vagasRestantesNum(t, fallback) {
      var n = Number(t.vagasRestantes);
      return Number.isFinite(n) ? n : fallback;
    }

    var algumaTurmaAberta = turmas.some(turmaAberta);

    var turmasHtml = "";
    if (c.chaveRadioTurmas && turmas.length > 1) {
      var chave = esc(c.chaveRadioTurmas);
      var firstAberta = turmas.findIndex(turmaAberta);
      turmasHtml += '<fieldset class="course-feature__turmas">';
      turmasHtml += '<legend class="course-feature__legend">Escolha a turma</legend>';
      var checkedIdx = firstAberta >= 0 ? firstAberta : 0;
      turmas.forEach(function (t, i) {
        var id = esc(t.id);
        var label = esc(t.resumo || t.titulo || "Turma");
        var aberta = turmaAberta(t);
        var vr = vagasRestantesNum(t, c.maxAlunos);
        var tag = aberta
          ? '<span class="course-feature__vagas-tag">' +
            vr +
            " vaga(s) após confirmação do pagamento</span>"
          : '<span class="course-feature__vagas-tag course-feature__vagas-tag--full">Lotada</span>';
        var isChecked = i === checkedIdx;
        turmasHtml +=
          '<label class="course-feature__radio' +
          (aberta ? "" : " course-feature__radio--disabled") +
          '">' +
          '<input type="radio" name="' +
          chave +
          '" value="' +
          i +
          '" data-turma-id="' +
          id +
          '"' +
          (aberta ? "" : " disabled") +
          (isChecked ? " checked" : "") +
          " />" +
          "<span>" +
          label +
          " " +
          tag +
          "</span></label>";
      });
      turmasHtml += "</fieldset>";
      if (!algumaTurmaAberta) {
        turmasHtml +=
          '<p class="course-feature__note course-feature__note--full">Todas as turmas estão com inscrições esgotadas. Fale com o estúdio para lista de espera.</p>';
      }
    } else if (turmas.length === 1) {
      var t0 = turmas[0];
      var aberta0 = turmaAberta(t0);
      var vr0 = vagasRestantesNum(t0, c.maxAlunos);
      var tag0 = aberta0
        ? '<span class="course-feature__vagas-tag">' +
          vr0 +
          " vaga(s) após confirmação do pagamento</span>"
        : '<span class="course-feature__vagas-tag course-feature__vagas-tag--full">Inscrições esgotadas</span>';
      turmasHtml +=
        '<p class="course-feature__turma-fixa">' +
        esc(t0.resumo || t0.titulo) +
        " " +
        tag0 +
        "</p>";
      if (!aberta0) {
        turmasHtml +=
          '<p class="course-feature__note course-feature__note--full">Não há vagas abertas no momento para esta turma.</p>';
      }
    }

    var endereco = c.endereco
      ? '<p class="course-feature__address">' + esc(c.endereco) + "</p>"
      : "";

    var enrollBtn = "";
    if (c.chaveRadioTurmas && turmas.length > 1) {
      if (algumaTurmaAberta) {
        enrollBtn =
          '<button type="button" class="btn btn--buy js-open-enroll" ' +
          'data-enroll-course="' +
          esc(c.nome) +
          '" ' +
          'data-curso-id="' +
          esc(c.id) +
          '" ' +
          'data-enroll-turma-radio="' +
          esc(c.chaveRadioTurmas) +
          '">Inscreva-se no curso</button>';
      }
    } else if (turmas.length === 1 && turmaAberta(turmas[0])) {
      enrollBtn =
        '<button type="button" class="btn btn--buy js-open-enroll" ' +
        'data-enroll-course="' +
        esc(c.nome) +
        '" ' +
        'data-curso-id="' +
        esc(c.id) +
        '" ' +
        'data-turma-id="' +
        esc(turmas[0].id) +
        '" ' +
        'data-enroll-turma="' +
        esc(turmas[0].resumo || turmas[0].titulo) +
        '">Inscreva-se no curso</button>';
    }

    return (
      '<article class="course-feature" id="curso-' +
      slug +
      '" aria-labelledby="titulo-' +
      slug +
      '">' +
      '<div class="course-feature__grid">' +
      mediaCol +
      '<div class="course-feature__content">' +
      '<p class="course-feature__loc">Montes Claros · MG</p>' +
      '<h3 id="titulo-' +
      slug +
      '" class="course-feature__title">' +
      esc(c.nome) +
      "</h3>" +
      '<p class="course-feature__spots">Até ' +
      esc(c.maxAlunos) +
      " vagas confirmadas por turma.</p>" +
      '<div class="course-feature__intro course-feature__intro--plain">' +
      esc(c.descricao).replace(/\n/g, "<br />") +
      "</div>" +
      '<h4 class="course-feature__sub">Onde</h4>' +
      endereco +
      '<h4 class="course-feature__sub">Turmas e horários</h4>' +
      turmasHtml +
      '<div class="course-feature__actions">' +
      enrollBtn +
      "</div>" +
      "</div></div></article>"
    );
  }

  function render(list) {
    root.innerHTML = list.map(renderCurso).join("\n");
    if (window.bindAzordeEnrollButtons) {
      window.bindAzordeEnrollButtons(root);
    }
    document.dispatchEvent(new CustomEvent("azorde:cursos-rendered"));
  }

  fetch(API_BASE + "/cursos")
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(render)
    .catch(function () {
      root.innerHTML =
        '<p class="course-feature__note">Não foi possível carregar os cursos. Tente novamente mais tarde.</p>';
    });
})();
