// Fans of Dungeons · La inteligencia de los enemigos: cada comportamiento (cazador, patrulla, guardián, tirador, cobarde,
// mímico, sanador), cómo buscan al héroe (campo de distancias), cómo huyen y lo que hacen los jefes (invocar, congelar,
// cambiar las reglas, el despido fulminante). Un turno de un enemigo es una sola acción.
'use strict';

// a quién ve: el héroe o un aliado, el más cercano, dentro de su visión y con línea de visión
function objetivoDe(e) {
  const m = J.mapa, cand = [J.heroe, ...J.aliados].filter(c => c && c.vida > 0);
  let mejor = null, md = 999;
  for (const c of cand) {
    if (invisible(c)) continue;   // descafeinado o SlyFox esfumado: no te ven
    const k = pasos(e.x, e.y, c.x, c.y);
    if (k > e.vision || k >= md) continue;
    if (!veDesde(m, e.x, e.y, c.x, c.y)) continue;
    mejor = c; md = k;
  }
  return mejor;
}
// un paso hacia una casilla, por el campo de distancias del héroe si es él, o buscando camino si no
function pasoHacia(e, tx, ty) {
  const m = J.mapa, h = J.heroe;
  let mejor = null;
  if (tx === h.x && ty === h.y && J.campoHeroe) {
    let mk = J.campoHeroe[e.y * m.w + e.x]; if (mk < 0) mk = 9999;
    for (const [dx, dy] of D.baraja(DIRS)) { const nx = e.x + dx, ny = e.y + dy, k = J.campoHeroe[ny * m.w + nx]; if (k >= 0 && k < mk && !quienHay(nx, ny)) { mk = k; mejor = [nx, ny]; } }
  } else {
    const c = caminoM(m, e.x, e.y, tx, ty, (x, y) => !!quienHay(x, y) && !(x === tx && y === ty), 60);
    if (c.length && !quienHay(c[0][0], c[0][1])) mejor = c[0];
  }
  if (!mejor || !(pasableM(m, mejor[0], mejor[1]) || enM(m, mejor[0], mejor[1]) === T.PUERTA)) return false;   // nunca dentro de un muro
  if (enM(m, mejor[0], mejor[1]) === T.PUERTA) ponM(m, mejor[0], mejor[1], T.PUERTA_ABIERTA);
  mueveA(e, mejor[0], mejor[1]);
  return true;
}
// un paso lejos del héroe (para huir o guardar la distancia)
function pasoLejos(e) {
  const m = J.mapa, h = J.heroe;
  let mejor = null, mk = pasos(e.x, e.y, h.x, h.y);
  for (const [dx, dy] of D.baraja(DIRS)) { const nx = e.x + dx, ny = e.y + dy; if (!pasableM(m, nx, ny) || quienHay(nx, ny)) continue; const k = pasos(nx, ny, h.x, h.y); if (k > mk) { mk = k; mejor = [nx, ny]; } }
  if (!mejor) return false;
  mueveA(e, mejor[0], mejor[1]); return true;
}
function pasoAlAzar(e) {
  const m = J.mapa;
  for (const [dx, dy] of D.baraja(DIRS)) { const nx = e.x + dx, ny = e.y + dy; if (pasableM(m, nx, ny) && !quienHay(nx, ny)) { mueveA(e, nx, ny); return true; } }
  return false;
}

function turnoEnemigo(e) {
  const h = J.heroe, m = J.mapa;
  if (tieneEstado(e, 'bug')) { fxNumero(e.x, e.y, tr('bug'), '#6aa878'); e.carga = null; return; }
  if (e.carga) { golpeCargado(e); return; }   // el golpe que preparó el turno pasado
  const obj = objetivoDe(e);
  if (obj) { e.despierto = true; e.ultimo = { x: obj.x, y: obj.y }; if (obj.x !== e.x) e.izq = obj.x < e.x; }
  const pegado = obj && rey(e.x, e.y, obj.x, obj.y) <= 1;
  e.contador++;
  if ((e.jefe || e.mini) && jefeActua(e, obj)) return;
  switch (e.comp) {
    case 'mimico':
      if (e.mimico) { if (pegado) { e.mimico = false; log(tr('¡El cofre tenía dientes! Es una CajaBotín.'), '#ff9aa4'); sonido('jefe'); ataca(e, obj); } return; }
      if (pegado) { ataca(e, obj); return; }
      if (obj) { pasoHacia(e, obj.x, obj.y); return; }
      return;
    case 'guardian':
      if (pegado) { if (vaACargar(e, false)) golpeCargado(e, obj); else ataca(e, obj); return; }
      if (obj && salaEn(m, obj.x, obj.y) === salaEn(m, e.x, e.y)) { pasoHacia(e, obj.x, obj.y); }
      return;
    case 'sanador': {
      if (!obj && !e.despierto) { if (D.prob(0.3)) pasoAlAzar(e); return; }
      let herido = null;
      for (const q of J.enemigos) if (q !== e && q.vida < q.vidaMax && pasos(q.x, q.y, e.x, e.y) <= 3 && (!herido || q.vida / q.vidaMax < herido.vida / herido.vidaMax)) herido = q;
      if (herido) { const n = Math.min(8 + J.planta, herido.vidaMax - herido.vida); herido.vida += n; anima(e, 'golpe', 0.3); fxNumero(herido.x, herido.y, '+' + n, '#5fd36a'); fxChispas(herido.x, herido.y, '#6aa878', 6); log(fmt(tr('{a} repara a {b}: +{n}.'), { a: tr(e.nombre), b: tr(herido.nombre), n }), '#5fd36a'); sonido('curar'); return; }
    }
    // sin nadie que curar, se porta como tirador
    // falls through
    case 'tirador': {
      if (obj) {
        const k = pasos(e.x, e.y, obj.x, obj.y);
        if (pegado && D.prob(0.6) && pasoLejos(e)) return;   // guarda la distancia
        if (k <= e.alcance && veDesde(m, e.x, e.y, obj.x, obj.y)) { disparaEnemigo(e, obj); return; }
        pasoHacia(e, obj.x, obj.y); return;
      }
      if (e.ultimo) { if (!pasoHacia(e, e.ultimo.x, e.ultimo.y) || (e.x === e.ultimo.x && e.y === e.ultimo.y)) e.ultimo = null; return; }
      if (D.prob(0.3)) pasoAlAzar(e);
      return;
    }
    case 'cobarde':
      if (e.vida < e.vidaMax * 0.3 && obj) { if (pasoLejos(e)) { if (D.prob(0.3)) fxNumero(e.x, e.y, '!', '#ff9aa4'); return; } }
    // falls through
    case 'patrulla':
      if (e.comp === 'patrulla' && !obj && !e.ultimo) {   // su ronda: va de un punto a otro
        if (!e.ruta || (e.x === e.ruta.x && e.y === e.ruta.y)) { const s = D.elige(m.salas); const cas = suelosDe(m, s); e.ruta = cas.length ? { x: cas[D.entre(0, cas.length - 1)][0], y: cas[D.entre(0, cas.length - 1)][1] } : null; }
        if (e.ruta && !pasoHacia(e, e.ruta.x, e.ruta.y)) e.ruta = null;
        return;
      }
    // falls through
    case 'cazador':
    default:
      if (pegado) { if (vaACargar(e, false)) golpeCargado(e, obj); else ataca(e, obj); return; }
      if (obj) { pasoHacia(e, obj.x, obj.y); return; }
      if (e.ultimo) { if (!pasoHacia(e, e.ultimo.x, e.ultimo.y) || (e.x === e.ultimo.x && e.y === e.ultimo.y)) e.ultimo = null; return; }
      if (e.despierto && D.prob(0.5)) pasoAlAzar(e);
      else if (D.prob(0.2)) pasoAlAzar(e);
  }
}
// disparo de un enemigo a distancia (taza, rayo, demanda…)
function disparaEnemigo(e, obj) {
  const n = ataca(e, obj);
  if (ENEMIGOS[e.tipo].demanda && obj.bando === 'heroe' && D.prob(0.35)) { ponEstado(obj, 'despedido', 3); log(tr('Demanda: no puedes tocar el equipo 3 turnos.'), '#ff9aa4'); }
  return n;
}
// lo propio de cada jefe. Devuelve true si ha gastado el turno
function jefeActua(e, obj) {
  const E = ENEMIGOS[e.tipo], h = J.heroe;
  if (!e.despierto) return false;
  if (E.invoca && e.contador % E.cada === 0 && J.enemigos.length < 14) {
    const tipo = E.invoca === 'cualquiera' ? D.elige(ZONAS[zonaDe(J.planta)].enemigos) : E.invoca;
    for (const [dx, dy] of D.baraja(DIRS8)) {
      const x = e.x + dx, y = e.y + dy;
      if (!pasableM(J.mapa, x, y) || quienHay(x, y)) continue;
      const nuevo = nuevoEnemigo(tipo, x, y, J.planta, false); nuevo.despierto = true; J.enemigos.push(nuevo);
      fxExplosion(x, y, 0.5, '#a8323a'); anima(e, 'golpe', 0.3); sonido('invocar');
      log(fmt(tr('{j} llama a refuerzos: un {t}.'), { j: tr(e.nombre), t: tr(ENEMIGOS[tipo].nombre) }), '#ff9aa4');
      return true;
    }
  }
  if (E.despido && e.contador % E.despido === 0 && obj && obj.bando === 'heroe') {
    const n = Math.max(5, Math.round(h.vidaMax * 0.2));
    fxRayo(e.x, e.y, h.x, h.y, '#ff4b5c'); fxRotulo(tr('¡DESPIDO FULMINANTE!'), '#ff4b5c'); anima(e, 'golpe', 0.3);
    log(tr('El CEO firma tu despido: pierdes un 20 % de la Vida.'), '#ff4b5c'); sonido('jefe');
    dana(h, n, 'despido', e);
    return true;
  }
  if (E.reglas && e.contador % 3 === 0) {
    e.modo = e.modo === 'furia' ? 'escudo' : 'furia';
    if (e.modo === 'furia') { e.atq = Math.round(E.atq * 1.5 * (1 + SUBIDA_POR_PLANTA * 3 + 0.7)); e.def = E.def; log(tr('Parche Día 1 cambia las reglas: ahora pega el doble.'), '#ff9aa4'); }
    else { e.atq = Math.round(E.atq * (1 + SUBIDA_POR_PLANTA * 3 + 0.7)); e.def = E.def + 6; log(tr('Parche Día 1 cambia las reglas: ahora es un muro.'), '#ff9aa4'); }
    fxChispas(e.x, e.y, '#4a9aa8', 12); sonido('error');
  }
  if (E.congela && obj && obj.bando === 'heroe' && rey(e.x, e.y, obj.x, obj.y) <= 1 && D.prob(E.congela)) {
    ataca(e, obj); if (obj.vida > 0) { ponEstado(obj, 'bug', 2); log(e.tipo === 'survivalbot' ? tr('SurvivalBot te congela con una carta de despido: pierdes un turno.') : fmt(tr('{e} te banea: pierdes un turno.'), { e: tr(e.nombre) }), '#ff9aa4'); fxChispas(obj.x, obj.y, '#4a9aa8', 10); }
    return true;
  }
  return false;
}
