// ================= PREMIUM DATA & STORE =================
const uImg = f => `img/${f}.avif`;
const PREMIUM = [
  { id: 'p1', name: 'Space Raider', type: 'Shooter', price: 199, photo: 'img17', desc: 'Blast the enemy ships and set the highest score in 3 lives.' },
  { id: 'p2', name: 'Brick Blaster', type: 'Arcade', price: 149, photo: 'img2', desc: 'Smash all the bricks with the ball. The paddle is in your hands.' },
  { id: 'p3', name: 'Memory Master', type: 'Puzzle', price: 99, photo: 'img14', desc: 'Match the pairs and win in the fewest moves.' }
];

const gvUser = () => localStorage.getItem('gv_email');
const ownedKey = () => 'gv_owned_' + gvUser();
const getOwned = () => { try { return JSON.parse(localStorage.getItem(ownedKey()) || '[]'); } catch (e) { return []; } };
const isOwned = id => !!gvUser() && getOwned().includes(id);
const addOwned = id => { const o = getOwned(); if (!o.includes(id)) { o.push(id); localStorage.setItem(ownedKey(), JSON.stringify(o)); } };

function premiumCards(container) {
  if (!container) return;
  container.innerHTML = PREMIUM.map(p => {
    const owned = isOwned(p.id);
    return `<div class="col-12 col-sm-6 col-lg-4"><div class="prem-card">
      <span class="prem-badge"><i class="bi bi-gem"></i> PREMIUM</span>
      ${owned ? '<span class="owned-badge"><i class="bi bi-check-circle-fill"></i> OWNED</span>' : ''}
      <div class="prem-img"><img src="${uImg(p.photo)}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='images/trending/game${PREMIUM.indexOf(p) + 1}.svg'">
      ${owned ? '' : '<div class="lock-ov"><i class="bi bi-lock-fill"></i></div>'}</div>
      <div class="p-3">
        <div class="d-flex justify-content-between"><h5 class="fw-bold mb-0">${p.name}</h5><small class="text-secondary">${p.type}</small></div>
        <p class="small text-secondary my-2">${p.desc}</p>
        <div class="d-flex justify-content-between align-items-center">
          <b class="fs-5 gradient-text">${owned ? 'Purchased' : '₹' + p.price}</b>
          ${owned
            ? `<a href="premium-play.html?g=${p.id}" class="btn btn-accent btn-sm"><i class="bi bi-play-fill"></i> Play Now</a>`
            : `<a href="premium.html?buy=${p.id}" data-buy="${p.id}" class="btn btn-accent btn-sm"><i class="bi bi-cart-fill"></i> Buy &amp; Play</a>`}
        </div></div></div></div>`;
  }).join('');
}

// Index preview section
premiumCards(document.getElementById('premiumPreview'));

// ================= PREMIUM STORE PAGE (checkout) =================
const store = document.getElementById('premiumGrid');
if (store) {
  premiumCards(store);
  const modalEl = document.getElementById('buyModal');
  const modal = new bootstrap.Modal(modalEl);
  let current = null;

  const openBuy = id => {
    if (!gvUser()) {
      alert('Please sign in first, then buy the game.');
      location.href = 'signin.html?next=' + encodeURIComponent('premium.html?buy=' + id);
      return;
    }
    current = PREMIUM.find(p => p.id === id);
    if (!current || isOwned(id)) return;
    document.getElementById('buyName').textContent = current.name;
    document.getElementById('buyPrice').textContent = '₹' + current.price;
    document.getElementById('payBtnPrice').textContent = '₹' + current.price;
    document.getElementById('payErr').classList.add('d-none');
    modal.show();
  };

  store.addEventListener('click', e => {
    const b = e.target.closest('[data-buy]');
    if (b) { e.preventDefault(); openBuy(b.dataset.buy); }
  });
  const q = new URLSearchParams(location.search).get('buy');
  if (q) openBuy(q);

  // payment method switch
  document.querySelectorAll('input[name=pm]').forEach(r => r.addEventListener('change', () => {
    document.getElementById('upiBox').classList.toggle('d-none', r.value !== 'upi' || !r.checked);
    document.getElementById('cardBox').classList.toggle('d-none', r.value !== 'card' || !r.checked);
  }));

  document.getElementById('payForm').addEventListener('submit', e => {
    e.preventDefault();
    const err = document.getElementById('payErr');
    const method = document.querySelector('input[name=pm]:checked').value;
    let ok = true;
    if (method === 'upi') ok = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(document.getElementById('upiId').value.trim());
    else {
      const num = document.getElementById('cardNo').value.replace(/\s/g, '');
      ok = /^\d{12,19}$/.test(num) && /^(0[1-9]|1[0-2])\/\d{2}$/.test(document.getElementById('cardExp').value.trim()) && /^\d{3,4}$/.test(document.getElementById('cardCvv').value.trim());
    }
    if (!ok) { err.textContent = 'Invalid payment details. Please check and try again.'; err.classList.remove('d-none'); return; }
    err.classList.add('d-none');
    const btn = document.getElementById('payBtn');
    btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing...';
    // DEMO: the real payment gateway (Razorpay/Stripe) code goes here.
    setTimeout(() => {
      addOwned(current.id);          // card/UPI details are never saved
      e.target.reset();
      btn.disabled = false; btn.innerHTML = 'Pay <span id="payBtnPrice"></span>';
      modal.hide();
      premiumCards(store);
      document.getElementById('okMsg').innerHTML = `<div class="alert alert-success">🎉 <b>${current.name}</b> is now yours! <a href="premium-play.html?g=${current.id}" class="alert-link">Play now</a></div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1600);
  });
}

// ================= PREMIUM GAMES =================
function spaceRaider(canvas, setScore) {
  const ctx = canvas.getContext('2d'); canvas.width = 400; canvas.height = 520;
  let ship, bullets, enemies, stars, score, lives, over, frame, raf, mouseX = null, keys = {};
  const reset = () => { ship = { x: 200, y: 480 }; bullets = []; enemies = []; score = 0; lives = 3; over = false; frame = 0; setScore('Score: 0 | Lives: 3');
    stars = Array.from({ length: 40 }, () => ({ x: Math.random() * 400, y: Math.random() * 520, s: Math.random() * 2 + .5 })); };
  const loop = () => {
    frame++;
    if (!over) {
      if (keys.ArrowLeft || keys.a) ship.x -= 5; if (keys.ArrowRight || keys.d) ship.x += 5;
      if (mouseX !== null) ship.x += (mouseX - ship.x) * .25;
      ship.x = Math.max(16, Math.min(384, ship.x));
      if (frame % 14 === 0) bullets.push({ x: ship.x, y: ship.y - 18 });
      if (frame % Math.max(18, 50 - Math.floor(score / 80)) === 0) enemies.push({ x: 20 + Math.random() * 360, y: -20, v: 1.2 + Math.random() * 1.2 + score / 600 });
      bullets.forEach(b => b.y -= 8); bullets = bullets.filter(b => b.y > -10);
      enemies.forEach(en => en.y += en.v);
      bullets.forEach(b => enemies.forEach(en => { if (!en.dead && !b.dead && Math.abs(b.x - en.x) < 18 && Math.abs(b.y - en.y) < 18) { en.dead = b.dead = true; score += 10; } }));
      enemies.forEach(en => { if (!en.dead && Math.abs(en.x - ship.x) < 22 && Math.abs(en.y - ship.y) < 22) { en.dead = true; lives--; } else if (!en.dead && en.y > 530) { en.dead = true; lives--; } });
      enemies = enemies.filter(e => !e.dead); bullets = bullets.filter(b => !b.dead);
      setScore(`Score: ${score} | Lives: ${Math.max(lives, 0)}`);
      if (lives <= 0) over = true;
    }
    ctx.fillStyle = '#050810'; ctx.fillRect(0, 0, 400, 520);
    ctx.fillStyle = '#fff'; stars.forEach(s => { s.y = (s.y + s.s) % 520; ctx.fillRect(s.x, s.y, s.s, s.s); });
    ctx.shadowBlur = 12; ctx.shadowColor = '#00e676'; ctx.fillStyle = '#00e676';
    ctx.beginPath(); ctx.moveTo(ship.x, ship.y - 18); ctx.lineTo(ship.x - 16, ship.y + 14); ctx.lineTo(ship.x + 16, ship.y + 14); ctx.closePath(); ctx.fill();
    ctx.shadowColor = '#00b8ff'; ctx.fillStyle = '#00b8ff'; bullets.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 12));
    ctx.shadowColor = '#ff4081'; ctx.fillStyle = '#ff4081'; enemies.forEach(en => { ctx.beginPath(); ctx.arc(en.x, en.y, 14, 0, 7); ctx.fill(); });
    ctx.shadowBlur = 0;
    if (over) { ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(0, 0, 400, 520); ctx.fillStyle = '#00e676'; ctx.font = 'bold 32px Poppins,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', 200, 250); ctx.font = '16px Poppins,sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText('Score: ' + score + '  —  Press Restart', 200, 285); }
    raf = requestAnimationFrame(loop);
  };
  const kd = e => { keys[e.key] = true; if (e.key.startsWith('Arrow')) e.preventDefault(); }, ku = e => keys[e.key] = false;
  document.addEventListener('keydown', kd); document.addEventListener('keyup', ku);
  const mv = e => { const r = canvas.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; mouseX = (t.clientX - r.left) * (400 / r.width); };
  canvas.addEventListener('mousemove', mv); canvas.addEventListener('touchmove', e => { e.preventDefault(); mv(e); }, { passive: false });
  reset(); loop();
  return { restart: reset };
}

function brickBlaster(canvas, setScore) {
  const ctx = canvas.getContext('2d'); canvas.width = 400; canvas.height = 500;
  let paddle, ball, bricks, score, lives, launched, over, won, keys = {};
  const reset = () => {
    paddle = { x: 165, w: 70 }; ball = { x: 200, y: 460, dx: 3, dy: -4 }; launched = false; over = won = false; score = 0; lives = 3;
    bricks = []; const cols = ['#ff4081', '#ff9100', '#ffd600', '#00e676', '#00b8ff'];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) bricks.push({ x: 12 + c * 47, y: 40 + r * 24, w: 42, h: 18, color: cols[r], alive: true });
    setScore('Score: 0 | Lives: 3');
  };
  const loop = () => {
    if (!over && !won) {
      if (keys.ArrowLeft || keys.a) paddle.x -= 7; if (keys.ArrowRight || keys.d) paddle.x += 7;
      paddle.x = Math.max(0, Math.min(400 - paddle.w, paddle.x));
      if (!launched) { ball.x = paddle.x + paddle.w / 2; ball.y = 460; }
      else {
        ball.x += ball.dx; ball.y += ball.dy;
        if (ball.x < 6 || ball.x > 394) ball.dx *= -1;
        if (ball.y < 6) ball.dy *= -1;
        if (ball.dy > 0 && ball.y > 462 && ball.y < 478 && ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
          ball.dy = -Math.abs(ball.dy); ball.dx = ((ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2)) * 5;
        }
        bricks.forEach(b => { if (b.alive && ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) { b.alive = false; ball.dy *= -1; score += 10; } });
        if (ball.y > 510) { lives--; launched = false; if (lives <= 0) over = true; }
        if (bricks.every(b => !b.alive)) won = true;
        setScore(`Score: ${score} | Lives: ${Math.max(lives, 0)}`);
      }
    }
    ctx.fillStyle = '#050810'; ctx.fillRect(0, 0, 400, 500);
    bricks.forEach(b => { if (b.alive) { ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h); } });
    ctx.shadowBlur = 12; ctx.shadowColor = '#00e676'; ctx.fillStyle = '#00e676'; ctx.fillRect(paddle.x, 472, paddle.w, 10);
    ctx.shadowColor = '#00b8ff'; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ball.x, ball.y, 6, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    if (!launched && !over && !won) { ctx.fillStyle = '#fff'; ctx.font = '15px Poppins,sans-serif'; ctx.fillText('Click / Space to launch the ball', 200, 300); }
    if (over || won) { ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(0, 0, 400, 500); ctx.fillStyle = '#00e676'; ctx.font = 'bold 32px Poppins,sans-serif';
      ctx.fillText(won ? 'YOU WIN! 🎉' : 'GAME OVER', 200, 240); ctx.font = '16px Poppins,sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText('Score: ' + score + '  —  Press Restart', 200, 275); }
    requestAnimationFrame(loop);
  };
  document.addEventListener('keydown', e => { keys[e.key] = true; if (e.key === ' ') { e.preventDefault(); launched = true; } if (e.key.startsWith('Arrow')) e.preventDefault(); });
  document.addEventListener('keyup', e => keys[e.key] = false);
  const mv = e => { const r = canvas.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; paddle.x = (t.clientX - r.left) * (400 / r.width) - paddle.w / 2; };
  canvas.addEventListener('mousemove', mv); canvas.addEventListener('touchmove', e => { e.preventDefault(); mv(e); }, { passive: false });
  canvas.addEventListener('click', () => launched = true);
  reset(); loop();
  return { restart: reset };
}

function memoryMaster(box, setScore) {
  const emojis = ['🎮', '🚀', '👾', '🏆', '⚡', '🎯', '🧩', '🔥'];
  let first = null, lock = false, moves = 0, matched = 0;
  const build = () => {
    const deck = [...emojis, ...emojis].sort(() => Math.random() - .5);
    first = null; lock = false; moves = 0; matched = 0; setScore('Moves: 0');
    box.innerHTML = deck.map((e, i) => `<button class="mem-card" data-i="${i}" data-e="${e}"><span class="front">?</span><span class="back">${e}</span></button>`).join('');
  };
  box.addEventListener('click', ev => {
    const card = ev.target.closest('.mem-card');
    if (!card || lock || card.classList.contains('flip') || card.classList.contains('done')) return;
    card.classList.add('flip');
    if (!first) { first = card; return; }
    moves++; setScore('Moves: ' + moves);
    if (first.dataset.e === card.dataset.e) {
      first.classList.add('done'); card.classList.add('done'); first = null; matched++;
      if (matched === 8) setTimeout(() => setScore(`🎉 You won! Total moves: ${moves}`), 300);
    } else {
      lock = true; const a = first; first = null;
      setTimeout(() => { a.classList.remove('flip'); card.classList.remove('flip'); lock = false; }, 800);
    }
  });
  build();
  return { restart: build };
}

// ================= PREMIUM PLAY PAGE =================
const pPlay = document.getElementById('pcanvas');
if (pPlay) {
  const id = new URLSearchParams(location.search).get('g');
  const game = PREMIUM.find(p => p.id === id);
  if (!game) location.replace('premium.html');
  else if (!isOwned(id)) { alert('This is a premium game. Please buy it first.'); location.replace('premium.html?buy=' + id); }
  else {
    document.getElementById('pTitle').textContent = game.name;
    document.getElementById('pDesc').textContent = game.desc;
    const setScore = t => document.getElementById('pScore').textContent = t;
    let inst;
    if (id === 'p3') { pPlay.classList.add('d-none'); const g = document.getElementById('pgrid'); g.classList.remove('d-none'); inst = memoryMaster(g, setScore); }
    else inst = (id === 'p1' ? spaceRaider : brickBlaster)(pPlay, setScore);
    document.getElementById('pRestart').addEventListener('click', () => inst.restart());
  }
}
