export function createGame(mount, services) {
  let count = services.storage.get('2048:count', 0);
  const board = document.createElement('div');
  board.textContent = count;
  board.style.fontSize = '48px';
  board.style.textAlign = 'center';
  board.style.padding = '20px';
  board.style.border = '1px solid #ccc';
  board.style.width = '200px';
  board.style.margin = 'auto';
  board.addEventListener('click', () => {
    count += 1;
    board.textContent = count;
    services.storage.set('2048:count', count);
  });
  return {
    start() {
      mount.appendChild(board);
    },
    pause() {},
    resume() {},
    stop() {
      mount.innerHTML = '';
    },
  };
}
