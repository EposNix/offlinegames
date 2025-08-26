import './ui.css';
import { registry } from './registry.js';
import { initRouter } from './router.js';
import { services } from './services.js';

const app = document.getElementById('app');

function tile(game) {
  const a = document.createElement('a');
  a.href = `#/play/${game.id}`;
  a.className = 'tile';
  const img = document.createElement('img');
  img.src = game.thumbnailUrl;
  const span = document.createElement('span');
  span.textContent = game.name;
  a.append(img, span);
  return a;
}

function getRecent() {
  return registry
    .map((g) => ({ game: g, t: services.storage.get(`${g.id}:last`, 0) }))
    .filter((g) => g.t)
    .sort((a, b) => b.t - a.t)
    .slice(0, 5)
    .map((g) => g.game);
}

function renderMenu() {
  app.innerHTML = '';
  const search = document.createElement('input');
  search.placeholder = 'Search';
  search.className = 'search';
  app.appendChild(search);

  const recent = getRecent();
  if (recent.length) {
    const strip = document.createElement('div');
    strip.className = 'recent-strip';
    recent.forEach((g) => strip.appendChild(tile(g)));
    app.appendChild(strip);
  }

  const grid = document.createElement('div');
  grid.className = 'menu-grid';
  app.appendChild(grid);

  function refresh() {
    const term = search.value.toLowerCase();
    grid.innerHTML = '';
    registry
      .filter(
        (g) =>
          g.name.toLowerCase().includes(term) ||
          g.tags.some((t) => t.toLowerCase().includes(term))
      )
      .forEach((g) => grid.appendChild(tile(g)));
  }
  search.addEventListener('input', refresh);
  refresh();
}

async function renderPlay(id) {
  app.innerHTML = '';
  const back = document.createElement('button');
  back.textContent = 'Back to menu';
  back.className = 'back';
  back.onclick = () => (location.hash = '#/menu');
  app.appendChild(back);

  const mount = document.createElement('div');
  app.appendChild(mount);

  const game = registry.find((g) => g.id === id);
  if (!game) {
    mount.textContent = 'Game not found';
    return;
  }

  if (game.sandbox === 'module') {
    const mod = await game.load();
    const instance = mod.createGame(mount, services);
    instance.start();
    const handler = () => {
      if (location.hash !== `#/play/${id}`) {
        instance.stop();
        window.removeEventListener('hashchange', handler);
      }
    };
    window.addEventListener('hashchange', handler);
  } else {
    const { iframeUrl } = game.load();
    const iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    iframe.sandbox = 'allow-scripts allow-pointer-lock';
    iframe.style.width = '100%';
    iframe.style.height = '80vh';
    mount.appendChild(iframe);
    iframe.addEventListener('load', () => {
      iframe.contentWindow.postMessage({ type: 'resume' }, '*');
    });
    const handler = () => {
      if (location.hash !== `#/play/${id}`) {
        iframe.contentWindow.postMessage({ type: 'pause' }, '*');
        window.removeEventListener('hashchange', handler);
      }
    };
    window.addEventListener('hashchange', handler);
  }
  services.storage.set(`${id}:last`, Date.now());
}

initRouter({ menu: renderMenu, play: renderPlay });
