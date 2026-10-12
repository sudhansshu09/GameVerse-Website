// =============== GameVerse extras: weekly game side panel + chatbot + nav scroll ===============
(function () {
  const $ = (s, r = document) => r.querySelector(s);

  // ---------- Header: shrink on scroll ----------
  const nav = $('.gv-nav');
  if (nav) addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 30), { passive: true });

  // ---------- Weekly game (changes automatically every Monday) ----------
  // To add games: add a line here. One game per week, in order.
  const WEEKLY = [
    { name: 'Neon Strike',  cat: 'Action',    img: 'img/img4.avif',  id: 1 },
    { name: 'Turbo Rush',   cat: 'Racing',    img: 'img/img5.avif',  id: 2 },
    { name: 'Mind Maze',    cat: 'Puzzle',    img: 'img/img6.avif',  id: 3 },
    { name: 'Lost Temple',  cat: 'Adventure', img: 'img/img7.avif',  id: 4 },
    { name: 'Star Voyager', cat: 'Sci-Fi',    img: 'img/img8.avif',  id: 5 },
    { name: 'Dark Hollow',  cat: 'Horror',    img: 'img/img9.avif',  id: 6 },
    { name: 'Goal Rush',    cat: 'Sports',    img: 'img/img10.avif', id: 7 },
    { name: 'Candy Quest',  cat: 'Kids',      img: 'img/img11.avif', id: 8 },
    { name: 'Clash Arena',  cat: 'Strategy',  img: 'img/img12.avif', id: 9 }
  ];
  const WEEK_MS = 7 * 864e5;
  const EPOCH = Date.UTC(2024, 0, 1);                 // a Monday
  const weekNo = () => Math.floor((Date.now() - EPOCH) / WEEK_MS);
  const nextDrop = () => EPOCH + (weekNo() + 1) * WEEK_MS;
  const thisWeek = () => WEEKLY[weekNo() % WEEKLY.length];

  const g = thisWeek();
  const week = document.createElement('aside');
  week.className = 'gv-week';
  week.innerHTML = `
    <div class="gv-week-card">
      <button class="gv-week-close" aria-label="Close"><i class="bi bi-x"></i></button>
      <div class="gv-week-img" style="background-image:url(${g.img})"><span class="gv-week-badge">🔥 NEW THIS WEEK</span></div>
      <div class="gv-week-body">
        <h6>${g.name}</h6><small>${g.cat} • A new game drops every week</small>
        <div class="gv-count"><div id="gvD">0<span>DAYS</span></div><div id="gvH">0<span>HRS</span></div><div id="gvM">0<span>MIN</span></div><div id="gvS">0<span>SEC</span></div></div>
        <small class="d-block mt-2">Next game unlocks in…</small>
        <a href="play.html?g=${g.id}" class="btn btn-accent btn-sm"><i class="bi bi-play-fill"></i> Play Now</a>
      </div>
    </div>
    <button class="gv-week-tab"><i class="bi bi-stars"></i> NEW GAME EVERY WEEK</button>`;
  document.body.appendChild(week);
  const tick = () => {
    let d = Math.max(0, nextDrop() - Date.now()) / 1000;
    const set = (id, v) => { const e = $('#' + id); e.firstChild.nodeValue = String(v).padStart(2, '0'); };
    set('gvD', Math.floor(d / 86400)); set('gvH', Math.floor(d % 86400 / 3600));
    set('gvM', Math.floor(d % 3600 / 60)); set('gvS', Math.floor(d % 60));
  };
  tick(); setInterval(tick, 1000);
  const toggleWeek = o => { week.classList.toggle('open', o); try { sessionStorage.setItem('gv_week_open', o ? '1' : '0'); } catch (e) {} };
  $('.gv-week-tab', week).onclick = () => toggleWeek(!week.classList.contains('open'));
  $('.gv-week-close', week).onclick = () => toggleWeek(false);
  // auto-peek once per session so visitors notice it
  let seen = null; try { seen = sessionStorage.getItem('gv_week_open'); } catch (e) {}
  if (seen === null) setTimeout(() => { toggleWeek(true); setTimeout(() => toggleWeek(false), 5000); }, 2500);
  else if (seen === '1') week.classList.add('open');

  // ---------- Chatbot (rule based, works offline) ----------
  const GAMES = [['neon strike', 1, 'Action'], ['turbo rush', 2, 'Racing'], ['mind maze', 3, 'Puzzle'], ['lost temple', 4, 'Adventure'],
    ['star voyager', 5, 'Sci-Fi'], ['dark hollow', 6, 'Horror'], ['goal rush', 7, 'Sports'], ['candy quest', 8, 'Kids'], ['clash arena', 9, 'Strategy']];
  const FAQ = [
    { k: ['hi', 'hello', 'hey', 'namaste', 'hola'], a: () => 'Hi! 👋 I am the GameVerse assistant. Ask me about games, premium, sign up or this week\'s new game.' },
    { k: ['new', 'week', 'latest', 'naya', 'release'], a: () => `🔥 This week's new game is <b>${g.name}</b> (${g.cat}). <a href="play.html?g=${g.id}">Play now</a>. A new game arrives every week!` },
    { k: ['free', 'play', 'snake', 'start'], a: () => 'You can play <a href="play.html">Neon Snake</a> for free, right now. More games are in <a href="games.html">All Games</a>.' },
    { k: ['premium', 'buy', 'price', 'cost', 'paid', 'purchase'], a: () => 'Premium games: Space Raider (₹199), Brick Blaster (₹149) and Memory Master (₹99). <a href="premium.html">See Premium</a>. (Checkout is a demo.)' },
    { k: ['pay', 'upi', 'card', 'payment'], a: () => 'You can pay by UPI or card on the <a href="premium.html">Premium</a> page. Please sign in first.' },
    { k: ['signup', 'sign up', 'register', 'account', 'join'], a: () => 'Create a free account here: <a href="signup.html">Sign Up</a>. Already registered? <a href="signin.html">Sign In</a>.' },
    { k: ['signin', 'sign in', 'login', 'log in', 'password'], a: () => 'Go to <a href="signin.html">Sign In</a> with your email and password.' },
    { k: ['category', 'categories', 'genre', 'type'], a: () => 'Categories: Action, Racing, Puzzle, Adventure, Sci-Fi, Horror, Sports, Kids and Strategy. Open <a href="games.html">All Games</a> and use the filters.' },
    { k: ['device', 'mobile', 'phone', 'laptop', 'tv', 'tablet', 'console'], a: () => 'GameVerse works on mobile, tablet, laptop and Smart TV — just open it in your browser.' },
    { k: ['cancel', 'refund'], a: () => 'No long-term contracts. You can cancel anytime.' },
    { k: ['contact', 'help', 'support', 'email'], a: () => 'Please use the Help Center / Contact Us links in the footer. I will try to answer here first!' },
    { k: ['thanks', 'thank', 'shukriya', 'dhanyavad'], a: () => 'You are welcome! 🎮 Happy gaming!' },
    { k: ['bye', 'goodbye'], a: () => 'Bye! See you in the game 👋' }
  ];
  const norm = s => s.toLowerCase().replace(/[^a-z0-9₹ ]/g, ' ');
  const reply = text => {
    const t = ' ' + norm(text) + ' ';
    const gm = GAMES.find(x => t.includes(x[0]));
    if (gm) return `<b>${gm[0].replace(/\b\w/g, c => c.toUpperCase())}</b> is a ${gm[2]} game. <a href="play.html?g=${gm[1]}">Play it</a>.`;
    const cat = GAMES.find(x => t.includes(' ' + x[2].toLowerCase().replace('-', '') + ' ') || t.includes(' ' + x[2].toLowerCase() + ' '));
    if (cat) return `Looking for ${cat[2]} games? <a href="games.html?cat=${cat[2].toLowerCase().replace('-', '')}">Open ${cat[2]} games</a>.`;
    let best = null, score = 0;
    FAQ.forEach(f => { const s = f.k.filter(k => t.includes(' ' + k + ' ') || (k.length > 3 && t.includes(k))).length; if (s > score) { score = s; best = f; } });
    return best ? best.a() : 'Sorry, I did not get that 🤔. Try: <i>new game</i>, <i>premium price</i>, <i>sign up</i>, or <i>categories</i>.';
  };

  const fab = document.createElement('button');
  fab.className = 'gv-chat-fab'; fab.setAttribute('aria-label', 'Open chat');
  fab.innerHTML = '<i class="bi bi-chat-dots-fill"></i><span class="dot"></span>';
  const box = document.createElement('div');
  box.className = 'gv-chat';
  box.innerHTML = `
    <div class="gv-chat-head"><div class="av"><i class="bi bi-robot"></i></div><div><b>GameVerse Bot</b><small>● Online</small></div><button aria-label="Close"><i class="bi bi-x-lg"></i></button></div>
    <div class="gv-msgs"></div>
    <div class="gv-chips"></div>
    <form><input type="text" placeholder="Type your message…" autocomplete="off"><button><i class="bi bi-send-fill"></i></button></form>`;
  document.body.append(fab, box);
  const msgs = $('.gv-msgs', box), input = $('input', box), chips = $('.gv-chips', box);
  const add = (html, who) => { const d = document.createElement('div'); d.className = 'gv-msg ' + who; d.innerHTML = html; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; };
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ask = text => {
    add(esc(text), 'user');
    const t = add('<div class="gv-typing"><i></i><i></i><i></i></div>', 'bot'); t.style.padding = '0';
    setTimeout(() => { t.remove(); add(reply(text), 'bot'); }, 600);
  };
  ['New game this week', 'Free games', 'Premium prices', 'Sign up', 'Categories'].forEach(c => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.onclick = () => ask(c); chips.appendChild(b);
  });
  let greeted = false;
  const toggleChat = o => {
    box.classList.toggle('open', o);
    const dot = $('.dot', fab); if (dot && o) dot.remove();
    if (o && !greeted) { greeted = true; add('Hi! 👋 I am the GameVerse assistant. How can I help you today?', 'bot'); }
    if (o) setTimeout(() => input.focus(), 350);
  };
  fab.onclick = () => toggleChat(!box.classList.contains('open'));
  $('.gv-chat-head button', box).onclick = () => toggleChat(false);
  $('form', box).onsubmit = e => { e.preventDefault(); const v = input.value.trim(); if (v) { input.value = ''; ask(v); } };
})();

// =============== Info pages: contact form, help search, account page ===============
(function () {
  const $ = s => document.querySelector(s);
  const cf = $('#contactForm');
  if (cf) cf.addEventListener('submit', e => { e.preventDefault(); $('#contactOk').classList.remove('d-none'); cf.reset(); });
  const fs = $('#faqSearch');
  if (fs) fs.addEventListener('input', () => {
    const q = fs.value.toLowerCase();
    document.querySelectorAll('#faq .accordion-item').forEach(i => i.style.display = i.textContent.toLowerCase().includes(q) ? '' : 'none');
  });
  const out = $('#acctOut');
  if (out) {
    const email = localStorage.getItem('gv_email'), name = localStorage.getItem('gv_current');
    if (!email) {
      out.innerHTML = '<div class="text-center"><i class="bi bi-lock fs-1 text-secondary"></i><h5 class="mt-2">You are not signed in</h5><p class="text-secondary">Sign in to see your profile and purchases.</p><a href="signin.html?next=account.html" class="btn btn-accent me-2">Sign In</a><a href="signup.html" class="btn btn-outline-glow">Sign Up</a></div>';
    } else {
      let owned = []; try { owned = JSON.parse(localStorage.getItem('gv_owned_' + email) || '[]'); } catch (e) {}
      const P = { p1: 'Space Raider', p2: 'Brick Blaster', p3: 'Memory Master' };
      const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      out.innerHTML = `<div class="d-flex align-items-center gap-3 mb-4"><div class="rounded-circle d-flex align-items-center justify-content-center" style="width:64px;height:64px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#041016;font-size:1.8rem;font-weight:800">${esc((name || '?')[0].toUpperCase())}</div><div><h5 class="mb-0">${esc(name)}</h5><small class="text-secondary">${esc(email)}</small></div></div>
        <h6 class="fw-bold">My premium games</h6>
        ${owned.length ? owned.map(id => `<div class="job"><div><h5>${esc(P[id] || id)}</h5><small>Purchased</small></div><a class="btn btn-accent btn-sm" href="premium-play.html?g=${esc(id)}">Play</a></div>`).join('') : '<p class="text-secondary small">You have not bought any premium games yet. <a href="premium.html" class="text-success">Browse Premium</a></p>'}
        <button id="signOut" class="btn btn-outline-glow mt-3"><i class="bi bi-box-arrow-right"></i> Sign Out</button>`;
      $('#signOut').onclick = () => { localStorage.removeItem('gv_current'); localStorage.removeItem('gv_email'); location.href = 'index.html'; };
    }
  }
})();
