// Fans Of · TIENDA (de prueba: no se cobra nada). El regalo diario, los packs de oro y de gemas de SHOP y la oferta de broma.
// Un juego puede enganchar 'tienda' para añadir sus propias ofertas a la fila del regalo (#gift-row) cuando se pinta.
'use strict';
const eur = v => v.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: Number.isInteger(v) ? 0 : 2 });
let shopTab = 'gold', jokeT = 0;
const PILE = (n, gem) => { // dibujo de un montón de monedas o gemas, más alto cuanto más grande el pack
  let o = ''; const k = Math.min(6, n), POS = [[30, 38], [17, 38], [43, 38], [23.5, 28], [36.5, 28], [30, 18]];
  for (let i = 0; i < k; i++) { const [x, y] = POS[i];
    o += gem ? `<path transform="translate(${x - 9} ${y - 9}) scale(.9)" d="M5 3h10l4 5-9 10L1 8z" fill="#ff5fd2" stroke="#20102c" stroke-width="1.6" stroke-linejoin="round"/>` : `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="#ffcb3d" stroke="#20102c" stroke-width="1.6"/><ellipse cx="${x}" cy="${y - 1}" rx="5" ry="2.4" fill="none" stroke="#c48a10" stroke-width="1.2"/>`; }
  return `<svg viewBox="0 0 60 48" aria-hidden="true">${o}</svg>`;
};
function bonusPct(list, p) { const base = list[0].amt / list[0].eur, r = p.amt / p.eur; const b = Math.floor((r / base - 1) * 100); return b > 0 ? b : 0; }
function giftReady() { return SAVE.giftDay !== todayStr(); }
function jokeClock() { const now = new Date(), end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); const s = Math.floor((end - now) / 1000); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(v => String(v).padStart(2, '0')).join(':'); }
function buildShop() {
  if (typeof ENERGIA !== 'undefined') { ENERGIA.aseguraTab(); if (!ENERGIA.estado) ENERGIA.cargar(); }   // si aún no se había preguntado, se pregunta ahora y la pestaña sale al llegar la respuesta
  for (const b of document.querySelectorAll('[data-st]')) b.setAttribute('aria-pressed', String(b.dataset.st === shopTab));
  const nota = document.querySelector('#scr-shop .shop-note'); if (nota && MONEDAS.activo()) nota.innerHTML = '<b>Tienda de Microblizz</b> · Las gemas solo se compran con dinero real y nunca entran en el azar. El oro solo se gana jugando.';
  const g = SHOP.gift, ready = giftReady();
  $('#gift-row').innerHTML = `<div class="pack gift"><div class="pk-ic">${PILE(2)}</div><div><div class="pk-name ol">Regalo del becario</div><div class="pk-note">Gratis una vez al día: ${g.gold} de oro y ${g.gems} gemas. Se lo ha «encontrado» en la oficina de Microblizz.</div></div><button class="btn-price ol" id="btn-gift" ${ready ? '' : 'disabled'}>${ready ? 'GRATIS' : 'MAÑANA'}</button></div>`;
  $('#btn-gift').onclick = () => {
    if (!giftReady()) return;
    SAVE.giftDay = todayStr(); ECO.ganar('regalo-diario', g); missionEvent('gift', 1); saveGame(); play('crown'); updateWallets(); buildShop(); toast(`+${g.gold} de oro y +${g.gems} gemas`);
  };
  fire('tienda');
  if (shopTab === 'caos') { const l = $('#shop-list'); clearInterval(jokeT); ENERGIA.seccion(l); return; }   // la sección del caos primordial es común a todos los juegos (core/js/sistema/energia.js)
  const L = SHOP[shopTab], gem = shopTab === 'gems', dos = MONEDAS.activo();   // dos: las dos monedas (PLAN-MONEDAS.md): el oro no se vende, las gemas solo con dinero real (o con mucho oro)
  let h = '';
  if (!gem) { const J = SHOP.joke; h += `<div class="pack joke"><span class="joke-flag">¡OFERTA!</span><div class="pk-ic">${PILE(6)}</div><div><div class="pk-name ol">${J.name}</div><div class="pk-amt ol">${COIN_SVG}${fmt(J.amt)}</div><div class="pk-note">¡Oferta irrepetible! (se repite cada día) · Termina en <span class="countdown" id="joke-clock">${jokeClock()}</span></div></div><button class="btn-price ol" id="btn-joke"><small>${eur(J.was)}</small>${eur(J.eur)}</button></div>`; }
  if (dos && !gem) h += `<div class="pack cambio"><div class="pk-ic">${PILE(3)}</div><div><div class="pk-name ol">El oro no se vende</div><div class="pk-note">Se gana jugando: partidas, misiones, logros, horas extra y el pase. Con él pagas el gashapón y los niveles de tus cartas.</div></div></div>`;
  if (dos && MONEDAS.conf().cambio > 0) h += `<div class="pack cambio"><div class="pk-ic">${PILE(3)}</div><div><div class="pk-name ol">Cambiar oro por gemas</div><div class="pk-amt ol">${COIN_SVG}${fmt(MONEDAS.conf().cambio)} <span class="pk-plus">=</span> ${GEM_SVG}1</div><div class="pk-note">Jugando mucho también se llega: sale caro, pero nunca al revés. El cambio no se deshace.</div></div><button class="btn-price ol" id="btn-cambio">CAMBIAR YA</button></div>`;
  if (!(dos && !gem)) h += L.map(p => { const b = bonusPct(L, p); return `<div class="pack${gem ? ' gem' : ''}"><div class="pk-ic">${PILE(1 + L.indexOf(p) + (L.indexOf(p) > 2 ? 1 : 0), gem)}</div><div><div class="pk-name ol">${p.name}${b ? `<span class="pk-bonus">+${b} % extra</span>` : ''}</div><div class="pk-amt ol">${gem ? GEM_SVG : COIN_SVG}${fmt(p.amt)}</div>${p.note ? `<div class="pk-note">${p.note}</div>` : ''}</div><button class="btn-price ol" data-buy="${p.id}">${eur(p.eur)}</button></div>`; }).join('');
  if (dos) h += `<p class="small-print">${gem ? 'Las gemas solo se compran con dinero real (y caen poco a poco jugando). Nunca entran en el azar ni se cambian por oro: pagan el pase, los cosméticos y las ventajas. Con oro de sobra puedes cambiarlo por gemas, nunca al revés. Los «% extra» se comparan con el pack más pequeño.' : 'Juego limpio: esto no es un pay to win. El oro solo se gana jugando y es lo único que paga el gashapón y los niveles de tus cartas, así que el dinero real nunca compra tiradas del gashapón. Lo que se compra con dinero (las gemas) paga el pase, los cosméticos y las ventajas, y nunca entra en el azar. Con oro de sobra puedes cambiarlo por gemas, nunca al revés. La experiencia tampoco se vende.'}</p>`;
  else h += `<p class="small-print">${gem ? 'Las gemas sirven para el gashapón (50 gemas por tirada: unos 0,50 € con el pack pequeño) y, más adelante, para aspectos.' : 'El oro sirve para subir de nivel tus cartas. La experiencia no se vende: siempre hay que jugar.'} Los «% extra» se comparan con el pack más pequeño. Precios de prueba: en esta versión no se cobra nada.</p>`;
  h += probsHtml();
  const list = $('#shop-list'); list.innerHTML = h;
  list.querySelectorAll('[data-buy]').forEach(b => { b.onclick = () => {
    const p = L.find(x => x.id === b.dataset.buy); play('select');
    if (dos) {   // con la app de Android cobra Google y el servidor entrega (r.real); en desarrollo es de prueba y se da aquí
      MONEDAS.compraReal('¿COMPRAR?', `${p.name}<span class="big">${GEM_SVG} ${fmt(p.amt)}</span>por <b>${eur(p.eur)}</b>`, r => {
        if (!(r && r.real)) { ECO.ganar('compra', { gems: p.amt }); saveGame(); }
        play('win'); updateWallets(); toast(`+${fmt(r && r.real ? r.gemas || p.amt : p.amt)} gemas · Microblizz te da las gracias`);
      }, `${AJUSTES.id}_gemas_${p.amt}`);
      return;
    }
    confirmBox('¿COMPRAR?', `${p.name}<span class="big">${gem ? GEM_SVG : COIN_SVG} ${fmt(p.amt)}</span>por <b>${eur(p.eur)}</b><small>Versión de prueba: no se cobra nada y te lo llevas gratis.</small>`, 'COMPRAR', () => {
      ECO.ganar('compra', gem ? { gems: p.amt } : { gold: p.amt });
      saveGame(); play('win'); updateWallets(); toast(`+${fmt(p.amt)} ${gem ? 'gemas' : 'de oro'} · Microblizz te da las gracias`);
    });
  }; });
  const cb = $('#btn-cambio'); if (cb) cb.onclick = () => { play('select'); MONEDAS.ventanaCambio(() => buildShop()); };
  const jb = $('#btn-joke'); if (jb) jb.onclick = () => { play('deny'); confirmBox('AGOTADO', `Se lo ha quedado el CEO de Microblizz.<small>Además, el precio tachado nunca existió: es un truco para que parezca una ganga. Así lo hacen ellos. Aquí, no.</small>`, null); };
  clearInterval(jokeT); jokeT = setInterval(() => { const c = $('#joke-clock'); if (!c || $('#scr-shop').hidden) { clearInterval(jokeT); return; } c.textContent = jokeClock(); }, 1000);
}
function openShop(tab) { if (tab) shopTab = tab; updateWallets(); show('scr-shop'); buildShop(); }
$('#btn-shop').addEventListener('click', () => { play('select'); openShop(); });
for (const b of document.querySelectorAll('[data-st]')) b.addEventListener('click', () => { shopTab = b.dataset.st; play('select'); buildShop(); });
