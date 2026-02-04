/* assets/js/jobs.demo.js */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  const elGrid = $("#jobs-grid");
  const elQ = $("#jobs-q");
  const elLocation = $("#jobs-location");
  const elArea = $("#jobs-area");

  // Modal elements
  const modal = $("#applyModal");
  const applyForm = $("#applyForm");
  const applyOk = $("#applyOk");
  const applySubtitle = $("#applySubtitle");
  const jobIdInput = $("#jobId");

  const seedJobs = [
    {
      id: "job_qfb_gt",
      title: "Químico Farmacéutico (QFB)",
      location: "Guatemala",
      type: "Tiempo completo",
      area: "Calidad",
      summary: "Aseguramiento y control de calidad para procesos y productos farmacéuticos.",
      description:
        "Buscamos un perfil con enfoque en cumplimiento, documentación y mejora continua en plantas o laboratorios.",
      requirements: [
        "Licenciatura en QFB / Química / afín",
        "Experiencia en GMP / BPx (deseable)",
        "Manejo de documentación y desviaciones",
        "Disponibilidad para trabajo presencial",
      ],
      offer: [
        "Prestaciones de ley + beneficios",
        "Capacitación continua",
        "Ambiente colaborativo",
        "Plan de crecimiento",
      ],
    },
    {
      id: "job_mm_mx",
      title: "Medical Marketing Specialist",
      location: "México",
      type: "Híbrido",
      area: "Marketing",
      summary: "Estrategia de comunicación científica y campañas para portafolio.",
      description:
        "Colaborarás con equipos cross-funcionales para contenidos, lanzamientos y comunicación B2B.",
      requirements: [
        "Experiencia en marketing farmacéutico o salud (deseable)",
        "Copywriting y planeación de campañas",
        "Conocimiento básico de regulación publicitaria",
        "Inglés intermedio (deseable)",
      ],
      offer: [
        "Modalidad híbrida",
        "Herramientas de trabajo",
        "Bonos por desempeño",
        "Cultura de innovación",
      ],
    },
    {
      id: "job_dev_gt",
      title: "Frontend Developer (Web)",
      location: "Guatemala",
      type: "Remoto",
      area: "Tecnología",
      summary: "Implementación UI/UX, performance y componentes reutilizables (Mobile First).",
      description:
        "Ayudarás a evolucionar la plataforma web con enfoque en accesibilidad, SEO técnico y modularidad.",
      requirements: [
        "HTML/CSS/JS sólido",
        "Buenas prácticas de performance (LCP/CLS)",
        "Experiencia con componentes y patrones UI",
        "Git y flujo de despliegue",
      ],
      offer: [
        "Trabajo remoto",
        "Horario flexible",
        "Crecimiento a liderazgo técnico",
        "Proyectos con impacto",
      ],
    },
    {
      id: "job_hr_latam",
      title: "Talent Acquisition (LATAM)",
      location: "Latam",
      type: "Tiempo completo",
      area: "Talento",
      summary: "Atracción de talento para áreas clave (operaciones, comercial, tecnología).",
      description:
        "Coordinarás procesos end-to-end, entrevistas y pipeline con enfoque en experiencia del candidato.",
      requirements: [
        "Experiencia reclutando perfiles diversos",
        "Manejo de ATS (deseable)",
        "Comunicación clara y seguimiento",
        "Disponibilidad para coordinar con equipos regionales",
      ],
      offer: [
        "Rol regional",
        "Crecimiento y capacitación",
        "Esquema competitivo",
        "Cultura enfocada en personas",
      ],
    },
  ];

  function ensureSeed() {
    const existing = window.LaSanteStore.getJobs();
    if (!existing || existing.length === 0) window.LaSanteStore.setJobs(seedJobs);
  }

  function uniq(list) {
    return [...new Set(list.filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  }

  function badge(text) {
    return `<span class="badge">${escapeHtml(text)}</span>`;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderFilters(jobs) {
    const locations = uniq(jobs.map((j) => j.location));
    const areas = uniq(jobs.map((j) => j.area));

    elLocation.innerHTML = `<option value="">Todos los países</option>` + locations.map((x) => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("");
    elArea.innerHTML = `<option value="">Todas las áreas</option>` + areas.map((x) => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("");
  }

  function matches(job, q, location, area) {
    const hay = `${job.title} ${job.location} ${job.area} ${job.summary} ${job.description} ${(job.requirements || []).join(" ")}`.toLowerCase();
    const okQ = !q || hay.includes(q);
    const okL = !location || job.location === location;
    const okA = !area || job.area === area;
    return okQ && okL && okA;
  }

  function jobCard(job) {
    const req = (job.requirements || []).slice(0, 4).map((r) => `<li>${escapeHtml(r)}</li>`).join("");
    const off = (job.offer || []).slice(0, 4).map((r) => `<li>${escapeHtml(r)}</li>`).join("");

    return `
      <article class="card job-card">
        <div class="p">
          <div class="job-card__top">
            <div>
              <h3 class="m0">${escapeHtml(job.title)}</h3>
              <div class="muted mt-1">${badge(job.location)} ${badge(job.type)} ${badge(job.area)}</div>
            </div>
            <div class="job-card__actions">
              <button class="btn ghost" type="button" data-job-toggle="${escapeHtml(job.id)}">Ver detalle</button>
              <button class="btn primary" type="button" data-job-apply="${escapeHtml(job.id)}">Aplicar →</button>
            </div>
          </div>

          <p class="mt-2">${escapeHtml(job.summary)}</p>

          <div class="job-detail" id="detail_${escapeHtml(job.id)}" hidden>
            <hr class="sep" />
            <p class="muted">${escapeHtml(job.description)}</p>

            <div class="grid cols-2 mt-2">
              <div>
                <h4 class="m0">Requisitos</h4>
                <ul class="mt-1">${req}</ul>
              </div>
              <div>
                <h4 class="m0">Ofrecemos</h4>
                <ul class="mt-1">${off}</ul>
              </div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function render() {
    const jobs = window.LaSanteStore.getJobs();
    const q = (elQ.value || "").trim().toLowerCase();
    const location = elLocation.value || "";
    const area = elArea.value || "";

    const filtered = jobs.filter((j) => matches(j, q, location, area));
    elGrid.innerHTML = filtered.map(jobCard).join("");

    // bind
    elGrid.querySelectorAll("[data-job-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-job-toggle");
        const detail = document.getElementById(`detail_${id}`);
        if (!detail) return;
        detail.hidden = !detail.hidden;
        btn.textContent = detail.hidden ? "Ver detalle" : "Ocultar detalle";
      });
    });

    elGrid.querySelectorAll("[data-job-apply]").forEach((btn) => {
      btn.addEventListener("click", () => openApply(btn.getAttribute("data-job-apply")));
    });
  }

  function openApply(jobId) {
    const jobs = window.LaSanteStore.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    jobIdInput.value = job.id;
    applySubtitle.textContent = `${job.title} — ${job.location} · ${job.type}`;
    applyOk.hidden = true;
    applyForm.reset();
    jobIdInput.value = job.id;

    openModal(modal);
  }

  function openModal(m) {
    m.setAttribute("aria-hidden", "false");
    m.classList.add("is-open");
    document.documentElement.classList.add("no-scroll");
  }

  function closeModal(m) {
    m.setAttribute("aria-hidden", "true");
    m.classList.remove("is-open");
    document.documentElement.classList.remove("no-scroll");
  }

  function bindModal() {
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.matches("[data-close-modal]")) {
        const m = target.closest(".modal");
        if (m) closeModal(m);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      document.querySelectorAll(".modal.is-open").forEach((m) => closeModal(m));
    });

    applyForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const file = $("#cvFile").files && $("#cvFile").files[0] ? $("#cvFile").files[0].name : "";
      const payload = {
        jobId: $("#jobId").value,
        fullName: $("#fullName").value.trim(),
        email: $("#email").value.trim(),
        phone: $("#phone").value.trim(),
        country: $("#country").value.trim(),
        linkedin: $("#linkedin").value.trim(),
        message: $("#message").value.trim(),
        cvFileName: file,
      };

      window.LaSanteStore.addApplication(payload);
      applyOk.hidden = false;

      // UX: cerrar después de 1.2s (demo)
      setTimeout(() => {
        closeModal(modal);
      }, 1200);
    });
  }

  function bindFilters() {
    [elQ, elLocation, elArea].forEach((el) => el.addEventListener("input", render));
    [elLocation, elArea].forEach((el) => el.addEventListener("change", render));
  }

  // init
  ensureSeed();
  renderFilters(window.LaSanteStore.getJobs());
  bindFilters();
  bindModal();
  render();
})();
