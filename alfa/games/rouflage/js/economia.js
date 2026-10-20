// Fans of Rouflage · LA ECONOMÍA: lo que se gana jugando y en qué se gasta. Va con el armario: solo en la alfa y en desarrollo (armarioVisible).
// - GOTAS de pintura (gratis): el premio diario (diario.js) y cada partida: 10 (+5 si ganas), el doble en BUSCAR PARTIDA (no en las salas con
//   amigos ni contra bots, que se pueden llenar de bots a voluntad), con un tope al día.
// - PASE DE TEMPORADA: experiencia por partida (100, +50 si ganas, ×1,5 en BUSCAR PARTIDA); cada 1000 es un nivel, hasta el 40 (unas 8 partidas por
//   nivel). Al subir, las cosas del armario marcadas «Pase gratis · nv N» son tuyas; las «Pase premium · nv N», si tienes el premium
//   (se compra con Acciones). El pase gratis da además 50 Acciones en algunos niveles (300 en total) y el premium otras 300 en los suyos
//   (purpPremium): gratis + premium = 600, el precio del siguiente. Quien lo completa tiene el siguiente pagado, como en Rumble (PLAN-MONEDAS.md, el pase en bucle).
// - ACCIONES: la moneda de la tienda del armario (cosméticos y pase premium). Se canjean por Gotas en la TIENDA (tienda.js), se compran por euros (de momento de prueba, sin cobrar) y salen también del pase gratis.
//   El flujo: se juega, se ganan Gotas, las Gotas se cambian por Acciones y las Acciones compran cosméticos y el pase premium.
// En el armario, lo que se compra con Gotas o Acciones lleva un botón COMPRAR. Todo se guarda en la partida: SAVE.gotas, SAVE.acciones,
// SAVE.pase = { xp, premium, purp: [niveles cobrados] } y SAVE.eco = { dia, gotasHoy }.
'use strict';

const ECO = { gotas: 10, gotasGanar: 5, linea: 2, topeDia: 150, xp: 100, xpGanar: 50, xpLinea: 1.5, xpNivel: 1000, niveles: 40, premium: 600,
  purpGratis: { 5: 50, 10: 50, 15: 50, 20: 50, 30: 50, 40: 50 },
  purpPremium: { 8: 50, 16: 50, 24: 50, 32: 50, 40: 100 } };   // 300 en total: con las 300 de la pista gratis, lo que cuesta el premium (600)

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
// LOS HUECOS DEL PASE: los niveles sin cosmético ni Acciones dan Gotas (como el oro del pase de Rumble): ninguna casilla vacía, en la
// pista gratis ni en la premium, y la premium da algo nada más comprarla (el nivel 1). Se calcula del catálogo al cargar y queda en ECO
// (gotasGratis y gotasPremium: { nivel: Gotas }), así herramientas/rouflage_datos.js se lo pasa igual al servidor (servidor/54-*.sql)
ECO.gotasHueco = { gratis: 50, premium: 100, premiumNv1: 250 };
(() => {
  const cosas = paseCosas(), hay = (n, premium) => cosas.some(c => c.nv === n && c.premium === premium);
  ECO.gotasGratis = {}; ECO.gotasPremium = {};
  for (let n = 1; n <= ECO.niveles; n++) {
    if (!hay(n, false) && !ECO.purpGratis[n]) ECO.gotasGratis[n] = ECO.gotasHueco.gratis;
    if (!hay(n, true) && !ECO.purpPremium[n]) ECO.gotasPremium[n] = n === 1 ? ECO.gotasHueco.premiumNv1 : ECO.gotasHueco.premium;
  }
})();
function paseReparte() {
  if (RFS.activo()) return [];      // con servidor lo reparte él (servidor.js)
  const p = ecoEstado(), a = armarioEstado(), nv = paseNivel(), nuevo = [];
  for (const { cat, it, nv: n, premium } of paseCosas()) {
    if (n > nv || (premium && !p.premium)) continue;
    const k = cat + ':' + it.id; if (!a.tengo.includes(k)) { a.tengo.push(k); nuevo.push(tr(it.n)); }
  }
  for (const n in ECO.purpGratis) if (+n <= nv && !p.purp.includes(+n)) { p.purp.push(+n); SAVE.acciones += ECO.purpGratis[n]; nuevo.push(tr('{n} Acciones', { n: ECO.purpGratis[n] })); }
  p.purpG = p.purpG || []; for (const n in ECO.gotasGratis) if (+n <= nv && !p.purpG.includes(+n)) { p.purpG.push(+n); SAVE.gotas += ECO.gotasGratis[n]; nuevo.push(tr('{n} Gotas', { n: ECO.gotasGratis[n] })); }
  if (p.premium) { p.purpGP = p.purpGP || []; for (const n in ECO.gotasPremium) if (+n <= nv && !p.purpGP.includes(+n)) { p.purpGP.push(+n); SAVE.gotas += ECO.gotasPremium[n]; nuevo.push(tr('{n} Gotas', { n: ECO.gotasPremium[n] })); } }
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
// ¿se puede comprar? Con Acciones solo las ÉPICAS de la tienda (el resto, solo en el gachapón). Devuelve { moneda: 'gotas' | 'acciones', precio } o null
function arPrecio(it) {
  if (it.de === 'gotas') { const m = /^(\d+) Gotas$/.exec(String(it.txt)); return m ? { moneda: 'gotas', precio: +m[1] } : null; }
  if (it.de === 'tienda' && typeof it.txt === 'number' && (it.r === 'epica' || it.r === 'legend')) return { moneda: 'acciones', precio: it.txt };
  return null;
}
function arCompra(cat, it) {
  if (RFS.activo()) return arCompraServidor(cat, it);
  const pr = arPrecio(it); if (!pr || arTiene(cat.id, it)) return;
  ecoEstado();
  if (SAVE[pr.moneda] < pr.precio) { play('deny'); avisa(pr.moneda === 'gotas' ? tr('Te faltan gotas: juega partidas y recoge el premio diario') : tr('No tienes bastantes Acciones'), 'malo'); if (pr.moneda === 'acciones') abreTienda('armario'); return; }
  SAVE[pr.moneda] -= pr.precio; armarioEstado().tengo.push(cat.id + ':' + it.id);
  if (!cat.conjuntos) armarioEstado().puesto[cat.id] = it.id;      // lo compras y te lo pones
  guardaPartida(); play('crown'); avisa(tr('¡{n} es tuyo!', { n: tr(it.n) }), 'bueno');
  arPintaTodo();
}
// el botón COMPRAR del armario y la cartera (lo llama arPintaInfo)
function arPintaCompra(cat, it) {
  ecoEstado();
  const b = E('b-ar-comprar'), pr = it ? arPrecio(it) : null;
  E('ar-cartera').innerHTML = `<span>${tr('Gotas')} <b>${SAVE.gotas}</b></span><span>${tr('Acciones')} <b>${SAVE.acciones}</b></span>`;
  if (!b) return;
  b.hidden = !pr || arTiene(cat.id, it);
  if (!b.hidden) { b.textContent = tr('COMPRAR · {n} {m}', { n: pr.precio, m: tr(pr.moneda === 'gotas' ? 'Gotas' : 'Acciones') }); b.classList.toggle('falta', SAVE[pr.moneda] < pr.precio); b.onclick = () => arCompra(cat, it); }
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
    : tr('Con PREMIUM consigues además {n} cosas, {g} Gotas y {a} Acciones: con las del pase gratis, el siguiente pase te sale pagado.', { n: cosas.filter(c => c.premium).length, a: sumaP, g: Object.values(ECO.gotasPremium).reduce((a, b) => a + b, 0) });
  for (let n = 1; n <= ECO.niveles; n++) {
    const g = cosas.filter(c => c.nv === n && !c.premium), pr = cosas.filter(c => c.nv === n && c.premium), purp = ECO.purpGratis[n];
    const gg = ECO.gotasGratis[n], gp = ECO.gotasPremium[n];
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
    fila.appendChild(casilla(pr, true, extra(purpP[n], gp)));
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
