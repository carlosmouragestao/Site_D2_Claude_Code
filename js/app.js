/* ==========================================================================
   D2 Motos — app.js
   Renderização, roteamento por hash e gerenciamento de estado.
   Depende de: motos.js (MOTOS), filters.js (filterMotos)
   ========================================================================== */

// ─── Placeholder para imagens que não carregam ──────────────────────────────
var IMG_PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3">' +
  '<rect width="4" height="3" fill="#e8e8e8"/>' +
  '<text x="2" y="1.7" text-anchor="middle" dominant-baseline="middle" ' +
  'fill="#bbb" font-family="Inter,sans-serif" font-size="0.4">Foto indisponível</text>' +
  '</svg>'
);

function handleImgError(img) {
  img.onerror = null;
  img.src = IMG_PLACEHOLDER;
}

// ─── Estado global ───────────────────────────────────────────────────────────
var state = {
  filters: {
    search: '',
    marca: '',
    modelo: '',
    cilindrada: '',
    precoMin: '',
    precoMax: '',
    anoMin: '',
    anoMax: '',
    kmMin: '',
    kmMax: ''
  },
  photoIndices: {}   // { [motoId]: currentIndex }
};

// ─── Helpers de formatação ───────────────────────────────────────────────────
function formatPrice(n) {
  return 'R$ ' + n.toLocaleString('pt-BR');
}

function formatKm(n) {
  return n.toLocaleString('pt-BR') + ' Km';
}

// ─── Badges ──────────────────────────────────────────────────────────────────
var BADGE_CLASSES = {
  'DESTAQUE':       'badge-destaque',
  'ABAIXO DA FIPE': 'badge-fipe',
  'NOVO NO ESTOQUE': 'badge-novo'
};

function badgeHtml(badge) {
  if (!badge) return '';
  var cls = BADGE_CLASSES[badge] || 'badge-destaque';
  return '<span class="card-badge ' + cls + '">' + badge + '</span>';
}

// ─── WhatsApp URL dinâmica ───────────────────────────────────────────────────
function waUrl(moto) {
  var nome = moto.marca + ' ' + moto.modelo + ' ' + moto.ano;
  var msg  = 'Olá, tenho interesse na moto ' + nome + ', gostaria de mais informações.';
  return 'https://wa.me/5581991635959?text=' + encodeURIComponent(msg);
}

// ─── SVG icons (inline, reutilizáveis) ───────────────────────────────────────
var ICONS = {
  calendar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  odometer: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>',
  pin:      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  chevLeft: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>',
  chevRight:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
  whatsapp: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>'
};

// ─── Renderização dos cards ───────────────────────────────────────────────────
function renderCard(moto) {
  var idx   = state.photoIndices[moto.id] || 0;
  var total = moto.fotos.length;
  var foto  = moto.fotos[idx];

  var navBtns = total > 1
    ? `<button class="btn-photo-nav btn-photo-prev" data-id="${moto.id}" data-dir="-1" aria-label="Foto anterior">${ICONS.chevLeft}</button>
       <button class="btn-photo-nav btn-photo-next" data-id="${moto.id}" data-dir="1"  aria-label="Próxima foto">${ICONS.chevRight}</button>`
    : '';

  var counter = total > 1
    ? `<span class="photo-count">📷 ${idx + 1}/${total}</span>`
    : '';

  return `
    <article class="moto-card" data-id="${moto.id}" role="listitem">
      <div class="card-photo">
        <img src="${foto}" alt="${moto.marca} ${moto.modelo} ${moto.ano}" loading="lazy" onerror="handleImgError(this)" />
        ${badgeHtml(moto.badge)}
        ${navBtns}
        ${counter}
      </div>
      <div class="card-body">
        <h3 class="card-name">${moto.marca.toUpperCase()} ${moto.modelo.toUpperCase()}</h3>
        <div class="card-specs">
          <span class="card-spec">${ICONS.calendar}${moto.ano}</span>
          <span class="card-spec">${ICONS.odometer}${formatKm(moto.km)}</span>
          <span class="card-spec">${ICONS.pin}Gravatá, PE</span>
        </div>
        <p class="card-price">${formatPrice(moto.preco)}</p>
        <button class="btn-details" data-id="${moto.id}">Ver detalhes</button>
      </div>
    </article>`;
}

// ─── Render catálogo ─────────────────────────────────────────────────────────
function renderCatalog() {
  var filtered  = filterMotos(MOTOS, state.filters);
  var count     = filtered.length;
  var countText = count + (count === 1 ? ' moto encontrada' : ' motos encontradas');
  var grid      = document.getElementById('motos-grid');
  var noRes     = document.getElementById('no-results');

  ['results-count', 'results-count-desktop', 'results-count-mobile'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = countText;
  });

  if (count === 0) {
    grid.innerHTML = '';
    noRes.classList.remove('hidden');
  } else {
    noRes.classList.add('hidden');
    grid.innerHTML = filtered.map(renderCard).join('');
  }
}

// ─── Render detalhe ──────────────────────────────────────────────────────────
function renderDetail(moto) {
  var detail = document.getElementById('view-detail');

  var thumbsHtml = '';
  if (moto.fotos.length > 1) {
    thumbsHtml = '<div class="gallery-thumbs" id="gallery-thumbs">' +
      moto.fotos.map(function (f, i) {
        return `<button class="gallery-thumb${i === 0 ? ' active' : ''}" data-idx="${i}" aria-label="Ver foto ${i + 1}">
          <img src="${f}" alt="${moto.marca} ${moto.modelo} — foto ${i + 1}" loading="lazy" onerror="handleImgError(this)" />
        </button>`;
      }).join('') +
    '</div>';
  }

  var badgeEl = moto.badge
    ? `<span class="detail-badge ${BADGE_CLASSES[moto.badge] || 'badge-destaque'}">${moto.badge}</span>`
    : '';

  detail.innerHTML = `
    <div class="detail-wrap">
      <div class="container">

        <div class="detail-back-row">
          <button class="btn-back" id="btn-back">
            ${ICONS.chevLeft}
            Voltar ao catálogo
          </button>
        </div>

        <div class="detail-layout">

          <div class="detail-gallery">
            <div class="gallery-main-wrap">
              <img id="gallery-main-img"
                   src="${moto.fotos[0]}"
                   alt="${moto.marca} ${moto.modelo} ${moto.ano}"
                   onerror="handleImgError(this)" />
            </div>
            ${thumbsHtml}
          </div>

          <div class="detail-info">
            ${badgeEl}
            <h1 class="detail-name">${moto.marca.toUpperCase()} ${moto.modelo.toUpperCase()}</h1>
            <p class="detail-price">${formatPrice(moto.preco)}</p>

            <div class="detail-specs-grid">
              <div class="spec-item"><span class="spec-label">Marca</span><span class="spec-value">${moto.marca}</span></div>
              <div class="spec-item"><span class="spec-label">Modelo</span><span class="spec-value">${moto.modelo}</span></div>
              <div class="spec-item"><span class="spec-label">Ano</span><span class="spec-value">${moto.ano}</span></div>
              <div class="spec-item"><span class="spec-label">Cor</span><span class="spec-value">${moto.cor}</span></div>
              <div class="spec-item"><span class="spec-label">Cilindrada</span><span class="spec-value">${moto.cilindrada}</span></div>
              <div class="spec-item"><span class="spec-label">Quilometragem</span><span class="spec-value">${formatKm(moto.km)}</span></div>
            </div>

            <div class="detail-desc">
              <h3>Descrição</h3>
              <p>${moto.descricao}</p>
            </div>

            <a href="${waUrl(moto)}" class="btn-wa-detail" target="_blank" rel="noopener noreferrer">
              ${ICONS.whatsapp}
              Tenho interesse — Chamar no WhatsApp
            </a>

            <button class="btn-back-bottom" id="btn-back-bottom">
              ${ICONS.chevLeft}
              Voltar ao catálogo
            </button>
          </div>
        </div>

      </div>
    </div>`;

  // Thumbnails
  var thumbs = detail.querySelectorAll('.gallery-thumb');
  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var idx = parseInt(thumb.dataset.idx, 10);
      document.getElementById('gallery-main-img').src = moto.fotos[idx];
      thumbs.forEach(function (t) { t.classList.remove('active'); });
      thumb.classList.add('active');
    });
  });

  // Botões voltar
  function goBack() { history.back(); }
  var bBack = document.getElementById('btn-back');
  var bBackB = document.getElementById('btn-back-bottom');
  if (bBack)  bBack.addEventListener('click', goBack);
  if (bBackB) bBackB.addEventListener('click', goBack);
}

// ─── Alternância de views ─────────────────────────────────────────────────────
function showCatalog() {
  document.getElementById('view-catalog').classList.remove('hidden');
  document.getElementById('view-detail').classList.add('hidden');
  renderCatalog();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function showDetail(moto) {
  document.getElementById('view-catalog').classList.add('hidden');
  document.getElementById('view-detail').classList.remove('hidden');
  renderDetail(moto);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ─── Roteador por hash ────────────────────────────────────────────────────────
function router() {
  var hash = window.location.hash;
  if (hash && hash.startsWith('#moto-')) {
    var id   = parseInt(hash.replace('#moto-', ''), 10);
    var moto = MOTOS.find(function (m) { return m.id === id; });
    if (moto) { showDetail(moto); return; }
  }
  showCatalog();
}

// ─── Sidebar mobile ───────────────────────────────────────────────────────────
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ─── Popular dropdowns ────────────────────────────────────────────────────────
function populateMarcas() {
  var sel   = document.getElementById('filter-marca');
  var marcas = Array.from(new Set(MOTOS.map(function (m) { return m.marca; }))).sort();
  marcas.forEach(function (marca) {
    var opt = document.createElement('option');
    opt.value = marca;
    opt.textContent = marca;
    sel.appendChild(opt);
  });
}

function populateModelos(marca) {
  var sel = document.getElementById('filter-modelo');
  sel.innerHTML = '<option value="">Todos os modelos</option>';
  if (!marca) return;
  var modelos = Array.from(new Set(
    MOTOS.filter(function (m) { return m.marca === marca; }).map(function (m) { return m.modelo; })
  )).sort();
  modelos.forEach(function (modelo) {
    var opt = document.createElement('option');
    opt.value = modelo;
    opt.textContent = modelo;
    sel.appendChild(opt);
  });
}

function populateCilindradas() {
  var sel  = document.getElementById('filter-cilindrada');
  var cils = Array.from(new Set(MOTOS.map(function (m) { return m.cilindrada; }))).sort();
  cils.forEach(function (c) {
    var opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

function populateYearPills() {
  var years = Array.from(new Set(MOTOS.map(function (m) { return m.ano; }))).sort();
  document.getElementById('year-pills').innerHTML = years.map(function (y) {
    return '<button class="pill" data-year="' + y + '">' + y + '</button>';
  }).join('');
}

// ─── Helpers de pills ─────────────────────────────────────────────────────────
function clearPills(containerId) {
  document.getElementById(containerId).querySelectorAll('.pill.active').forEach(function (p) {
    p.classList.remove('active');
  });
}

// ─── Limpar todos os filtros ──────────────────────────────────────────────────
function clearAllFilters() {
  state.filters = {
    search: '', marca: '', modelo: '', cilindrada: '',
    precoMin: '', precoMax: '', anoMin: '', anoMax: '', kmMin: '', kmMax: ''
  };
  state.photoIndices = {};

  ['search-input', 'filter-preco-min', 'filter-preco-max',
   'filter-ano-min', 'filter-ano-max', 'filter-km-min', 'filter-km-max'
  ].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });

  document.getElementById('filter-marca').value      = '';
  document.getElementById('filter-modelo').value     = '';
  document.getElementById('filter-cilindrada').value = '';
  populateModelos('');
  document.querySelectorAll('.pill.active').forEach(function (p) { p.classList.remove('active'); });
  renderCatalog();
}

// ─── Event listeners ─────────────────────────────────────────────────────────
function initEvents() {

  // Busca (tempo real)
  document.getElementById('search-input').addEventListener('input', function () {
    state.filters.search = this.value;
    renderCatalog();
  });

  // Botão "Buscar" no hero — rola até os cards
  var btnSearch = document.getElementById('btn-search');
  if (btnSearch) {
    btnSearch.addEventListener('click', function () {
      document.getElementById('motos-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Marca
  document.getElementById('filter-marca').addEventListener('change', function () {
    state.filters.marca  = this.value;
    state.filters.modelo = '';
    populateModelos(this.value);
    renderCatalog();
  });

  // Modelo
  document.getElementById('filter-modelo').addEventListener('change', function () {
    state.filters.modelo = this.value;
    renderCatalog();
  });

  // Cilindrada
  document.getElementById('filter-cilindrada').addEventListener('change', function () {
    state.filters.cilindrada = this.value;
    renderCatalog();
  });

  // Preço inputs
  document.getElementById('filter-preco-min').addEventListener('input', function () {
    state.filters.precoMin = this.value;
    clearPills('price-pills');
    renderCatalog();
  });
  document.getElementById('filter-preco-max').addEventListener('input', function () {
    state.filters.precoMax = this.value;
    clearPills('price-pills');
    renderCatalog();
  });

  // Preço pills
  document.getElementById('price-pills').addEventListener('click', function (e) {
    var pill = e.target.closest('.pill');
    if (!pill) return;
    if (pill.classList.contains('active')) {
      pill.classList.remove('active');
      state.filters.precoMin = '';
      state.filters.precoMax = '';
      document.getElementById('filter-preco-min').value = '';
      document.getElementById('filter-preco-max').value = '';
    } else {
      clearPills('price-pills');
      pill.classList.add('active');
      state.filters.precoMin = pill.dataset.min || '';
      state.filters.precoMax = pill.dataset.max || '';
      document.getElementById('filter-preco-min').value = pill.dataset.min || '';
      document.getElementById('filter-preco-max').value = pill.dataset.max || '';
    }
    renderCatalog();
  });

  // Ano inputs
  document.getElementById('filter-ano-min').addEventListener('input', function () {
    state.filters.anoMin = this.value;
    clearPills('year-pills');
    renderCatalog();
  });
  document.getElementById('filter-ano-max').addEventListener('input', function () {
    state.filters.anoMax = this.value;
    clearPills('year-pills');
    renderCatalog();
  });

  // Ano pills
  document.getElementById('year-pills').addEventListener('click', function (e) {
    var pill = e.target.closest('.pill');
    if (!pill) return;
    if (pill.classList.contains('active')) {
      pill.classList.remove('active');
      state.filters.anoMin = '';
      state.filters.anoMax = '';
      document.getElementById('filter-ano-min').value = '';
      document.getElementById('filter-ano-max').value = '';
    } else {
      clearPills('year-pills');
      pill.classList.add('active');
      state.filters.anoMin = pill.dataset.year;
      state.filters.anoMax = pill.dataset.year;
      document.getElementById('filter-ano-min').value = pill.dataset.year;
      document.getElementById('filter-ano-max').value = pill.dataset.year;
    }
    renderCatalog();
  });

  // Km inputs
  document.getElementById('filter-km-min').addEventListener('input', function () {
    state.filters.kmMin = this.value;
    renderCatalog();
  });
  document.getElementById('filter-km-max').addEventListener('input', function () {
    state.filters.kmMax = this.value;
    renderCatalog();
  });

  // Limpar filtros
  document.getElementById('btn-clear-filters').addEventListener('click', clearAllFilters);

  // Mobile sidebar
  document.getElementById('btn-filter-toggle').addEventListener('click', openSidebar);
  document.getElementById('btn-sidebar-close').addEventListener('click', closeSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

  // Grid — delegação de eventos (foto nav + clique no card)
  document.getElementById('motos-grid').addEventListener('click', function (e) {
    var navBtn = e.target.closest('.btn-photo-nav');
    if (navBtn) {
      var motoId = parseInt(navBtn.dataset.id, 10);
      var dir    = parseInt(navBtn.dataset.dir, 10);
      var moto   = MOTOS.find(function (m) { return m.id === motoId; });
      if (!moto) return;
      var cur  = state.photoIndices[motoId] || 0;
      var next = (cur + dir + moto.fotos.length) % moto.fotos.length;
      state.photoIndices[motoId] = next;
      var navCard = navBtn.closest('.moto-card');
      navCard.querySelector('.card-photo img').src = moto.fotos[next];
      var counter = navCard.querySelector('.photo-count');
      if (counter) counter.textContent = '📷 ' + (next + 1) + '/' + moto.fotos.length;
      return;
    }

    var card = e.target.closest('.moto-card');
    if (card) {
      window.location.hash = '#moto-' + card.dataset.id;
    }
  });

  // Logo → volta ao catálogo
  document.getElementById('logo-link').addEventListener('click', function (e) {
    if (window.location.hash) {
      e.preventDefault();
      window.location.hash = '';
    }
  });

  // Roteamento por hash (botão voltar do navegador)
  window.addEventListener('hashchange', router);
}

// ─── Inicialização ────────────────────────────────────────────────────────────
function init() {
  populateMarcas();
  populateCilindradas();
  populateYearPills();
  initEvents();
  router();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
