// Statistik Indonesia — single source of truth for every published figure.
// Every number below comes from BPS (Badan Pusat Statistik) as recorded in
// EVIDENCE/data-verified.md. No figure here is estimated or invented.
// Periods use Indonesian formatting: comma for decimals, dot for thousands.

// Format a number with Indonesian separators: 3.7 -> "3,70", 231.61 -> "231,61".
export function idNum(value, decimals = 2) {
  return value.toFixed(decimals).replace('.', ',');
}

// Home indicator cards. contextClass 'good' is teal, 'warn' is amber.
// The unit renders on the value line only when it is not already stated
// by the value itself (see cardHTML in views.js).
export const INDICATORS = [
  {
    key: 'penduduk',
    label: 'Penduduk',
    value: '284,44',
    unit: 'juta jiwa',
    sub: '2025',
    context: 'dari 281,60 juta (2024)',
    contextClass: 'good',
    period: '2025',
    route: '#/penduduk',
  },
  {
    key: 'pdb',
    label: 'PDB',
    value: 'Rp23.821,1',
    unit: 'triliun',
    sub: '2025',
    context: 'dari Rp22.139,0 triliun (2024)',
    contextClass: 'good',
    period: '2025',
    route: '#/ekonomi',
  },
  {
    key: 'pdb-kapita',
    label: 'PDB per kapita',
    value: 'Rp83,7 juta / USD5.083,4',
    unit: 'per kapita',
    sub: '2025',
    context: 'dari Rp78,6 juta / USD4.960,3 (2024)',
    contextClass: 'good',
    period: '2025',
    route: '#/ekonomi',
  },
  {
    key: 'inflasi',
    label: 'Inflasi',
    value: '2,92',
    unit: '%',
    sub: 'Desember 2025',
    context: 'dari 1,57% (Des 2024)',
    contextClass: 'warn',
    period: '2025',
    route: '#/ekonomi',
  },
  {
    key: 'pengangguran',
    label: 'Pengangguran',
    value: '4,65',
    unit: '%',
    sub: 'Mei 2026',
    context: 'dari 4,68% (Feb 2026)',
    contextClass: 'good',
    period: '2026',
    route: '#/kerja',
  },
  {
    key: 'kemiskinan',
    label: 'Kemiskinan',
    value: '8,07% / 22,93 juta jiwa',
    unit: 'persen / juta jiwa',
    sub: 'Maret 2026',
    context: 'dari 8,47% / 23,85 juta (Mar 2025)',
    contextClass: 'good',
    period: '2026',
    route: '#/sejahtera',
  },
  {
    key: 'ekspor',
    label: 'Ekspor',
    value: 'USD264,70 miliar',
    unit: '',
    sub: '2024',
    context: 'dari USD258,82 miliar (2023)',
    contextClass: 'good',
    period: '2025',
    route: '#/perdagangan',
  },
  {
    key: 'pertumbuhan',
    label: 'Pertumbuhan ekonomi',
    value: '5,11',
    unit: '%',
    sub: '2025',
    context: 'dari 5,03% (2024)',
    contextClass: 'good',
    period: '2025',
    route: '#/ekonomi',
  },
];

// Pertumbuhan ekonomi, persen (BPS, 2025).
export const GROWTH = [
  { label: '2021', value: 3.70 },
  { label: '2022', value: 5.31 },
  { label: '2023', value: 5.05 },
  { label: '2024', value: 5.03 },
  { label: '2025', value: 5.11 },
];

// Penduduk, juta jiwa (BPS). 2021 is not published in the cited source;
// the site discloses that in a footnote instead of interpolating.
export const POPULATION = [
  { label: '2020', value: 270.20 },
  { label: '2022', value: 275.77 },
  { label: '2023', value: 278.70 },
  { label: '2024', value: 281.60 },
  { label: '2025', value: 284.44 },
];

// Inflasi tahunan, persen, Desember (BPS). Desember 2022 is not in the
// cited source; the site discloses that instead of interpolating.
export const INFLATION = [
  { label: 'Des 2021', value: 1.87 },
  { label: 'Des 2023', value: 2.61 },
  { label: 'Des 2024', value: 1.57 },
  { label: 'Des 2025', value: 2.92 },
];

// Perdagangan luar negeri, USD miliar (BPS, 2025).
export const TRADE = [
  { label: '2021', ekspor: 231.61, impor: 196.27, surplus: 35.34 },
  { label: '2022', ekspor: 291.90, impor: 237.44, surplus: 54.46 },
  { label: '2023', ekspor: 258.82, impor: 221.93, surplus: 36.89 },
  { label: '2024', ekspor: 264.70, impor: 233.66, surplus: 31.04 },
];

// Sebaran penduduk per pulau, pertengahan 2024 (BPS).
export const ISLANDS = [
  { label: 'Jawa', value: 151.59, share: 54.36 },
  { label: 'Sumatera', value: 57.76, share: 20.71 },
  { label: 'Kalimantan', value: 16.15, share: 5.79 },
  { label: 'Sulawesi', value: 12.19, share: 4.37 },
  { label: 'Papua', value: 4.15, share: 1.49 },
];

// Tingkat pengangguran terbuka, persen (BPS).
export const TPT = [
  { label: 'Agu 2024', value: 4.91 },
  { label: 'Feb 2025', value: 4.76 },
  { label: 'Feb 2026', value: 4.68 },
  { label: 'Mei 2026', value: 4.65 },
];

// Tingkat kemiskinan, persen dan juta jiwa (BPS).
export const POVERTY = [
  { label: 'Sep 2024', value: 8.57, juta: 24.06 },
  { label: 'Mar 2025', value: 8.47, juta: 23.85 },
  { label: 'Mar 2026', value: 8.07, juta: 22.93 },
];

// Indeks Pembangunan Manusia (BPS). delta is the change in points.
export const HDI = [
  { label: '2023', value: 74.39, delta: '' },
  { label: '2024', value: 75.02, delta: '+0,63' },
  { label: '2025', value: 75.90, delta: '+0,88' },
  { label: '2026', value: 76.59, delta: '+0,69' },
];

// Status bands for provincial IPM (BPS categories).
export function statusOf(ipm) {
  if (ipm >= 80) return 'Sangat tinggi';
  if (ipm >= 70) return 'Tinggi';
  if (ipm >= 60) return 'Sedang';
  return 'Rendah';
}

export const STATUS_RANK = { Rendah: 1, Sedang: 2, Tinggi: 3, 'Sangat tinggi': 4 };

// 37 provinces with a published 2024 IPM value (BPS). Papua Barat Daya has
// no published 2024 IPM value in the cited source and is deliberately
// absent; the province page says so in a notice instead of inventing a value.
export const PROVINCES = [
  { name: 'Aceh', island: 'Sumatera', ipm: 75.36 },
  { name: 'Sumatera Utara', island: 'Sumatera', ipm: 75.76 },
  { name: 'Sumatera Barat', island: 'Sumatera', ipm: 76.43 },
  { name: 'Riau', island: 'Sumatera', ipm: 75.67 },
  { name: 'Jambi', island: 'Sumatera', ipm: 74.36 },
  { name: 'Sumatera Selatan', island: 'Sumatera', ipm: 73.84 },
  { name: 'Bengkulu', island: 'Sumatera', ipm: 74.91 },
  { name: 'Lampung', island: 'Sumatera', ipm: 73.13 },
  { name: 'Kepulauan Bangka Belitung', island: 'Sumatera', ipm: 74.55 },
  { name: 'Kepulauan Riau', island: 'Sumatera', ipm: 79.89 },
  { name: 'DKI Jakarta', island: 'Jawa', ipm: 84.15 },
  { name: 'Jawa Barat', island: 'Jawa', ipm: 74.92 },
  { name: 'Jawa Tengah', island: 'Jawa', ipm: 73.87 },
  { name: 'DI Yogyakarta', island: 'Jawa', ipm: 81.62 },
  { name: 'Jawa Timur', island: 'Jawa', ipm: 75.35 },
  { name: 'Banten', island: 'Jawa', ipm: 76.35 },
  { name: 'Bali', island: 'Bali–Nusa Tenggara', ipm: 78.63 },
  { name: 'Nusa Tenggara Barat', island: 'Bali–Nusa Tenggara', ipm: 73.10 },
  { name: 'Nusa Tenggara Timur', island: 'Bali–Nusa Tenggara', ipm: 69.14 },
  { name: 'Kalimantan Barat', island: 'Kalimantan', ipm: 71.19 },
  { name: 'Kalimantan Tengah', island: 'Kalimantan', ipm: 74.28 },
  { name: 'Kalimantan Selatan', island: 'Kalimantan', ipm: 75.19 },
  { name: 'Kalimantan Timur', island: 'Kalimantan', ipm: 78.79 },
  { name: 'Kalimantan Utara', island: 'Kalimantan', ipm: 73.41 },
  { name: 'Sulawesi Utara', island: 'Sulawesi', ipm: 75.68 },
  { name: 'Sulawesi Tengah', island: 'Sulawesi', ipm: 72.24 },
  { name: 'Sulawesi Selatan', island: 'Sulawesi', ipm: 75.18 },
  { name: 'Sulawesi Tenggara', island: 'Sulawesi', ipm: 73.62 },
  { name: 'Gorontalo', island: 'Sulawesi', ipm: 72.01 },
  { name: 'Sulawesi Barat', island: 'Sulawesi', ipm: 70.46 },
  { name: 'Maluku', island: 'Maluku', ipm: 73.40 },
  { name: 'Maluku Utara', island: 'Maluku', ipm: 71.84 },
  { name: 'Papua', island: 'Papua', ipm: 67.69 },
  { name: 'Papua Barat', island: 'Papua', ipm: 69.65 },
  { name: 'Papua Selatan', island: 'Papua', ipm: 68.86 },
  { name: 'Papua Tengah', island: 'Papua', ipm: 73.83 },
  { name: 'Papua Pegunungan', island: 'Papua', ipm: 54.43 },
];
