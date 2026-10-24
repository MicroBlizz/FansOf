// Fans of Rouflage · LA ECONOMÍA: lo que se gana jugando y en qué se gasta. Va con el armario: solo en la alfa y en desarrollo (armarioVisible).
// - GOTAS de pintura (gratis): el premio diario (diario.js) y cada partida: 10 (+5 si ganas), el doble en BUSCAR PARTIDA (no en las salas con
//   amigos ni contra bots, que se pueden llenar de bots a voluntad), con un tope al día (300 desde el 24-10-2026, decidido por Daniel; antes 150).
// - PASE DE TEMPORADA: experiencia por partida (100, +50 si ganas, ×1,5 en BUSCAR PARTIDA); cada 1000 es un nivel, hasta el 40 (unas 8 partidas por
//   nivel). Al subir, las cosas del armario marcadas «Pase gratis · nv N» son tuyas; las «Pase premium · nv N», si tienes el premium
//   (se compra con Acciones). El pase gratis da además 50 Acciones en algunos niveles (300 en total) y el premium otras 300 en los suyos
//   (purpPremium): gratis + premium = 600, el precio del siguiente. Quien lo completa tiene el siguiente pagado, como en Rumble (PLAN-MONEDAS.md, el pase en bucle).
// - ACCIONES: la moneda de la tienda del armario (cosméticos y pase premium). Se canjean por Gotas en la TIENDA (tienda.js), se compran por euros (de momento de prueba, sin cobrar) y salen también del pase (la pista gratis y la premium).
//   El flujo: se juega, se ganan Gotas, las Gotas se cambian por Acciones y las Acciones compran cosméticos y el pase premium.
// En el armario, lo que se vende lleva un botón COMPRAR que abre la ventana de confirmar (armario-compra.js): se paga con Gotas o con Acciones, a elegir. Todo se guarda en la partida: SAVE.gotas, SAVE.acciones,
// SAVE.pase = { xp, premium, purp: [niveles cobrados] } y SAVE.eco = { dia, gotasHoy }.
'use strict';

const ECO = { gotas: 10, gotasGanar: 5, linea: 2, topeDia: 300, xp: 100, xpGanar: 50, xpLinea: 1.5, xpNivel: 1000, niveles: 40, premium: 600,
  purpGratis: { 10: 50, 20: 50, 30: 50 },
  purpPremium: { 16: 50, 32: 50, 40: 50 } };   // desde el 23-10-2026: 150 + 150 = 300, la mitad del premium (600). Antes devolvía 830 y quien lo compraba una vez no pagaba nunca más

function ecoEstado() {
  if (typeof SAVE.gotas !== 'number') SAVE.gotas = 0;
  if (typeof SAVE.acciones !== 'number') SAVE.acciones = 0;
  if (!SAVE.pase) SAVE.pase = { xp: 0, premium: false, purp: [] };
  if (!SAVE.eco) SAVE.eco = { dia: '', gotasHoy: 0 };
  return SAVE.pase;
}
const paseNivel = () => Math.min(ECO.niveles, 1 + Math.floor(ecoEstado().xp / ECO.xpNivel));
// las cosas del pase: [{ cat, it, nv, premium }]
function paseCosas() {
  const out = [];
  for (const c of CATALOGO_AR) for (const it of c.items) {
    if (it.de !== 'gratis' && it.de !== 'premium') continue;
    const m = /nv (\d+)/.exec(String(it.txt)); if (m) out.push({ cat: c.id, it, nv: +m[1], premium: it.de === 'premium' });
  }
  return out.sort((a, b) => a.nv - b.nv);
}
// da todo lo que toca hasta el nivel actual (se puede llamar siempre: no repite nada). Devuelve lo nuevo, en texto
// LOS HUECOS DEL PASE: los niveles sin cosmético ni Acciones no se quedan vacíos (como el oro del pase de Rumble): en la pista gratis dan
// Gotas y en la PREMIUM dan Acciones (lo mismo que antes en Gotas, al cambio de la tienda: 100 Gotas = 20 Acciones, y el nivel 1 da algo nada
// más comprarla). Se calcula del catálogo al cargar y queda en ECO (gotasGratis: { nivel: Gotas } y accionesPremium: { nivel: Acciones }), así
// herramientas/rouflage/rouflage_datos.js se lo pasa igual al servidor (servidor/56-*.sql y 65-*.sql). Un hueco premium se cobra una sola vez (SAVE.pase.purpGP):
// quien ya lo cobró en Gotas con la versión de antes no cobra además sus Acciones.
ECO.gotasHueco = { gratis: 50, premium: 150 };      // desde el 24-10-2026 los huecos premium dan 150 Gotas (eco.gotasPremium, que el servidor ya sabe pagar: servidor/65)
ECO.accionesHueco = { premium: 0, premiumNv1: 50 };      // los huecos premium ya no dan Acciones (desde el 23-10-2026), solo el nivel 1 su regalo de bienvenida
(() => {
  const cosas = paseCosas(), hay = (n, premium) => cosas.some(c => c.nv === n && c.premium === premium);
  ECO.gotasGratis = {}; ECO.accionesPremium = {}; ECO.gotasPremium = {};
  for (let n = 1; n <= ECO.niveles; n++) {
    if (!hay(n, false) && !ECO.purpGratis[n]) ECO.gotasGratis[n] = ECO.gotasHueco.gratis;
    if (!hay(n, true) && !ECO.purpPremium[n] && (n === 1 ? ECO.accionesHueco.premiumNv1 : ECO.accionesHueco.premium)) ECO.accionesPremium[n] = n === 1 ? ECO.accionesHueco.premiumNv1 : ECO.accionesHueco.premium;
    else if (!hay(n, true) && !ECO.purpPremium[n] && n > 1) ECO.gotasPremium[n] = ECO.gotasHueco.premium;      // ningún nivel premium se queda vacío
  }
})();
// lo que da el pase si ya tienes la pieza (no debería pasar: lo del pase no se vende ni sale en el gachapón mientras dura, pero por si acaso):
// las mismas Gotas que una repetida del gachapón de su rareza. SAVE.pase.dadas = las piezas del pase ya resueltas (dadas o pagadas)
const paseRepetida = it => (GACHA.repetida && GACHA.repetida[it.r]) || 0;
function paseReparte() {
  if (RFS.activo()) return [];      // con servidor lo reparte él (servidor.js)
  const p = ecoEstado(), a = armarioEstado(), nv = paseNivel(), nuevo = [];
  if (!Array.isArray(p.dadas)) p.dadas = paseCosas().map(c => c.cat + ':' + c.it.id).filter(k => a.tengo.includes(k));      // las de antes de apuntarlas: ya estaban dadas
  for (const { cat, it, nv: n, premium } of paseCosas()) {
    if (n > nv || (premium && !p.premium)) continue;
    const k = cat + ':' + it.id; if (p.dadas.includes(k)) continue;
    p.dadas.push(k);
    if (!a.tengo.includes(k)) { a.tengo.push(k); nuevo.push(tr(it.n)); }
    else if (paseRepetida(it)) { SAVE.gotas += paseRepetida(it); nuevo.push(tr('{n} Gotas', { n: paseRepetida(it) }) + ' (' + tr(it.n) + ')'); }
  }
  for (const n in ECO.purpGratis) if (+n <= nv && !p.purp.includes(+n)) { p.purp.push(+n); SAVE.acciones += ECO.purpGratis[n]; nuevo.push(tr('{n} Acciones', { n: ECO.purpGratis[n] })); }
  p.purpG = p.purpG || []; for (const n in ECO.gotasGratis) if (+n <= nv && !p.purpG.includes(+n)) { p.purpG.push(+n); SAVE.gotas += ECO.gotasGratis[n]; nuevo.push(tr('{n} Gotas', { n: ECO.gotasGratis[n] })); }
  if (p.premium) { p.purpGP = p.purpGP || []; for (const n in ECO.accionesPremium) if (+n <= nv && !p.purpGP.includes(+n)) { p.purpGP.push(+n); SAVE.acciones += ECO.accionesPremium[n]; nuevo.push(tr('{n} Acciones (premium)', { n: ECO.accionesPremium[n] })); }
    for (const n in ECO.gotasPremium) if (+n <= nv && !p.purpGP.includes(+n)) { p.purpGP.push(+n); SAVE.gotas += ECO.gotasPremium[n]; nuevo.push(tr('{n} Gotas', { n: ECO.gotasPremium[n] })); } }
  if (p.premium) { p.purpP = p.purpP || []; for (const n in ECO.purpPremium) if (+n <= nv && !p.purpP.includes(+n)) { p.purpP.push(+n); SAVE.acciones += ECO.purpPremium[n]; nuevo.push(tr('{n} Acciones (premium)', { n: ECO.purpPremium[n] })); } }
  return nuevo;
}

// al acabar una partida (la llama termina): suma Gotas y experiencia y lo añade a las cifras del final
function economiaPartida(r) {
  if (armarioVisible() && J.yo) finPaseApunta(r);      // lo de antes, para que el final anime la barra del pase (fin-pase.js)
  if (RFS.activo()) return economiaPartidaServidor(r);
  if (!armarioVisible() || !J.yo) return;
  ecoEstado();
  const publica = J.pvp && !(RFP.info && RFP.info.privada), hoy = fechaHoy(), e = SAVE.eco, linea = publica ? ECO.linea : 1;      // ×2 solo en BUSCAR PARTIDA
  if (e.dia !== hoy) { e.dia = hoy; e.gotasHoy = 0; }
  const quiere = (ECO.gotas + (r.victoria ? ECO.gotasGanar : 0)) * linea, gotas = Math.max(0, Math.min(quiere, ECO.topeDia - e.gotasHoy));
  e.gotasHoy += gotas; SAVE.gotas += gotas;
  const antes = paseNivel(), xp = Math.round((ECO.xp + (r.victoria ? ECO.xpGanar : 0)) * (publica ? ECO.xpLinea : 1));
  SAVE.pase.xp += xp;
  const despues = paseNivel(), nuevo = paseReparte();
  r.filas.push([tr('Gotas'), gotas ? '+' + gotas : tr('tope de hoy')]);
  r.filas.push([tr('Pase de temporada'), tr('nivel {n}', { n: despues }) + ' (+' + xp + ' XP)']);
  if (r.eco) r.eco.gotas = gotas;      // la subida de nivel y su premio ya se ven en el final, en el tubo del pase (fin-pase.js)
  else if (despues > antes) setTimeout(() => avisa(tr('¡Pase: nivel {n}!', { n: despues }) + (nuevo.length ? ' ' + nuevo.join(', ') : ''), 'bueno'), 3200);
  guardaPartida();
}

/* ---------- comprar en el armario ---------- */
// Lo que se vende se paga con Gotas O con Acciones, a elegir (al cambio de la tienda, ECO.cambio: 5 Gotas = 1 Acción). Se vende lo que tiene
// precio: lo de Gotas («N Gotas»), lo de Acciones (épicas y legendarias de la tienda) y lo que antes salía SOLO en el gachapón (comunes y raras
// de la tienda), esto con el recargo PRECIO_GACHA (armario-precios.js). NO se vende lo del pase, el diario, «Al empezar», los talentos, la
// suscripción ni el Pack de inicio: eso solo se consigue jugando o esperando. Devuelve { gotas, acciones, gacha } o null.
// herramientas/rouflage/rouflage_datos.js lo pasa al servidor (pg y pa de cada pieza), que cobra con eso y no con lo que diga el cliente (rf_comprar_con)
const ecoCambio = () => { const c = typeof TIENDA !== 'undefined' && TIENDA.canje && TIENDA.canje[0]; return c ? c.gotas / c.n : 20; };
function arPrecio(it) {
  if (!it) return null;
  const cambio = ecoCambio();
  if (it.de === 'gotas') { const m = /^(\d+) Gotas$/.exec(String(it.txt)); return m ? { gotas: +m[1], acciones: Math.ceil(+m[1] / 5), gacha: false } : null; }      // lo de Gotas (escenarios y muebles baratos) mantiene su precio en Acciones de siempre (÷5): es lo barato de verdad
  if (it.de !== 'tienda' || typeof it.txt !== 'number' || it.txt <= 0) return null;
  const gacha = it.r !== 'epica' && it.r !== 'legend'; let acciones = gacha ? Math.ceil(it.txt * PRECIO_GACHA / 5) * 5 : it.txt, rebaja = false;
  if (it.conj && typeof it.conj.txt === 'number') { const cj = arItem('conjuntos', it.conj.id); if (cj && arTiene('conjuntos', cj)) { acciones = it.conj.txt; rebaja = true; } }      // las pegatinas de un conjunto del Rumble que ya tienes: más baratas
  return { gotas: acciones * cambio, acciones, gacha, rebaja };
}
// compra con la moneda elegida ('gotas' o 'acciones'): la llama la ventana de confirmar (armario-compra.js), nunca el botón COMPRAR directamente.
// Sin moneda, la de siempre de esa pieza (Gotas lo de Gotas, Acciones lo demás). Devuelve true si se ha comprado (con servidor, una promesa)
function arCompra(cat, it, moneda) {
  if (moneda !== 'gotas' && moneda !== 'acciones') moneda = it && it.de === 'gotas' ? 'gotas' : 'acciones';
  if (RFS.activo()) return arCompraServidor(cat, it, moneda);
  const pr = arPrecio(it); if (!pr || arTiene(cat.id, it) || !(moneda in pr)) return false;
  ecoEstado();
  if (SAVE[moneda] < pr[moneda]) { play('deny'); avisa(moneda === 'gotas' ? tr('Te faltan gotas: juega partidas y recoge el premio diario') : tr('No tienes bastantes Acciones'), 'malo'); return false; }
  SAVE[moneda] -= pr[moneda]; armarioEstado().tengo.push(cat.id + ':' + it.id);
  if (!cat.conjuntos && !arMira(cat)) armarioEstado().puesto[cat.id] = it.id;      // lo compras y te lo pones
  guardaPartida(); play('crown'); avisa(tr('¡{n} es tuyo!', { n: tr(it.n) }), 'bueno');
  arPintaTodo();
  return true;
}
// el botón COMPRAR del armario y la cartera (lo llama arPintaInfo): abre la ventana de confirmar, con los dos precios
function arPintaCompra(cat, it) {
  ecoEstado();
  const b = E('b-ar-comprar'), pr = it ? arPrecio(it) : null;
  E('ar-cartera').innerHTML = `<span>${tr('Gotas')} <b>${SAVE.gotas}</b></span><span>${tr('Acciones')} <b>${SAVE.acciones}</b></span>`;
  if (!b) return;
  b.hidden = !pr || arTiene(cat.id, it);
  if (!b.hidden) { b.textContent = tr('COMPRAR'); b.classList.toggle('falta', SAVE.gotas < pr.gotas && SAVE.acciones < pr.acciones); b.onclick = () => arPideCompra(cat, it); }
}

/* ---------- la pantalla del pase ---------- */
function abrePase() { ecoEstado(); paseReparte(); guardaPartida(); pasePinta(); pantalla('p-pase'); play('select'); }
function pasePinta() {
  const p = ecoEstado(), nv = paseNivel(), dentro = p.xp % ECO.xpNivel, lista = E('pase-lista');
  E('pase-nivel').textContent = tr('Nivel {n} de {t}', { n: nv, t: ECO.niveles });
  E('pase-barra').style.width = (nv >= ECO.niveles ? 100 : dentro / ECO.xpNivel * 100) + '%';
  E('pase-xp').textContent = nv >= ECO.niveles ? tr('¡Pase completo!') : tr('{a} / {b} XP para el siguiente', { a: dentro, b: ECO.xpNivel });
  E('pase-cartera').innerHTML = `<span>${tr('Gotas')} <b>${SAVE.gotas}</b></span><span>${tr('Acciones')} <b>${SAVE.acciones}</b></span>`;
  const bp = E('b-pase-premium'); bp.disabled = p.premium;
  bp.textContent = p.premium ? tr('PREMIUM ACTIVO') : tr('PREMIUM · {n} Acciones', { n: ECO.premium });
  lista.innerHTML = '';
  const cosas = paseCosas(), purpP = ECO.purpPremium || {}, sumaP = Object.values(purpP).reduce((a, b) => a + b, 0);
  // arriba, lo que da el premium de un vistazo (antes había que ir bajando la lista para adivinarlo)
  E('pase-oferta').textContent = p.premium ? tr('Premium activo: lo de la columna dorada también es tuyo al llegar a su nivel.')
    : tr('Con PREMIUM consigues además {n} cosas, {a} Acciones y {g} Gotas: con las del pase gratis, el siguiente te sale a mitad de precio.', { n: cosas.filter(c => c.premium).length, a: sumaP + Object.values(ECO.accionesPremium).reduce((a, b) => a + b, 0), g: Object.values(ECO.gotasPremium || {}).reduce((a, b) => a + b, 0).toLocaleString(LOCALE_RF) });
  for (let n = 1; n <= ECO.niveles; n++) {
    const g = cosas.filter(c => c.nv === n && !c.premium), pr = cosas.filter(c => c.nv === n && c.premium), purp = ECO.purpGratis[n];
    const gg = ECO.gotasGratis[n], ap = (purpP[n] || 0) + (ECO.accionesPremium[n] || 0);
    const fila = document.createElement('div'); fila.className = 'pase-fila' + (n <= nv ? ' hecho' : '') + (n === nv + 1 ? ' siguiente' : '');
    fila.innerHTML = `<b class="pase-n">${n}</b>`;
    const casilla = (lista2, premium, extra) => {
      const vacio = !lista2.length && !extra;
      const d = document.createElement('div'); d.className = 'pase-premio' + (premium ? ' premium' : '') + (premium && !p.premium && !vacio ? ' bloq' : '') + (vacio ? ' vacio' : '');
      for (const { it } of lista2) { const k = arLienzo(34, 34); arPinta(k, (c, w) => it.x(c, w)); d.appendChild(k); const s = document.createElement('small'); s.textContent = tr(it.n); d.appendChild(s); }
      if (extra) { const s = document.createElement('small'); s.className = 'purp'; s.textContent = extra; d.appendChild(s); }
      if (premium && !p.premium && !vacio) { const s = document.createElement('small'); s.className = 'candado'; s.textContent = tr('CON PREMIUM'); d.appendChild(s); }
      return d;
    };
    const extra = (acc, got) => [acc ? '+' + tr('{n} Acciones', { n: acc }) : '', got ? '+' + tr('{n} Gotas', { n: got }) : ''].filter(Boolean).join(' · ');
    fila.appendChild(casilla(g, false, extra(purp, gg)));
    fila.appendChild(casilla(pr, true, extra(ap, ECO.gotasPremium[n] || 0)));
    lista.appendChild(fila);
  }
}
function pasePremium() {
  if (RFS.activo()) return pasePremiumServidor();
  const p = ecoEstado(); if (p.premium) return;
  if (SAVE.acciones < ECO.premium) { play('deny'); avisa(tr('No tienes bastantes Acciones para el pase premium'), 'malo'); abreTienda('pase'); return; }
  SAVE.acciones -= ECO.premium; p.premium = true; const nuevo = paseReparte(); guardaPartida(); play('crown');
  avisa(tr('¡Pase premium activado!') + (nuevo.length ? ' ' + nuevo.join(', ') : ''), 'bueno'); pasePinta();
}
function preparaEconomia() {
  E('b-pase').onclick = abrePase;
  E('b-pase-premium').onclick = pasePremium;
  E('b-pase-volver').onclick = () => { play('select'); irTitulo(); };
}
