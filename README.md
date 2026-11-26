# Statistik Indonesia

Situs statistik nasional Indonesia yang independen — angka resmi BPS (Badan Pusat Statistik), disajikan ulang dengan grafik dan tabel interaktif. Berjalan sepenuhnya offline: file statis di bawah `app/`, tanpa build step, tanpa permintaan jaringan.

[![Make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![Rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/garyadrianto1/best-national-statistics-site/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![Reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/garyadrianto1/best-national-statistics-site/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)

## Menjalankan

```sh
node serve.ts
```

Lalu buka http://localhost:8080 — enam halaman (Beranda, Ekonomi, Penduduk, Ketenagakerjaan, Kesejahteraan, Provinsi) lewat hash route, termasuk tabel IPM 37 provinsi yang bisa dicari, disaring, dan diurutkan.

## Menyerahkan

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` menyalin `app/` dan `screenshots/` ke direktori output dan menulis `dossier.json` lewat pustaka `vendor/makefun-frontend.ts`.

## Data

Semua angka bersumber dari BPS (Badan Pusat Statistik), masing-masing dengan periode dan sumbernya pada halaman terkait. Situs ini independen dan tidak berafiliasi dengan BPS.
