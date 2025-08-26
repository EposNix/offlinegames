export function initRouter(routes) {
  function resolve() {
    const hash = location.hash.slice(1) || '/menu';
    const parts = hash.split('/');
    if (parts[1] === 'play' && parts[2]) {
      routes.play(parts[2]);
    } else {
      routes.menu();
    }
  }
  window.addEventListener('hashchange', resolve);
  resolve();
}
