// Fans of Nova · Primera misión guiada (adaptador de NV.Guion, dominio/guion.js): cuándo sale, los sucesos de la partida que la avanzan,
// lo que la hace fácil (no te destruyen, el jefe llega antes y con menos vida, la fusión sale segura) y la frase en pantalla con el
// botón «Ya sé jugar». Datos: datos-guion.js. Diseño: docs/nova/primera-mision.md.
'use strict';

// Solo en la primera misión de una campaña nueva, si no la has saltado (nunca con el bot ni en el simulador)
function nvGuionToca() { const c = NVP.camp; return !!c && !NVP.auto && !(c.misiones > 0) && !c.guia; }
function nvGuionInicio(S) { S.guion = nvGuionToca() ? NV.Guion.nuevo() : null; }

// Un suceso de la partida (mueve, baja, chatarra, carta, habilidad, fusion, combo, victoria)
function nvGuion(S, nombre, cantidad) {
  if (!S || !S.guion || !NV.Guion.suceso(S.guion, NOVA_GUION, nombre, cantidad)) return;
  nvGuionSiguiente(S);
}
function nvGuionPaso(S, dt) {
  if (!S.guion) return;
  if (Math.hypot(NVP.entrada.x, NVP.entrada.y) > 0.3 || NVP.teclas.ArrowLeft || NVP.teclas.ArrowRight || NVP.teclas.ArrowUp || NVP.teclas.ArrowDown || NVP.teclas.a || NVP.teclas.d || NVP.teclas.w || NVP.teclas.s) nvGuion(S, 'mueve', dt);
  if (NV.Guion.paso(S.guion, NOVA_GUION, dt)) nvGuionSiguiente(S);
}
function nvGuionSiguiente(S) {
  nvSnd('nvElige', S);
  if (NV.Guion.hecho(S.guion, NOVA_GUION)) nvGuionTermina(S, 'hecha');
}
// Al acabar (o saltarla) no vuelve a salir, y las páginas de ayuda que ya ha contado no salen solas
function nvGuionTermina(S, como) {
  S.guion = null;
  if (NVP.camp) { NVP.camp.guia = como; nvCampGuarda(); }
  if (como === 'hecha' && typeof nvTutoMarca === 'function') nvTutoMarca(['mision', 'cartas', 'fusion', 'habilidad', 'armas']);
}

// ---------- lo que la hace fácil ----------
function nvGuionAguanta(S, r) { return S.guion ? Math.min(r, Math.max(0, S.nave.hp - 1)) : r; }   // no te destruyen
function nvTiempoJefe(S) { return S.guion ? (NV.Guion.llegaJefe(S.guion, NOVA_GUION, S.t) ? S.t : Infinity) : NV_TIEMPO_JEFE; }
function nvGuionJefe(S, j) { if (S.guion) j.hp = j.hpMax = Math.round(j.hpMax * NOVA_GUION.jefeVida); }   // un jefe pequeño
// En el paso de la fusión, si hay una carta de fusión posible, sale seguro (la primera)
function nvGuionCartas(S, cartas, pool) {
  const p = NV.Guion.actual(S.guion, NOVA_GUION);
  if (!p || p.suceso !== 'fusion' || cartas.some(c => c.tipo === 'fusion')) return cartas;
  const f = pool.find(c => c.tipo === 'fusion');
  if (f) { f.rol = cartas[0] && cartas[0].rol; cartas[0] = f; }
  return cartas;
}

// ---------- en pantalla: la frase del paso y «Ya sé jugar» ----------
function nvGuionBoton(W, H, u) { return { x: W - 12 * u - 80 * u, y: 12 * u + 56 * u, w: 80 * u, h: 22 * u }; }
function nvGuionToque(ev) {
  const S = NVP.S, cv = document.getElementById('nv-canvas');
  if (!S || !S.guion) return false;
  const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) * cv.width / r.width, y = (ev.clientY - r.top) * cv.height / r.height;
  const b = nvGuionBoton(cv.width, cv.height, cv.width / 360);
  if (x < b.x || x > b.x + b.w || y < b.y || y > b.y + b.h) return false;
  nvGuionTermina(S, 'saltada');
  return true;
}
function nvGuionPinta(c, S, W, H, u) {
  const p = S.guion && NV.Guion.actual(S.guion, NOVA_GUION);
  if (!p || S.estado !== 'juego') return;
  const b = nvGuionBoton(W, H, u), y = H * 0.72, alto = 46 * u;
  c.save();
  c.fillStyle = 'rgba(10,14,40,.82)'; c.fillRect(16 * u, y - alto / 2, W - 32 * u, alto);
  c.lineWidth = 3 * u; c.strokeStyle = '#ffd93d'; c.strokeRect(16 * u, y - alto / 2, W - 32 * u, alto);
  c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = '700 ' + 12 * u + 'px Baloo 2, sans-serif';
  nvGuionTexto(c, tr(p.txt), W / 2, y, W - 48 * u, 14 * u);
  c.font = '700 ' + 9 * u + 'px Baloo 2, sans-serif'; c.fillStyle = '#ffd93d';
  c.fillText((S.guion.i + 1) + ' / ' + NOVA_GUION.pasos.length, W / 2, y + alto / 2 - 4 * u);
  c.fillStyle = 'rgba(10,14,40,.82)'; c.fillRect(b.x, b.y, b.w, b.h); c.strokeStyle = '#fff'; c.lineWidth = 2 * u; c.strokeRect(b.x, b.y, b.w, b.h);
  c.fillStyle = '#fff'; c.font = '700 ' + 10 * u + 'px Baloo 2, sans-serif'; c.fillText(tr('Ya sé jugar'), b.x + b.w / 2, b.y + b.h * 0.68);
  c.restore();
}
// La frase en dos líneas como mucho, partida por palabras
function nvGuionTexto(c, txt, x, y, ancho, alto) {
  const pal = txt.split(' '), lineas = [''];
  for (const p of pal) { const l = lineas[lineas.length - 1], prueba = l ? l + ' ' + p : p; if (c.measureText(prueba).width > ancho && l) lineas.push(p); else lineas[lineas.length - 1] = prueba; }
  lineas.forEach((l, i) => c.fillText(l, x, y - (lineas.length - 1) * alto / 2 + i * alto - 2 * alto / 14));
}
