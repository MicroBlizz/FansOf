// Fans of Rouflage · TEMPORADA, LIGA, EVENTO SEMANAL Y OFERTAS DEL DÍA (boceto 8 aprobado por Daniel el 23-10-2026). Todo lo cuenta el servidor
// (servidor/83-rouflage-temporada.sql): temporadas de 6 semanas desde el 26-10-2026; cada partida de BUSCAR PARTIDA suma +30 si ganas y −10 si pierdes;
// 5 ligas (Bronce, Plata 300, Oro 1000, Diamante 2000, Junta directiva 3000); tu tabla son los 30 de arriba de tu liga. Evento por semanas: «doble»
// (fin de semana, ganar da el doble) y «remontada» (perder solo quita 5). Al empezar la temporada siguiente, premio según tu liga (rf_liga_cobrar).
// Las OFERTAS DEL DÍA: 3 piezas de la tienda al 70 %, iguales para todos, que cambian a medianoche (rouflage_ofertas, rf_oferta_comprar).
'use strict';

const LIGAS = [
  { id: 'bronce', n: 'BRONCE', min: 0, col: '#b0743a' }, { id: 'plata', n: 'PLATA', min: 300, col: '#cfd8e6' }, { id: 'oro', n: 'ORO', min: 1000, col: '#ffcb3d' },
  { id: 'diamante', n: 'DIAMANTE', min: 2000, col: '#7fe0f0' }, { id: 'junta', n: 'JUNTA DIRECTIVA', min: 3000, col: '#ff6b6b' },
];
const NOMBRES_TEMPORADA = ['BECARIOS EN PRÁCTICAS', 'HORAS EXTRA', 'CIERRE DE TRIMESTRE', 'CENA DE EMPRESA', 'AUDITORÍA SORPRESA', 'TEAM BUILDING'];
const TEMP = { d: null, pidiendo: null, ofertas: null };
const ligaDe = id => LIGAS.find(l => l.id === id) || LIGAS[0];
const nombreTemporada = t => tr(NOMBRES_TEMPORADA[(t - 1) % NOMBRES_TEMPORADA.length]);
// sin servidor: lo que se puede saber con la fecha
function tempLocal() {
  const hoy = new Date(diaHoy() + 'T12:00:00Z'), base = Date.UTC(2026, 9, 26, 12), dias = Math.floor((hoy - base) / 864e5);
  const t = Math.max(1, Math.floor(dias / 42) + 1), fin = base + 42 * t * 864e5;
  return { temporada: t, dias: Math.round((fin - hoy) / 864e5), evento: (Math.floor(dias / 7) % 2 + 2) % 2 === 0 ? 'doble' : 'remontada', puntos: 0, jugadas: 0, liga: 'bronce', lista: [], local: true };
}
function tempPide() {
  if (TEMP.pidiendo) return TEMP.pidiendo;
  if (!RFRED.conSesion()) { TEMP.d = TEMP.d || tempLocal(); return Promise.resolve(TEMP.d); }
  TEMP.pidiendo = Promise.resolve(RFRED.rpc('rouflage_liga', {})).then(d => { TEMP.d = d || tempLocal(); tempTarjeta(); if (TEMP.d.premio) tempPremio(TEMP.d.premio); return TEMP.d; })
    .catch(() => { TEMP.d = TEMP.d || tempLocal(); return TEMP.d; }).finally(() => { TEMP.pidiendo = null; });
  return TEMP.pidiendo;
}
// la tarjeta del título: tu liga, los días que quedan y lo que falta para la siguiente
function tempTarjeta() {
  const d = TEMP.d || tempLocal(), l = ligaDe(d.liga), i = LIGAS.indexOf(l), sig = LIGAS[i + 1];
  E('tit-tem-n').textContent = tr('TEMPORADA {n}', { n: d.temporada });
  E('tit-tem-t').textContent = tr('Liga {l} · {d} días', { l: tr(l.n).toLowerCase().replace(/^./, c => c.toUpperCase()), d: Math.max(0, d.dias) });
  E('tit-tem-b').style.width = (sig ? Math.round(Math.min(1, (d.puntos - l.min) / (sig.min - l.min)) * 100) : 100) + '%';
  E('tit-tem-b').style.background = l.col;
}
const eventoTexto = d => d.evento === 'doble'
  ? { t: tr('FIN DE SEMANA DOBLE'), s: tr('Sábado y domingo, ganar en BUSCAR PARTIDA da el doble de puntos de liga.') }
  : { t: tr('SEMANA DE LA REMONTADA'), s: tr('Toda la semana, perder solo quita 5 puntos de liga.') };

/* ---------- la pantalla ---------- */
async function abreTemporada() { pantalla('p-temporada'); tempPinta(); await tempPide(); tempPinta(); }
function tempPinta() {
  const d = TEMP.d || tempLocal(), l = ligaDe(d.liga), i = LIGAS.indexOf(l), sig = LIGAS[i + 1];
  E('tem-cab').textContent = tr('TEMPORADA {n} · QUEDAN {d} DÍAS', { n: d.temporada, d: Math.max(0, d.dias) });
  E('tem-nombre').textContent = nombreTemporada(d.temporada);
  const fila = E('tem-ligas'); fila.innerHTML = '';
  for (const k of LIGAS) {
    const b = document.createElement('div'); b.className = 'tem-liga' + (k === l ? ' tuya' : LIGAS.indexOf(k) < i ? ' pasada' : '');
    b.style.setProperty('--col', k.col); b.innerHTML = '<b></b><small></small>';
    b.children[0].textContent = tr(k.n); b.children[1].textContent = k === l ? tr('TÚ') : String(k.min); fila.appendChild(b);
  }
  E('tem-puntos').textContent = tr('{n} puntos', { n: d.puntos });
  E('tem-falta').textContent = sig ? tr('{n} para {l}', { n: sig.min - d.puntos, l: tr(sig.n) }) : tr('¡Liga más alta!');
  E('tem-barra').style.width = (sig ? Math.round(Math.min(1, (d.puntos - l.min) / (sig.min - l.min)) * 100) : 100) + '%'; E('tem-barra').style.background = l.col;
  E('tem-tabla-t').textContent = d.local ? tr('JUEGA BUSCAR PARTIDA PARA ENTRAR EN LA LIGA') : tr('TU LIGA · VAS {p}.º', { p: d.puesto || 1 });
  const tabla = E('tem-tabla'); tabla.innerHTML = '';
  (d.lista || []).forEach((x, n) => {
    const f = document.createElement('div'); f.className = 'tem-pos' + (x.yo ? ' yo' : ''); f.innerHTML = '<span></span><b></b><i></i>';
    f.children[0].textContent = n + 1; f.children[1].textContent = x.yo ? tr('{n} (tú)', { n: x.nombre }) : x.nombre; f.children[2].textContent = x.puntos; tabla.appendChild(f);
  });
  if (!(d.lista || []).length) { const p = document.createElement('p'); p.className = 'tem-vacia'; p.textContent = tr('Aún no hay nadie en tu liga esta temporada. ¡Sé el primero!'); tabla.appendChild(p); }
  const ev = eventoTexto(d); E('tem-ev-t').textContent = ev.t; E('tem-ev-s').textContent = ev.s;
  E('tem-premio-s').textContent = tr('{g} gotas{a} si acabas en {l}', { g: [150, 400, 800, 1500, 2500][i], a: [0, 0, 30, 60, 120][i] ? ' + ' + tr('{n} Acciones', { n: [0, 0, 30, 60, 120][i] }) : '', l: tr(l.n) });
}
// el premio de la temporada que acabó: se cobra una vez
function tempPremio(p) {
  if (!p || visible('p-ligapremio')) return;
  const l = ligaDe(p.liga);
  E('lp-titulo').textContent = tr('¡TEMPORADA {n} TERMINADA!', { n: p.temporada });
  E('lp-sub').textContent = tr('Acabaste en la liga {l}. Tu premio:', { l: tr(l.n) });
  E('lp-premio').textContent = tr('{n} Gotas', { n: p.gotas }) + (p.acciones ? ' + ' + tr('{n} Acciones', { n: p.acciones }) : '');
  E('lp-premio').style.color = l.col;
  setTimeout(() => { if (visible('p-titulo')) pantalla('p-ligapremio'); }, 900);
}
async function tempCobra() {
  try { await RFS.llama('rf_liga_cobrar'); play('crown'); avisa(tr('¡Premio de temporada cobrado!'), 'bueno'); TEMP.d && (TEMP.d.premio = null); }
  catch (e) { RFS.error(e); }
  irTitulo();
}

/* ---------- las ofertas del día, en la tienda ---------- */
async function ofertasPinta() {
  const caja = E('tienda-hoy'); if (!caja) return;
  if (!RFS.activo()) { caja.hidden = true; return; }
  if (!TEMP.ofertas || TEMP.ofertas.dia !== diaHoy()) { try { TEMP.ofertas = await RFRED.rpc('rouflage_ofertas', {}); } catch (_) { caja.hidden = true; return; } }
  const o = TEMP.ofertas, lista = E('tienda-hoy-lista'); caja.hidden = !(o && o.lista && o.lista.length);
  if (caja.hidden) return;
  const h = Math.floor(o.quedan / 3600), m = Math.floor((o.quedan % 3600) / 60);
  E('tienda-hoy-t').textContent = tr('Cambian en {h} h {m} min', { h, m });
  lista.innerHTML = '';
  for (const of of o.lista) {
    const [cat, id] = of.pieza.split(':'), it = arItem(cat, id); if (!it) continue;
    const tengo = of.tengo || arTiene(cat, it);
    const d = document.createElement('div'); d.className = 'tn-tarjeta oferta hoy';
    const k = arLienzo(54, 54); arPinta(k, (c, w) => it.x(c, w)); d.appendChild(k);
    const t = document.createElement('div'); t.className = 'tn-texto'; t.innerHTML = '<b></b><small></small>'; t.children[0].textContent = tr(it.n); t.children[1].textContent = tengo ? tr('YA ES TUYO') : tr('−30 % solo hoy'); d.appendChild(t);
    const bs = document.createElement('div'); bs.className = 'tn-dos';
    for (const [mon, n] of [['acciones', of.pa], ['gotas', of.pg]]) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'boton peq tn-boton'; b.disabled = tengo;
      b.appendChild(iconoPeq(ICONO_MONEDA[mon], 20)); const s = document.createElement('span'); s.textContent = String(n); b.appendChild(s);
      b.onclick = () => ofertaCompra(of.pieza, mon, n, tr(it.n));
      bs.appendChild(b);
    }
    d.appendChild(bs); lista.appendChild(d);
  }
}
async function ofertaCompra(pieza, moneda, n, nombre) {
  if ((SAVE[moneda] || 0) < n) { play('deny'); if (moneda === 'acciones') avisa(tr('No tienes bastantes Acciones'), 'malo'); else avisa(tr('Te faltan gotas: juega partidas y recoge el premio diario'), 'malo'); return; }
  try { await RFS.llama('rf_oferta_comprar', { p_pieza: pieza, p_moneda: moneda }); play('crown'); avisa(tr('¡Comprado! {c}', { c: nombre }), 'bueno'); TEMP.ofertas = null; tiendaPinta(); }
  catch (e) { RFS.error(e); }
}

function preparaTemporada() {
  for (const id of ['p-temporada', 'p-ligapremio']) if (!PANTALLAS.includes(id)) PANTALLAS.push(id);
  E('b-temporada').onclick = () => { play('select'); abreTemporada(); };
  E('b-tem-volver').onclick = () => { play('select'); irTitulo(); };
  E('b-tem-ofertas').onclick = () => { play('select'); abreTienda('titulo'); };
  E('b-lp-cobrar').onclick = tempCobra;
  const pinta = tiendaPinta; tiendaPinta = () => { pinta(); ofertasPinta(); };
  tempTarjeta(); setTimeout(tempPide, 2500);
}
