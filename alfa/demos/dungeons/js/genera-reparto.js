// Fans of Dungeons · Lo que se coloca en una planta ya dibujada: puertas, escaleras (la salida siempre lejos de la llegada),
// la comprobación de que todo se recorre, las salas especiales (jefe, tesoro con llave, tienda, descanso), trampas, enemigos
// según el presupuesto, cofres, objetos sueltos, monedas y muebles. generaPlanta() junta las recetas y esto.
'use strict';

// genera la planta n de una partida con semilla s; devuelve { m, enemigos, objetos } (o null si no sale bien: se reintenta)
function generaPlanta(planta, semillaPartida, intento = 0) {
  const d = dados((semillaPartida + planta * 7919 + intento * 104729) | 0);
  const zona = zonaDe(planta), Z = ZONAS[zona], P = PLANTAS[planta] || PLANTAS[13];
  const m = nuevoMapa(P.w, P.h, zona, planta);
  if (Z.receta === 'cuevas') generaCuevas(m, d); else generaSalas(m, d);
  if (m.salas.length < 3) return intento < 8 ? generaPlanta(planta, semillaPartida, intento + 1) : null;
  const out = { m, enemigos: [], objetos: [] };
  ponPuertas(m, d);
  // llegada y salida: la salida en la sala más lejana a pie
  const normales = m.salas.filter(s => s.tipo !== 'hueco');
  const llegadaSala = d.elige(normales.length ? normales : m.salas);
  m.llegada = { x: llegadaSala.cx, y: llegadaSala.cy }; llegadaSala.tipo = 'llegada';
  let campo = campoM(m, [[m.llegada.x, m.llegada.y]]);
  let lejos = null, mejor = -1;
  for (const s of m.salas) { if (s === llegadaSala) continue; const k = campo[s.cy * m.w + s.cx]; if (k > mejor) { mejor = k; lejos = s; } }
  if (!lejos || mejor < 12) {   // alguna sala no se alcanza o todo está demasiado cerca: un pasillo más y otra vez
    for (const s of m.salas) if (campo[s.cy * m.w + s.cx] < 0) pasillo(m, llegadaSala.cx, llegadaSala.cy, s.cx, s.cy, d);
    campo = campoM(m, [[m.llegada.x, m.llegada.y]]);
    mejor = -1; for (const s of m.salas) { if (s === llegadaSala) continue; const k = campo[s.cy * m.w + s.cx]; if (k > mejor) { mejor = k; lejos = s; } }
    if (!lejos || mejor < 8) return intento < 8 ? generaPlanta(planta, semillaPartida, intento + 1) : null;
  }
  m.salida = { x: lejos.cx, y: lejos.cy }; lejos.tipo = P.jefe ? 'jefe' : 'salida';
  ponM(m, m.llegada.x, m.llegada.y, T.LLEGADA); ponM(m, m.salida.x, m.salida.y, T.SUBIDA);
  // salas especiales, de entre las que quedan (nunca la de llegada ni la de salida)
  const libres = d.baraja(m.salas.filter(s => s.tipo === 'normal' || s.tipo === 'cripta'));
  if (libres.length && d.prob(0.6)) { const s = libres.pop(); s.tipo = 'tesoro'; preparaTesoro(m, s, d, planta, out); }
  if (libres.length && (P.tienda || d.prob(0.35))) { const s = libres.pop(); s.tipo = 'tienda'; preparaTienda(m, s, d, planta, out); }
  if (libres.length && planta >= 5 && d.prob(0.25)) { const s = libres.pop(); s.tipo = 'descanso'; preparaDescanso(m, s, d); }
  if (libres.length && planta >= 2 && d.prob(0.45)) { const s = libres.pop(); s.tipo = 'altar'; preparaAltar(m, s, d); }
  if (libres.length && planta >= 2 && d.prob(0.3)) { const s = libres.pop(); s.tipo = 'prision'; preparaPrision(m, s, d, planta, out); }
  if (libres.length && d.prob(0.3)) { const s = libres.pop(); s.tipo = 'biblioteca'; preparaBiblioteca(m, s, d, planta, out); }
  if (libres.length && planta >= 3 && planta !== PLANTA_FINAL && d.prob(0.25)) {
    const s = libres.pop(); s.tipo = 'maldita'; preparaMaldita(m, s, d);
    const c = casillasDe(m, s, T.ALFOMBRA).sort((a, b) => pasos(a[0], a[1], s.cx, s.cy) - pasos(b[0], b[1], s.cx, s.cy))[0];
    if (c) out.objetos.push({ x: c[0], y: c[1], obj: { id: 'cofre', maldito: true } });
  }
  // la comprobación final de que todo se recorre (la sala de tesoro cerrada no puede cortar el paso a nada)
  const tesoro = m.salas.find(s => s.tipo === 'tesoro');
  if (!todoComunicado(m)) {
    if (tesoro && tesoro.cerrada) { abreTesoro(m, tesoro); out.llave = false; }
    if (!todoComunicado(m)) return intento < 8 ? generaPlanta(planta, semillaPartida, intento + 1) : null;
  }
  campo = campoM(m, [[m.llegada.x, m.llegada.y]]);
  // trampas, enemigos, botín y muebles
  ponTrampas(m, d, P, llegadaSala);
  ponEnemigos(m, d, P, Z, planta, llegadaSala, campo, out);
  ponMiniJefe(m, d, P, Z, planta, campo, out);
  ponBotin(m, d, P, planta, llegadaSala, out);
  ponMuebles(m, d, out);
  ponRompibles(m, d, planta, out);
  for (let k = 0; k < m.w * m.h; k++) if (m.t[k] === T.SUELO) m.v[k] = d.prob(0.03) ? 3 : d.entre(0, 2);
  return out;
}

// puertas donde un pasillo entra en una sala: la casilla de fuera, pegada al borde, con muro a los dos lados
function ponPuertas(m, d) {
  for (const s of m.salas) {
    if (s.tipo === 'hueco') continue;
    let puestas = 0;
    const candidatas = [];
    for (let x = s.x; x < s.x + s.w; x++) { candidatas.push([x, s.y - 1, 0, 1]); candidatas.push([x, s.y + s.h, 0, -1]); }
    for (let y = s.y; y < s.y + s.h; y++) { candidatas.push([s.x - 1, y, 1, 0]); candidatas.push([s.x + s.w, y, -1, 0]); }
    for (const [x, y, dx, dy] of d.baraja(candidatas)) {
      if (enM(m, x, y) !== T.SUELO || puestas >= 4) continue;
      const lado1 = enM(m, x + dy, y + dx), lado2 = enM(m, x - dy, y - dx);   // los dos lados, perpendiculares
      if (lado1 !== T.MURO || lado2 !== T.MURO) continue;
      if (enM(m, x - dx, y - dy) !== T.SUELO) continue;   // tiene que seguir pasillo por fuera
      ponM(m, x, y, T.PUERTA); puestas++;
    }
  }
}
// la sala de tesoro: alfombra, puertas cerradas con llave, dos o tres objetos buenos y un cofre; la llave en otra sala
function preparaTesoro(m, s, d, planta, out) {
  for (let j = s.y; j < s.y + s.h; j++) for (let i = s.x; i < s.x + s.w; i++) if (enM(m, i, j) === T.SUELO) ponM(m, i, j, T.ALFOMBRA);
  let cerradas = 0;
  for (let x = s.x - 1; x <= s.x + s.w; x++) for (const y of [s.y - 1, s.y + s.h]) if (enM(m, x, y) === T.PUERTA) { ponM(m, x, y, T.PUERTA_CERRADA); cerradas++; }
  for (let y = s.y - 1; y <= s.y + s.h; y++) for (const x of [s.x - 1, s.x + s.w]) if (enM(m, x, y) === T.PUERTA) { ponM(m, x, y, T.PUERTA_CERRADA); cerradas++; }
  const sitios = d.baraja(casillasDe(m, s, T.ALFOMBRA));   // (antes buscaba suelo y la alfombra ya lo había tapado: la sala salía vacía)
  for (let i = 0; i < Math.min(3, sitios.length); i++) { const [x, y] = sitios[i]; out.objetos.push({ x, y, obj: i === 0 ? { id: 'cofre', contenido: generaObjeto(planta, d, null, 2) } : generaObjeto(planta, d, null, 1) }); }
  if (cerradas) out.llave = true;   // la llave se coloca con el botín, en otra sala
  s.cerrada = cerradas > 0;
}
// la tienda: el puesto de Lola (70 %) o la máquina de Phony, pegado a una pared de la sala, sobre alfombra
function preparaTienda(m, s, d, planta, out) {
  const cas = casillasDe(m, s, T.SUELO).filter(([x, y]) => enM(m, x, y - 1) === T.MURO && pasableM(m, x, y + 1) && pasableM(m, x - 1, y) && pasableM(m, x + 1, y));
  const sitio = cas.length ? d.elige(cas) : [s.cx, s.cy];
  const lola = d.prob(0.7);
  ponM(m, sitio[0], sitio[1], lola ? T.PUESTO : T.MAQUINA);
  for (let j = s.y; j < s.y + s.h; j++) for (let i = s.x; i < s.x + s.w; i++) if (enM(m, i, j) === T.SUELO) ponM(m, i, j, T.ALFOMBRA2);
  out.tienda = { x: sitio[0], y: sitio[1], lola, oferta: generaTienda(planta, d, lola) };
}
// la sala de descanso: una cafetera que recupera una vez
function preparaDescanso(m, s, d) {
  const cas = casillasDe(m, s, T.SUELO).filter(([x, y]) => enM(m, x, y - 1) === T.MURO && pasableM(m, x, y + 1));
  const sitio = cas.length ? d.elige(cas) : [s.cx, s.cy];
  ponM(m, sitio[0], sitio[1], T.CAFETERA);
}
// la sala del altar: una ofrenda, una mejora a elegir entre tres
function preparaAltar(m, s, d) {
  const cas = casillasDe(m, s, T.SUELO).filter(([x, y]) => enM(m, x, y - 1) === T.MURO && pasableM(m, x, y + 1) && pasableM(m, x - 1, y) && pasableM(m, x + 1, y));
  const sitio = cas.length ? d.elige(cas) : [s.cx, s.cy];
  ponM(m, sitio[0], sitio[1], T.ALTAR);
}
// ¿se llega desde la llegada a la salida y a todas las salas (menos la de tesoro cerrada)?
function todoComunicado(m) {
  const campo = campoM(m, [[m.llegada.x, m.llegada.y]]);
  if (campo[m.salida.y * m.w + m.salida.x] < 0) return false;
  for (const s of m.salas) if (campo[s.cy * m.w + s.cx] < 0 && !(s.tipo === 'tesoro' && s.cerrada)) return false;
  return true;
}
// la sala de tesoro se queda abierta (sus puertas, normales) cuando cerrarla cortaba el paso
function abreTesoro(m, s) {
  for (let y = s.y - 1; y <= s.y + s.h; y++) for (let x = s.x - 1; x <= s.x + s.w; x++) if (enM(m, x, y) === T.PUERTA_CERRADA) ponM(m, x, y, T.PUERTA);
  s.cerrada = false;
}
const casillasDe = (m, s, t) => { const out = []; for (let j = s.y; j < s.y + s.h; j++) for (let i = s.x; i < s.x + s.w; i++) if (enM(m, i, j) === t) out.push([i, j]); return out; };

// trampas escondidas en el suelo (nunca en la sala de llegada ni en una puerta)
function ponTrampas(m, d, P, llegadaSala) {
  const tipos = ['chispas', 'reunion', 'alarma', 'montacargas'];
  let puestas = 0;
  for (let n = 0; n < 200 && puestas < P.trampas; n++) {
    const x = d.entre(1, m.w - 2), y = d.entre(1, m.h - 2);
    if (enM(m, x, y) !== T.SUELO || salaEn(m, x, y) === llegadaSala) continue;
    if (m.trampas.has(clave(x, y))) continue;
    let puertaCerca = false;
    for (const [dx, dy] of DIRS) if (enM(m, x + dx, y + dy) === T.PUERTA || enM(m, x + dx, y + dy) === T.PUERTA_CERRADA) puertaCerca = true;
    if (puertaCerca) continue;
    m.trampas.set(clave(x, y), { tipo: d.elige(tipos), vista: false }); puestas++;
  }
}
// los enemigos: se gasta el presupuesto con los tipos de la zona; nunca a menos de 6 pasos de la llegada. Jefe en su sala
function ponEnemigos(m, d, P, Z, planta, llegadaSala, campo, out) {
  const ocupadas = new Set([clave(m.llegada.x, m.llegada.y), clave(m.salida.x, m.salida.y), ...out.enemigos.map(e => clave(e.x, e.y)), ...out.objetos.map(o => clave(o.x, o.y))]);
  const libre = (x, y) => (enM(m, x, y) === T.SUELO || enM(m, x, y) === T.ALFOMBRA) && !ocupadas.has(clave(x, y)) && campo[y * m.w + x] >= 6 && !m.trampas.has(clave(x, y));
  let presupuesto = P.presupuesto, intentos = 0;
  const pesos = {}; for (const t of Z.enemigos) pesos[t] = ENEMIGOS[t].coste === 1 ? 4 : ENEMIGOS[t].coste <= 2 ? 3 : 2;
  while (presupuesto > 0 && intentos++ < 400) {
    const tipo = d.pesado(pesos), E = ENEMIGOS[tipo];
    if (E.coste > presupuesto && presupuesto < 2) break;
    const s = d.elige(m.salas);
    if (s.tipo === 'llegada' || s.tipo === 'tienda' || s.tipo === 'descanso' || s.tipo === 'jefe' || s.tipo === 'maldita' || s.tipo === 'prision') continue;
    const cas = casillasDe(m, s, s.tipo === 'tesoro' ? T.ALFOMBRA : T.SUELO).filter(([x, y]) => libre(x, y));
    if (!cas.length) continue;
    const [x, y] = d.elige(cas);
    const elite = tipo !== 'cajabotin' && d.prob(P.elites);
    out.enemigos.push({ tipo: elite && Z.elite !== tipo && d.prob(0.5) ? Z.elite : tipo, x, y, elite, sala: s });
    ocupadas.add(clave(x, y));
    presupuesto -= E.coste + (elite ? 2 : 0);
  }
  // el elite del Cementerio (cosido) y del Foro también salen sueltos de vez en cuando
  if (P.jefe) {
    const s = m.salas.find(q => q.tipo === 'jefe');
    const cas = casillasDe(m, s, T.SUELO).filter(([x, y]) => libre(x, y) && pasos(x, y, m.salida.x, m.salida.y) >= 2);
    const [x, y] = cas.length ? d.elige(cas) : [m.salida.x + 1, m.salida.y];
    out.enemigos.push({ tipo: Z.jefe, x, y, elite: false, jefe: true, sala: s });
    ocupadas.add(clave(x, y));
  }
  out.ocupadas = ocupadas;
}
// cofres, objetos sueltos, monedas y la llave del tesoro
function ponBotin(m, d, P, planta, llegadaSala, out) {
  const ocupadas = out.ocupadas, huecos = [];
  for (const s of m.salas) { if (s.tipo === 'tesoro' || s.tipo === 'jefe') continue; for (const [x, y] of casillasDe(m, s, T.SUELO)) if (!ocupadas.has(clave(x, y)) && !m.trampas.has(clave(x, y))) huecos.push([x, y]); }
  const sitios = d.baraja(huecos);
  const saca = () => sitios.pop();
  for (let i = 0; i < P.cofres && sitios.length; i++) { const [x, y] = saca(); out.objetos.push({ x, y, obj: { id: 'cofre', contenido: generaObjeto(planta, d), mimico: d.prob(0.1) && planta > 1 } }); }
  for (let i = 0; i < P.objetos && sitios.length; i++) { const [x, y] = saca(); out.objetos.push({ x, y, obj: generaObjeto(planta, d) }); }
  const montones = d.entre(3, 6);
  for (let i = 0; i < montones && sitios.length; i++) { const [x, y] = saca(); out.objetos.push({ x, y, obj: { id: 'monedas', n: d.entre(3 + planta * 2, 8 + planta * 4) } }); }
  if (out.llave) {
    // la llave: en un cofre lejos de la sala de tesoro o la lleva un elite (si hay)
    const elite = out.enemigos.find(e => e.elite);
    if (elite && d.prob(0.5)) elite.llave = true;
    else if (sitios.length) { const [x, y] = saca(); out.objetos.push({ x, y, obj: { id: 'llave' } }); }
    else if (out.enemigos.length) out.enemigos[0].llave = true;
  }
}
// muebles dentro de las salas (solo donde no cortan el paso): mesas, archivadores, lápidas, servidores…
function ponMuebles(m, d, out) {
  const ocupadas = new Set(out.ocupadas);
  for (const o of out.objetos) ocupadas.add(clave(o.x, o.y));
  for (const e of out.enemigos) ocupadas.add(clave(e.x, e.y));
  for (const s of m.salas) {
    if (s.tipo === 'llegada' || s.tipo === 'jefe' || s.w < 5 || s.h < 5) continue;
    const n = d.entre(0, Math.min(3, Math.floor(s.w * s.h / 14)));
    for (let i = 0; i < n; i++) {
      const x = d.entre(s.x + 1, s.x + s.w - 2), y = d.entre(s.y + 1, s.y + s.h - 2);
      if (enM(m, x, y) !== T.SUELO || m.trampas.has(clave(x, y)) || ocupadas.has(clave(x, y))) continue;
      if (pasos(x, y, s.cx, s.cy) < 2) continue;
      let cerca = false;
      for (const [dx, dy] of DIRS8) { const t = enM(m, x + dx, y + dy); if (t === T.MUEBLE || t === T.PUERTA || t === T.PUERTA_CERRADA || t === T.SUBIDA || t === T.LLEGADA || t === T.PUESTO || t === T.MAQUINA || t === T.CAFETERA || t === T.ALTAR || t === T.JAULA || t === T.ATRIL) cerca = true; }
      if (cerca) continue;
      ponM(m, x, y, T.MUEBLE); m.v[y * m.w + x] = d.entre(0, 1);
    }
  }
}
