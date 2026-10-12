// ---------- Trending slider buttons ----------
document.querySelectorAll('.slide-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const s = document.getElementById('trendSlider');
    s.scrollBy({ left: btn.dataset.dir * 360, behavior: 'smooth' });
  });
});

// ---------- Newsletter ----------
const news = document.getElementById('newsForm');
if (news) news.addEventListener('submit', e => {
  e.preventDefault(); alert('Thanks! You have subscribed.'); news.reset();
});

// ---------- Auth (demo, localStorage) ----------
const users = () => JSON.parse(localStorage.getItem('gv_users') || '[]');
const showErr = m => { const e = document.getElementById('err'); e.textContent = m; e.classList.remove('d-none'); };

const su = document.getElementById('signupForm');
if (su) su.addEventListener('submit', e => {
  e.preventDefault();
  const email = su.email.value.trim().toLowerCase();
  if (su.pass.value !== su.pass2.value) return showErr('Passwords do not match.');
  if (users().some(u => u.email === email)) return showErr('This email is already registered.');
  localStorage.setItem('gv_users', JSON.stringify([...users(), { name: su.name.value, email, pass: su.pass.value }]));
  alert('Account created! Please sign in.');
  location.href = 'signin.html' + location.search;
});

const si = document.getElementById('signinForm');
if (si) si.addEventListener('submit', e => {
  e.preventDefault();
  const u = users().find(u => u.email === si.email.value.trim().toLowerCase() && u.pass === si.pass.value);
  if (!u) return showErr('Incorrect email or password.');
  localStorage.setItem('gv_current', u.name);
  localStorage.setItem('gv_email', u.email);
  location.href = new URLSearchParams(location.search).get('next') || 'play.html';
});

// ---------- Games page with filters ----------
const GAME_IMG = i => `img/img${i + 3}.avif`;
const grid = document.getElementById('gameGrid');
if (grid) {
  const games = [
    ['Neon Strike', 'action', 1], ['Turbo Rush', 'racing', 2], ['Mind Maze', 'puzzle', 3],
    ['Lost Temple', 'adventure', 4], ['Star Voyager', 'scifi', 5], ['Dark Hollow', 'horror', 6],
    ['Goal Rush', 'sports', 7], ['Candy Quest', 'kids', 8], ['Clash Arena', 'strategy', 9]
  ];
  const cats = ['all', 'action', 'racing', 'puzzle', 'adventure', 'scifi', 'horror', 'sports', 'kids', 'strategy'];
  const params = new URLSearchParams(location.search);
  let current = cats.includes(params.get('cat')) ? params.get('cat') : 'all';

  const render = () => {
    document.getElementById('catTitle').textContent = current === 'all' ? 'Games' : current.toUpperCase() + ' Games';
    document.getElementById('filters').innerHTML = cats.map(c =>
      `<button class="btn btn-sm ${c === current ? 'btn-accent' : 'btn-outline-glow'}" data-c="${c}">${c.toUpperCase()}</button>`).join('');
    const list = games.filter(g => current === 'all' || g[1] === current);
    grid.innerHTML = list.length ? list.map(g => `
      <div class="col-6 col-md-3 col-lg-2"><a href="play.html?g=${g[2]}" class="game-card" style="display:block">
        <img src="${GAME_IMG(g[2])}" alt="${g[0]}" loading="lazy" onerror="this.onerror=null;this.src='images/trending/game${g[2]}.svg'"><div class="play-ov"><i class="bi bi-play-circle-fill"></i></div>
        <div class="info">${g[0]}<br><span>${g[1]}</span></div></a></div>`).join('')
      : '<p class="text-secondary">There are no games in this category yet.</p>';
    document.querySelectorAll('#filters button').forEach(b => b.onclick = () => { current = b.dataset.c; render(); });
  };
  render();
}
