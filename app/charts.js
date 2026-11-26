// Statistik Indonesia — hand-built SVG chart builders.
// Every builder is a pure function: same inputs, same markup. No data lives
// here; callers pass arrays from data.js. Charts render text at true CSS
// pixels because the caller measures the panel width and passes it in, so
// the viewBox width always equals the rendered width (scale 1).

import { idNum } from './data.js';

const INK = '#14213D';
const MUTED = '#5F6672';
const GRID = '#E3DED3';
const TEAL = '#0F7A63';
const AMBER = '#C07A22';
const SLATE = '#3F5F8C';

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Trim trailing zeros from an Indonesian-formatted number: 6 -> "6", 5.5 -> "5,5".
function fmtTrim(value, decimals = 2) {
  let s = value.toFixed(decimals).replace('.', ',');
  if (s.includes(',')) s = s.replace(/,?0+$/, '').replace(/,$/, '');
  return s;
}

// Round a maximum up to a round number (steps 1, 2, 3, 4, 5, 6, 8, 10
// times a power of ten) and return five ticks: 0, quarter, half, three
// quarters, top.
function niceTicks(maxValue) {
  const target = maxValue * 1.1;
  const power = Math.pow(10, Math.floor(Math.log10(target)));
  const scaled = target / power;
  const steps = [1, 2, 3, 4, 5, 6, 8, 10];
  let nice = 10;
  for (const step of steps) {
    if (scaled <= step) { nice = step; break; }
  }
  const top = nice * power;
  const step = top / 4;
  return [0, step, step * 2, step * 3, top];
}

function gridAndAxis({ width, height, top, bottom, left, right, ticks, max }) {
  const plotH = bottom - top;
  let s = '';
  for (const tick of ticks) {
    const y = bottom - (tick / max) * plotH;
    s += `<line x1="${left}" y1="${y.toFixed(1)}" x2="${width - right}" y2="${y.toFixed(1)}" stroke="${GRID}" stroke-width="1"/>`;
    s += `<text x="${left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-family="system-ui, sans-serif" font-size="12" fill="${MUTED}">${esc(fmtTrim(tick))}</text>`;
  }
  s += `<line x1="${left}" y1="${bottom}" x2="${width - right}" y2="${bottom}" stroke="${MUTED}" stroke-width="1"/>`;
  s += `<text x="16" y="${height - 10}" font-family="system-ui, sans-serif" font-size="12" fill="${MUTED}">${esc(this.source)}</text>`;
  return s;
}

// Vertical bar chart with a printed value above each bar.
export function barChart({ title, labels, values, unit = '', source = '', color = TEAL, width = 640 }) {
  const height = 280;
  const top = 46;
  const bottom = height - 46;
  const left = 52;
  const right = 16;
  const ticks = niceTicks(Math.max(...values));
  const max = ticks[ticks.length - 1];
  const plotW = width - left - right;
  const plotH = bottom - top;
  const n = values.length;
  const slot = plotW / n;
  const barW = Math.min(64, slot * 0.58);
  let s = `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="${esc(title)}">`;
  s += `<text x="16" y="22" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="${INK}">${esc(title)}</text>`;
  s += gridAndAxis.call({ source }, { width, height, top, bottom, left, right, ticks, max });
  values.forEach((value, i) => {
    const cx = left + slot * i + slot / 2;
    const h = (value / max) * plotH;
    const y = bottom - h;
    s += `<rect x="${(cx - barW / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${color}" rx="2"/>`;
    s += `<text x="${cx.toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="${INK}">${esc(idNum(value) + unit)}</text>`;
    s += `<text x="${cx.toFixed(1)}" y="${bottom + 20}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="${MUTED}">${esc(labels[i])}</text>`;
  });
  s += '</svg>';
  return s;
}

// Line chart with dots and a printed value near each point. A value label
// flips below its point when the point sits near the top of the plot.
export function lineChart({ title, labels, values, unit = '', source = '', color = TEAL, width = 640 }) {
  const height = 280;
  const top = 46;
  const bottom = height - 46;
  const left = 52;
  const right = 20;
  const ticks = niceTicks(Math.max(...values));
  const max = ticks[ticks.length - 1];
  const plotW = width - left - right;
  const plotH = bottom - top;
  const n = values.length;
  const xs = values.map((_, i) => (n === 1 ? left + plotW / 2 : left + (plotW * i) / (n - 1)));
  const ys = values.map((value) => bottom - (value / max) * plotH);
  let s = `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="${esc(title)}">`;
  s += `<text x="16" y="22" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="${INK}">${esc(title)}</text>`;
  s += gridAndAxis.call({ source }, { width, height, top, bottom, left, right, ticks, max });
  const points = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  s += `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  values.forEach((value, i) => {
    const above = ys[i] - 12 > top + 2;
    const labelY = above ? ys[i] - 10 : ys[i] + 20;
    s += `<circle cx="${xs[i].toFixed(1)}" cy="${ys[i].toFixed(1)}" r="4.5" fill="${color}" stroke="#FFFFFF" stroke-width="1.5"/>`;
    s += `<text x="${(i === 0 ? xs[i] + 8 : i === values.length - 1 ? xs[i] - 8 : xs[i]).toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="${i === 0 ? 'start' : i === values.length - 1 ? 'end' : 'middle'}" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="${INK}">${esc(idNum(value) + unit)}</text>`;
    s += `<text x="${(i === 0 ? xs[i] + 8 : i === values.length - 1 ? xs[i] - 8 : xs[i]).toFixed(1)}" y="${bottom + 20}" text-anchor="${i === 0 ? 'start' : i === values.length - 1 ? 'end' : 'middle'}" font-family="system-ui, sans-serif" font-size="12" fill="${MUTED}">${esc(labels[i])}</text>`;
  });
  s += '</svg>';
  return s;
}

// Grouped vertical bars: two series side by side per category, with a
// legend row at the bottom of the plot.
export function groupedBarChart({ title, labels, series, source = '', width = 640 }) {
  const height = 320;
  const top = 46;
  const bottom = height - 86;
  const left = 52;
  const right = 16;
  const allValues = series.flatMap((entry) => entry.values);
  const ticks = niceTicks(Math.max(...allValues));
  const max = ticks[ticks.length - 1];
  const plotW = width - left - right;
  const plotH = bottom - top;
  const n = labels.length;
  const slot = plotW / n;
  const barW = Math.min(44, slot * 0.3);
  let s = `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="${esc(title)}">`;
  s += `<text x="16" y="22" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="${INK}">${esc(title)}</text>`;
  s += gridAndAxis.call({ source }, { width, height, top, bottom, left, right, ticks, max });
  labels.forEach((label, i) => {
    const cx = left + slot * i + slot / 2;
    series.forEach((entry, j) => {
      const value = entry.values[i];
      const offset = (j - (series.length - 1) / 2) * (barW + 4);
      const h = (value / max) * plotH;
      const y = bottom - h;
      s += `<rect x="${(cx + offset - barW / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${entry.color}" rx="2"/>`;
      s += `<text x="${(cx + offset).toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="${INK}">${esc(idNum(value))}</text>`;
    });
    s += `<text x="${cx.toFixed(1)}" y="${bottom + 20}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="${MUTED}">${esc(label)}</text>`;
  });
  let legendX = 16;
  for (const entry of series) {
    s += `<rect x="${legendX}" y="${height - 46}" width="12" height="12" fill="${entry.color}" rx="2"/>`;
    s += `<text x="${legendX + 16}" y="${height - 36}" font-family="system-ui, sans-serif" font-size="12" fill="${MUTED}">${esc(entry.label)}</text>`;
    legendX += 16 + entry.label.length * 7 + 28;
  }
  s += '</svg>';
  return s;
}
