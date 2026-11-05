// Fans of Basement · Tu mesa y el resultado (solo pantalla): en la mesa se ven las monedas, el récord y las tres mejoras
// (cafetera propia, caja más grande y grapadora mejorada) con su botón de comprar, y el botón BAJAR. Al volver de una bajada
// sale el resultado: a salvo (cobras la caja) o desmayado (la pierdes). Las reglas de comprar están en progreso.js.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto;
  const MEJORA = {
    cafe: { nombre: 'CAFETERA PROPIA', dibujo: 'taza_hud', efecto: (s) => tr('Café') + ': ' + s.cafeMax },
    caja: { nombre: 'CAJA MÁS GRANDE', dibujo: 'caja', efecto: (s) => tr('Caja') + ': ' + s.caja },
    dano: { nombre: 'GRAPADORA MEJORADA', dibujo: 'grapadora', efecto: (s) => tr('Daño') + ': ' + s.dano },
  };

  function tarjeta(g, AJ, p, id, x, y, w) {
    const M = MEJORA[id], nivel = p.niveles[id], max = AJ.mejoras[id].max, s = B.statsDe(AJ, p);
    const sig = nivel < max ? B.statsDe(AJ, { ...p, niveles: { ...p.niveles, [id]: nivel + 1 } }) : null;
    UI.caja(g, x, y, w, 86, C.crema, 12);
    B.dibujaSprite(g, M.dibujo, x + 34, y + 43, 4);
    UI.textoCabe(g, tr(M.nombre), x + 66, y + 22, 15, w - 66 - 100, C.tinta, 'left', false, false);
    T(g, tr('Nivel') + ' ' + nivel + '/' + max, x + 66, y + 44, 13, C.marron, 'left', false, false);
    T(g, M.efecto(s) + (sig ? '  →  ' + M.efecto(sig).split(': ')[1] : ''), x + 66, y + 64, 13, '#2a6b3a', 'left', false, false);
    const b = { x: x + w - 92, y: y + 20, w: 80, h: 46, accion: 'comprar', id };
    if (!sig) { UI.caja(g, b.x, b.y, b.w, b.h, C.amarillo, 10); T(g, tr('MÁXIMO'), b.x + 40, b.y + 25, 13, C.tinta, 'center', true, false); return null; }
    const coste = B.costeMejora(AJ, id, nivel), puede = p.monedas >= coste;
    UI.caja(g, b.x, b.y, b.w, b.h, puede ? C.verde : C.marron, 10);
    UI.moneda(g, b.x + 18, b.y + 24, 9);
    T(g, String(coste), b.x + 52, b.y + 25, 16, puede ? '#ffffff' : '#f2c08a', 'center', true);
    return b;
  }

  UI.mesa = function (g, W, H, t, AJ, p) {
    UI.fondo(g, W, H, t * 0.3);
    T(g, tr('TU MESA'), W / 2, 40, 34, C.amarillo, 'center', true);
    UI.moneda(g, W / 2 - 54, 86, 16);
    T(g, String(p.monedas), W / 2 - 30, 88, 28, '#ffffff', 'left', true);
    T(g, p.record ? tr('Récord: planta') + ' -' + p.record : tr('El servidor se ha caído. Baja a arreglarlo.'), W / 2, 122, 13, '#ffffff');
    const botones = [];
    let y = 150;
    for (const id of B.MEJORAS) { const b = tarjeta(g, AJ, p, id, 20, y, W - 40); if (b) botones.push(b); y += 100; }
    const bajar = { x: W / 2 - 110, y: Math.max(y + 14, H - 110), w: 220, h: 70, accion: 'bajar' };
    UI.caja(g, bajar.x, bajar.y, bajar.w, bajar.h, C.naranja, 16);
    T(g, tr('BAJAR'), W / 2, bajar.y + 38, 36, '#ffffff', 'center', true);
    botones.push(bajar);
    return botones;
  };

  function fila(g, W, y, etiqueta, valor, color) {
    T(g, etiqueta, 44, y, 16, '#ffffff', 'left');
    T(g, valor, W - 44, y, 20, color || '#ffffff', 'right', true);
  }

  UI.resultado = function (g, W, H, t, r, record) {
    UI.fondo(g, W, H, t * 0.3);
    const salvo = r.como === 'ascensor';
    T(g, salvo ? tr('¡A SALVO!') : tr('¡DESMAYADO!'), W / 2, H * 0.14, 42, salvo ? C.verde : C.rojo, 'center', true);
    T(g, salvo ? tr('El ascensor te ha subido con la caja') : tr('Sin café no hay quien trabaje: pierdes la caja'), W / 2, H * 0.14 + 40, 13, '#ffffff');
    UI.caja(g, 24, H * 0.26, W - 48, 210, 'rgba(22,22,22,0.55)', 14);
    let y = H * 0.26 + 34;
    fila(g, W, y, tr('Planta más baja'), '-' + r.planta); y += 44;
    fila(g, W, y, tr('Bichos eliminados'), String(r.bajas)); y += 44;
    fila(g, W, y, tr('Objetos en la caja'), String(r.objetos)); y += 44;
    fila(g, W, y, tr('Monedas'), '+' + r.monedas, salvo ? C.amarillo : C.rojo);
    if (record && Math.floor(t * 3) % 2) T(g, tr('¡NUEVO RÉCORD!'), W / 2, H * 0.26 + 236, 22, C.amarillo, 'center', true);
    const b = { x: W / 2 - 110, y: H - 120, w: 220, h: 64, accion: 'mesa' };
    UI.caja(g, b.x, b.y, b.w, b.h, C.naranja, 16);
    T(g, tr('A MI MESA'), W / 2, b.y + 35, 28, '#ffffff', 'center', true);
    return [b];
  };
})(BAS);
