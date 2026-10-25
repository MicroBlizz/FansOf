// Fans of Rouflage · LOS COCHES APARCADOS (rediseño elegido por Daniel el 26-10-2026): seis modelos modernos INVENTADOS (sin marcas, logotipos ni
// rejillas de ningún fabricante), vistos desde arriba con el morro hacia arriba y centrados en (0, 0), en la misma plaza de siempre. Con el estilo
// del coche del jefe (dibujo-roaster.js): contorno grueso, un lado en sombra y reflejos en el cristal. pintaCoche (dibujo-parking.js) elige
// modelo y color por la variante del mueble (m.v): compacto, berlina eléctrica, todoterreno, pickup, monovolumen y mini eléctrico.
'use strict';
const CB = {};
(() => {
  const N = '#1b1526', G = '#2c2538', CR = '#9fd6e8';
  const rueda = (c, x, y, h = 12) => { forma(c, caja(x - 3.5, y - h / 2, 7, h, 2.5), OL, 0); forma(c, caja(x - 2, y - h / 2 + 2, 4, h - 4, 1.2), '#4a4458', 1); };
  const sombra = () => {};      // la sombra la pone pintaCoche, sin girar
  // el lado en sombra y el brillo, recortados a la carrocería
  const volumen = (c, cuerpo, col) => {
    c.save(); c.beginPath(); cuerpo(c); c.clip();
    c.fillStyle = tono(col, -0.16); c.fillRect(8, -40, 30, 80);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-16, -40, 3, 80);
    c.restore();
  };
  // cristal oscuro con dos reflejos
  const cristal = (c, traza, lw = 2.5) => {
    forma(c, traza, N, lw);
    c.save(); c.beginPath(); traza(c); c.clip();
    c.fillStyle = G; c.fillRect(-30, -40, 24, 80);
    c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.moveTo(-10, -40); c.lineTo(-5, -40); c.lineTo(-17, 10); c.lineTo(-22, 10); c.closePath(); c.fill();
    c.fillStyle = 'rgba(159,214,232,0.3)'; c.beginPath(); c.moveTo(0, -40); c.lineTo(3, -40); c.lineTo(-9, 10); c.lineTo(-12, 10); c.closePath(); c.fill();
    c.restore();
  };
  const espejos = (c, y, col, w = 19) => { forma(c, poli(-w, y, -w - 5, y + 1, -w - 4.5, y + 4, -w, y + 3.5), col, 1.8); forma(c, poli(w, y, w + 5, y + 1, w + 4.5, y + 4, w, y + 3.5), tono(col, -0.16), 1.8); };

  // 1 · COMPACTO: un utilitario corto y redondito, capó corto y la luna de atrás casi vertical
  CB.compacto = (c, col) => {
    sombra(c, 21, 25);
    for (const [x, y] of [[-17, -13], [17, -13], [-17, 13], [17, 13]]) rueda(c, x, y, 11);
    const cuerpo = cc => rrPathRF(cc, -17, -22, 34, 44, 11);
    forma(c, cuerpo, col, 3); volumen(c, cuerpo, col);
    raya(c, [-9, -21, -11, -12], 'rgba(32,16,44,0.3)', 1.2); raya(c, [9, -21, 11, -12], 'rgba(32,16,44,0.3)', 1.2);
    cristal(c, cc => { cc.moveTo(-12, -10); cc.lineTo(12, -10); cc.lineTo(14, -2); cc.lineTo(14, 14); cc.lineTo(11, 17); cc.lineTo(-11, 17); cc.lineTo(-14, 14); cc.lineTo(-14, -2); cc.closePath(); });
    forma(c, caja(-11, -1, 22, 13, 4), tono(col, 0.06), 2);      // el techo, del color
    for (const s of [-1, 1]) { forma(c, poli(s * 15, -19, s * 8, -21.5, s * 8, -19, s * 13, -16.5), '#fff6ea', 1.4); forma(c, poli(s * 15, 19, s * 9, 21.5, s * 9, 19.5, s * 14, 17.5), '#ff4b5c', 1.4); }
    espejos(c, -9, col, 17);
  };
  // 2 · BERLINA ELÉCTRICA: larga y lisa, sin rejilla, techo entero de cristal y una tira de luz de lado a lado delante y detrás
  CB.berlina = (c, col) => {
    sombra(c, 21, 27);
    for (const [x, y] of [[-18, -15], [18, -15], [-18, 15], [18, 15]]) rueda(c, x, y, 12);
    const cuerpo = poli(-12, -25, 12, -25, 18, -19, 19.5, -6, 19.5, 14, 17, 22, 11, 25, -11, 25, -17, 22, -19.5, 14, -19.5, -6, -18, -19);
    forma(c, cuerpo, col, 3); volumen(c, cuerpo, col);
    raya(c, [-13, -22, -15, -11], 'rgba(32,16,44,0.28)', 1.2); raya(c, [13, -22, 15, -11], 'rgba(32,16,44,0.28)', 1.2);
    cristal(c, poli(-12, -11, 12, -11, 15.5, -4, 15.5, 13, 12, 19, -12, 19, -15.5, 13, -15.5, -4));
    raya(c, [-14, -1, 14, -1], 'rgba(255,255,255,0.2)', 1); raya(c, [-14.5, 9, 14.5, 9], 'rgba(255,255,255,0.15)', 1);
    forma(c, caja(-14, -24.5, 28, 2.4, 1.2), '#fff6ea', 1.4);      // la tira de luz delantera
    forma(c, caja(-15, 22.3, 30, 2.2, 1.1), '#ff4b5c', 1.4);      // y la de atrás
    for (const s of [-1, 1]) raya(c, [s * 19.6, -2, s * 19.6, 2], OL, 2.2);      // las manetas escondidas
    espejos(c, -10, col, 19.5);
  };
  // 3 · TODOTERRENO (SUV): cuadrado y alto, con los pasos de rueda negros, barras en el techo y un portón con la rueda de repuesto
  CB.suv = (c, col) => {
    sombra(c, 23, 27);
    for (const [x, y] of [[-18.5, -14], [18.5, -14], [-18.5, 14], [18.5, 14]]) rueda(c, x, y, 13);
    for (const [x, y] of [[-19.5, -14], [19.5, -14], [-19.5, 14], [19.5, 14]]) forma(c, caja(x - 2.5, y - 8, 5, 16, 2), G, 1.6);      // los pasos de rueda de plástico
    const cuerpo = cc => rrPathRF(cc, -18, -24, 36, 48, 5);
    forma(c, cuerpo, col, 3); volumen(c, cuerpo, col);
    forma(c, caja(-14, -23, 28, 4, 1.5), G, 1.6);      // la parrilla ancha, de plástico negro
    for (const s of [-1, 1]) forma(c, caja(s > 0 ? 6 : -14, -23.5, 8, 2.5, 1), '#fff6ea', 1.2);
    cristal(c, poli(-14, -12, 14, -12, 15, -8, 15, 18, -15, 18, -15, -8));
    forma(c, caja(-13, -7, 26, 23, 3), tono(col, 0.05), 2.2);      // el techo, del color
    for (const x of [-10, 10]) { raya(c, [x, -6, x, 15], OL, 3.4); raya(c, [x, -6, x, 15], '#b8bcc6', 1.6); }      // las barras
    forma(c, caja(-15, 21, 30, 2.5, 1), '#ff4b5c', 1.3);
    forma(c, ovalo(0, 25.5, 6, 2.6), OL, 0); forma(c, ovalo(0, 25.2, 4.5, 1.8), '#4a4458', 0);      // la rueda de repuesto, detrás
    espejos(c, -12, col, 18);
  };
  // 4 · PICKUP: cabina delante y caja abierta detrás, con sus nervios y una caja de herramientas
  CB.pickup = (c, col) => {
    sombra(c, 22, 28);
    for (const [x, y] of [[-18, -15], [18, -15], [-18, 15], [18, 15]]) rueda(c, x, y, 13);
    const cuerpo = cc => rrPathRF(cc, -18, -26, 36, 52, 5);
    forma(c, cuerpo, col, 3); volumen(c, cuerpo, col);
    forma(c, caja(-15, -25, 30, 4, 1.5), G, 1.6); for (const x of [-11, -5, 1, 7]) raya(c, [x, -24.5, x + 3, -21.5], '#6d6680', 1);      // la rejilla
    for (const s of [-1, 1]) forma(c, caja(s > 0 ? 9 : -16, -25.5, 7, 3, 1), '#fff6ea', 1.2);
    raya(c, [0, -21, 0, -13], 'rgba(32,16,44,0.3)', 1.2);      // el nervio del capó
    cristal(c, poli(-14, -12, 14, -12, 15, -8, 15, 2, -15, 2, -15, -8));
    forma(c, caja(-13, -6, 26, 7, 2), tono(col, 0.05), 2);
    forma(c, caja(-15, 4, 30, 20, 2), tono(col, -0.3), 2.5);      // la caja, por dentro
    for (const x of [-9, -3, 3, 9]) raya(c, [x, 6, x, 22], 'rgba(255,255,255,0.18)', 1.6);
    forma(c, caja(-12, 6, 13, 7, 1.5), '#ffcb3d', 1.6); raya(c, [-7.5, 6, -7.5, 13], OL, 1.4);      // la caja de herramientas
    for (const s of [-1, 1]) forma(c, caja(s > 0 ? 12 : -17, 24, 5, 2.4, 1), '#ff4b5c', 1.2);
    espejos(c, -11, col, 18);
  };
  // 5 · MONOVOLUMEN: capó cortito y un techo muy largo, con el raíl de la puerta corredera y ventanillas detrás
  CB.mono = (c, col) => {
    sombra(c, 21, 28);
    for (const [x, y] of [[-18, -17], [18, -17], [-18, 16], [18, 16]]) rueda(c, x, y, 12);
    const cuerpo = cc => { cc.moveTo(-10, -27); cc.lineTo(10, -27); cc.quadraticCurveTo(18, -25, 18.5, -16); cc.lineTo(18.5, 22); cc.quadraticCurveTo(18.5, 26, 14, 26); cc.lineTo(-14, 26); cc.quadraticCurveTo(-18.5, 26, -18.5, 22); cc.lineTo(-18.5, -16); cc.quadraticCurveTo(-18, -25, -10, -27); cc.closePath(); };
    forma(c, cuerpo, col, 3); volumen(c, cuerpo, col);
    for (const s of [-1, 1]) forma(c, poli(s * 15, -22, s * 8, -26, s * 8, -24, s * 13, -20), '#fff6ea', 1.4);
    cristal(c, poli(-13, -19, 13, -19, 15.5, -13, -15.5, -13));      // el parabrisas, enorme e inclinado
    forma(c, caja(-15, -12, 30, 34, 4), tono(col, 0.05), 2.4);      // el techo largo
    cristal(c, caja(-12, -9, 24, 9, 2), 1.8);      // el techo solar
    for (const s of [-1, 1]) raya(c, [s * 18.6, -2, s * 18.6, 12], OL, 2.6);      // el raíl de la corredera
    forma(c, caja(-15, 23, 30, 2.4, 1.2), '#ff4b5c', 1.3);
    espejos(c, -15, col, 18.5);
  };
  // 6 · MINI ELÉCTRICO: de dos plazas, cortísimo, casi todo burbuja de cristal, con el enchufe en un lado
  CB.mini = (c, col) => {
    sombra(c, 19, 20);
    for (const [x, y] of [[-16, -10], [16, -10], [-16, 10], [16, 10]]) rueda(c, x, y, 10);
    const cuerpo = cc => rrPathRF(cc, -16, -18, 32, 36, 12);
    forma(c, cuerpo, col, 3); volumen(c, cuerpo, col);
    cristal(c, cc => rrPathRF(cc, -12.5, -11, 25, 24, 9));
    forma(c, caja(-9, -4, 18, 11, 4), tono(col, 0.06), 2);      // la franja del techo, del color
    for (const s of [-1, 1]) { forma(c, ovalo(s * 9, -16, 3.6, 1.8), '#fff6ea', 1.3); forma(c, ovalo(s * 9, 16.2, 3.4, 1.6), '#ff4b5c', 1.3); }
    forma(c, ovalo(16.2, 3, 1.8, 2.6), '#7ee04a', 1.4);      // la tapa del enchufe
    espejos(c, -8, col, 16);
  };
})();
