// Statistik Indonesia — one render function per page. Each returns an HTML
// string built only from data.js and charts.js, and wires only that page's
// controls after insertion. Charts are drawn after insertion so the builder
// receives the panel's real pixel width and labels stay at true CSS pixels.
//
// A chart slot may carry data-height: the SVG is then built at that height
// in the compact geometry (14 px titles, 11 px labels, 10 px source lines)
// so the panel fits its pixel budget. Slots without data-height use the
// default 280/320 px geometry.

import {
  INDICATORS, GROWTH, POPULATION, INFLATION, TRADE, ISLANDS, TPT, POVERTY,
  HDI, PROVINCES, statusOf, STATUS_RANK, idNum,
} from './data.js';
import { barChart, lineChart, groupedBarChart, sparkline } from './charts.js';

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

const TEAL = '#0F7C7B';
const AMBER = '#D98E04';

// Sparkline series per indicator card, from the verified series in data.js.
// Only published points are passed in, in order; a gap (population 2021,
// inflation Des 2022) is never interpolated. Colour follows the latest
// published move in the improving direction (teal) or against it (amber).
// PDB and PDB per kapita have no verified series of three or more points,
// so they get a blank spacer of the same height instead of a sparkline.
const SPARKS = {
  penduduk: { values: POPULATION.map((p) => p.value), color: TEAL },
  inflasi: { values: INFLATION.map((p) => p.value), color: AMBER },
  pengangguran: { values: TPT.map((p) => p.value), color: TEAL },
  kemiskinan: { values: POVERTY.map((p) => p.value), color: TEAL },
  ekspor: { values: TRADE.map((t) => t.ekspor), color: TEAL },
  pertumbuhan: { values: GROWTH.map((g) => g.value), color: TEAL },
};

// The unit is omitted from the value line for these two cards: the value
// already states it, and value plus unit measures 401 px / 455 px at the
// card's type size against a 271 px inner width, so it cannot fit on one
// line. The label already carries the unit (PDB per kapita; Kemiskinan).
const OMIT_UNIT = new Set(['pdb-kapita', 'kemiskinan']);

// The trade page's filter state. Reset to defaults every time the page
// renders; wirePerdagangan repaints the chart and the table together.
let tradeState = { year: 'Semua', mode: 'both' };

function tradeView() {
  const rows = tradeState.year === 'Semua' ? TRADE : TRADE.filter((t) => t.label === tradeState.year);
  const labels = rows.map((t) => t.label);
  const mode = tradeState.mode;
  let series;
  let base;
  if (mode === 'ekspor') {
    series = [{ label: 'Ekspor', values: rows.map((t) => t.ekspor), color: TEAL }];
    base = 'Ekspor';
  } else if (mode === 'impor') {
    series = [{ label: 'Impor', values: rows.map((t) => t.impor), color: AMBER }];
    base = 'Impor';
  } else if (mode === 'surplus') {
    series = [{ label: 'Surplus', values: rows.map((t) => t.surplus), color: TEAL }];
    base = 'Surplus perdagangan';
  } else {
    series = [
      { label: 'Ekspor', values: rows.map((t) => t.ekspor), color: TEAL },
      { label: 'Impor', values: rows.map((t) => t.impor), color: AMBER },
    ];
    base = 'Ekspor dan impor';
  }
  const years = tradeState.year === 'Semua' ? '2021–2024' : tradeState.year;
  return { rows, labels, series, title: `${base} ${years} (USD miliar)` };
}

function tradeColumns() {
  if (tradeState.mode === 'ekspor') return [{ key: 'ekspor', label: 'Ekspor (USD miliar)' }];
  if (tradeState.mode === 'impor') return [{ key: 'impor', label: 'Impor (USD miliar)' }];
  if (tradeState.mode === 'surplus') return [{ key: 'surplus', label: 'Surplus (USD miliar)' }];
  return [
    { key: 'ekspor', label: 'Ekspor (USD miliar)' },
    { key: 'impor', label: 'Impor (USD miliar)' },
    { key: 'surplus', label: 'Surplus (USD miliar)' },
  ];
}

// Chart slots: the key is the slot's data-chart value, the function builds
// the SVG at the measured panel width (and the slot's data-height, when
// given). The trade chart reads the page's filter state, so repainting it
// after a chip click shows the filtered chart.
const CHART_BUILDERS = {
  growth: (w, h) => barChart({
    title: 'Pertumbuhan ekonomi 2021–2025', labels: GROWTH.map((g) => g.label),
    values: GROWTH.map((g) => g.value), unit: '%', source: 'Sumber: BPS, 2025',
    color: TEAL, width: w, height: h || 280, compact: h !== undefined,
  }),
  population: (w, h) => lineChart({
    title: 'Penduduk 2020–2025 (juta jiwa)', labels: POPULATION.map((p) => p.label),
    values: POPULATION.map((p) => p.value), source: 'Sumber: BPS, 2025 · 2021 tidak dipublikasikan',
    color: TEAL, width: w, height: h || 280, compact: h !== undefined,
  }),
  inflation: (w, h) => lineChart({
    title: 'Inflasi tahunan (Desember)', labels: INFLATION.map((p) => p.label),
    values: INFLATION.map((p) => p.value), unit: '%', source: 'Sumber: BPS, 2025',
    color: AMBER, width: w, height: h || 280, compact: h !== undefined,
  }),
  trade: (w, h) => {
    const v = tradeView();
    return groupedBarChart({
      title: v.title, labels: v.labels, series: v.series,
      source: 'Sumber: BPS, 2021–2024', width: w, height: h || 166, compact: true,
    });
  },
  tpt: (w, h) => lineChart({
    title: 'Tingkat pengangguran terbuka', labels: TPT.map((p) => p.label),
    values: TPT.map((p) => p.value), unit: '%', source: 'Sumber: BPS, 2026',
    color: TEAL, width: w, height: h || 280, compact: h !== undefined,
  }),
  poverty: (w, h) => lineChart({
    title: 'Tingkat kemiskinan', labels: POVERTY.map((p) => p.label),
    values: POVERTY.map((p) => p.value), unit: '%', source: 'Sumber: BPS, 2026',
    color: AMBER, width: w, height: h || 280, compact: h !== undefined,
  }),
  hdi: (w, h) => lineChart({
    title: 'Indeks Pembangunan Manusia', labels: HDI.map((p) => p.label),
    values: HDI.map((p) => p.value), source: 'Sumber: BPS, 2026',
    color: TEAL, width: w, height: h || 280, compact: h !== undefined,
  }),
};

// Fill every chart slot on the current page with an SVG built at the
// slot's real rendered width. Safe to call again on resize.
export function mountCharts(root) {
  root.querySelectorAll('.chart').forEach((slot) => {
    const build = CHART_BUILDERS[slot.dataset.chart];
    if (!build) return;
    const width = Math.max(280, slot.clientWidth || 640);
    const height = slot.dataset.height ? Number(slot.dataset.height) : undefined;
    slot.innerHTML = build(width, height);
  });
}

function cardHTML(card) {
  const unit = card.unit && !OMIT_UNIT.has(card.key) ? ` <small>${esc(card.unit)}</small>` : '';
  const sub = `<span class="card-sub">${esc(card.sub)}</span>`;
  const spark = SPARKS[card.key]
    ? `<span class="spark">${sparkline({ values: SPARKS[card.key].values, color: SPARKS[card.key].color })}</span>`
    : '<span class="spark-blank" aria-hidden="true"></span>';
  return `<a class="card" href="${card.route}">
    <span class="card-label">${esc(card.label)}</span>
    <span class="card-value">${esc(card.value)}${unit}</span>
    ${sub}
    ${spark}
    <span class="card-context ${card.contextClass}">${esc(card.context)}</span>
    ${src(card.period)}
  </a>`;
}

export function renderHome() {
  const cards = INDICATORS.map(cardHTML).join('');
  return `
  <section class="hero">
    <div class="hero-text">
      <p class="eyebrow">Ringkasan Nasional</p>
      <div class="h1-wrap"><span class="accent-bar" aria-hidden="true"></span><h1 tabindex="-1">Dengan penduduk 284,44 juta jiwa pada 2025, Indonesia mencatat PDB Rp23.821,1 triliun dan pertumbuhan ekonomi 5,11%.</h1></div>
      <p class="lede">Ringkasan BPS 2025 ini menyatukan skala penduduk, besar PDB, dan laju pertumbuhan dalam satu gambaran.</p>
    </div>
    <div class="hero-cta">
      <a class="btn-primary" href="#/provinsi">Lihat tabel provinsi</a>
      <a class="btn-secondary" href="#/ekonomi">Jelajahi ekonomi</a>
    </div>
  </section>
  <section class="cards" aria-label="Indikator utama">${cards}</section>
  <section class="chart-row home-charts">
    <div class="panel"><div class="chart" data-chart="growth" data-height="228"></div></div>
    <div class="panel"><div class="chart" data-chart="population" data-height="228"></div></div>
  </section>
  <section class="panel">
    <h2>Sorotan</h2>
    <div class="sorotan-row">
      <strong>Kemiskinan terendah</strong>
      <p>Kemiskinan turun ke 8,07% pada Maret 2026, capaian terendah yang tercatat.</p>
      <a href="#/sejahtera">Lihat Kesejahteraan →</a>
    </div>
    <div class="sorotan-row">
      <strong>Pengangguran terendah</strong>
      <p>Pengangguran 4,65% pada Mei 2026, terendah sejak 1995.</p>
      <a href="#/kerja">Lihat Ketenagakerjaan →</a>
    </div>
    <div class="sorotan-row">
      <strong>IPM naik empat tahun</strong>
      <p>IPM naik empat tahun berturut-turut, dari 74,39 pada 2023 menjadi 76,59 pada 2026.</p>
      <a href="#/sejahtera">Lihat Kesejahteraan →</a>
    </div>
  </section>
  <section class="tiles">
    <a class="tile" href="#/ekonomi"><strong>Ekonomi</strong><span>PDB, pertumbuhan, inflasi</span></a>
    <a class="tile" href="#/penduduk"><strong>Penduduk</strong><span>284,44 juta jiwa, 38 provinsi</span></a>
    <a class="tile" href="#/kerja"><strong>Ketenagakerjaan</strong><span>Pengangguran 4,65%, pekerja informal</span></a>
    <a class="tile" href="#/sejahtera"><strong>Kesejahteraan</strong><span>Kemiskinan 8,07%, IPM 76,59</span></a>
    <a class="tile" href="#/perdagangan"><strong>Perdagangan</strong><span>Ekspor, impor, dan surplus 2021–2024</span></a>
  </section>`;
}

export function renderEkonomi() {
  return `
  <section>
    <p class="eyebrow">Ekonomi</p>
    <div class="h1-wrap"><span class="accent-bar" aria-hidden="true"></span><h1 tabindex="-1">Ekonomi</h1></div>
    <p class="lede">PDB, pertumbuhan, dan inflasi Indonesia.</p>
  </section>
  <section class="lead">
    <p class="eyebrow">PDB nominal 2025</p>
    <p><span class="lead-value">Rp23.821,1 <small>triliun</small></span></p>
    <p>Pertumbuhan 5,11% pada 2025. Triwulan I-2026 tumbuh 5,61% (yoy) dan triwulan II-2026 tumbuh 5,29% (yoy). ${src('2025–2026')}</p>
  </section>
  <section class="chart-row">
    <div class="panel"><div class="chart" data-chart="growth" data-height="260"></div></div>
    <div class="panel"><div class="chart" data-chart="inflation" data-height="170"></div>
      <p class="note">Catatan: Desember 2022 tidak ada pada sumber yang dikutip.</p>
      <p><span class="chip">Inti 2,38%</span> <span class="chip">Bergejolak 6,21%</span> <span class="chip">Harga diatur 1,93%</span></p>
      <p class="note">Komponen inflasi 2025. Terbaru: 3,19% (Agu 2026). ${src('2025–2026')}</p>
    </div>
  </section>
  <section class="panel">
    <h2>Apa artinya</h2>
    <dl class="defs">
      <dt>PDB</dt><dd>Nilai seluruh barang dan jasa yang dihasilkan di Indonesia dalam satu tahun.</dd>
      <dt>Pertumbuhan ekonomi</dt><dd>Kenaikan PDB dibanding tahun sebelumnya, setelah dikoreksi inflasi.</dd>
      <dt>Inflasi</dt><dd>Kenaikan harga barang dan jasa secara umum dalam satu tahun.</dd>
    </dl>
  </section>`;
}

export function renderPerdagangan() {
  tradeState = { year: 'Semua', mode: 'both' };
  return `
  <section>
    <p class="eyebrow">Perdagangan</p>
    <div class="h1-wrap"><span class="accent-bar" aria-hidden="true"></span><h1 tabindex="-1">Perdagangan</h1></div>
    <p class="lede">Ekspor, impor, dan neraca perdagangan Indonesia.</p>
  </section>
  <section class="lead">
    <p class="eyebrow">Ekspor 2024</p>
    <p><span class="lead-value">USD264,70 <small>miliar</small></span></p>
    <p>Surplus perdagangan USD31,04 miliar pada 2024 (BPS, 2024). Indonesia mencatat surplus 56 bulan berturut sejak Mei 2020 hingga Desember 2024 (BPS, 2020–2024).</p>
  </section>
  <section class="panel trade-chart-panel">
    <div class="trade-controls">
      <div class="chips" role="group" aria-label="Pilih periode">
        <button type="button" class="chip-btn active" data-year="Semua">Semua</button>
        <button type="button" class="chip-btn" data-year="2021">2021</button>
        <button type="button" class="chip-btn" data-year="2022">2022</button>
        <button type="button" class="chip-btn" data-year="2023">2023</button>
        <button type="button" class="chip-btn" data-year="2024">2024</button>
      </div>
      <div class="chips" role="group" aria-label="Pilih seri">
        <button type="button" class="chip-btn active" data-mode="both">Ekspor &amp; Impor</button>
        <button type="button" class="chip-btn" data-mode="ekspor">Ekspor</button>
        <button type="button" class="chip-btn" data-mode="impor">Impor</button>
        <button type="button" class="chip-btn" data-mode="surplus">Surplus</button>
      </div>
    </div>
    <div class="chart" data-chart="trade" data-height="166"></div>
  </section>
  <section class="panel panel-tight">
    <h2>Tabel perdagangan</h2>
    <div class="table-scroll">
      <table class="tbl compact">
        <thead id="trade-head"></thead>
        <tbody id="trade-body"></tbody>
      </table>
    </div>
  </section>
  <p class="note" id="trade-detail">Rincian 2024: ekspor non-migas USD248,83 miliar dan migas USD15,89 miliar; impor non-migas USD197,38 miliar dan migas USD36,28 miliar. ${src('2024')}</p>
  <section class="panel">
    <h2>Apa artinya</h2>
    <p>Neraca perdagangan adalah selisih antara nilai ekspor dan impor. Jika ekspor lebih besar daripada impor, terjadi surplus; jika impor lebih besar, terjadi defisit.</p>
  </section>`;
}

function paintTrade(root) {
  const v = tradeView();
  const cols = tradeColumns();
  const chartSlot = root.querySelector('[data-chart="trade"]');
  if (chartSlot) {
    const width = Math.max(280, chartSlot.clientWidth || 640);
    chartSlot.innerHTML = CHART_BUILDERS.trade(width, 166);
  }
  const head = root.querySelector('#trade-head');
  head.innerHTML = `<tr><th>Tahun</th>${cols.map((c) => `<th class="num">${c.label}</th>`).join('')}<th>Sumber</th></tr>`;
  const body = root.querySelector('#trade-body');
  body.innerHTML = v.rows.map((t) => `<tr><td>${t.label}</td>${cols.map((c) => `<td class="num">${idNum(t[c.key])}</td>`).join('')}<td>BPS, ${t.label}</td></tr>`).join('');
  const detail = root.querySelector('#trade-detail');
  if (detail) detail.hidden = !(tradeState.year === 'Semua' || tradeState.year === '2024');
  root.querySelectorAll('[data-year]').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.year === tradeState.year);
  });
  root.querySelectorAll('[data-mode]').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.mode === tradeState.mode);
  });
}

function wirePerdagangan(root) {
  root.querySelectorAll('[data-year]').forEach((chip) => {
    chip.addEventListener('click', () => {
      tradeState.year = chip.dataset.year;
      paintTrade(root);
    });
  });
  root.querySelectorAll('[data-mode]').forEach((chip) => {
    chip.addEventListener('click', () => {
      tradeState.mode = chip.dataset.mode;
      paintTrade(root);
    });
  });
  paintTrade(root);
}

export function renderPenduduk() {
  const rows = ISLANDS.map((row) => {
    const barWidth = ((row.share / 60) * 120).toFixed(1);
    return `<tr><td>${esc(row.label)}</td><td class="num">${idNum(row.value)} juta</td><td><span class="share-bar" style="width:${barWidth}px"></span>${idNum(row.share)}%</td></tr>`;
  }).join('');
  return `
  <section>
    <p class="eyebrow">Penduduk</p>
    <div class="h1-wrap"><span class="accent-bar" aria-hidden="true"></span><h1 tabindex="-1">Penduduk</h1></div>
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
    <div class="h1-wrap"><span class="accent-bar" aria-hidden="true"></span><h1 tabindex="-1">Ketenagakerjaan</h1></div>
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
    <div class="h1-wrap"><span class="accent-bar" aria-hidden="true"></span><h1 tabindex="-1">Kesejahteraan</h1></div>
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
    <div class="h1-wrap"><span class="accent-bar" aria-hidden="true"></span><h1 tabindex="-1">Provinsi</h1></div>
    <p class="lede">Indeks Pembangunan Manusia 2024 untuk 37 provinsi. Cari, saring, dan urutkan tabel di bawah ini.</p>
  </section>
  <section>
    <p class="notice">37 dari 38 provinsi ditampilkan; nilai IPM 2024 Papua Barat Daya tidak dipublikasikan pada sumber yang dikutip.</p>
    <div class="prov-controls">
      <div class="search-wrap">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="#5B6B73" stroke-width="1.5"/><line x1="11" y1="11" x2="15" y2="15" stroke="#5B6B73" stroke-width="1.5"/></svg>
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
  // The whole header cell sorts, not just the button: the button is
  // narrower than its th, so a click on the cell padding missed it and
  // the sort looked dead. One listener on the th catches clicks on the
  // button (which bubble up), on the cell padding, and keyboard
  // activation of the button (its click event bubbles to the th).
  root.querySelectorAll('th [data-sort]').forEach((btn) => {
    btn.closest('th').addEventListener('click', () => {
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
  perdagangan: { title: 'Perdagangan — Statistik Indonesia', render: renderPerdagangan },
  penduduk: { title: 'Penduduk — Statistik Indonesia', render: renderPenduduk },
  kerja: { title: 'Ketenagakerjaan — Statistik Indonesia', render: renderKerja },
  sejahtera: { title: 'Kesejahteraan — Statistik Indonesia', render: renderSejahtera },
  provinsi: { title: 'Provinsi — Statistik Indonesia', render: renderProvinsi },
};

// Wire page-specific controls after the markup is in the document.
export function wirePage(route, root) {
  if (route === 'provinsi') wireProvinsi(root);
  if (route === 'perdagangan') wirePerdagangan(root);
}
