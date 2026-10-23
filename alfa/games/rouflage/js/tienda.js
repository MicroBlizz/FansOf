// Fans of Rouflage · LA TIENDA: paquetes de Acciones (con su precio en euros), ofertas (el Pack de inicio y el pase premium), Acciones a cambio
// de Gotas (que se ganan jugando) y el Caos primordial ilimitado (el de toda la serie, ENERGIA). Como en el resto de la serie, de momento es DE PRUEBA: no se cobra
// nada y lo que compras se te da (PLAN-TIENDA.md dice qué falta para cobrar de verdad). Va con el armario: solo en la alfa y en desarrollo.
// Se abre desde MI PERFIL › TIENDA, o sola cuando te faltan Acciones en el armario o en el pase (y VOLVER te devuelve allí).
'use strict';

const TIENDA = {
  desde: 'titulo',
  acciones: [      // { n: Acciones, eur: precio, extra: % de regalo sobre el pack pequeño }
    { n: 100, eur: 0.99 }, { n: 550, eur: 4.99, extra: 10 }, { n: 1200, eur: 9.99, extra: 20 }, { n: 2600, eur: 19.99, extra: 30 }, { n: 7000, eur: 49.99, extra: 40 },
  ],
  canje: [{ gotas: 1000, n: 50 }, { gotas: 2400, n: 125 }, { gotas: 6000, n: 330 }],      // Acciones a cambio de Gotas: 20 Gotas = 1 Acción desde el 23-10-2026 (antes 5: pagar no daba ninguna ventaja), un pelín mejor en los paquetes grandes
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
  if (TIENDA.desde === 'armario') abreArmario(ARMARIO.cat, ARMARIO.desde); else if (TIENDA.desde === 'pase') abrePase(); else if (TIENDA.desde === 'gacha') abreGacha(); else irTitulo();
}
function tiendaCompra(texto, da) { MONEDAS.recomiendaCuenta(() => tiendaCompraHecha(texto, da)); }
function tiendaCompraHecha(texto, da) { da(); guardaPartida(); play('crown'); avisa(tr('¡Comprado! {c}', { c: texto }) + ' · ' + tr('Te invita {quien}', { quien: INVITA_TIENDA }), 'bueno'); tiendaPinta(); }

// el icono del euro: una moneda dorada con su signo
function pintaEuro(c, w) {
  c.save(); c.scale(w / 40, w / 40);
  c.beginPath(); c.arc(20, 20, 15, 0, TAU); c.fillStyle = '#ffcb3d'; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.arc(20, 20, 10.5, 0, TAU); c.lineWidth = 1.6; c.strokeStyle = '#e0a11f'; c.stroke();
  c.font = '900 17px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = OL; c.strokeText('€', 20, 21.5); c.fillStyle = '#fff6ea'; c.fillText('€', 20, 21.5);
  c.restore();
}
// la flecha de la conversión (de lo que pagas a lo que recibes)
function pintaFlecha(c, w) {
  c.save(); c.scale(w / 40, w / 40); c.lineJoin = 'round';
  c.beginPath(); c.moveTo(4, 15); c.lineTo(22, 15); c.lineTo(22, 7); c.lineTo(36, 20); c.lineTo(22, 33); c.lineTo(22, 25); c.lineTo(4, 25); c.closePath();
  c.fillStyle = '#7ee04a'; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
  c.restore();
}
const ICONO_MONEDA = { euro: pintaEuro, gotas: pintaGotas, acciones: pintaAcciones };
const iconoPeq = (dibuja, px) => { const k = arLienzo(px, px); arPinta(k, dibuja); return k; };
// quien invita por ahora (como en el caos primordial ilimitado): a veces uno y a veces el otro
const INVITA_TIENDA = Math.random() < 0.5 ? 'Arkioner' : 'Pepins';

function tiendaPinta() {
  ecoEstado();
  E('tienda-cartera').innerHTML = `<span>${tr('Gotas')} <b>${SAVE.gotas}</b></span><span>${tr('Acciones')} <b>${SAVE.acciones}</b></span>`;
  const aviso = E('tienda-aviso-euros'); if (aviso) aviso.textContent = tr('De momento lo de los euros es gratis: te invita {quien}.', { quien: INVITA_TIENDA });
  // una tarjeta: lo que recibes (dibujo y nombre), de dónde viene (icono + flecha si es un cambio) y el botón con el icono de lo que pagas.
  // `pago` = { moneda: 'euro' | 'gotas' | 'acciones', txt, tengo, hace }: con `tengo` por debajo de `hace`, el botón avisa de lo que falta
  const tarjeta = (dibuja, nombre, nota, pago, alTocar, clase = '', origen = null) => {
    const d = document.createElement('div'); d.className = 'tn-tarjeta ' + clase + (origen ? ' cambio' : '');
    if (origen) { const f = document.createElement('div'); f.className = 'tn-cambio'; f.append(iconoPeq(ICONO_MONEDA[origen], 36), iconoPeq(pintaFlecha, 24), iconoPeq(dibuja, 46)); d.appendChild(f); }
    else { const k = arLienzo(54, 54); arPinta(k, dibuja); d.appendChild(k); }
    const t = document.createElement('div'); t.className = 'tn-texto'; t.innerHTML = `<b></b><small></small>`; t.querySelector('b').textContent = nombre; t.querySelector('small').textContent = nota; d.appendChild(t);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'boton peq tn-boton';
    const falta = pago.hace && pago.tengo < pago.hace ? pago.hace - pago.tengo : 0;
    if (pago.moneda) { b.appendChild(iconoPeq(ICONO_MONEDA[pago.moneda], 22)); }
    const sp = document.createElement('span'); sp.textContent = pago.txt; b.appendChild(sp);
    if (falta) {
      b.classList.add('falta'); const nm = pago.moneda === 'gotas' ? tr('Gotas') : tr('Acciones');
      const aviso = document.createElement('small'); aviso.className = 'tn-falta'; aviso.textContent = tr('Te faltan {n} {m}', { n: falta, m: nm }); t.appendChild(aviso);
      b.onclick = () => { play('deny'); b.classList.remove('sacude'); void b.offsetWidth; b.classList.add('sacude'); aviso.classList.add('avisa'); avisa(tr('Te faltan {n} {m}: tienes {t} y hacen falta {h}', { n: falta, m: nm, t: pago.tengo, h: pago.hace }), 'malo'); };
    } else if (alTocar) b.onclick = alTocar; else b.disabled = true;
    d.appendChild(b);
    return d;
  };
  // ofertas
  const of = E('tienda-ofertas'); of.innerHTML = '';
  const ini = TIENDA.inicio, yaInicio = !!(SAVE.tienda && SAVE.tienda.inicio);
  const cosasIni = ini.cosas.map(([cat, id]) => ({ cat, it: arItem(cat, id) })).filter(x => x.it);
  of.appendChild(tarjeta((c, w) => { if (cosasIni[0]) cosasIni[0].it.x(c, w); }, tr('Pack de inicio'), cosasIni.map(x => tr(x.it.n)).join(' + ') + ' + ' + tr('{n} Acciones', { n: ini.acciones }) + ' · ' + tr('una sola vez'),
    yaInicio ? { txt: tr('YA ES TUYO') } : { moneda: 'euro', txt: eurTexto(ini.eur) }, yaInicio ? null : RFS.activo() ? () => tiendaServidor('inicio', 0, tr('Pack de inicio')) : () => tiendaCompra(tr('Pack de inicio'), () => {
      SAVE.tienda = SAVE.tienda || {}; SAVE.tienda.inicio = true; SAVE.acciones += ini.acciones;
      for (const { cat, it } of cosasIni) { const k = cat + ':' + it.id; if (!armarioEstado().tengo.includes(k)) armarioEstado().tengo.push(k); }
    }), 'oferta'));
  const p = ecoEstado();
  of.appendChild(tarjeta((c, w) => pintaAcciones(c, w), tr('Pase premium'), tr('Todo lo premium de los 40 niveles del pase de temporada'),
    p.premium ? { txt: tr('YA ES TUYO') } : { moneda: 'acciones', txt: String(ECO.premium), tengo: SAVE.acciones, hace: ECO.premium }, p.premium ? null : () => { pasePremium(); tiendaPinta(); }, 'oferta'));
  // paquetes de Acciones, por euros
  const ac = E('tienda-acciones'); ac.innerHTML = '';
  for (const pk of TIENDA.acciones) ac.appendChild(tarjeta((c, w) => pintaAcciones(c, w), tr('{n} Acciones', { n: pk.n.toLocaleString(IDIOMA_RF === 'es' ? 'es-ES' : 'en-GB') }),
    pk.extra ? tr('+{n} % de regalo', { n: pk.extra }) : '', { moneda: 'euro', txt: eurTexto(pk.eur) }, RFS.activo() ? () => tiendaServidor('acciones', TIENDA.acciones.indexOf(pk), tr('{n} Acciones', { n: pk.n })) : () => tiendaCompra(tr('{n} Acciones', { n: pk.n }), () => { SAVE.acciones += pk.n; }), pk.extra >= 30 ? 'destacado' : '', 'euro'));
  // Acciones a cambio de Gotas (las Gotas solo se ganan jugando)
  const go = E('tienda-gotas'); go.innerHTML = '';
  for (const pk of TIENDA.canje) go.appendChild(tarjeta((c, w) => pintaAcciones(c, w), tr('{n} Acciones', { n: pk.n }), tr('Las Gotas se ganan jugando'), { moneda: 'gotas', txt: String(pk.gotas), tengo: SAVE.gotas, hace: pk.gotas }, RFS.activo() ? () => tiendaServidor('canje', TIENDA.canje.indexOf(pk)) : () => {
    SAVE.gotas -= pk.gotas; SAVE.acciones += pk.n; guardaPartida(); play('crown'); avisa(tr('+{n} Acciones', { n: pk.n }), 'bueno'); tiendaPinta();
  }, '', 'gotas'));
  // el caos primordial ilimitado (el de toda la serie)
  E('tienda-caos').hidden = typeof ENERGIA === 'undefined';
}
function preparaTienda() {
  E('b-tienda').onclick = () => abreTienda('titulo');
  E('b-tienda-volver').onclick = cierraTienda;
  E('b-tienda-caos').onclick = () => { play('select'); if (typeof ENERGIA !== 'undefined') ENERGIA.abrirTienda(); };
}
