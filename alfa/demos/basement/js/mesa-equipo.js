// Fans of Basement · Tu mesa: pestañas EQUIPO y PAQUETES, y la apertura de un paquete (solo pantalla, estilo Swipe). En EQUIPO,
// los tres huecos (teclado, auriculares y silla) con la pieza puesta y las cuatro de cada rareza (tócalas para ponértelas si las
// tienes), y las mascotas con su nivel. En PAQUETES, el paquete de mensajería (se compra) y el del jefe (lo sueltan los jefes),
// siempre con sus probabilidades a la vista. Al abrir uno, el paquete tiembla, se abre con rayos del color de la rareza y enseña el premio.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto, V = () => B.vista;
  const HUECO = { teclado: 'TECLADO', auriculares: 'AURICULARES', silla: 'SILLA' };
  const DIBUJO_HUECO = { teclado: ['teclado', 4], auriculares: ['r-auriculares', 2], silla: ['r-silla', 2] };
  const RAREZA = { comun: 'COMÚN', raro: 'RARO', epico: 'ÉPICO', legendario: 'LEGENDARIO' };
  UI.nombreRareza = (r) => tr(RAREZA[r]);
  const pintaHueco = (g, h, x, y, k) => V().pinta(g, DIBUJO_HUECO[h][0], x, y, DIBUJO_HUECO[h][1] * (k || 1));

  // un cuadro de rareza: del color de la rareza si la tienes (con su dibujo), oscuro con «?» si no; el puesto, con marco blanco
  function cuadro(g, b, color, pinta, marcado) {
    if (marcado) { g.fillStyle = '#ffffff'; g.fillRect(b.x - 5, b.y - 5, b.w + 10, b.h + 10); }
    UI.panel(g, b.x, b.y, b.w, b.h, color || '#2a1830', null, null, 3);
    if (pinta) pinta(b.x + b.w / 2, b.y + b.h / 2);
    else T(g, '?', b.x + b.w / 2, b.y + b.h / 2, 24, '#6a5670', 'center', 0);
  }
  const cuadros = (x, y, w) => [0, 1, 2, 3].map((i) => ({ x: x + w - 4 * 62 - 6 + i * 62, y, w: 52, h: 52 }));

  function filaHueco(g, AJ, p, hueco, x, y, w, h, botones) {
    const puesta = p.equipo.puesto[hueco], pieza = puesta ? AJ.equipo[hueco][puesta] : null;
    UI.pergamino(g, x, y, w, h);
    T(g, tr(HUECO[hueco]), x + 26, y + 32, 18, C.gris, 'left', 0);
    UI.textoCabe(g, pieza ? tr(pieza.nombre) : tr('Nada puesto'), x + 26, y + 62, 22, w - 4 * 62 - 50, pieza ? AJ.colorRareza[puesta] : '#8a7a5a', 'left', pieza ? 4 : 0);
    if (pieza) UI.textoCabe(g, UI.describe(pieza.ef).join(' · '), x + 26, y + h - 30, 16, w - 52, '#2e6a2a', 'left', 0);
    cuadros(x, y + 24, w).forEach((b, i) => {
      const r = AJ.rarezas[i], tiene = p.equipo.tiene[hueco + ':' + r];
      cuadro(g, b, tiene ? AJ.colorRareza[r] : null, tiene ? (cx, cy) => pintaHueco(g, hueco, cx, cy, 0.8) : null, puesta === r);
      if (tiene) botones.push({ ...b, accion: 'equipar', hueco, rareza: r });
    });
  }

  function filaMascotas(g, AJ, p, x, y, w, h, botones) {
    UI.pergamino(g, x, y, w, h);
    T(g, tr('MASCOTA'), x + 26, y + 32, 18, C.gris, 'left', 0);
    const id = p.mascota, m = B.mascotaDe(AJ, p);
    UI.textoCabe(g, m ? tr(AJ.mascotas[id].nombre) + ' · ' + tr('Nv') + ' ' + m.nivel : tr('Ninguna todavía'), x + 26, y + 62, 22, w - 4 * 62 - 50, m ? AJ.colorRareza[AJ.mascotas[id].rareza] : '#8a7a5a', 'left', m ? 4 : 0);
    if (m) UI.textoCabe(g, tr('Dispara sola: {n} de daño', { n: m.dano }) + (m.cafeCada ? ' · ' + tr('trae café') : ''), x + 26, y + h - 30, 16, w - 52, '#2e6a2a', 'left', 0);
    cuadros(x, y + 24, w).forEach((b, i) => {
      const k = Object.keys(AJ.mascotas)[i], nivel = p.mascotas[k];
      cuadro(g, b, nivel ? AJ.colorRareza[AJ.mascotas[k].rareza] : null, nivel ? (cx, cy) => V().pintaCosa(g, k, cx, cy, null, k === 'dron' ? 0.9 : 0.8) : null, id === k);
      if (!nivel) return;
      T(g, String(nivel), b.x + b.w - 2, b.y + b.h - 6, 16, '#ffffff', 'right', 3);
      botones.push({ ...b, accion: 'mascota', id: k });
    });
  }

  // El arma: la puesta, con su nivel y lo que hace; los cuadros, la grapadora y las cuatro que salen de los paquetes.
  const QUE_HACE = { grapadora: 'Una grapa al más cercano', clips: 'Tres clips en abanico', taladro: 'Atraviesa a varios bichos', extintor: 'Explota y daña alrededor', raton: 'Rebota de bicho en bicho' };
  function filaArma(g, AJ, p, x, y, w, h, botones) {
    const a = B.armaDe(AJ, p), color = a.rareza ? AJ.colorRareza[a.rareza] : C.cafe;
    UI.pergamino(g, x, y, w, h);
    T(g, tr('ARMA'), x + 26, y + 32, 18, C.gris, 'left', 0);
    UI.textoCabe(g, tr(a.nombre) + (a.rareza ? ' · ' + tr('Nv') + ' ' + a.nivel : ''), x + 26, y + 62, 22, w - 5 * 56 - 40, color, 'left', a.rareza ? 4 : 0);
    UI.textoCabe(g, tr(QUE_HACE[a.id]), x + 26, y + h - 30, 16, w - 52, '#2e6a2a', 'left', 0);
    Object.keys(AJ.armas).forEach((id, i) => {
      const d = AJ.armas[id], tiene = !d.rareza || p.armas[id] > 0, b = { x: x + w - 5 * 56 - 6 + i * 56, y: y + 26, w: 48, h: 48 };
      cuadro(g, b, tiene ? (d.rareza ? AJ.colorRareza[d.rareza] : C.perg2) : null, tiene ? (cx, cy) => V().pintaCosa(g, id, cx, cy, null, 0.7) : null, a.id === id);
      if (tiene) botones.push({ ...b, accion: 'arma', id });
    });
  }

  UI.pestanaEquipo = function (g, W, H, AJ, p, botones) {
    const { y0, y1 } = UI.zonaMesa(H), h = Math.min(150, Math.floor((y1 - y0) / 5) - 8);
    let y = y0;
    filaArma(g, AJ, p, 12, y, W - 24, h, botones); y += h + 8;
    for (const hueco of Object.keys(AJ.equipo)) { filaHueco(g, AJ, p, hueco, 12, y, W - 24, h, botones); y += h + 8; }
    filaMascotas(g, AJ, p, 12, y, W - 24, h, botones);
  };

  // ---------- PAQUETES ----------
  function probabilidades(g, AJ, P, x, y, w) {
    const ancho = (w - 10) / 4;
    AJ.rarezas.forEach((r, i) => {
      UI.panel(g, x + i * ancho, y - 18, ancho - 6, 36, AJ.colorRareza[r], null, null, 3);
      UI.textoCabe(g, UI.nombreRareza(r) + ' ' + P.rarezas[r] + '%', x + i * ancho + (ancho - 6) / 2, y, 15, ancho - 14, '#ffffff', 'center', 3);
    });
    T(g, tr('Mascota {m} % · Arma {a} % · Equipo {e} %', { m: P.mascota, a: P.arma || 0, e: 100 - P.mascota - (P.arma || 0) }), x, y + 36, 17, C.cafe, 'left', 0);
  }

  function tarjetaPaquete(g, AJ, p, tipo, x, y, w, h, botones) {
    const P = AJ.paquetes[tipo], n = p.paquetes[tipo];
    UI.pergamino(g, x, y, w, h);
    V().pintaCosa(g, tipo === 'jefe' ? 'paqueteJefe' : 'paquete', x + 70, y + 74, null, tipo === 'jefe' ? 1.3 : 1.6);
    UI.textoCabe(g, tr(P.nombre), x + 130, y + 40, 26, w - 160, C.oro, 'left', 5);
    T(g, tr('Tienes: {n}', { n }), x + 130, y + 76, 20, C.gris, 'left', 0);
    if (P.coste == null) UI.lineas(g, tr('Lo suelta un jefe la primera vez que lo vences'), x + 130, y + 104, 15, w - 160, C.cafe, 'left', 0, 17);
    probabilidades(g, AJ, P, x + 24, y + h - 118, w - 48);
    const by = y + h - 66;
    if (P.coste != null) {
      const comprar = { x: x + 24, y: by, w: w / 2 - 32, h: 50, accion: 'comprarPaquete', id: tipo };
      UI.boton(g, comprar, p.monedas >= P.coste ? 'verde' : 'apagado', '', 0);
      UI.moneda(g, comprar.x + 26, by + 25, 2);
      T(g, tr('COMPRAR') + ' ' + P.coste, comprar.x + comprar.w / 2 + 14, by + 25, 20, '#ffffff', 'center', 4);
      botones.push(comprar);
    }
    const abrir = { x: x + w / 2 + 8, y: by, w: w / 2 - 32, h: 50, accion: 'abrirPaquete', id: tipo };
    UI.boton(g, abrir, n > 0 ? 'naranja' : 'apagado', tr('ABRIR'), 24);
    if (n > 0) botones.push(abrir);
  }

  UI.pestanaPaquetes = function (g, W, H, AJ, p, botones) {
    const { y0, y1 } = UI.zonaMesa(H), h = Math.min(300, Math.floor((y1 - y0) / 2) - 8);
    tarjetaPaquete(g, AJ, p, 'normal', 12, y0, W - 24, h, botones);
    tarjetaPaquete(g, AJ, p, 'jefe', 12, y0 + h + 14, W - 24, h, botones);
  };

  // ---------- abrir un paquete ----------
  const NOMBRE_PREMIO = (AJ, pr) => (pr.tipo === 'equipo' ? AJ.equipo[pr.hueco][pr.rareza].nombre : pr.tipo === 'arma' ? AJ.armas[pr.id].nombre : AJ.mascotas[pr.id].nombre);
  UI.REVELA = 0.9;

  function rayos(g, x, y, color, t) {
    g.save(); g.translate(x, y); g.rotate(t * 0.6); g.globalAlpha = 0.4; g.fillStyle = color;
    for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(0, 0); g.lineTo(-30, -420); g.lineTo(30, -420); g.fill(); }
    g.restore();
  }

  function lineaPremio(pr) {
    if (!pr.nuevo) return tr('Repetido: +{n} monedas', { n: pr.monedas });
    if (pr.tipo !== 'equipo' && pr.nivel > 1) return tr('¡Sube a nivel {n}!', { n: pr.nivel });
    return tr('¡NUEVO!');
  }

  UI.apertura = function (g, W, H, t, AJ, a) {
    UI.fondoMenu(g, W, H, 'fondo-sede');
    g.fillStyle = 'rgba(10,5,20,0.82)'; g.fillRect(0, 0, W, H);
    const d = t - a.t0, pr = a.premio, cx = W / 2, cy = H * 0.4;
    if (d < UI.REVELA) {
      const k = d * 14;
      V().pintaCosa(g, a.tipo === 'jefe' ? 'paqueteJefe' : 'paquete', cx + Math.sin(d * 50) * k, cy + Math.cos(d * 43) * k * 0.5, null, a.tipo === 'jefe' ? 3.5 : 4);
      return [];
    }
    const color = AJ.colorRareza[pr.rareza];
    rayos(g, cx, cy, color, t);
    if (pr.tipo === 'equipo') pintaHueco(g, pr.hueco, cx, cy, 2.5); else V().pintaCosa(g, pr.id, cx, cy, null, pr.tipo === 'arma' ? 3 : 2.5);
    UI.titulo(g, UI.nombreRareza(pr.rareza), cx, cy + 160, 50);
    UI.lineas(g, tr(NOMBRE_PREMIO(AJ, pr)), cx, cy + 222, 30, W - 60, '#ffffff', 'center', 5, 34);
    T(g, lineaPremio(pr), cx, cy + 300, 26, pr.nuevo ? C.oro : '#ffffff', 'center', 5);
    if (d > UI.REVELA + 0.6) UI.franja(g, tr('Toca para seguir'), cx, H - 80, 20);
    return d > UI.REVELA + 0.4 ? [{ x: 0, y: 0, w: W, h: H, accion: 'cerrarApertura' }] : [];
  };
})(BAS);
