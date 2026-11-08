// Fans of Auto · LOS MODERADORES Y LAS BANDAS: quién te persigue y cómo. Los Moderadores (la policía) aparecen fuera de la
// vista según los martillos, van por las calles hasta ti (o hasta donde te vieron por última vez), te embisten si te ven
// cerca, uno te corta el paso por delante con 3 martillos, con 4 ponen barreras, a pie bajan agentes que te banean si te
// tocan, y si te encierran con el coche parado te banean también. Las bandas que te odian te disparan desde la acera en su
// zona y mandan un coche a por ti. Los conductores enfadados bajan a pegarte si les robas el coche.
'use strict';

MODOS_IA.policia = c => pasoPolicia(c);
MODOS_IA.banda = c => pasoCocheBanda(c);
MODOS_PEATON.ataca = p => pasoAtaca(p);

function pasoModeradores() {
  const j = S.jugadores[0], pj = posJugador(j), quiere = j.muerto || j.baneado ? 0 : j.buscado;
  if (S.tick % 45 === 0) aparecenModeradores(j, quiere);
  if (quiere >= 4 && S.tick % 240 === 0) ponBarrera(j, pj);
  if (S.tick % 6 === 0) vigilaVista(j, pj);
  vigilaEncierro(j, pj);
  if (S.tick % 300 === 0) mandaCocheBanda(j, pj);
}
const modsEnCoche = () => S.coches.filter(c => c.policia && !c.chatarra && c.conductor === 'ia' && c.ia && c.ia.modo === 'policia');
function aparecenModeradores(j, quiere) {
  const coches = modsEnCoche().filter(c => c.ia.rol !== 'barrera');
  if (coches.length >= Math.min(5, quiere)) return;
  // primero vuelven a la caza los que patrullaban cerca
  const patrulla = S.coches.find(c => c.policia && !c.chatarra && c.conductor === 'ia' && c.ia && c.ia.modo === 'trafico' && dist(c, j) < 320);
  if (patrulla) { patrulla.ia.modo = 'policia'; patrulla.ia.rol = 'persigue'; return; }
  const s = calleLejos(j, 220, 360);
  if (!s) return;
  const c = nuevoCoche('moderador', s.x, s.y, Math.atan2(s.dy, s.dx), 'ia');
  c.ia.modo = 'policia';
  c.ia.rol = quiere >= 3 && !coches.some(o => o.ia.rol === 'corta') ? 'corta' : 'persigue';
}
// ¿te ve algún Moderador? entonces el buscado no baja y apuntan a donde estás
function vigilaVista(j, pj) {
  if (j.muerto || j.baneado || j.buscado === 0) return;
  const mods = [...modsEnCoche(), ...S.peatones.filter(p => p.banda === 'moderador' && !p.muerto)];
  if (mods.some(m => seVe(m, pj, 220))) { j.visto = 180; S.ultimoVisto = { x: pj.x, y: pj.y }; }
}
// con el coche parado y un Moderador pegado durante dos segundos y medio (o dos durante algo más de uno): baneado
function vigilaEncierro(j, pj) {
  if (j.coche === null || j.buscado === 0 || Math.hypot(pj.vx, pj.vy) > 0.3) { j.encierro = 0; return; }
  const cerca = modsEnCoche().filter(c => dist(c, pj) < 28).length;
  j.encierro = cerca ? (j.encierro || 0) + cerca : 0;
  if (j.encierro > 150) { mensaje(tr('Rodeado: los Moderadores te sacan del coche.')); banea(j); }
}

/* ---------- el coche de un Moderador ---------- */
function pasoPolicia(c) {
  const ia = c.ia, j = S.jugadores[0], pj = posJugador(j);
  if (j.buscado === 0 || j.muerto || j.baneado) { ia.modo = 'trafico'; ia.rol = null; ia.ruta = null; c.sirena = false; return; }
  c.sirena = true;
  if (ia.rol === 'barrera') { pasoBarrera(c, j, pj); return; }
  if (j.coche === null && dist(c, pj) < 60 && seVe(c, pj, 60)) { bajaAgente(c, pj); conduceIA(c, null, 0); return; }
  const destino = ia.rol === 'corta' ? puntoDeCorte(pj) : j.visto > 0 ? pj : S.ultimoVisto || pj;
  const [tx, ty] = casillaDe(destino.x, destino.y), d = dist(c, pj);
  persigue(c, destino, COCHES[c.tipo].vmax * (d > 120 ? 1 : 0.85), campoA(tx, ty, costeCoche));
  if (d < 230 && S.tick % 90 === c.id % 90) play('sirena');
  if (ia.rol === 'corta' && dist(c, destino) < 24) ia.rol = 'persigue';
}
// el que corta el paso va a donde estarás dentro de un segundo, sobre la calzada
function puntoDeCorte(pj) {
  const x = pj.x + (pj.vx || 0) * 60, y = pj.y + (pj.vy || 0) * 60, [tx, ty] = casillaDe(x, y);
  const k = esCalle(tx, ty) ? [tx, ty] : carrilCercano(tx, ty, 4);
  return k ? centroCasilla(k[0], k[1]) : pj;
}
// el agente baja una vez por coche, por el lado que no da a la pared
function bajaAgente(c, pj) {
  if (c.ia.bajado) return;
  c.ia.bajado = true;
  for (const lado of [1, -1]) {
    const x = c.x - Math.sin(c.ang) * 12 * lado, y = c.y + Math.cos(c.ang) * 12 * lado;
    if (!solidoPx(x, y)) { const p = nuevoPeaton(x, y, 'moderador'); p.estado = 'ataca'; p.vida = 20; dice(p, ['¡ALTO! ¡INFRACCIÓN DE LAS NORMAS!', '¡QUEDAS BANEADO!', '¡TICKET DE SOPORTE ABIERTO!']); return; }
  }
}

/* ---------- las barreras (4 martillos o más) ---------- */
// dos coches atravesados en la calle por la que vas, un poco por delante
function ponBarrera(j, pj) {
  if (modsEnCoche().some(c => c.ia.rol === 'barrera')) return;
  const v = Math.hypot(pj.vx || 0, pj.vy || 0);
  if (v < 0.8) return;   // solo si vas lanzado: la barrera se pone donde vas a llegar, no encima de ti
  const k = carrilCercano(...casillaDe(pj.x + pj.vx / v * 190, pj.y + pj.vy / v * 190), 3);
  if (!k || dist(centroCasilla(k[0], k[1]), pj) < 130) return;
  const [dx, dy] = carrilEn(k[0], k[1]), otro = dy !== 0 ? [k[0] + (dy > 0 ? 1 : -1), k[1]] : [k[0], k[1] + (dx > 0 ? -1 : 1)];
  const sitios = [k, otro].filter(([tx, ty]) => esCalle(tx, ty) && hueco(centroCasilla(tx, ty)));
  for (const [tx, ty] of sitios) {
    const c = nuevoCoche('moderador', tx * T + 8, ty * T + 8, dy !== 0 ? 0 : Math.PI / 2, 'ia');
    Object.assign(c.ia, { modo: 'policia', rol: 'barrera', hasta: S.tick + 900 });
  }
  if (sitios.length) mensaje(tr('¡Barrera de Moderadores más adelante!'), 150);
}
function pasoBarrera(c, j, pj) {
  conduceIA(c, null, 0);
  if (dist(c, pj) < 70) bajaAgente(c, pj);
  if (S.tick > c.ia.hasta && dist(c, pj) > 200) c.ia.rol = 'persigue';
}

/* ---------- los que atacan a pie: agentes, bandas y conductores enfadados ---------- */
// la banda decide si ataca: en su zona, si te odia y te ve
function decideBanda(p) {
  const j = S.jugadores[0], pj = posJugador(j), z = ZONA[p.banda], odia = j.respeto[z] < 25 && !j.muerto && !j.baneado;
  if (p.estado === 'pasea' && odia && dist(p, pj) < 150 && zonaEn(...casillaDe(p.x, p.y)) === z && seVe(p, pj, 150)) { p.estado = 'ataca'; p.meta = null; dice(p, ['¡ES ÉL!', '¡A POR EL CONEJO!', '¡NOS DEBE RESPETO!']); }
  else if (p.estado === 'ataca' && (!odia || dist(p, pj) > 240)) p.estado = 'pasea';
}
function pasoAtaca(p) {
  const j = S.jugadores[0], pj = posJugador(j);
  if (j.muerto || j.baneado || (p.cansa && S.tick > p.cansa)) { p.estado = 'pasea'; p.meta = null; return; }
  const d = dist(p, pj), ve = seVe(p, pj, 160);
  if (p.banda === 'moderador') ataqueAgente(p, j, pj, d, ve);
  else if (p.punos) ataquePunos(p, j, pj, d);
  else ataqueBanda(p, pj, d, ve);
}
// andar por el campo de caminos a pie hacia el jugador
function andaHaciaJugador(p, pj, v) {
  if (!andaHacia(p, v)) return;
  const [tx, ty] = casillaDe(pj.x, pj.y), campo = campoA(tx, ty, costePie);
  const s = bajaCampo(campo, ...casillaDe(p.x, p.y));
  p.meta = s ? centroCasilla(s[0], s[1]) : { x: pj.x, y: pj.y };
}
function ataqueAgente(p, j, pj, d, ve) {
  if (j.coche === null && ve && d < 40) { p.meta = { x: pj.x, y: pj.y }; andaHacia(p, 1.15); }
  else andaHaciaJugador(p, pj, j.coche === null ? 1.15 : 0.8);
  if (j.coche === null && d < 9) banea(j);
  if (j.coche !== null && ve && d < 130) dispara1(p, pj, 50);
  if (d > 320) p.cansa = S.tick;
}
function ataqueBanda(p, pj, d, ve) {
  if (!ve || d > 110) andaHaciaJugador(p, pj, 0.9);
  else if (d < 55) { const a = anguloHacia(pj, p); p.meta = { x: p.x + Math.cos(a) * 6, y: p.y + Math.sin(a) * 6 }; if (solidoPx(p.meta.x, p.meta.y)) p.meta = null; else andaHacia(p, 0.7); }
  else p.ang = anguloHacia(p, pj);
  if (ve && d < 130) dispara1(p, pj, 70);
}
// el conductor al que le has robado el coche, si es de los agresivos: a puñetazos durante diez segundos
function ataquePunos(p, j, pj, d) {
  if (j.coche !== null) { p.estado = 'huye'; p.miedo = 120; p.huyeDe = { x: pj.x, y: pj.y }; return; }
  if (d > 10) andaHaciaJugador(p, pj, 1.0);
  else if (p.disparoT === 0) { danaJugador(j, 6); p.disparoT = 40; dice(p, ['¡TOMA!', '¡DEVUÉLVEMELO!']); }
}
function dispara1(p, pj, cada) {
  if (p.disparoT > 0) return;
  p.ang = tiroDesde(p.x, p.y, pj); p.disparoT = cada;
}
// una bala de la IA desde (x, y) hacia el objetivo, con un poco de puntería mala; devuelve el ángulo
function tiroDesde(x, y, obj) {
  const a = Math.atan2(obj.y - y, obj.x - x) + S.az.entre(-0.12, 0.12);
  S.balas.push({ x: x + Math.cos(a) * 6, y: y + Math.sin(a) * 6, dx: Math.cos(a) * 4, dy: Math.sin(a) * 4, t: 45, de: 'ia' });
  if (dist({ x, y }, S.jugadores[0]) < 200) play('pistola');
  return a;
}

/* ---------- el coche de la banda ---------- */
const COCHE_BANDA = [{ tipo: 'helados' }, { tipo: 'granizo' }, { tipo: 'furgon', color: '#5c4f2a' }];
function mandaCocheBanda(j, pj) {
  if (j.muerto || j.baneado || S.coches.some(c => !c.chatarra && c.conductor === 'ia' && c.ia && c.ia.modo === 'banda')) return;
  const z = zonaEn(...casillaDe(pj.x, pj.y));
  if (j.respeto[z] >= 25) return;
  const s = calleLejos(j, 220, 340);
  if (!s) return;
  const B = COCHE_BANDA[z], c = nuevoCoche(B.tipo, s.x, s.y, Math.atan2(s.dy, s.dx), 'ia');
  if (B.color) c.color = B.color;
  Object.assign(c.ia, { modo: 'banda', banda: z, disparoT: 0 });
  mensaje(tr(ZONA_NOMBRE[z]) + tr(' han mandado un coche a por ti.'), 180);
}
function pasoCocheBanda(c) {
  const ia = c.ia, j = S.jugadores[0], pj = posJugador(j), d = dist(c, pj);
  if (j.respeto[ia.banda] >= 25 || j.muerto || j.baneado || d > 420) { ia.modo = 'trafico'; ia.ruta = null; return; }
  const [tx, ty] = casillaDe(pj.x, pj.y);
  persigue(c, pj, COCHES[c.tipo].vmax * 0.9, campoA(tx, ty, costeCoche));
  if (ia.disparoT > 0) ia.disparoT--;
  else if (d < 140 && seVe(c, pj, 140)) { tiroDesde(c.x, c.y, pj); ia.disparoT = 45; }
}
