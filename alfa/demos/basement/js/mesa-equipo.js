// Fans of Basement · Tu mesa: pestañas EQUIPO y PAQUETES, y la apertura de un paquete (solo pantalla). En EQUIPO, los tres huecos
// (teclado, auriculares y silla) con la pieza puesta y las cuatro de cada rareza (tócalas para ponértelas si las tienes), y las
// mascotas con su nivel. En PAQUETES, el paquete de mensajería (se compra) y el del jefe (lo sueltan los jefes), siempre con sus
// probabilidades a la vista. Al abrir uno, el paquete tiembla, se abre con rayos del color de la rareza y enseña el premio.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto;
  const HUECO = { teclado: 'TECLADO', auriculares: 'AURICULARES', silla: 'SILLA' };
  const RAREZA = { comun: 'COMÚN', raro: 'RARO', epico: 'ÉPICO', legendario: 'LEGENDARIO' };
  const OSCURO = '#26304d';
  UI.nombreRareza = (r) => tr(RAREZA[r]);

  function cuadro(g, b, color, dibujo, px, marcado) {
    g.fillStyle = marcado ? '#ffffff' : C.tinta; g.fillRect(b.x - 3, b.y - 3, b.w + 6, b.h + 6);
    g.fillStyle = color; g.fillRect(b.x, b.y, b.w, b.h);
    if (dibujo) B.dibujaSprite(g, dibujo, b.x + b.w / 2, b.y + b.h / 2, px);
    else T(g, '?', b.x + b.w / 2, b.y + b.h / 2 + 2, 18, '#5a6788', 'center', true, false);
  }

  function filaHueco(g, AJ, p, hueco, x, y, w, h, botones) {
    const puesta = p.equipo.puesto[hueco], pieza = puesta ? AJ.equipo[hueco][puesta] : null;
    UI.caja(g, x, y, w, h, C.crema, 12);
    T(g, tr(HUECO[hueco]), x + 12, y + 16, 12, C.marron, 'left', true, false);
    UI.textoCabe(g, pieza ? tr(pieza.nombre) : tr('Nada puesto'), x + 12, y + 36, 15, w - 4 * 42 - 24, pieza ? AJ.colorRareza[puesta] : '#9a8a6a', 'left', true);
    if (pieza) UI.textoCabe(g, UI.describe(pieza.ef).join(' · '), x + 12, y + 56, 12, w - 24, '#2a6b3a', 'left', false, false);
    AJ.rarezas.forEach((r, i) => {
      const b = { x: x + w - 4 * 42 - 6 + i * 42, y: y + 8, w: 34, h: 34, accion: 'equipar', hueco, rareza: r }, tiene = p.equipo.tiene[hueco + ':' + r];
      cuadro(g, b, tiene ? AJ.colorRareza[r] : OSCURO, tiene ? hueco : null, 2, puesta === r);
      if (tiene) botones.push(b);
    });
  }

  function filaMascotas(g, AJ, p, x, y, w, h, botones) {
    UI.caja(g, x, y, w, h, C.crema, 12);
    T(g, tr('MASCOTA'), x + 12, y + 16, 12, C.marron, 'left', true, false);
    const id = p.mascota, m = B.mascotaDe(AJ, p);
    UI.textoCabe(g, m ? tr(AJ.mascotas[id].nombre) + ' · ' + tr('Nv') + ' ' + m.nivel : tr('Ninguna todavía'), x + 12, y + 36, 15, w - 4 * 42 - 24, m ? AJ.colorRareza[AJ.mascotas[id].rareza] : '#9a8a6a', 'left', true);
    if (m) UI.textoCabe(g, tr('Dispara sola: {n} de daño', { n: m.dano }) + (m.cafeCada ? ' · ' + tr('trae café') : ''), x + 12, y + 56, 12, w - 24, '#2a6b3a', 'left', false, false);
    Object.keys(AJ.mascotas).forEach((k, i) => {
      const b = { x: x + w - 4 * 42 - 6 + i * 42, y: y + 8, w: 34, h: 34, accion: 'mascota', id: k }, nivel = p.mascotas[k];
      cuadro(g, b, nivel ? AJ.colorRareza[AJ.mascotas[k].rareza] : OSCURO, nivel ? k : null, 2, id === k);
      if (nivel) { T(g, String(nivel), b.x + b.w - 2, b.y + b.h - 4, 11, '#ffffff', 'right', true); botones.push(b); }
    });
  }

  UI.pestanaEquipo = function (g, W, H, AJ, p, botones) {
    const { y0, y1 } = UI.zonaMesa(H), h = Math.min(96, Math.floor((y1 - y0) / 4) - 8);
    let y = y0;
    for (const hueco of Object.keys(AJ.equipo)) { filaHueco(g, AJ, p, hueco, 12, y, W - 24, h, botones); y += h + 8; }
    filaMascotas(g, AJ, p, 12, y, W - 24, h, botones);
  };

  // ---------- PAQUETES ----------
  function probabilidades(g, AJ, P, x, y) {
    let cx = x;
    AJ.rarezas.forEach((r) => {
      const t = UI.nombreRareza(r) + ' ' + P.rarezas[r] + '%';
      T(g, t, cx, y, 11, AJ.colorRareza[r], 'left', true);
      g.font = '11px ' + "'Luckiest Guy', sans-serif"; cx += g.measureText(t).width + 8;
    });
    T(g, tr('Mascota {m} % · Equipo {e} %', { m: P.mascota, e: 100 - P.mascota }), x, y + 18, 12, C.tinta, 'left', false, false);
  }

  function tarjetaPaquete(g, AJ, p, tipo, x, y, w, h, botones) {
    const P = AJ.paquetes[tipo], n = p.paquetes[tipo];
    UI.caja(g, x, y, w, h, C.crema, 14);
    B.dibujaSprite(g, tipo === 'jefe' ? 'paqueteJefe' : 'paquete', x + 40, y + 46, 5);
    UI.textoCabe(g, tr(P.nombre), x + 80, y + 22, 17, w - 92, C.tinta, 'left', true, false);
    T(g, tr('Tienes: {n}', { n }), x + 80, y + 46, 14, C.marron, 'left', false, false);
    if (P.coste == null) UI.lineas(g, tr('Lo suelta un jefe la primera vez que lo vences'), x + 80, y + 66, 12, w - 92, C.tinta, 'left', 2);
    probabilidades(g, AJ, P, x + 12, y + h - 70);
    const by = y + h - 42;
    if (P.coste != null) {
      const comprar = { x: x + 12, y: by, w: w / 2 - 18, h: 34, accion: 'comprarPaquete', id: tipo };
      UI.caja(g, comprar.x, comprar.y, comprar.w, comprar.h, p.monedas >= P.coste ? C.verde : C.marron, 10);
      UI.moneda(g, comprar.x + 18, by + 17, 8);
      T(g, tr('COMPRAR') + ' ' + P.coste, comprar.x + comprar.w / 2 + 10, by + 19, 13, '#ffffff', 'center', true);
      botones.push(comprar);
    }
    const abrir = { x: x + w / 2 + 6, y: by, w: w / 2 - 18, h: 34, accion: 'abrirPaquete', id: tipo };
    UI.caja(g, abrir.x, abrir.y, abrir.w, abrir.h, n > 0 ? C.naranja : C.marron, 10);
    T(g, tr('ABRIR'), abrir.x + abrir.w / 2, by + 19, 15, '#ffffff', 'center', true);
    if (n > 0) botones.push(abrir);
  }

  UI.pestanaPaquetes = function (g, W, H, AJ, p, botones) {
    const { y0, y1 } = UI.zonaMesa(H), h = Math.min(200, Math.floor((y1 - y0) / 2) - 8);
    tarjetaPaquete(g, AJ, p, 'normal', 12, y0, W - 24, h, botones);
    tarjetaPaquete(g, AJ, p, 'jefe', 12, y0 + h + 12, W - 24, h, botones);
  };

  // ---------- abrir un paquete ----------
  const DIBUJO_PREMIO = (pr) => (pr.tipo === 'equipo' ? pr.hueco : pr.id);
  const NOMBRE_PREMIO = (AJ, pr) => (pr.tipo === 'equipo' ? AJ.equipo[pr.hueco][pr.rareza].nombre : AJ.mascotas[pr.id].nombre);
  UI.REVELA = 0.9;

  function rayos(g, x, y, color, t) {
    g.save(); g.translate(x, y); g.rotate(t * 0.6); g.globalAlpha = 0.35; g.fillStyle = color;
    for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(0, 0); g.lineTo(-22, -260); g.lineTo(22, -260); g.fill(); }
    g.restore();
  }

  function lineaPremio(AJ, pr) {
    if (!pr.nuevo) return tr('Repetido: +{n} monedas', { n: pr.monedas });
    if (pr.tipo === 'mascota' && pr.nivel > 1) return tr('¡Sube a nivel {n}!', { n: pr.nivel });
    return tr('¡NUEVO!');
  }

  UI.apertura = function (g, W, H, t, AJ, a) {
    g.fillStyle = 'rgba(10,14,30,0.92)'; g.fillRect(0, 0, W, H);
    const d = t - a.t0, pr = a.premio, cx = W / 2, cy = H * 0.42;
    if (d < UI.REVELA) {
      const k = d * 10;
      B.dibujaSprite(g, a.tipo === 'jefe' ? 'paqueteJefe' : 'paquete', cx + Math.sin(d * 50) * k, cy + Math.cos(d * 43) * k * 0.5, 10);
      return [];
    }
    const color = AJ.colorRareza[pr.rareza];
    rayos(g, cx, cy, color, t);
    B.dibujaSprite(g, DIBUJO_PREMIO(pr), cx, cy, 8);
    T(g, UI.nombreRareza(pr.rareza), cx, cy + 110, 30, color, 'center', true);
    UI.lineas(g, tr(NOMBRE_PREMIO(AJ, pr)), cx, cy + 148, 22, W - 40, '#ffffff', 'center', 2);
    T(g, lineaPremio(AJ, pr), cx, cy + 196, 18, pr.nuevo ? C.amarillo : '#ffffff', 'center', true);
    if (d > UI.REVELA + 0.6) T(g, tr('Toca para seguir'), cx, H - 60, 16, '#ffffff', 'center', true);
    return d > UI.REVELA + 0.4 ? [{ x: 0, y: 0, w: W, h: H, accion: 'cerrarApertura' }] : [];
  };
})(BAS);
