// Statistik Indonesia — one render function per page. Each returns an HTML
// string built only from data.js and charts.js, and wires only that page's
// controls after insertion. Charts are drawn after insertion so the builder
// receives the panel's real pixel width and labels stay at true CSS pixels.

import {
  INDICATORS, GROWTH, POPULATION, INFLATION, TRADE, ISLANDS, TPT, POVERTY,
  HDI, PROVINCES, statusOf, STATUS_RANK, idNum,
} from './data.js';
import { barChart, lineChart, groupedBarChart } from './charts.js';

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function src(period) {
  return `<span class="src">Sumber: BPS, ${period}</span>`;
}

const TEAL = '#0F7A63';
const SLATE = '#3F5F8C';
const AMBER = '#C07A22';

// Chart slots: the key is the slot's data-chart value, the function builds
// the SVG at the measured panel width.
const CHART_BUILDERS = {
  growth: (w) => barChart({
    title: 'Pertumbuhan ekonomi 2021–2025', labels: GROWTH.map((g) => g.label),
    values: GROWTH.map((g) => g.value), unit: '%', source: 'Sumber: BPS, 2025',
    color: TEAL, width: w,
  }),
  population: (w) => lineChart({
    title: 'Penduduk 2020–2025 (juta jiwa)', labels: POPULATION.map((p) => p.label),
    values: POPULATION.map((p) => p.value), source: 'Sumber: BPS, 2025',
    color: TEAL, width: w,
  }),
  inflation: (w) => lineChart({
    title: 'Inflasi tahunan (Desember)', labels: INFLATION.map((p) => p.label),
    values: INFLATION.map((p) => p.value), unit: '%', source: 'Sumber: BPS, 2025',
    color: AMBER, width: w,
  }),
  trade: (w) => groupedBarChart({
    title: 'Ekspor dan impor 2021–2024 (USD miliar)', labels: TRADE.map((t) => t.label),
    series: [
      { label: 'Ekspor', values: TRADE.map((t) => t.ekspor), color: TEAL },
      { label: 'Impor', values: TRADE.map((t) => t.impor), color: SLATE },
    ],
    source: 'Sumber: BPS, 2025', width: w,
  }),
  tpt: (w) => lineChart({
    title: 'Tingkat pengangguran terbuka', labels: TPT.map((p) => p.label),
    values: TPT.map((p) => p.value), unit: '%', source: 'Sumber: BPS, 2026',
    color: TEAL, width: w,
  }),
  poverty: (w) => lineChart({
    title: 'Tingkat kemiskinan', labels: POVERTY.map((p) => p.label),
    values: POVERTY.map((p) => p.value), unit: '%', source: 'Sumber: BPS, 2026',
    color: AMBER, width: w,
  }),
  hdi: (w) => lineChart({
    title: 'Indeks Pembangunan Manusia', labels: HDI.map((p) => p.label),
    values: HDI.map((p) => p.value), source: 'Sumber: BPS, 2026',
    color: TEAL, width: w,
  }),
};

// Fill every chart slot on the current page with an SVG built at the
// slot's real rendered width. Safe to call again on resize.
export function mountCharts(root) {
  root.querySelectorAll('.chart').forEach((slot) => {
    const build = CHART_BUILDERS[slot.dataset.chart];
    if (!build) return;
    const width = Math.max(280, slot.clientWidth || 640);
    slot.innerHTML = build(width);
  });
}

function cardHTML(card) {
  const unit = card.unit ? ` <small>${esc(card.unit)}</small>` : '';
  const sub = card.sub ? `<span class="card-sub">${esc(card.sub)}</span>` : '';
  return `<a class="card" href="${card.route}">
    <span class="card-label">${esc(card.label)}</span>
    <span class="card-value">${esc(card.value)}${unit}</span>
    ${sub}
    <span class="card-context ${card.contextClass}">${esc(card.context)}</span>
    ${src(card.period)}
  </a>`;
}

export function renderHome() {
  const cards = INDICATORS.map(cardHTML).join('');
  return `
  <section class="hero">
    <p class="eyebrow">Ringkasan Nasional</p>
    <h1 tabindex="-1">Indonesia dalam Angka</h1>
    <p class="lede">Statistik resmi terbaru untuk 38 provinsi, 284 juta penduduk, dan ekonomi Rp23.821 triliun.</p>
    <p><span class="chip">Diperbarui: angka terbaru Mei 2026</span></p>
  </section>
  <section class="cards" aria-label="Indikator utama">${cards}</section>
  <section class="chart-row">
    <div class="panel"><div class="chart" data-chart="growth"></div></div>
    <div class="panel"><div class="chart" data-chart="population"></div>
      <p class="note">Catatan: angka 2021 tidak dipublikasikan pada sumber yang dikutip. Terbaru 2026: 287,1 juta.</p>
    </div>
  </section>
  <section class="panel">
    <h2>Sorotan</h2>
    <div class="sorotan-row">
      <strong>Kemiskinan terendah dalam sejarah</strong>
      <p>8,07% pada Mar 2026, turun dari 8,47% pada Mar 2025.</p>
      <a href="#/sejahtera">Lihat Kesejahteraan →</a>
    </div>
    <div class="sorotan-row">
      <strong>Pengangguran terendah sejak 1995</strong>
      <p>4,65% pada Mei 2026, dengan 7,22 juta pencari kerja.</p>
      <a href="#/kerja">Lihat Ketenagakerjaan →</a>
    </div>
    <div class="sorotan-row">
      <strong>IPM naik empat tahun berturut</strong>
      <p>74,39 pada 2023 menjadi 76,59 pada 2026.</p>
      <a href="#/sejahtera">Lihat Kesejahteraan →</a>
    </div>
  </section>
  <section class="tiles">
    <a class="tile" href="#/ekonomi"><strong>Ekonomi</strong><span>PDB, inflasi, perdagangan</span></a>
    <a class="tile" href="#/penduduk"><strong>Penduduk</strong><span>284,44 juta jiwa, 38 provinsi</span></a>
    <a class="tile" href="#/kerja"><strong>Ketenagakerjaan</strong><span>Pengangguran 4,65%, pekerja informal</span></a>
    <a class="tile" href="#/sejahtera"><strong>Kesejahteraan</strong><span>Kemiskinan 8,07%, IPM 76,59</span></a>
  </section>`;
}

export function renderEkonomi() {
  const rows = TRADE.map((t) => `<tr><td>${t.label}</td><td class="num">${idNum(t.ekspor)}</td><td class="num">${idNum(t.impor)}</td><td class="num">${idNum(t.surplus)}</td></tr>`).join('');
  return `
  <section>
    <p class="eyebrow">Ekonomi</p>
    <h1 tabindex="-1">Ekonomi</h1>
    <p class="lede">PDB, pertumbuhan, inflasi, dan perdagangan luar negeri Indonesia.</p>
  </section>
  <section class="lead">
    <p class="eyebrow">PDB nominal 2025</p>
    <p><span class="lead-value">Rp23.821,1 <small>triliun</small></span></p>
    <p>Pertumbuhan 5,11% pada 2025. Triwulan I-2026 tumbuh 5,61% (yoy) dan triwulan II-2026 tumbuh 5,29% (yoy). ${src('2025–2026')}</p>
  </section>
  <section class="chart-row">
    <div class="panel"><div class="chart" data-chart="growth"></div></div>
    <div class="panel"><div class="chart" data-chart="inflation"></div>
      <p class="note">Catatan: Desember 2022 tidak ada pada sumber yang dikutip.</p>
      <p><span class="chip">Inti 2,38%</span> <span class="chip">Bergejolak 6,21%</span> <span class="chip">Harga diatur 1,93%</span></p>
      <p class="note">Komponen inflasi 2025. Terbaru: 3,19% (Agu 2026). ${src('2025–2026')}</p>
    </div>
  </section>
  <section class="panel">
    <h2>Perdagangan luar negeri</h2>
    <div class="chart" data-chart="trade"></div>
    <table class="tbl">
      <thead><tr><th>Tahun</th><th class="num">Ekspor (USD miliar)</th><th class="num">Impor (USD miliar)</th><th class="num">Surplus (USD miliar)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="note">Rincian 2024: ekspor non-migas USD248,83 miliar dan migas USD15,89 miliar; impor non-migas USD197,38 miliar dan migas USD36,28 miliar. Neraca dagang surplus 56 bulan berturut sejak Mei 2020. ${src('2025')}</p>
  </section>
  <section class="panel">
    <h2>Apa artinya</h2>
    <dl class="defs">
      <dt>PDB</dt><dd>Nilai seluruh barang dan jasa yang dihasilkan di Indonesia dalam satu tahun.</dd>
      <dt>Pertumbuhan ekonomi</dt><dd>Kenaikan PDB dibanding tahun sebelumnya, setelah dikoreksi inflasi.</dd>
      <dt>Inflasi</dt><dd>Kenaikan harga barang dan jasa secara umum dalam satu tahun.</dd>
      <dt>Neraca dagang</dt><dd>Selisih nilai ekspor dan impor; surplus berarti ekspor lebih besar dari impor.</dd>
    </dl>
  </section>`;
}

export function renderPenduduk() {
  const rows = ISLANDS.map((row) => {
    const barWidth = ((row.share / 60) * 120).toFixed(1);
    return `<tr><td>${esc(row.label)}</td><td class="num">${idNum(row.value)} juta</td><td><span class="share-bar" style="width:${barWidth}px"></span>${idNum(row.share)}%</td></tr>`;
  }).join('');
  return `
  <section>
    <p class="eyebrow">Penduduk</p>
    <h1 tabindex="-1">Penduduk</h1>
    <p class="lede">Jumlah, pertumbuhan, dan sebaran penduduk Indonesia.</p>
  </section>
  <section class="panel">
    <div class="chart" data-chart="population"></div>
    <p class="note">Pertumbuhan penduduk: +1,04% pada 2024 dan +1,01% pada 2025. Terbaru 2026: 287,1 juta. Catatan: angka 2021 tidak dipublikasikan pada sumber yang dikutip. ${src('2025–2026')}</p>
  </section>
  <section class="panel">
    <h2>Sebaran penduduk per pulau (pertengahan 2024)</h2>
    <table class="tbl">
      <thead><tr><th>Pulau</th><th class="num">Penduduk</th><th>Pangsa</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="note">${src('2024')}</p>
  </section>
  <section>
    <h2>Fakta penduduk</h2>
    <div class="facts">
      <div class="fact"><span class="fact-value">38</span><span class="fact-label">provinsi di Indonesia</span><br>${src('2024')}</div>
      <div class="fact"><span class="fact-value">48,15 juta</span><span class="fact-label">penduduk Jawa Barat, provinsi terbesar</span><br>${src('Sensus Penduduk 2020')}</div>
      <div class="fact"><span class="fact-value">1.890.179,78 km²</span><span class="fact-label">luas daratan Indonesia</span><br>${src('BPS')}</div>
      <div class="fact"><span class="fact-value">17.380</span><span class="fact-label">pulau</span><br>${src('BPS')}</div>
      <div class="fact"><span class="fact-value">718</span><span class="fact-label">bahasa daerah</span><br>${src('BPS')}</div>
    </div>
  </section>`;
}

export function renderKerja() {
  return `
  <section>
    <p class="eyebrow">Ketenagakerjaan</p>
    <h1 tabindex="-1">Ketenagakerjaan</h1>
    <p class="lede">Pengangguran terbuka dan pekerja informal di Indonesia.</p>
  </section>
  <section class="lead">
    <p class="eyebrow">Tingkat pengangguran terbuka, Mei 2026</p>
    <p><span class="lead-value">4,65<small>%</small></span></p>
    <p>7,22 juta pencari kerja. Turun dari 4,68% (Feb 2026). ${src('2026')}</p>
    <p><strong>Terendah sejak 1995</strong> — pada Feb 2025 tingkat pengangguran terbuka tercatat 4,76%.</p>
  </section>
  <section class="panel"><div class="chart" data-chart="tpt"></div></section>
  <section class="panel">
    <h2>Pekerja informal</h2>
    <p><span class="lead-value">59,40<small>%</small></span></p>
    <p>Pekerja informal mencapai 59,40% dari penduduk bekerja pada Feb 2025. Pekerja informal bekerja tanpa perlindungan kerja formal seperti kontrak tetap atau jaminan sosial, sehingga pendapatannya lebih tidak menentu. ${src('Feb 2025')}</p>
    <p><a href="#/sejahtera">Lihat juga: Kesejahteraan →</a></p>
  </section>`;
}

function hdiTable(title, rows) {
  const body = rows.map((r) => `<tr><td>${esc(r.name)}</td><td class="num">${idNum(r.ipm)}</td><td><span class="pill pill-${pillClass(statusOf(r.ipm))}">${statusOf(r.ipm)}</span></td></tr>`).join('');
  return `<h3>${title}</h3>
  <table class="tbl">
    <thead><tr><th>Provinsi</th><th class="num">IPM 2024</th><th>Status</th></tr></thead>
    <tbody>${body}</tbody>
  </table>`;
}

function pillClass(status) {
  if (status === 'Sangat tinggi') return 'st';
  if (status === 'Tinggi') return 't';
  if (status === 'Sedang') return 's';
  return 'r';
}

export function renderSejahtera() {
  const topFive = [
    { name: 'DKI Jakarta', ipm: 84.15 },
    { name: 'DI Yogyakarta', ipm: 81.62 },
    { name: 'Kepulauan Riau', ipm: 79.89 },
    { name: 'Kalimantan Timur', ipm: 78.79 },
    { name: 'Bali', ipm: 78.63 },
  ];
  const bottomFive = [
    { name: 'Papua Pegunungan', ipm: 54.43 },
    { name: 'Papua', ipm: 67.69 },
    { name: 'Papua Selatan', ipm: 68.86 },
    { name: 'Nusa Tenggara Timur', ipm: 69.14 },
    { name: 'Papua Barat', ipm: 69.65 },
  ];
  return `
  <section>
    <p class="eyebrow">Kesejahteraan</p>
    <h1 tabindex="-1">Kesejahteraan</h1>
    <p class="lede">Kemiskinan dan pembangunan manusia di Indonesia.</p>
  </section>
  <section class="lead">
    <p class="eyebrow">Tingkat kemiskinan, Mar 2026</p>
    <p><span class="lead-value">8,07<small>%</small></span> &nbsp;·&nbsp; <span class="lead-value">22,93 <small>juta jiwa</small></span></p>
    <p>Turun dari 8,47% / 23,85 juta jiwa (Mar 2025) dan 8,57% / 24,06 juta jiwa (Sep 2024). Di perkotaan 6,73% dan di perdesaan 11,03% (Mar 2025). Garis kemiskinan Rp609.160 per kapita per bulan (Mar 2025). ${src('2025–2026')}</p>
  </section>
  <section class="chart-row">
    <div class="panel"><div class="chart" data-chart="poverty"></div></div>
    <div class="panel"><div class="chart" data-chart="hdi"></div>
      <p class="note">Kenaikan IPM: +0,63 poin (2024), +0,88 poin (2025), +0,69 poin (2026). ${src('2026')}</p>
    </div>
  </section>
  <section class="panel">
    <h2>IPM provinsi 2024</h2>
    ${hdiTable('Lima tertinggi', topFive)}
    <br>
    ${hdiTable('Lima terendah', bottomFive)}
    <p class="note">Tertinggi 2025: DKI Jakarta 85,05. Terendah 2025: Papua Pegunungan 54,91. ${src('2024–2025')}</p>
    <p><a href="#/provinsi">Tabel lengkap 37 provinsi →</a></p>
  </section>`;
}

// Province page state. Reset to defaults every time the page renders.
let provState = { q: '', status: 'Semua', key: 'ipm', dir: 'desc' };

function provFiltered() {
  let rows = PROVINCES.slice();
  if (provState.status !== 'Semua') {
    rows = rows.filter((r) => statusOf(r.ipm) === provState.status);
  }
  const q = provState.q.trim().toLowerCase();
  if (q) {
    rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.island.toLowerCase().includes(q));
  }
  const dir = provState.dir === 'asc' ? 1 : -1;
  rows.sort((a, b) => {
    if (provState.key === 'ipm') return (a.ipm - b.ipm) * dir;
    if (provState.key === 'provinsi') return a.name.localeCompare(b.name, 'id') * dir;
    const byStatus = (STATUS_RANK[statusOf(a.ipm)] - STATUS_RANK[statusOf(b.ipm)]) * dir;
    return byStatus !== 0 ? byStatus : b.ipm - a.ipm;
  });
  return rows;
}

function paintProvTable(root) {
  const rows = provFiltered();
  const body = root.querySelector('#prov-body');
  body.innerHTML = rows.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td>${esc(r.island)}</td><td class="num">${idNum(r.ipm)}</td><td><span class="pill pill-${pillClass(statusOf(r.ipm))}">${statusOf(r.ipm)}</span></td></tr>`).join('');
  root.querySelector('#prov-count').textContent = `Menampilkan ${rows.length} dari 37 provinsi`;
  root.querySelector('#prov-empty').hidden = rows.length !== 0;
  root.querySelectorAll('th [data-sort]').forEach((btn) => {
    const th = btn.closest('th');
    const arrow = btn.querySelector('.arrow');
    if (btn.dataset.sort === provState.key) {
      arrow.textContent = provState.dir === 'asc' ? '▲' : '▼';
      th.setAttribute('aria-sort', provState.dir === 'asc' ? 'ascending' : 'descending');
    } else {
      arrow.textContent = '';
      th.removeAttribute('aria-sort');
    }
  });
  root.querySelectorAll('.chip-btn').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.status === provState.status);
  });
}

export function renderProvinsi() {
  provState = { q: '', status: 'Semua', key: 'ipm', dir: 'desc' };
  return `
  <section>
    <p class="eyebrow">Provinsi</p>
    <h1 tabindex="-1">Provinsi</h1>
    <p class="lede">Indeks Pembangunan Manusia 2024 untuk 37 provinsi. Cari, saring, dan urutkan tabel di bawah ini.</p>
  </section>
  <section>
    <p class="notice">37 dari 38 provinsi ditampilkan; nilai IPM 2024 Papua Barat Daya tidak dipublikasikan pada sumber yang dikutip.</p>
    <div class="prov-controls">
      <div class="search-wrap">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="#5F6672" stroke-width="1.5"/><line x1="11" y1="11" x2="15" y2="15" stroke="#5F6672" stroke-width="1.5"/></svg>
        <input id="prov-search" type="search" placeholder="Cari provinsi atau wilayah…" aria-label="Cari provinsi atau wilayah">
      </div>
      <div class="chips" role="group" aria-label="Saring menurut status IPM">
        <button type="button" class="chip-btn active" data-status="Semua">Semua</button>
        <button type="button" class="chip-btn" data-status="Sangat tinggi">Sangat tinggi</button>
        <button type="button" class="chip-btn" data-status="Tinggi">Tinggi</button>
        <button type="button" class="chip-btn" data-status="Sedang">Sedang</button>
        <button type="button" class="chip-btn" data-status="Rendah">Rendah</button>
      </div>
      <button type="button" id="prov-reset" class="btn">Atur ulang</button>
    </div>
    <p id="prov-count" class="prov-count" aria-live="polite">Menampilkan 37 dari 37 provinsi</p>
    <div class="table-scroll">
      <table class="tbl">
        <thead><tr>
          <th>No</th>
          <th><button type="button" class="sort-btn" data-sort="provinsi">Provinsi <span class="arrow" aria-hidden="true"></span></button></th>
          <th>Wilayah</th>
          <th class="num"><button type="button" class="sort-btn" data-sort="ipm">IPM 2024 <span class="arrow" aria-hidden="true">▼</span></button></th>
          <th><button type="button" class="sort-btn" data-sort="status">Status <span class="arrow" aria-hidden="true"></span></button></th>
        </tr></thead>
        <tbody id="prov-body"></tbody>
      </table>
    </div>
    <p id="prov-empty" class="empty" hidden>Tidak ada provinsi yang cocok. <button type="button" id="prov-empty-reset" class="link-btn">Tampilkan semua</button></p>
    <p class="note">${src('2024')}</p>
  </section>
  <section>
    <h2>Catatan</h2>
    <div class="facts">
      <div class="fact"><span class="fact-value">38</span><span class="fact-label">provinsi di Indonesia sejak 2022</span><br>${src('BPS')}</div>
      <div class="fact"><span class="fact-value">84,15 / 54,43</span><span class="fact-label">IPM tertinggi 2024 (DKI Jakarta) dan terendah (Papua Pegunungan)</span><br>${src('2024')}</div>
    </div>
  </section>`;
}

function wireProvinsi(root) {
  const search = root.querySelector('#prov-search');
  search.addEventListener('input', () => {
    provState.q = search.value;
    paintProvTable(root);
  });
  root.querySelectorAll('.chip-btn').forEach((chip) => {
    chip.addEventListener('click', () => {
      provState.status = chip.dataset.status;
      paintProvTable(root);
    });
  });
  root.querySelectorAll('th [data-sort]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (provState.key === btn.dataset.sort) {
        provState.dir = provState.dir === 'asc' ? 'desc' : 'asc';
      } else {
        provState.key = btn.dataset.sort;
        provState.dir = 'asc';
      }
      paintProvTable(root);
    });
  });
  const reset = () => {
    provState = { q: '', status: 'Semua', key: 'ipm', dir: 'desc' };
    search.value = '';
    paintProvTable(root);
  };
  root.querySelector('#prov-reset').addEventListener('click', reset);
  root.querySelector('#prov-empty-reset').addEventListener('click', reset);
  paintProvTable(root);
}

export const PAGES = {
  '': { title: 'Statistik Indonesia — Indonesia dalam Angka', render: renderHome },
  ekonomi: { title: 'Ekonomi — Statistik Indonesia', render: renderEkonomi },
  penduduk: { title: 'Penduduk — Statistik Indonesia', render: renderPenduduk },
  kerja: { title: 'Ketenagakerjaan — Statistik Indonesia', render: renderKerja },
  sejahtera: { title: 'Kesejahteraan — Statistik Indonesia', render: renderSejahtera },
  provinsi: { title: 'Provinsi — Statistik Indonesia', render: renderProvinsi },
};

// Wire page-specific controls after the markup is in the document.
export function wirePage(route, root) {
  if (route === 'provinsi') wireProvinsi(root);
}
