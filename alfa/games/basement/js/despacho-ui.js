// Fans of Basement · Tu despacho (solo pantalla, estilo Swipe): una escena pintada con código que crece contigo. La sala cambia con
// el cargo (cubículo con mampara, oficina con puerta, despacho con ventanal y la planta del CEO con la ciudad de noche); en la
// estantería, los trofeos de los jefes vencidos (los que faltan, en sombra); en el tablón, tus armas; el terrario con los bichos
// capturados; tu becario en su mesa con lo que lleva puesto, su mascota y el cuadro del catálogo completo. Lo que sale lo
// decide despacho.js (dominio). Se abre con el botón DESPACHO de la cabecera de la mesa.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, C = UI.C, T = UI.texto, V = () => B.vista;
  const SALA = {   // pared, zócalo, suelo y nombre
    cubiculo: ['#9a9284', '#6e675c', '#4a4038', 'Cubículo compartido'],
    oficina: ['#4f6f95', '#34506f', '#3a2c22', 'Oficina con puerta'],
    despacho: ['#8a5a34', '#5e3a1e', '#2c1e16', 'Despacho con ventanal'],
    planta: ['#2b2b35', '#1a1a20', '#120e0a', 'La planta del CEO'],
  };
  const JEFE = { producto: 'ladirectora', rrhh: 'survivalbot', lanzamiento: 'servidorbot', accionistas: 'presidente', ceo: 'ceo', becario2004: 'becario', fantasma: 'servidorbot', impresora: 'r-tarjeta' };
  const ORO = 'sepia(1) saturate(5) brightness(1.15)';   // las estatuillas doradas de los jefes secretos
  const hash = (n) => ((n * 2654435761) >>> 0) % 1000 / 1000;

  // el ventanal: cielo y edificios (de día en el despacho, de noche con luces en la planta del CEO)
  function ventanal(g, x, y, w, h, noche) {
    g.fillStyle = noche ? '#141a3a' : '#8ac4ff'; g.fillRect(x, y, w, h);
    for (let i = 0; i < 9; i++) {
      const bw = w / 9, bh = h * (0.35 + hash(i + 3) * 0.5), bx = x + i * bw;
      g.fillStyle = noche ? '#232a50' : '#5a7a9a'; g.fillRect(bx + 2, y + h - bh, bw - 4, bh);
      if (noche) for (let k = 0; k < 6; k++) if (hash(i * 7 + k) > 0.4) { g.fillStyle = '#ffd23a'; g.fillRect(bx + 6 + (k % 2) * 12, y + h - bh + 8 + Math.floor(k / 2) * 16, 6, 8); }
    }
    g.strokeStyle = '#1a1a1a'; g.lineWidth = 6; g.strokeRect(x, y, w, h);
    g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.stroke();
  }

  function sala(g, W, d, y0, y1) {
    const [pared, zocalo, suelo] = SALA[d.sala], ys = y1 - 150;
    g.fillStyle = pared; g.fillRect(0, y0, W, ys - y0);
    g.fillStyle = zocalo; g.fillRect(0, ys - 16, W, 16);
    g.fillStyle = suelo; g.fillRect(0, ys, W, y1 - ys);
    if (d.sala === 'cubiculo') { g.fillStyle = '#c8bfae'; g.fillRect(0, ys - 120, 30, 120); g.fillRect(W - 30, ys - 120, 30, 120); }
    if (d.sala === 'oficina') { UI.panel(g, 24, ys - 210, 90, 194, '#6b4424', null, null, 4); g.fillStyle = C.oro; g.fillRect(96, ys - 120, 8, 8); }
    if (d.sala === 'despacho' || d.sala === 'planta') ventanal(g, W / 2 - 150, y0 + 20, 300, 150, d.sala === 'planta');
    return ys;
  }

  // la estantería con los cinco jefes: los vencidos, con su dibujo; los demás, en sombra
  function trofeos(g, AJ, d, x, y, w) {
    g.fillStyle = '#5e3a1e'; g.fillRect(x, y + 52, w, 12);
    AJ.jefes.orden.forEach((id, i) => {
      const cx = x + 30 + i * ((w - 60) / 4), vencido = d.trofeos.includes(id);
      UI.dibuja(g, JEFE[id], cx, y + 14, id === 'ceo' ? 0.62 : 0.75, vencido ? null : { filtro: 'brightness(0)', alfa: 0.4 });
    });
  }

  // el tablón con tus armas
  function armas(g, AJ, d, x, y) {
    UI.panel(g, x, y, 190, 140, '#c8a070', '#e0c090', '#8a6a40', 4);
    d.armas.slice(0, 12).forEach((id, i) => V().pintaCosa(g, id, x + 26 + (i % 4) * 46, y + 28 + Math.floor(i / 4) * 44, null, 0.62));
    if (!d.armas.length) UI.lineas(g, tr('Tus armas irán aquí'), x + 95, y + 60, 15, 160, C.cafe, 'center', 0, 17);
  }

  // el terrario con los bichos capturados, que se mueven un poco
  function terrario(g, d, x, y, t) {
    g.fillStyle = 'rgba(160,220,255,0.25)'; g.fillRect(x, y, 170, 110);
    g.fillStyle = '#4a7a3a'; g.fillRect(x, y + 92, 170, 18);
    d.terrario.slice(0, 6).forEach((b, i) => {
      const bx = x + 30 + (i % 3) * 55 + Math.sin(t * 2 + i) * 6, by = y + 40 + Math.floor(i / 3) * 40;
      V().pintaCosa(g, b.id, bx, by, null, 0.45);
      if (b.n > 1) T(g, 'x' + b.n, bx + 18, by + 14, 13, '#ffffff', 'center', 3);
    });
    if (!d.terrario.length) UI.lineas(g, tr('Captura bichos con la RED'), x + 85, y + 50, 14, 150, '#ffffff', 'center', 3, 16);
    g.strokeStyle = '#1a1a1a'; g.lineWidth = 5; g.strokeRect(x, y, 170, 110);
    T(g, tr('TERRARIO'), x + 85, y - 12, 14, C.crema, 'center', 3);
  }

  // lo que decora: el cartel con el lema de la empresa, el reloj y una planta (más grande cuanto mejor la sala)
  const LEMAS = ['SINERGIA', 'SOMOS UNA FAMILIA', 'EL CRUNCH ES PASIÓN', 'PIENSA EN EL ACCIONISTA'];
  function adornos(g, d, W, ys, t) {
    const n = Object.keys(SALA).indexOf(d.sala);
    UI.panel(g, 30, ys - 250, 150, 70, '#ffffff', null, null, 3);
    UI.lineas(g, tr(LEMAS[n]), 105, ys - 225, 15, 130, C.rojo, 'center', 0, 17);
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(W - 60, ys - 430, 22, 0, 7); g.fill();
    g.strokeStyle = '#1a1a1a'; g.lineWidth = 4; g.stroke();
    g.beginPath(); g.moveTo(W - 60, ys - 430); g.lineTo(W - 60 + Math.cos(t) * 14, ys - 430 + Math.sin(t) * 14); g.stroke();
    const alto = 40 + n * 22;
    g.fillStyle = '#2f7d4f'; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(46 + (i - 2) * 8, ys - 30 - alto * (0.5 + 0.1 * (i % 2)), 10, alto / 2, (i - 2) * 0.3, 0, 7); g.fill(); }
    UI.panel(g, 30, ys - 34, 34, 34, '#b0703a', null, null, 3);
  }

  // la mesa con tu becario, lo de su formación encima y la mascota al lado
  function mesa(g, AJ, p, d, W, ys) {
    UI.becario(g, AJ, B.aspectoDe(AJ, p), W / 2, ys - 90, 2.2);
    UI.panel(g, W / 2 - 130, ys - 30, 260, 50, '#6b4424', '#8a5a34', '#3a2414', 4);
    if (d.formacion.bienestar) V().pinta(g, 'r-taza', W / 2 + 90, ys - 44, 1.4);
    if (d.mascota) V().pintaCosa(g, d.mascota, W / 2 - 170, ys - 10, null, 0.7);
    d.secretos.forEach((id, i) => UI.dibuja(g, JEFE[id], W / 2 - 100 + i * 36, ys - 50, id === 'becario2004' ? 0.5 : 0.28, { filtro: ORO }));   // estatuillas de oro en la mesa
    if (d.catalogoCompleto) { UI.panel(g, 30, ys - 330, 110, 80, C.oro, '#fff3a0', '#c8901a', 4); UI.lineas(g, tr('CATÁLOGO COMPLETO'), 85, ys - 302, 14, 96, C.cafe, 'center', 0, 16); }
  }

  UI.despacho = function (g, W, H, t, AJ, p) {
    const d = B.despachoDe(AJ, p), y0 = 110, y1 = H - 120;
    g.fillStyle = '#120a1c'; g.fillRect(0, 0, W, H);
    const ys = sala(g, W, d, y0, y1);
    trofeos(g, AJ, d, 40, ys - 380, W - 80);
    armas(g, AJ, d, W - 214, ys - 250);
    adornos(g, d, W, ys, t);
    terrario(g, d, W - 190, ys + 24, t);
    mesa(g, AJ, p, d, W, ys);
    UI.panel(g, -6, -6, W + 12, 110, C.madera, '#c2432e', '#5a1714', 5);
    UI.titulo(g, tr('MI DESPACHO'), W / 2, 34, 38);
    UI.franja(g, tr(AJ.rangos[p.rango]) + ' · ' + tr(SALA[d.sala][3]), W / 2, 80, 17, W - 40);
    const volver = { x: W / 2 - 120, y: H - 100, w: 240, h: 76, accion: 'cerrarDespacho' };
    UI.boton(g, volver, 'azul', tr('VOLVER'), 30);
    return [volver];
  };
})(BAS);
