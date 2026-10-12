GameVerse - Gaming Website
==========================
To open: double-click index.html (internet is only needed for Bootstrap, icons and fonts - all photos are local in img/).

Pages
- index.html         Home (hero slider, trending slider, categories, originals, premium, footer)
- games.html         All games with category filter (?cat=action etc.)
- play.html          Free game: Neon Snake
- premium.html       Premium store + checkout (UPI / Card)
- premium-play.html  Premium games (unlocked only after purchase)
- signup.html / signin.html   Accounts (demo only, saved in browser localStorage)

Premium games: Space Raider (Rs 199), Brick Blaster (Rs 149), Memory Master (Rs 99)
To change prices or games, edit the PREMIUM array at the top of js/premium.js.

IMPORTANT - Payments
The checkout is a DEMO: no real money is charged. For real payments you need a gateway
(Razorpay / Stripe) and a server - see the "DEMO" comment in js/premium.js.
"Owned" games are only saved in the browser, so anyone can unlock them with DevTools.
For a real business, ownership must be verified on a server.

Images
- All photos are local files in the img/ folder (img1..img19.avif). To change a photo, replace the file or change the src path.
- If a photo fails, the local SVG from the images/ folder is shown automatically.

New features
- Footer pages: support, help, account, contact, privacy, terms, about, careers, press, partners (.html).
- Animated header with full navigation on every page (css/extras.css).
- 'New Game Every Week' side panel (left side) - changes automatically every Monday. Edit the WEEKLY list in js/extras.js.
- Chatbot (bottom-right) - rule-based FAQ bot, no server needed. Edit the FAQ list in js/extras.js.
- Favicon / logo: images/logo/ (favicon.svg, favicon.ico, apple-touch-icon.png, logo.svg, logo.png)
- Colors: see :root at the top of css/style.css.
