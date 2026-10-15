// Fans of Rouflage · LA TIENDA: paquetes de Acciones (con su precio en euros), ofertas (el Pack de inicio y el pase premium), Gotas a cambio
// de Acciones y el Caos primordial ilimitado (el de toda la serie, ENERGIA). Como en el resto de la serie, de momento es DE PRUEBA: no se cobra
// nada y lo que compras se te da (PLAN-TIENDA.md dice qué falta para cobrar de verdad). Va con el armario: solo en la alfa y en desarrollo.
// Se abre desde MI PERFIL › TIENDA, o sola cuando te faltan Acciones en el armario o en el pase (y VOLVER te devuelve allí).
'use strict';

const TIENDA = {
  desde: 'titulo',
  acciones: [      // { n: Acciones, eur: precio, extra: % de regalo sobre el pack pequeño }
    { n: 100, eur: 0.99 }, { n: 550, eur: 4.99, extra: 10 }, { n: 1200, eur: 9.99, extra: 20 }, { n: 2600, eur: 19.99, extra: 30 }, { n: 7000, eur: 49.99, extra: 40 },
  ],
  gotas: [{ n: 500, acciones: 50 }, { n: 1200, acciones: 100 }, { n: 3000, acciones: 220 }],      // Gotas a cambio de Acciones
  inicio: { eur: 2.99, acciones: 300, cosas: [['cabeza', 'gorra'], ['marcos', 'pixel']] },        // el Pack de inicio: una sola vez
};
const eurTexto = v => (IDIOMA_RF === 'es' ? v.toFixed(2).replace('.', ',') + ' €' : '€' + v.toFixed(2));

// el icono de las Acciones: un título de acciones con su flecha verde que sube y el sello dorado
function pintaAcciones(c, w) {
  c.save(); c.scale(w / 40, w / 40); c.lineJoin = 'round';
  c.beginPath(); rrPathRF(c, 6, 8, 28, 24, 3); c.fillStyle = '#f4ecd2'; c.fill(); c.lineWidth = 2.6; c.strokeStyle = OL; c.stroke();
  c.strokeStyle = '#c9b98a'; c.lineWidth = 1.2; c.strokeRect(9, 11, 22, 18);
  c.beginPath(); c.moveTo(11, 26); c.lineTo(17, 20); c.lineTo(21, 23); c.lineTo(29, 14); c.strokeStyle = '#3f8a35'; c.lineWidth = 2.6; c.stroke();
  c.beginPath(); c.moveTo(29, 14); c.lineTo(24.5, 14.5); c.lineTo(28.5, 18.5); c.closePath(); c.fillStyle = '#3f8a35'; c.fill();
  c.beginPath(); c.arc(30, 30, 5, 0, TAU); c.fillStyle = '#ffcb3d'; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.arc(30, 30, 2.2, 0, TAU); c.fillStyle = '#e0a11f'; c.fill();
  c.restore();
}

function abreTienda(desde) { ecoEstado(); TIENDA.desde = desde || 'titulo'; tiendaPinta(); pantalla('p-tienda'); play('select'); }
function cierraTienda() {
  play('select');
  if (TIENDA.desde === 'armario') abreArmario(ARMARIO.cat, ARMARIO.desde); else if (TIENDA.desde === 'pase') abrePase(); else irTitulo();
}
function tiendaCompra(texto, da) { da(); guardaPartida(); play('crown'); avisa(tr('¡Comprado! {c}', { c: texto }) + ' · ' + tr('(pruebas: no se ha cobrado nada)'), 'bueno'); tiendaPinta(); }

function tiendaPinta() {
  ecoEstado();
  E('tienda-cartera').innerHTML = `<span>${tr('Gotas')} <b>${SAVE.gotas}</b></span><span>${tr('Acciones')} <b>${SAVE.acciones}</b></span>`;
  const tarjeta = (dibuja, nombre, nota, boton, alTocar, clase = '') => {
    const d = document.createElement('div'); d.className = 'tn-tarjeta ' + clase;
    const k = arLienzo(54, 54); arPinta(k, dibuja); d.appendChild(k);
    const t = document.createElement('div'); t.className = 'tn-texto'; t.innerHTML = `<b></b><small></small>`; t.querySelector('b').textContent = nombre; t.querySelector('small').textContent = nota; d.appendChild(t);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'boton peq'; b.textContent = boton; if (alTocar) b.onclick = alTocar; else b.disabled = true; d.appendChild(b);
    return d;
  };
  // ofertas
  const of = E('tienda-ofertas'); of.innerHTML = '';
  const ini = TIENDA.inicio, yaInicio = !!(SAVE.tienda && SAVE.tienda.inicio);
  const cosasIni = ini.cosas.map(([cat, id]) => ({ cat, it: arItem(cat, id) })).filter(x => x.it);
  of.appendChild(tarjeta((c, w) => { if (cosasIni[0]) cosasIni[0].it.x(c, w); }, tr('Pack de inicio'), cosasIni.map(x => tr(x.it.n)).join(' + ') + ' + ' + tr('{n} Acciones', { n: ini.acciones }) + ' · ' + tr('una sola vez'),
    yaInicio ? tr('YA ES TUYO') : eurTexto(ini.eur), yaInicio ? null : () => tiendaCompra(tr('Pack de inicio'), () => {
      SAVE.tienda = SAVE.tienda || {}; SAVE.tienda.inicio = true; SAVE.acciones += ini.acciones;
      for (const { cat, it } of cosasIni) { const k = cat + ':' + it.id; if (!armarioEstado().tengo.includes(k)) armarioEstado().tengo.push(k); }
    }), 'oferta'));
  const p = ecoEstado();
  of.appendChild(tarjeta((c, w) => pintaAcciones(c, w), tr('Pase premium'), tr('Todo lo premium de los 40 niveles del pase de temporada'),
    p.premium ? tr('YA ES TUYO') : tr('{n} Acciones', { n: ECO.premium }), p.premium ? null : () => { if (SAVE.acciones < ECO.premium) { play('deny'); avisa(tr('No tienes bastantes Acciones'), 'malo'); return; } pasePremium(); tiendaPinta(); }, 'oferta'));
  // paquetes de Acciones
  const ac = E('tienda-acciones'); ac.innerHTML = '';
  for (const pk of TIENDA.acciones) ac.appendChild(tarjeta((c, w) => pintaAcciones(c, w), tr('{n} Acciones', { n: pk.n.toLocaleString(IDIOMA_RF === 'es' ? 'es-ES' : 'en-GB') }),
    pk.extra ? tr('+{n} % de regalo', { n: pk.extra }) : '', eurTexto(pk.eur), () => tiendaCompra(tr('{n} Acciones', { n: pk.n }), () => { SAVE.acciones += pk.n; }), pk.extra >= 30 ? 'destacado' : ''));
  // Gotas
  const go = E('tienda-gotas'); go.innerHTML = '';
  for (const pk of TIENDA.gotas) go.appendChild(tarjeta((c, w) => pintaGotas(c, w), tr('{n} Gotas', { n: pk.n }), '', tr('{n} Acciones', { n: pk.acciones }), () => {
    if (SAVE.acciones < pk.acciones) { play('deny'); avisa(tr('No tienes bastantes Acciones'), 'malo'); return; }
    SAVE.acciones -= pk.acciones; SAVE.gotas += pk.n; guardaPartida(); play('crown'); avisa(tr('+{n} Gotas', { n: pk.n }), 'bueno'); tiendaPinta();
  }));
  // el caos primordial ilimitado (el de toda la serie)
  E('tienda-caos').hidden = typeof ENERGIA === 'undefined';
}
function preparaTienda() {
  E('b-tienda').onclick = () => abreTienda('titulo');
  E('b-tienda-volver').onclick = cierraTienda;
  E('b-tienda-caos').onclick = () => { play('select'); if (typeof ENERGIA !== 'undefined') ENERGIA.abrirTienda(); };
}
