// Fans of Dungeons · Los controles: el toque (primero los botones pintados, luego el mapa: ir a una casilla, pegar, mirar) y
// el teclado (flechas o WASD, espacio, Intro, E, Q, I, M, 1-4, Esc). Los deslizamientos en el mapa mueven una casilla.
'use strict';

const TOQUE = { x0: 0, y0: 0, t0: 0, activo: false };
// el toque en (x, y) en píxeles del juego
function toque(x, y) {
  if (J.modo === 'juego' && tutoToque(x, y)) return;
  for (let i = BOTONES.length - 1; i >= 0; i--) { const b = BOTONES[i]; if (x >= b.x && y >= b.y && x < b.x + b.w && y < b.y + b.h) { if (!b.apagado || true) b.f(); return; } }
  if (J.modo === 'panel') { return; }
  if (J.modo !== 'juego') return;
  if (y < VISTA.y || y >= VISTA.y + VISTA.h) return;
  const m = J.mapa;
  const ox = Math.round(J.cam.x) - (m.w * TS < VISTA.w ? Math.round((VISTA.w - m.w * TS) / 2) : 0), oy = Math.round(J.cam.y) - (m.h * TS < VISTA.h ? Math.round((VISTA.h - m.h * TS) / 2) : 0);
  const tx = Math.floor((x - VISTA.x + ox) / TS), ty = Math.floor((y - VISTA.y + oy) / TS);
  if (!dentroM(m, tx, ty)) return;
  if (VISTA.mirar) { miraCasilla(tx, ty); return; }
  if (J.heroe.camino.length) { J.heroe.camino = []; J.heroe.explorando = false; return; }   // un toque corta el viaje
  caminoHasta(tx, ty);
}
function tecla(k) {
  if (J.modo === 'juego' && tutoTecla(k)) return;
  const h = J.heroe;
  if (J.modo === 'titulo') { if (k === 'Enter' || k === ' ') { J.modo = 'clase'; } return; }
  if (J.modo === 'clase') { if (k === 'ArrowLeft' || k === 'a') PORTADA.sel = (PORTADA.sel + CLASES_ORDEN.length - 1) % CLASES_ORDEN.length; else if (k === 'ArrowRight' || k === 'd') PORTADA.sel = (PORTADA.sel + 1) % CLASES_ORDEN.length; else if (k === 'Enter' || k === ' ') empiezaClase(); else if (k === 'Escape') J.modo = 'titulo'; return; }
  if (J.modo === 'fin' || J.modo === 'victoria') { if (k === 'Enter' || k === ' ') J.modo = 'clase'; else if (k === 'Escape') J.modo = 'titulo'; return; }
  if (J.modo === 'registro' || J.modo === 'ayuda' || J.modo === 'taquilla' || J.modo === 'opciones' || J.modo === 'aviso') { if (k === 'Escape' || k === 'Enter') { J.modo = 'titulo'; J.panel = null; } return; }
  if (J.modo === 'panel') {
    const p = J.panel;
    if (k === 'Escape' || k === 'i' && p.tipo === 'mochila') { if (p.tipo === 'ayuda') p.tipo = 'pausa'; else cierraPanel(); return; }
    if (p.tipo === 'mochila') {
      if (typeof p.sel !== 'number') p.sel = -1;
      const idx = indicesBolsillo(h, p.pestana === 'cafe'), k0 = idx.indexOf(p.sel);
      if (k === 'ArrowDown' || k === 's' || k === 'ArrowRight' || k === 'd') { if (idx.length) p.sel = idx[Math.min(idx.length - 1, k0 + 1)]; }
      else if (k === 'ArrowUp' || k === 'w' || k === 'ArrowLeft' || k === 'a') { if (idx.length) p.sel = idx[Math.max(0, k0 - 1)]; }
      else if (k === 'Tab') { p.pestana = p.pestana === 'cafe' ? 'obj' : 'cafe'; p.sel = -1; }
      else if (k === 'Enter' && h.mochila[p.sel]) usaDesdeMochila(p);
      else if ((k === 'Backspace' || k === 'Delete') && h.mochila[p.sel]) { suelta(h, p.sel); p.sel = -1; }
    } else if (p.tipo === 'altar') {
      if (k === 'ArrowDown' || k === 's') p.sel = Math.min(p.opciones.length - 1, p.sel + 1);
      else if (k === 'ArrowUp' || k === 'w') p.sel = Math.max(0, p.sel - 1);
      else if (k === 'Enter' || k === ' ') eligeAltar(p.opciones[p.sel]);
    } else if (p.tipo === 'tienda') {
      const n = p.pestana === 'comprar' ? J.tienda.oferta.length : h.mochila.length;
      if (k === 'ArrowDown' || k === 's') p.sel = Math.min(n - 1, p.sel + 1);
      else if (k === 'ArrowUp' || k === 'w') p.sel = Math.max(0, p.sel - 1);
      else if (k === 'Enter') { if (p.pestana === 'comprar') compra(h, p.sel); else vende(h, p.sel); }
      else if (k === 'Tab' || k === 'ArrowRight' || k === 'ArrowLeft') { if (J.tienda.lola) { p.pestana = p.pestana === 'comprar' ? 'vender' : 'comprar'; p.sel = 0; } }
    }
    return;
  }
  if (J.modo !== 'juego') return;
  if (h.camino.length) { h.camino = []; h.explorando = false; }
  const D4 = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
  if (D4[k]) { intentaMover(D4[k][0], D4[k][1]); return; }
  if (k === ' ' || k === '.' || k === '5') esperar();
  else if (k === 'Enter' || k === '<' || k === '>') subir();
  else if (k === 'e') explorar();
  else if (k === 'q' || k === 'h') usaHabilidad();
  else if (k === 'i') { J.panel = { tipo: 'mochila', sel: h.mochila.length ? 0 : -1 }; J.modo = 'panel'; }
  else if (k === 'm') VISTA.minimapa = !VISTA.minimapa;
  else if (k === 'f') { const e = enemigoMasCercanoVisible(h); if (e) { if (rey(h.x, h.y, e.x, e.y) <= 1) intentaMover(Math.sign(e.x - h.x), Math.sign(e.y - h.y)); else disparaA(e); } }
  else if (k >= '1' && k <= '4') { const cons = h.mochila.map((o, i) => [o, i]).filter(([o]) => OBJETOS[o.id].tipo === 'consumible'); const c = cons[+k - 1]; if (c && usaObjeto(h, c[1])) accion(); }
  else if (k === 'Escape' || k === 'p') abreMenu();
  else if (k === 'l') VISTA.mirar = !VISTA.mirar;
}
// un deslizamiento corto en el mapa mueve una casilla (cómodo en el móvil)
function deslizamiento(dx, dy) {
  if (J.modo !== 'juego') return false;
  if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return false;
  if (Math.abs(dx) > Math.abs(dy)) intentaMover(Math.sign(dx), 0); else intentaMover(0, Math.sign(dy));
  return true;
}
