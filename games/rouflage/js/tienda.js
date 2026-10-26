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
const eurTexto = v => (IDIOMA_RF === 'en' ? '€' + v.toFixed(2) : v.toFixed(2).replace('.', ',') + ' €');

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
// lo que cuesta euros: en la app de Android, Google Play (core/js/sistema/pagos.js: el servidor entrega, servidor/91, y el estado vuelve por el gancho 'compra'
// de servidor-economia.js); si no, como hasta ahora, la compra de prueba del servidor o de la partida local. `producto` = el id en Play Console y en `productos`
function tiendaEuros(tipo, idx, texto, precio, producto, daLocal) {
  if (typeof PAGOS !== 'undefined' && PAGOS.disponible()) return MONEDAS.compraReal(texto, `<p><b>${texto}</b> · ${precio}</p>`, r => { if (r && r.real) { play('crown'); avisa(tr('¡Comprado! {c}', { c: texto }), 'bueno'); } }, producto);
  return RFS.activo() ? tiendaServidor(tipo, idx, texto) : tiendaCompra(texto, daLocal);
}
function tiendaCompraHecha(texto, da) { da(); guardaPartida(); play('crown'); avisa(tr('¡Comprado! {c}', { c: texto }), 'bueno'); tiendaPinta(); }

// un montón de títulos de Acciones (1 a 5): cuanto más grande el paquete, más alto el montón; el de arriba, el icono de siempre
function pintaMontonAcciones(c, w, n) {
  n = Math.max(1, Math.min(5, n));
  if (n === 1) { pintaAcciones(c, w); return; }
  const k = w / 40, s = 0.62 + 0.06 * (5 - n);      // los de abajo, un poco más pequeños si hay muchos
  c.save(); c.scale(k, k); c.lineJoin = 'round';
  for (let i = 0; i < n - 1; i++) {      // los de debajo: papeles apilados y un poco torcidos
    c.save(); c.translate(20, 31 - i * 3.2); c.rotate((i % 2 ? 1 : -1) * (0.08 + i * 0.03));
    c.beginPath(); rrPathRF(c, -15, -6, 30, 12, 2.5); c.fillStyle = i % 2 ? '#e8dcb6' : '#f4ecd2'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = OL; c.stroke();
    c.restore();
  }
  c.restore();
  c.save(); c.translate(w * (1 - s) / 2, w * (1 - s) / 2 - w * 0.05 * (n - 1) * 0.6); pintaAcciones(c, w * s); c.restore();
}

// el icono del euro: una moneda dorada con su signo
function pintaEuro(c, w) {
  c.save(); c.scale(w / 40, w / 40);
  c.beginPath(); c.arc(20, 20, 15, 0, TAU); c.fillStyle = '#ffcb3d'; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.arc(20, 20, 10.5, 0, TAU); c.lineWidth = 1.6; c.strokeStyle = '#e0a11f'; c.stroke();
  c.font = '900 17px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = OL; c.strokeText('€', 20, 21.5); c.fillStyle = '#fff6ea'; c.fillText('€', 20, 21.5);
  c.restore();
}
const ICONO_MONEDA = { euro: pintaEuro, gotas: pintaGotas, acciones: pintaAcciones };
const iconoPeq = (dibuja, px) => { const k = arLienzo(px, px); arPinta(k, dibuja); return k; };

function tiendaPinta() {
  ecoEstado();
  pintaCartera('tienda-cartera');
  // una tarjeta: lo que recibes (dibujo y nombre), de dónde viene (icono + flecha si es un cambio) y el botón con el icono de lo que pagas.
  // `pago` = { moneda: 'euro' | 'gotas' | 'acciones', txt, tengo, hace }: con `tengo` por debajo de `hace`, el botón avisa de lo que falta
  const tarjeta = (dibuja, nombre, nota, pago, alTocar, clase = '', origen = null) => {
    const d = document.createElement('div'); d.className = 'tn-tarjeta ' + clase; void origen;
    const k = arLienzo(54, 54); arPinta(k, dibuja); d.appendChild(k);      // lo que recibes; con qué pagas lo dice el botón (su moneda)
    const t = document.createElement('div'); t.className = 'tn-texto'; t.innerHTML = `<b></b><small></small>`; t.querySelector('b').textContent = nombre; t.querySelector('small').textContent = nota; d.appendChild(t);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'boton peq tn-boton';
    const falta = pago.hace && pago.tengo < pago.hace ? pago.hace - pago.tengo : 0;
    if (pago.moneda) { b.appendChild(iconoPeq(ICONO_MONEDA[pago.moneda], 22)); }
    const sp = document.createElement('span'); b.appendChild(sp);
    const eur = pago.moneda === 'euro' && /€/.test(pago.txt);      // el € en letra normal: la letra gorda del juego no lo tiene y salía mordido
    if (eur) { const [a, z] = pago.txt.split('€'); if (a) sp.append(a.trim()); const i = document.createElement('i'); i.className = 'tn-eur'; i.textContent = '€'; sp.appendChild(i); if (z) sp.append(z.trim()); }
    else sp.textContent = pago.txt;
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
    yaInicio ? { txt: tr('YA ES TUYO') } : { moneda: 'euro', txt: eurTexto(ini.eur) }, yaInicio ? null : () => tiendaEuros('inicio', 0, tr('Pack de inicio'), eurTexto(ini.eur), 'rouflage_inicio', () => {
      SAVE.tienda = SAVE.tienda || {}; SAVE.tienda.inicio = true; SAVE.acciones += ini.acciones;
      for (const { cat, it } of cosasIni) { const k = cat + ':' + it.id; if (!armarioEstado().tengo.includes(k)) armarioEstado().tengo.push(k); }
    }), 'oferta'));
  const p = ecoEstado();
  of.appendChild(tarjeta((c, w) => pintaAcciones(c, w), tr('Pase premium'), tr('Todo lo premium de los 40 niveles del pase de temporada'),
    p.premium ? { txt: tr('YA ES TUYO') } : { moneda: 'acciones', txt: String(ECO.premium), tengo: SAVE.acciones, hace: ECO.premium }, p.premium ? null : () => { pasePremium(); tiendaPinta(); }, 'oferta'));
  // paquetes de Acciones, por euros
  const ac = E('tienda-acciones'); ac.innerHTML = '';
  for (const pk of TIENDA.acciones) ac.appendChild(tarjeta((c, w) => pintaMontonAcciones(c, w, TIENDA.acciones.indexOf(pk) + 1), tr('{n} Acciones', { n: pk.n.toLocaleString(LOCALE_RF) }),
    pk.extra ? tr('+{n} % de regalo', { n: pk.extra }) : '', { moneda: 'euro', txt: eurTexto(pk.eur) }, () => tiendaEuros('acciones', TIENDA.acciones.indexOf(pk), tr('{n} Acciones', { n: pk.n }), eurTexto(pk.eur), 'rouflage_acciones_' + pk.n, () => { SAVE.acciones += pk.n; }), pk.extra >= 30 ? 'destacado' : '', 'euro'));
  // Acciones a cambio de Gotas (las Gotas solo se ganan jugando)
  const go = E('tienda-gotas'); go.innerHTML = '';
  for (const pk of TIENDA.canje) go.appendChild(tarjeta((c, w) => pintaMontonAcciones(c, w, TIENDA.canje.indexOf(pk) + 1), tr('{n} Acciones', { n: pk.n }), tr('Las Gotas se ganan jugando'), { moneda: 'gotas', txt: String(pk.gotas), tengo: SAVE.gotas, hace: pk.gotas }, RFS.activo() ? () => tiendaServidor('canje', TIENDA.canje.indexOf(pk)) : () => {
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
