// Fans of Dungeons · Los objetos: cómo se generan (tipo y rareza según la planta), su nombre, su descripción y su precio, la
// mochila y el equipo del héroe (coger, usar, equipar, soltar) y las tiendas de Lola y de Phony.
'use strict';

const HUECOS = ['arma', 'armadura', 'accesorio'];

// un objeto nuevo para la planta. tipo: 'arma' | 'armadura' | 'accesorio' | 'consumible' | null (al azar); minRar: rareza mínima
function generaObjeto(planta, d, tipo = null, minRar = 0) {
  const P = PLANTAS[planta] || PLANTAS[13];
  if (!tipo) tipo = d.pesado({ consumible: 55, arma: 15, armadura: 15, accesorio: 15 });
  if (tipo === 'consumible') { const id = d.pesado(CONSUMIBLES); return { id: id === 'rinonera' && J.heroe && capacidad(J.heroe) >= MOCHILA_TOPE ? 'cafe_solo' : id, rar: 0 }; }
  const b = P.botin, r = d.f() * 100;
  let rar = r < b[0] ? 0 : r < b[0] + b[1] ? d.entre(1, 2) : d.prob(0.3) ? 4 : 3;
  rar = Math.max(rar, minRar);
  const id = d.elige(tipo === 'arma' ? ARMAS : tipo === 'armadura' ? ARMADURAS : ACCESORIOS);
  const o = { id, rar, mas: 0 };
  if (rar >= 3 || (rar === 2 && d.prob(0.5))) o.ef = efectoAzar(tipo, d);   // los raros pueden traer un efecto especial; los legendarios, siempre
  return o;
}
// la oferta de una tienda: 4 objetos y 2 consumibles, con precio según la planta y el tendero
function generaTienda(planta, d, lola) {
  const oferta = [];
  for (let i = 0; i < 4; i++) oferta.push(generaObjeto(planta, d, d.elige(['arma', 'armadura', 'accesorio']), planta >= 5 ? 1 : 0));
  oferta.push({ id: 'cafe_solo', rar: 0 }, { id: d.pesado({ cafe_hielo: 3, cafe_doble: 2, perg_reestructuracion: 3, perg_auditoria: 2, perg_despido: 1, parche: 2, manzanilla: 3, bomba: 2, descafeinado: 2 }), rar: 0 });
  if (!d.prob(0.5)) oferta.push({ id: 'perg_reestructuracion', rar: 0 });
  if (lola && d.prob(0.4) && !(J.heroe && capacidad(J.heroe) >= MOCHILA_TOPE)) oferta.push({ id: 'rinonera', rar: 0 });
  const ofertaDia = lola ? -1 : d.entre(0, 3);
  return oferta.map((o, i) => ({ obj: o, precio: precioDe(o, planta, lola, i === ofertaDia), oferta: i === ofertaDia, vendido: false }));
}
function precioDe(o, planta, lola = true, ofertaDia = false) {
  const def = OBJETOS[o.id], base = def.precio * RAR_VALOR[o.rar || 0] * (1 + 0.15 * (planta - 1)) * (lola ? 1 : 1.4) * (ofertaDia ? 0.5 : 1);
  return Math.max(1, Math.round(base));
}
const nombreObj = o => { const def = OBJETOS[o.id]; if (!def) return '?'; if (!conocido(o)) return nombreMisterio(o); const r = o.rar || 0; return (o.ef && EFECTOS[o.ef] ? tr(EFECTOS[o.ef].nombre) + ' · ' : '') + (r >= 3 ? tr(def.nombre) + ' ' + tr(RAREZAS[r] === 'Épica' ? 'del CEO' : 'legendario') : tr(def.nombre)) + (o.mas ? ' +' + o.mas : ''); };
// la cifra que da un objeto de equipo en su rareza (atq, def, vision, vidaMax o cafeMax)
function cifraObj(o) {
  const def = OBJETOS[o.id]; if (!def) return null;
  for (const k of ['atq', 'def', 'vision', 'vidaMax', 'cafeMax']) if (def[k]) return { k, v: def[k][o.rar || 0] + (o.mas || 0) };
  return null;
}
function descObj(o) {
  const def = OBJETOS[o.id]; if (!def) return '';
  if (!conocido(o)) return tr('No sabes qué es. Úsalo y lo descubrirás. Lola sabe lo que vende.');
  const c = cifraObj(o);
  const ETQ = { atq: 'Ataque', def: 'Defensa', vision: 'Visión', vidaMax: 'Vida máxima', cafeMax: 'Café máximo' };
  return (c ? '+' + c.v + ' ' + tr(ETQ[c.k]) + ' · ' : '') + (o.ef && EFECTOS[o.ef] ? tr(EFECTOS[o.ef].desc) + ' ' : '') + tr(def.desc);
}

// el héroe coge lo que hay en el suelo de su casilla (lo llama jugador.js al llegar)
function cogeDelSuelo(h) {
  const J_ = J, aqui = J_.objetos.filter(o => o.x === h.x && o.y === h.y);
  for (const o of aqui) {
    const obj = o.obj;
    if (obj.id === 'monedas') { obj.n = Math.round(obj.n * factorMonedas()); h.monedas += obj.n; J_.monedasVistas += obj.n; fxMonedas(h.x, h.y, Math.min(8, obj.n)); log(fmt(tr('+{n} monedas.'), { n: obj.n }), '#ffd040'); sonido('moneda'); quita(o); continue; }
    if (obj.id === 'cofre' && obj.maldito) { abreMaldito(h, o); continue; }
    if (obj.id === 'cofre') { abreCofre(h, o); continue; }
    if (obj.id === 'llave') { h.llaves++; log(tr('Tienes la llave de la sala de tesoro.'), '#ffd040'); sonido('coger'); quita(o); continue; }
    if (mochilaLlena(h, obj)) { log(esConsumible(obj) ? tr('No te caben más cafés ni pergaminos (12). Bebe o suelta alguno.') : tr('La mochila está llena. Suelta algo para coger esto.'), '#ff9aa4'); continue; }
    h.mochila.push(obj); cuenta('objetos'); log(fmt(tr('Coges: {o}.'), { o: nombreObj(obj) }), RAR_COLOR[obj.rar || 0]); sonido('coger'); quita(o);
  }
  function quita(o) { const i = J_.objetos.indexOf(o); if (i >= 0) J_.objetos.splice(i, 1); }
}
// un cofre: se abre al pisarlo; uno de cada diez es una CajaBotín
function abreCofre(h, o) {
  const i = J.objetos.indexOf(o); if (i >= 0) J.objetos.splice(i, 1);
  if (o.obj.mimico) { const e = nuevoEnemigo('cajabotin', h.x, h.y, J.planta, false); e.despierto = true; e.x = h.x; e.y = h.y; sitioLibreCerca(e); J.enemigos.push(e); fxExplosion(h.x, h.y, 0.6, '#ffd040'); log(tr('¡El cofre tenía dientes! Es una CajaBotín.'), '#ff9aa4'); sonido('jefe'); return; }
  const n = D.entre(5 + J.planta * 3, 12 + J.planta * 5);
  h.monedas += n; J.monedasVistas += n; fxMonedas(h.x, h.y, 8); sonido('cofre');
  log(fmt(tr('Abres el cofre: +{n} monedas y {o}.'), { n, o: nombreObj(o.obj.contenido) }), '#ffd040');
  if (mochilaLlena(h, o.obj.contenido)) { J.objetos.push({ x: h.x, y: h.y, obj: o.obj.contenido }); log(tr('La mochila está llena: se queda en el suelo.'), '#ff9aa4'); }
  else h.mochila.push(o.obj.contenido);
  fxExplosion(h.x, h.y, 0.4, '#ffe88a');
}
// mueve una entidad a la casilla libre más cercana (para la CajaBotín que sale de debajo del héroe)
function sitioLibreCerca(e) {
  for (const [dx, dy] of D.baraja(DIRS8)) { const x = e.x + dx, y = e.y + dy; if (pasableM(J.mapa, x, y) && !quienHay(x, y)) { e.x = x; e.y = y; return; } }
}

// usar un objeto de la mochila (índice). Devuelve true si gastó el turno
function usaObjeto(h, i) {
  const o = h.mochila[i]; if (!o) return false;
  const def = OBJETOS[o.id];
  if (def.tipo !== 'consumible') return equipa(h, i);
  const ef = def.efecto;
  identifica(o);
  const rn = usaNuevo(h, def);
  if (rn === false) return false;
  if (rn) { /* descafeinado, manzanilla o bomba */ }
  else if (ef === 'vida') { const n = Math.min(def.valor, h.vidaMax - h.vida); h.vida += n; fxNumero(h.x, h.y, '+' + n, '#5fd36a'); log(fmt(tr('Café solo: curas {n}.'), { n }), '#5fd36a'); }
  else if (ef === 'cafe') { h.cafe = Math.min(h.cafeMax, h.cafe + def.valor); fxNumero(h.x, h.y, '+' + def.valor, '#4aa3ff'); log(tr('Café con hielo: recuperas Café.'), '#4aa3ff'); }
  else if (ef === 'cafeinado') { ponEstado(h, 'cafeinado', def.valor); log(tr('¡Cafeinado! Vas más rápido que los enemigos.'), '#ffd040'); }
  else if (ef === 'quemar') { let n = 0; for (const e of J.enemigos) if (rey(e.x, e.y, h.x, h.y) <= 1) { dana(e, def.valor, 'quemado', h); ponEstado(e, 'quemado', 3); n++; } fxExplosion(h.x, h.y, 0.8, '#ff6a2a'); log(n ? fmt(tr('Café quemado: {n} enemigos arden.'), { n }) : tr('Café quemado: no había nadie cerca. Qué desperdicio.'), '#ff8a5c'); }
  else if (ef === 'despido') { const e = enemigoMasCercanoVisible(h, false); if (!e) { log(tr('No ves a nadie a quien despedir.'), '#ff9aa4'); return false; } log(fmt(tr('¡Despido fulminante! {e} recoge sus cosas.'), { e: tr(e.nombre) }), '#ff4b5c'); fxRayo(h.x, h.y, e.x, e.y, '#ff4b5c'); muere(e, 'despido', h); }
  else if (ef === 'teletransporte') { const s = D.elige(J.mapa.salas.filter(q => q.tipo !== 'jefe')); const cas = suelosDe(J.mapa, s).filter(([x, y]) => !quienHay(x, y)); if (cas.length) { const [x, y] = D.elige(cas); fxExplosion(h.x, h.y, 0.5, '#4aa3ff'); h.x = x; h.y = y; h.camino = []; fxExplosion(x, y, 0.5, '#4aa3ff'); log(tr('Reestructuración: apareces en otra sala.'), '#4aa3ff'); } }
  else if (ef === 'revelar') { const m = J.mapa; for (let k = 0; k < m.t.length; k++) if (m.t[k] !== T.MURO && !m.vis[k]) m.vis[k] = 1; for (const t of m.trampas.values()) t.vista = true; log(tr('Auditoría: el plano de la planta, con sus trampas.'), '#5fd36a'); }
  else if (ef === 'ascenso') { log(tr('Ascenso: subes de planta sin pasar por la escalera.'), '#ffd040'); h.mochila.splice(i, 1); sonido('escalera'); subePlanta(); return true; }
  else if (ef === 'mochila') { if (!amplia(h)) return false; }
  else if (ef === 'parche') { const peor = ['arma', 'armadura'].map(k => h.equipo[k]).filter(Boolean).sort((a, b) => (cifraObj(a) ? cifraObj(a).v : 0) - (cifraObj(b) ? cifraObj(b).v : 0))[0]; if (!peor) { log(tr('No llevas nada que parchear.'), '#ff9aa4'); return false; } peor.mas = (peor.mas || 0) + 1; recalcula(h); log(fmt(tr('Parche aplicado: {o}.'), { o: nombreObj(peor) }), '#5fd36a'); }
  h.mochila.splice(i, 1); sonido('beber'); cuenta('cafes');
  return true;
}
// equipar un objeto de la mochila (cambia con el que lleva, que vuelve a la mochila)
function equipa(h, i) {
  const o = h.mochila[i], def = OBJETOS[o.id];
  if (!HUECOS.includes(def.tipo)) return false;
  if (tieneEstado(h, 'despedido')) { log(tr('Despedido: no puedes tocar el equipo durante unos turnos.'), '#ff9aa4'); return false; }
  const antes = h.equipo[def.tipo];
  h.equipo[def.tipo] = o; h.mochila.splice(i, 1);
  if (antes) h.mochila.push(antes);
  recalcula(h); sonido('equipar');
  log(fmt(tr('Te equipas: {o}.'), { o: nombreObj(o) }), RAR_COLOR[o.rar || 0]);
  return true;
}
function suelta(h, i) {
  const o = h.mochila[i]; if (!o) return false;
  h.mochila.splice(i, 1); J.objetos.push({ x: h.x, y: h.y, obj: o });
  log(fmt(tr('Sueltas: {o}.'), { o: nombreObj(o) }), '#d9d2e0');
  return true;
}
// comprar en la tienda abierta (índice de la oferta)
function compra(h, i) {
  const t = J.tienda, l = t && t.oferta[i];
  if (!l || l.vendido) return;
  if (h.monedas < l.precio) { log(tr('No te llega. Phony ofrece financiación al 99 %.'), '#ff9aa4'); sonido('error'); return; }
  if (mochilaLlena(h, l.obj)) { log(tr('La mochila está llena.'), '#ff9aa4'); sonido('error'); return; }
  h.monedas -= l.precio; l.vendido = true; h.mochila.push(l.obj); sonido('moneda');
  log(fmt(tr('Compras {o} por {n} monedas.'), { o: nombreObj(l.obj), n: l.precio }), '#ffd040');
}
// vender un objeto de la mochila (solo a Lola, a mitad de precio)
function vende(h, i) {
  const o = h.mochila[i]; if (!o || !J.tienda || !J.tienda.lola) return;
  const n = Math.max(1, Math.floor(precioDe(o, J.planta, true) / 2));
  h.monedas += n; h.mochila.splice(i, 1); sonido('moneda');
  log(fmt(tr('Lola te compra {o} por {n} monedas.'), { o: nombreObj(o), n }), '#ffd040');
}
