// Fans of Basement · Vista del mundo (solo pantalla): la cámara que sigue al jugador, el hueco del ascensor de Microblizz con
// sus paredes y las puertas de cada planta (con su cartel y los carteles de empresa), el botín, los enemigos, las grapas,
// el jugador y la cabina del ascensor de emergencia que baja a recogerte.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const V = B.vista = { camY: 0 };
  const PX = 3;   // cada píxel de los dibujos son 3 unidades del juego
  const LEMAS = ['SINERGIA', 'EL CRUNCH ES PASIÓN', '¿LO HAS REINICIADO?', 'MONETIZA TUS SUEÑOS', 'NO ES UN BUG, ES UNA FEATURE',
    'REUNIÓN A LAS 8:00', 'SOMOS UNA FAMILIA', 'PIENSA EN EL ACCIONISTA'];
  const hash = (n) => { let h = (n * 2654435761) >>> 0; h = (h ^ (h >>> 13)) >>> 0; return (h % 1000) / 1000; };

  V.reiniciar = (e, H) => { V.camY = e.jugador.y - H * 0.38; };
  V.camara = function (e, H, dt) {
    const quiero = e.jugador.y - H * 0.38;
    V.camY += (quiero - V.camY) * Math.min(1, dt * 6);
  };

  function planta(g, AJ, n, texto) {
    const z = B.zonaDe(AJ, n), y0 = n * AJ.altoPlanta, A = AJ.altoPlanta, W = AJ.ancho;
    g.fillStyle = z.fondo; g.fillRect(0, y0, W, A);
    g.fillStyle = 'rgba(0,0,0,0.07)';
    for (let x = AJ.pared + 30; x < W - AJ.pared; x += 60) g.fillRect(x, y0, 24, A);
    puertas(g, W, y0, n, z, texto);
    if (hash(n) > 0.25) cartelEmpresa(g, AJ, n, y0, texto);
    if (z.crunch) { g.fillStyle = 'rgba(229,50,45,0.10)'; g.fillRect(0, y0, W, A); }
  }

  function puertas(g, W, y0, n, z, texto) {
    const x = W / 2 - 42;
    g.fillStyle = '#161616'; g.fillRect(x - 4, y0 + 10, 92, 74);
    g.fillStyle = '#b8c4d6'; g.fillRect(x, y0 + 14, 41, 70); g.fillRect(x + 43, y0 + 14, 41, 70);
    g.fillStyle = '#8a97ab'; g.fillRect(x + 6, y0 + 20, 3, 58); g.fillRect(x + 75, y0 + 20, 3, 58);
    g.fillStyle = '#161616'; g.fillRect(x + 22, y0 - 16, 40, 22);
    texto(g, n ? '-' + n : '0', W / 2, y0 + 1, 14, '#ffe14a');
    texto(g, tr(z.nombre).toUpperCase(), W / 2, y0 + 100, 11, '#ffffff');
  }

  function cartelEmpresa(g, AJ, n, y0, texto) {
    const lado = hash(n * 3) > 0.5, x = lado ? AJ.pared + 52 : AJ.ancho - AJ.pared - 52, y = y0 + 150 + hash(n * 7) * 60;
    g.save(); g.translate(x, y); g.rotate((hash(n * 5) - 0.5) * 0.12);
    g.fillStyle = '#161616'; g.fillRect(-46, -20, 92, 40);
    g.fillStyle = '#ffffff'; g.fillRect(-44, -18, 88, 36);
    g.fillStyle = '#e5322d'; g.fillRect(-44, -18, 88, 6);
    const lema = tr(LEMAS[Math.floor(hash(n * 11) * LEMAS.length)]);
    parteLema(g, lema, texto);
    g.restore();
  }
  function parteLema(g, lema, texto) {
    const pal = lema.split(' '), mitad = Math.ceil(pal.length / 2);
    const l1 = pal.slice(0, mitad).join(' '), l2 = pal.slice(mitad).join(' ');
    texto(g, l1, 0, l2 ? 2 : 8, 9, '#1a1a1a', 'center', false, false);
    if (l2) texto(g, l2, 0, 13, 9, '#1a1a1a', 'center', false, false);
  }

  function paredes(g, AJ, yA, yB) {
    const W = AJ.ancho, P = AJ.pared;
    for (let n = Math.max(0, Math.floor(yA / AJ.altoPlanta)); n * AJ.altoPlanta < yB; n++) {
      const z = B.zonaDe(AJ, n), y0 = n * AJ.altoPlanta;
      g.fillStyle = z.pared; g.fillRect(0, y0, P, AJ.altoPlanta); g.fillRect(W - P, y0, P, AJ.altoPlanta);
    }
    g.fillStyle = 'rgba(0,0,0,0.25)';
    const ini = Math.floor(yA / 20) * 20;
    for (let y = ini; y < yB; y += 20) { const d = (y / 20) % 2 ? 0 : 8; g.fillRect(d, y, P - d, 2); g.fillRect(W - P, y, P - d, 2); }
    g.fillStyle = '#161616'; g.fillRect(P - 3, yA, 3, yB - yA); g.fillRect(W - P, yA, 3, yB - yA);
  }

  function recepcion(g, AJ, yA, texto) {
    if (yA >= 0) return;
    g.fillStyle = '#2a3250'; g.fillRect(0, yA, AJ.ancho, -yA);
    texto(g, tr('RECEPCIÓN DE MICROBLIZZ'), AJ.ancho / 2, -22, 13, '#ffe14a');
  }

  function objetos(g, e) {
    for (const o of e.objetos) B.dibujaSprite(g, o.tipo, o.x, o.y + Math.sin(e.t * 4 + o.id) * 2, 2.5);
  }

  function enemigos(g, e) {
    for (const en of e.enemigos) {
      const blanco = en.golpeT > 0;
      B.dibujaSprite(g, en.tipo, en.x, en.y, PX, { blanco, izq: en.dir < 0 && en.tipo === 'bug' });
      if (en.tipo === 'reunion' && en.vida < en.vidaMax) barraVida(g, en);
    }
  }
  function barraVida(g, en) {
    const w = 44, x = en.x - w / 2, y = en.y - en.radio - 14;
    g.fillStyle = '#161616'; g.fillRect(x - 1, y - 1, w + 2, 6);
    g.fillStyle = '#e5322d'; g.fillRect(x, y, w * Math.max(0, en.vida / en.vidaMax), 4);
  }

  function balas(g, e) {
    for (const b of e.balas) {
      g.save(); g.translate(b.x, b.y); g.rotate(Math.atan2(b.vy, b.vx));
      g.fillStyle = '#161616'; g.fillRect(-5, -2, 10, 4);
      g.fillStyle = '#e8eef7'; g.fillRect(-4, -1, 8, 2);
      g.restore();
    }
  }

  function jugador(g, e) {
    const j = e.jugador;
    if (j.invulT > 0 && Math.floor(j.invulT * 14) % 2) return;
    B.dibujaSprite(g, 'jugador', j.x, j.y, PX, { izq: j.mira < 0 });
    if (j.frenoT > 0) { g.fillStyle = 'rgba(229,50,45,0.35)'; g.beginPath(); g.arc(j.x, j.y, 26, 0, Math.PI * 2); g.fill(); }
  }

  // La cabina baja desde arriba durante la espera y se para justo encima del jugador.
  function ascensor(g, e, H) {
    if (e.ascensorT < 0 && !(e.fin === 'ascensor')) return;
    const j = e.jugador, falta = Math.max(0, e.ascensorT) / e.aj.ascensor.espera, y = j.y - 36 - falta * H * 0.55;
    g.fillStyle = '#161616'; g.fillRect(j.x - 2, V.camY - 10, 4, y - V.camY);
    g.fillRect(j.x - 34, y - 46, 68, 52);
    g.fillStyle = '#ff8a2a'; g.fillRect(j.x - 31, y - 43, 62, 46);
    g.fillStyle = '#ffe14a'; g.fillRect(j.x - 24, y - 36, 48, 8);
  }

  V.dibujar = function (g, e, W, H, texto) {
    const AJ = e.aj, yA = V.camY, yB = V.camY + H;
    g.save(); g.translate(0, -Math.round(V.camY));
    recepcion(g, AJ, yA, texto);
    for (let n = Math.max(0, Math.floor(yA / AJ.altoPlanta)); n * AJ.altoPlanta < yB; n++) planta(g, AJ, n, texto);
    paredes(g, AJ, Math.max(0, yA), yB);
    objetos(g, e); enemigos(g, e); balas(g, e); jugador(g, e); ascensor(g, e, H);
    B.efectos.dibujarMundo(g, texto);
    g.restore();
  };
  V.PX = PX;
})(BAS);
