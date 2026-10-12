// Neon Snake game
(function () {
  const canvas = document.getElementById('game');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 20, cells = canvas.width / size;
  let snake, dir, nextDir, food, score, timer, paused = false, running = false;
  let best = +localStorage.getItem('gv_best') || 0;
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  bestEl.textContent = best;

  function placeFood() {
    do {
      food = { x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells) };
    } while (snake.some(s => s.x === food.x && s.y === food.y));
  }

  function start() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = { x: 1, y: 0 }; nextDir = dir; score = 0; paused = false; running = true;
    scoreEl.textContent = 0;
    placeFood();
    clearInterval(timer);
    timer = setInterval(tick, 110);
  }

  function gameOver() {
    clearInterval(timer); running = false;
    if (score > best) { best = score; localStorage.setItem('gv_best', best); bestEl.textContent = best; }
    draw();
    ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00e676'; ctx.font = 'bold 32px Poppins, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.font = '16px Poppins, sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 32);
  }

  function tick() {
    if (paused) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells ||
        snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10; scoreEl.textContent = score; placeFood();
    } else snake.pop();
    draw();
  }

  function draw() {
    ctx.fillStyle = '#050810'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#ff4081'; ctx.fillStyle = '#ff4081';
    ctx.beginPath(); ctx.arc(food.x * size + size / 2, food.y * size + size / 2, size / 2 - 2, 0, 7); ctx.fill();
    ctx.shadowColor = '#00e676';
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#00b8ff' : '#00e676';
      ctx.fillRect(s.x * size + 1, s.y * size + 1, size - 2, size - 2);
    });
    ctx.shadowBlur = 0;
  }

  function setDir(d) {
    const map = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[d];
    if (!map) return;
    if (map[0] === -dir.x && map[1] === -dir.y) return; // no reverse
    nextDir = { x: map[0], y: map[1] };
  }

  document.addEventListener('keydown', e => {
    const k = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down',
                ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' }[e.key];
    if (k && running) { e.preventDefault(); setDir(k); }
    if (e.key === ' ') { e.preventDefault(); if (running) paused = !paused; }
  });
  document.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => running && setDir(b.dataset.d)));
  document.getElementById('startBtn').addEventListener('click', start);
  document.getElementById('pauseBtn').addEventListener('click', () => { if (running) paused = !paused; });

  // initial screen
  snake = [{ x: 10, y: 10 }]; food = { x: 5, y: 5 }; draw();
  ctx.fillStyle = '#fff'; ctx.font = '18px Poppins, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Press Start!', canvas.width / 2, canvas.height / 2);
})();
