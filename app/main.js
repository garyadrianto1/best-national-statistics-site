// Statistik Indonesia — bootstrapper: hash routing, nothing else.
// Reads the hash, renders the matching page into #app, updates the nav,
// sets the document title, scrolls to top and moves focus to the heading.

import { PAGES, mountCharts, wirePage } from './views.js';

const app = document.getElementById('app');
const navLinks = Array.from(document.querySelectorAll('.site-nav a'));

function currentRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const key = raw.split('/')[0];
  return Object.prototype.hasOwnProperty.call(PAGES, key) ? key : '';
}

function render() {
  const route = currentRoute();
  const page = PAGES[route];
  app.innerHTML = page.render();
  document.title = page.title;
  navLinks.forEach((link) => {
    if (link.dataset.route === route) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
  mountCharts(app);
  wirePage(route, app);
  window.scrollTo(0, 0);
  const heading = app.querySelector('h1');
  if (heading) heading.focus({ preventScroll: true });
  // On a phone the nav row scrolls horizontally; bring the active item
  // into view on load. On desktop the row does not scroll, so this is a
  // no-op. block: 'nearest' keeps the page itself from scrolling.
  const active = navLinks.find((link) => link.classList.contains('active'));
  if (active) active.scrollIntoView({ inline: 'center', block: 'nearest' });
}

window.addEventListener('hashchange', render);

let resizeTimer = 0;
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => mountCharts(app), 150);
});

render();
