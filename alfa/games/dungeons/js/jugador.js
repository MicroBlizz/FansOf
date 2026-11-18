// Fans of Dungeons · Lo que hace el héroe: moverse (y chocar contra enemigos, puertas, tiendas, cafeteras), esperar, subir,
// pisar trampas, disparar, las tres habilidades (Chaos Jump, Ráfaga, Invocar bug), ir a una casilla tocada paso a paso y
// explorar automático. Cada acción que gasta turno llama a accion().
'use strict';

function intentaMover(dx, dy) {
  const h = J.heroe, m = J.mapa;
  if (J.modo !== 'juego' || h.vida <= 0) return false;
  const x = h.x + dx, y = h.y + dy;
  if (dx) h.izq = dx < 0;
  const q = quienHay(x, y);
  if (q && q.bando === 'enemigo') { ataca(h, q); accion(); return true; }
  if (q && q.bando === 'aliado') { const ax = q.x, ay = q.y; q.x = h.x; q.y = h.y; mueveA(h, ax, ay); accion(); return true; }   // cambian el sitio
  const t = enM(m, x, y);
  if (t === T.PUERTA) { ponM(m, x, y, T.PUERTA_ABIERTA); sonido('puerta'); accion(); return true; }
  if (t === T.PUERTA_CERRADA) {
    if (h.clase === 'slyfox') { ponM(m, x, y, T.PUERTA_ABIERTA); sonido('puerta'); fxChispas(x, y, '#ffd040', 6); log(tr('SlyFox abre la cerradura con su ganzúa. Ni la has visto moverse.'), '#b070f0'); hito('tesoro'); accion(); return true; }
    if (h.llaves > 0) { h.llaves--; ponM(m, x, y, T.PUERTA_ABIERTA); sonido('puerta'); log(tr('Abres la sala de tesoro con la llave.'), '#ffd040'); hito('tesoro'); accion(); return true; }
    log(tr('Cerrada con llave. La llave la tiene alguien de esta planta, o está en un cofre.'), '#ff9aa4'); sonido('error'); return false;
  }
  if (t === T.PUESTO || t === T.MAQUINA) { abreTienda(); return false; }
  if (t === T.ALTAR) { abreAltar(x, y); return false; }
  if (t === T.JAULA) { abreJaula(x, y); return true; }
  if (t === T.ATRIL) { leeAtril(x, y); return true; }
  if (t === T.REJA) { log(tr('Las rejas no se abren hasta que no quede nadie de la emboscada.'), '#ff9aa4'); sonido('error'); return false; }
  if (t === T.ROMPIBLE) { anima(h, 'golpe', 0.3); h.dx += dx * 5; h.dy += dy * 5; rompe(x, y, h); accion(); return true; }
  if (t === T.CAFETERA) {
    const k = clave(x, y);
    if (m.usado[k]) { log(tr('La cafetera está vacía. Como el presupuesto de Microblizz.'), '#ff9aa4'); return false; }
    m.usado[k] = true; h.vida = h.vidaMax; h.cafe = h.cafeMax; fxExplosion(h.x, h.y, 0.7, '#ffe88a'); sonido('cofre');
    log(tr('Café de la sala de descanso: Vida y Café al máximo. Solo una vez.'), '#5fd36a'); accion(); return true;
  }
  if (t === T.MUEBLE) { log(tr('Un mueble te corta el paso. Sirve de parapeto.'), '#8c879a'); return false; }
  if (!pasableM(m, x, y)) return false;
  mueveA(h, x, y); sonido('paso');
  const tp = m.trampas.get(clave(x, y));
  if (tp) pisaTrampa(tp, x, y);
  if (h.vida > 0) cogeDelSuelo(h);
  if (h.vida > 0 && enM(m, x, y) === T.SUBIDA && !h.camino.length) log(tr('La escalera de subida. Toca el botón de subir (o pulsa Intro).'), '#ffd040');
  accion();
  return true;
}
function esperar() { if (J.modo !== 'juego') return; anima(J.heroe, 'quieto'); accion(); }
function subir() {
  const h = J.heroe, m = J.mapa;
  if (J.modo !== 'juego') return;
  if (enM(m, h.x, h.y) !== T.SUBIDA) { const c = caminoM(m, h.x, h.y, m.salida.x, m.salida.y, (x, y) => visM(m, x, y) === 0 || !!quienHay(x, y), 400); if (visM(m, m.salida.x, m.salida.y) && c.length) { h.camino = c; h.explorando = false; } else log(tr('Aún no has visto la escalera de subida.'), '#8c879a'); return; }
  const jefe = J.enemigos.find(e => e.jefe);
  if (jefe) { log(fmt(tr('{j} vigila la escalera. Primero hay que despedirlo.'), { j: tr(jefe.nombre) }), '#ff9aa4'); sonido('error'); return; }
  if (!J.enemigos.length) { hito('limpia'); log(tr('Planta limpia: +monedas de bonificación.'), '#ffd040'); h.monedas += 10 + J.planta * 5; }
  sonido('escalera'); fxExplosion(h.x, h.y, 0.8, '#ffffff');
  subePlanta();
}
function pisaTrampa(tp, x, y) {
  const h = J.heroe;
  tp.vista = true; sonido('trampa');
  if (tp.tipo === 'chispas') { const n = 4 + J.planta * 2; log(fmt(tr('¡Trampa! La alfombra suelta chispas: -{n}.'), { n }), '#ff8a5c'); fxExplosion(x, y, 0.6, '#ffd040'); dana(h, n, 'trampa'); }
  else if (tp.tipo === 'reunion') { log(tr('¡Trampa! Una hoja de reunión pegajosa: pierdes 2 turnos.'), '#ff9aa4'); ponEstado(h, 'bug', 2); }
  else if (tp.tipo === 'alarma') { log(tr('¡Trampa! Suena la alarma: toda la planta sabe dónde estás.'), '#ff9aa4'); for (const e of J.enemigos) { e.despierto = true; e.ultimo = { x: h.x, y: h.y }; } fxExplosion(x, y, 0.5, '#ff4b5c'); }
  else if (tp.tipo === 'montacargas') { log(tr('¡Trampa! Un montacargas averiado te sube a la siguiente planta.'), '#ff9aa4'); fxExplosion(x, y, 0.8, '#4aa3ff'); h.camino = []; subePlanta(); }
  J.mapa.trampas.delete(clave(x, y));
}
// disparar a un enemigo (clases con alcance): hace falta verlo y tenerlo a tiro
function disparaA(e) {
  const h = J.heroe;
  if (h.alcance <= 1) return false;
  if (pasos(h.x, h.y, e.x, e.y) > h.alcance || !veDesde(J.mapa, h.x, h.y, e.x, e.y)) { log(tr('Fuera de alcance o sin línea de tiro.'), '#8c879a'); return false; }
  ataca(h, e); accion(); return true;
}
// la habilidad de la clase
function usaHabilidad() {
  const h = J.heroe, C = CLASES[h.clase], m = J.mapa;
  if (J.modo !== 'juego') return;
  if (h.enfria > 0) { log(fmt(tr('{h}: faltan {n} turnos.'), { h: tr(C.habilidad), n: h.enfria }), '#8c879a'); sonido('error'); return; }
  if (h.cafe < costePoder(h)) { log(fmt(tr('No tienes Café suficiente ({n}).'), { n: costePoder(h) }), '#8c879a'); sonido('error'); return; }
  if (h.clase === 'bunny') {   // Chaos Jump: salta sobre el grupo más grande (hasta 3 casillas) y pega a todos los de alrededor
    let mejor = null, mv = -1;
    for (const e of J.enemigos) { if (visM(m, e.x, e.y) !== 2 || pasos(h.x, h.y, e.x, e.y) > 4) continue; let v = 0; for (const q of J.enemigos) if (rey(q.x, q.y, e.x, e.y) <= 1) v++; if (v > mv) { mv = v; mejor = e; } }
    if (!mejor) { log(tr('No hay nadie cerca sobre quien saltar.'), '#8c879a'); sonido('error'); return; }
    let sitio = null, md = 99;
    for (const [dx, dy] of DIRS8) { const x = mejor.x + dx, y = mejor.y + dy; if (!pasableM(m, x, y) || quienHay(x, y)) continue; const k = pasos(h.x, h.y, x, y); if (k < md) { md = k; sitio = [x, y]; } }
    if (!sitio) { log(tr('No hay sitio donde caer.'), '#8c879a'); return; }
    h.cafe -= costePoder(h); h.enfria = C.enfria;
    fxEstela(h.x, h.y, sitio[0], sitio[1], '#d07040'); h.x = sitio[0]; h.y = sitio[1]; h.camino = [];
    fxExplosion(h.x, h.y, 1.4, '#a8323a'); fxRotulo(tr('¡CHAOS JUMP!'), '#d07040'); TEMBLOR.t = 0.3; TEMBLOR.f = 5; sonido('explosion');
    let n = 0; for (const e of J.enemigos.slice()) if (rey(e.x, e.y, h.x, h.y) <= 1) { ataca(h, e, 1.5, { habilidad: true }); n++; }
    log(fmt(tr('Chaos Jump: aterrizas sobre {n} enemigos.'), { n }), '#d07040');
    const tp = m.trampas.get(clave(h.x, h.y)); if (tp) pisaTrampa(tp, h.x, h.y);
    if (h.vida > 0) cogeDelSuelo(h);
    accion(); return;
  }
  if (h.clase === 'cybermarine') {   // Ráfaga: todos los enemigos en línea recta hasta 5 casillas, hacia el más cercano
    const e0 = enemigoMasCercanoVisible(h);
    if (!e0) { log(tr('No ves a nadie a quien disparar.'), '#8c879a'); sonido('error'); return; }
    const ddx = e0.x - h.x, ddy = e0.y - h.y, dx = Math.abs(ddx) >= Math.abs(ddy) ? Math.sign(ddx) : 0, dy = dx ? 0 : Math.sign(ddy);
    h.cafe -= costePoder(h); h.enfria = C.enfria; if (dx) h.izq = dx < 0;
    let x = h.x, y = h.y, n = 0, fin = null;
    for (let i = 0; i < 5; i++) { x += dx; y += dy; if (opacoM(m, x, y)) break; fin = [x, y]; const q = quienHay(x, y); if (q && q.bando === 'enemigo') { ataca(h, q, 1.3, { habilidad: true }); n++; } }
    if (fin) fxRayo(h.x, h.y, fin[0], fin[1], '#4a9aa8', 2);
    fxRotulo(tr('¡RÁFAGA!'), '#4a9aa8'); sonido('disparo'); anima(h, 'golpe', 0.4);
    log(fmt(tr('Ráfaga: alcanzas a {n} enemigos.'), { n }), '#4a9aa8');
    accion(); return;
  }
  if (h.clase === 'slyfox') { h.cafe -= costePoder(h); h.enfria = C.enfria; esfumarse(h); accion(); return; }
  if (h.clase === 'necrolord') {   // Invocar bug: de los restos más cercanos que veas
    let mejor = null, md = 99;
    for (const r of J.restos) { if (visM(m, r.x, r.y) !== 2) continue; const k = pasos(h.x, h.y, r.x, r.y); if (k < md) { md = k; mejor = r; } }
    const bugs = J.aliados.filter(a => a.fig === 'bug');
    if (bugs.length >= BUGS_MAX) {   // con los tres bugs ya en pie, el Poder los repara del todo
      h.cafe -= costePoder(h); h.enfria = C.enfria;
      for (const b of bugs) { b.vida = b.vidaMax; fxExplosion(b.x, b.y, 0.5, '#6aa878'); fxNumero(b.x, b.y, tr('reparado'), '#5fd36a'); }
      sonido('curar'); anima(h, 'golpe', 0.4); log(tr('Ya tienes tres bugs: el Poder los repara del todo.'), '#6aa878'); accion(); return;
    }
    const deLaNada = !mejor;   // sin restos a la vista, el bug sale a tu lado
    if (deLaNada) mejor = { x: h.x, y: h.y };
    let sitio = deLaNada || quienHay(mejor.x, mejor.y) ? null : [mejor.x, mejor.y];
    if (!sitio) for (const [dx, dy] of DIRS8) { const x = mejor.x + dx, y = mejor.y + dy; if (pasableM(m, x, y) && !quienHay(x, y)) { sitio = [x, y]; break; } }
    if (!sitio) { log(tr('No hay sitio para el bug.'), '#8c879a'); return; }
    h.cafe -= costePoder(h); h.enfria = C.enfria;
    if (!deLaNada) J.restos.splice(J.restos.indexOf(mejor), 1);
    const bug = nuevoAliado('bug', sitio[0], sitio[1], 999, h); bug.fiel = true; J.aliados.push(bug);
    fxExplosion(sitio[0], sitio[1], 0.8, '#6aa878'); fxRotulo(tr('¡BUG INVOCADO!'), '#6aa878'); sonido('invocar'); anima(h, 'golpe', 0.4);
    log(deLaNada ? tr('Sin restos cerca, el bug sale de tu propio código. Te seguirá para siempre (hasta 3 bugs).') : tr('Un bug se levanta de los restos. Te seguirá para siempre (hasta 3 bugs).'), '#6aa878');
    accion(); return;
  }
}

// ir a una casilla tocada: paso a paso, un turno por paso; se corta si aparece un enemigo o te hacen daño
function caminoHasta(tx, ty) {
  const h = J.heroe, m = J.mapa;
  if (J.modo !== 'juego') return;
  if (tx === h.x && ty === h.y) { if (enM(m, h.x, h.y) === T.SUBIDA) subir(); else esperar(); return; }
  const q = quienHay(tx, ty);
  if (q && q.bando === 'enemigo' && visM(m, tx, ty) === 2) {
    if (rey(h.x, h.y, tx, ty) <= 1) { h.camino = []; intentaMover(Math.sign(tx - h.x), Math.sign(ty - h.y)); return; }
    if (h.alcance > 1 && pasos(h.x, h.y, tx, ty) <= h.alcance && veDesde(m, h.x, h.y, tx, ty)) { h.camino = []; disparaA(q); return; }
  }
  if (visM(m, tx, ty) === 0) { log(tr('Ahí todavía no has mirado.'), '#8c879a'); return; }
  if (rey(h.x, h.y, tx, ty) <= 1 && pasos(h.x, h.y, tx, ty) === 1) { h.camino = []; intentaMover(tx - h.x, ty - h.y); return; }
  const c = caminoM(m, h.x, h.y, tx, ty, (x, y) => visM(m, x, y) === 0 || (quienHay(x, y) && !(x === tx && y === ty)) || (m.trampas.has(clave(x, y)) && m.trampas.get(clave(x, y)).vista), 500);
  if (!c.length) { log(tr('No hay camino hasta ahí (por lo que has visto).'), '#8c879a'); return; }
  // con enemigos a la vista, el primer toque solo enseña la ruta: el segundo, en la misma casilla, la confirma
  if (c.length > 1 && enemigosALaVista().size && !(J.ruta && J.ruta.x === tx && J.ruta.y === ty)) {
    J.ruta = { x: tx, y: ty, c };
    if (!J.avisoRuta) { J.avisoRuta = true; log(tr('Hay enemigos cerca: toca otra vez la misma casilla para ir.'), '#c8a040'); }
    sonido('coger'); return;
  }
  J.ruta = null;
  h.camino = c; h.explorando = false; J.vistos = enemigosALaVista();
}
function enemigosALaVista() { const s = new Set(); for (const e of J.enemigos) if (visM(J.mapa, e.x, e.y) === 2) s.add(e); return s; }
// un paso del camino pendiente (lo llama el bucle cada poco)
function pasoCamino() {
  const h = J.heroe;
  if (!h.camino.length || J.modo !== 'juego') { h.camino = []; return; }
  const vida = h.vida, [x, y] = h.camino.shift();
  const dx = x - h.x, dy = y - h.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1 || !intentaMover(dx, dy)) { h.camino = []; h.explorando = false; return; }
  if (h.x !== x || h.y !== y) h.camino.unshift([x, y]);   // ha abierto una puerta (o pegado): el paso sigue pendiente
  // se para si asoma un enemigo nuevo, si te han hecho daño o si el camino ya no vale
  for (const e of J.enemigos) if (visM(J.mapa, e.x, e.y) === 2 && !(J.vistos && J.vistos.has(e))) { h.camino = []; if (h.explorando) log(fmt(tr('Ves a {e}.'), { e: tr(e.nombre) }), '#ff9aa4'); h.explorando = false; return; }
  if (h.vida < vida) { h.camino = []; h.explorando = false; return; }
  if (!h.camino.length && h.explorando) explorar();   // sigue explorando hasta que no quede nada
}
// explorar automático: camina hasta lo más cercano sin ver; sin nada que ver, va a la escalera
function explorar() {
  const h = J.heroe, m = J.mapa;
  if (J.modo !== 'juego') return;
  for (const e of J.enemigos) if (visM(m, e.x, e.y) === 2) { log(tr('Hay enemigos a la vista: explorar es mala idea.'), '#ff9aa4'); h.explorando = false; return; }
  const campo = campoM(m, [[h.x, h.y]], 300, (x, y) => !!quienHay(x, y) || (m.trampas.has(clave(x, y)) && m.trampas.get(clave(x, y)).vista));
  let mejor = null, md = 9999;
  for (let y = 1; y < m.h - 1; y++) for (let x = 1; x < m.w - 1; x++) {
    const k = campo[y * m.w + x];
    if (k < 0 || k >= md || !visM(m, x, y) || !(pasableM(m, x, y) || enM(m, x, y) === T.PUERTA)) continue;
    let frontera = false;
    for (const [dx, dy] of DIRS) if (visM(m, x + dx, y + dy) === 0 && enM(m, x + dx, y + dy) !== T.MURO) frontera = true;
    if (frontera) { md = k; mejor = [x, y]; }
  }
  if (!mejor) {
    const objetos = J.objetos.filter(o => visM(m, o.x, o.y) && campo[o.y * m.w + o.x] >= 0 && !(o.x === h.x && o.y === h.y));
    if (objetos.length) { objetos.sort((a, b) => campo[a.y * m.w + a.x] - campo[b.y * m.w + b.x]); mejor = [objetos[0].x, objetos[0].y]; }
    else if (visM(m, m.salida.x, m.salida.y) && !(h.x === m.salida.x && h.y === m.salida.y)) { mejor = [m.salida.x, m.salida.y]; log(tr('No queda nada por ver: vas a la escalera.'), '#8c879a'); }
    else { log(tr('No queda nada por explorar en esta planta.'), '#8c879a'); h.explorando = false; return; }
  }
  const c = caminoM(m, h.x, h.y, mejor[0], mejor[1], (x, y) => !!quienHay(x, y) || (m.trampas.has(clave(x, y)) && m.trampas.get(clave(x, y)).vista), 500);
  if (!c.length) { h.explorando = false; return; }
  h.camino = c; h.explorando = true; J.vistos = enemigosALaVista();
}
// abrir la tienda que hay al lado (el puesto o la máquina)
function abreTienda() {
  if (!J.tienda) { log(tr('Cerrado por vacaciones. Las de Microblizz, no las tuyas.'), '#8c879a'); return; }
  J.panel = { tipo: 'tienda', sel: 0, pestana: 'comprar' }; J.modo = 'panel'; sonido('coger');
  if (J.tienda.lola) { const nuevos = J.tienda.oferta.filter(l => !conocido(l.obj)); for (const l of nuevos) identifica(l.obj, false); if (nuevos.length) log(tr('Lola te dice qué es cada café y cada pergamino. Lola sabe lo que vende.'), '#ffb0e0'); }
  log(J.tienda.lola ? tr('Lola: «Precio de amiga. Y lo que no quieras, te lo compro».') : tr('PayPlus: «Suscríbase para ver los precios. Es broma. O no».'), '#ffb0e0');
}
