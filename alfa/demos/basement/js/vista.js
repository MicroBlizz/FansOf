// Fans of Basement · Vista de la bajada (solo pantalla), al estilo de Fans of Swipe: la cámara que sigue al jugador y el hueco del
// ascensor de Microblizz. Cada planta se ve a través del hueco con el fondo de Yoshi de su zona (estudios, oficinas, la LAN de QA o
// los servidores), separada por un forjado con su cartel; a los lados, las paredes del hueco. Encima, el botín, los enemigos (los
// bots de Swipe), las grapas, el jugador (el becario) y la cabina del ascensor de emergencia. El mundo mide 360 de ancho y se
// pinta a 1,5 píxeles de pantalla por unidad (540). Los jefes, los becarios y los ayudantes están en vista-jefes.js.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui, V = B.vista = { camY: 0, K: UI.W / B.AJ.ancho };
  const K = V.K, T = UI.texto;
  V.sx = (x) => x * K;
  V.sy = (y) => (y - V.camY) * K;
  // cómo se pinta cada cosa: [dibujo de Yoshi o propio (sprites.js), escala]
  V.DIBUJO = {
    jugador: ['becario', 1.5], bug: ['descargabot', 1.1], correo: ['plusbot', 1.1], miniCorreo: ['plusbot', 0.65], reunion: ['reunion', 5],
    codigo: ['r-tarjeta', 2], postit: ['r-post', 1.6], taza: ['r-taza', 2], cafe: ['cafe', 4], paquete: ['paquete', 4], paqueteJefe: ['cajabotin', 0.8],
    pato: ['pato', 4], gato: ['gato', 4], roomba: ['roomba', 4], dron: ['soportebot', 0.8],
    dorado: ['descargabot', 1.1, 'sepia(1) saturate(5) brightness(1.15)'], spam: ['plusbot', 1.1, 'hue-rotate(150deg) saturate(1.6)'],
    critico: ['descargabot', 1.7, 'hue-rotate(-120deg) saturate(2.2)'],
    grapadora: ['r-grapadora', 2], clips: ['lanzaclips', 4], taladro: ['taladro', 4], extintor: ['extintor', 4], raton: ['raton', 4],
  };
  // los muebles que se rompen y los materiales del taller (0.6.0)
  Object.assign(V.DIBUJO, { taquilla: ['taquilla', 4.5], fotocopiadora: ['fotocopiadora', 4.5], maquina: ['maquina', 4.5], rack: ['rack', 4.5],
    tornillo: ['tornillo', 2.6], cable: ['cable', 2.6], chip: ['chip', 2.4], disco: ['disco', 2.4] });
  // las armas de la 0.5.0: su icono es el mismo dibujo que llevan en la mano (aspecto-capas.js)
  for (const id of ['cinta', 'perforadora', 'abrecartas', 'boli', 'impresora', 'trituradora', 'router', 'laser', 'sello', 'proyector', 'taza', 'industrial']) V.DIBUJO[id] = ['arma-' + id, 3];
  // pinta lo que sea: si hay dibujo de Yoshi (img/), ese; si no, el propio en píxel (sprites.js)
  V.pinta = function (g, n, x, y, esc, opc) {
    const o = opc || {};
    if (UI.IMG[n]) return UI.dibuja(g, n, x, y, esc, { ...o, filtro: o.blanco ? 'brightness(6)' : o.filtro });
    B.dibujaSprite(g, n, x, y, esc, o);
    return true;
  };
  V.pintaCosa = (g, tipo, x, y, opc, extraEsc) => { const d = V.DIBUJO[tipo]; V.pinta(g, d[0], x, y, d[1] * (extraEsc || 1), d[2] ? { ...opc, filtro: (opc && opc.blanco) ? undefined : d[2] } : opc); };

  const LEMAS = ['SINERGIA', 'EL CRUNCH ES PASIÓN', '¿LO HAS REINICIADO?', 'MONETIZA TUS SUEÑOS', 'NO ES UN BUG, ES UNA FEATURE',
    'REUNIÓN A LAS 8:00', 'SOMOS UNA FAMILIA', 'PIENSA EN EL ACCIONISTA'];
  const hash = (n) => { let h = (n * 2654435761) >>> 0; h = (h ^ (h >>> 13)) >>> 0; return (h % 1000) / 1000; };

  V.reiniciar = (e, H) => { V.camY = e.jugador.y - H / K * 0.38; };
  V.camara = function (e, H, dt) {
    const quiero = e.jugador.y - H / K * 0.38;
    V.camY += (quiero - V.camY) * Math.min(1, dt * 6);
  };

  // ---------- el hueco del ascensor ----------
  function planta(g, AJ, n, W) {
    const z = B.zonaDe(AJ, n), y = V.sy(n * AJ.altoPlanta), h = AJ.altoPlanta * K;
    UI.fondo(g, z.img, 0, y, W, h, 0.32, z.filtro);
    if (z.crunch && Math.floor(performance.now() / 600) % 2) { g.fillStyle = 'rgba(232,65,58,0.10)'; g.fillRect(0, y, W, h); }
    if (hash(n) > 0.3) cartel(g, n, y);
    forjado(g, W, y, n, z);
  }

  // la losa entre plantas, con el número de planta y la zona
  function forjado(g, W, y, n, z) {
    UI.panel(g, -6, y - 12, W + 12, 24, '#4a3a4e', '#6a5670', '#2a1830', 3);
    UI.panel(g, W / 2 - 110, y - 22, 220, 44, '#1a0f1f', null, null, 3);
    UI.textoCabe(g, (n ? '-' + n : '0') + ' · ' + tr(z.nombre).toUpperCase(), W / 2, y - 1, 17, 200, '#ffd84a', 'center', 3);
  }

  function cartel(g, n, y0) {
    const izq = hash(n * 3) > 0.5, x = izq ? 110 : 430, y = y0 + 230 + hash(n * 7) * 150;
    g.save(); g.translate(x, y); g.rotate((hash(n * 5) - 0.5) * 0.1);
    UI.panel(g, -72, -30, 144, 60, UI.C.perg, UI.C.perg2, '#e2cfa6', 3);
    g.fillStyle = UI.C.rojo; g.fillRect(-68, -26, 136, 8);
    UI.lineas(g, tr(LEMAS[Math.floor(hash(n * 11) * LEMAS.length)]), 0, 0, 12, 128, UI.C.cafe, 'center', 0, 14);
    g.restore();
  }

  function paredes(g, AJ, W, H) {
    const P = AJ.pared * K;
    for (const x of [0, W - P]) {
      UI.panel(g, x - 4, -10, P + 8, H + 20, '#3a2e48', '#4a3c5a', '#241a30', 3);
      g.fillStyle = '#1a0f1f';
      const ini = Math.floor(V.camY * K / 60) * 60 - V.camY * K;
      for (let y = ini; y < H; y += 60) { g.fillRect(x + P / 2 - 3, y, 6, 6); g.fillRect(x + 2, y + 30, P - 4, 3); }
    }
  }

  function recepcion(g, W) {
    const y = V.sy(0);
    if (y <= 0) return;
    UI.fondo(g, 'fondo-vestibulo', 0, y - 960, W, 960, 0.1);
    UI.franja(g, tr('RECEPCIÓN DE MICROBLIZZ'), W / 2, y - 60, 18);
  }

  // ---------- lo que hay en el hueco ----------
  function objetos(g, e) {
    for (const o of e.objetos) V.pintaCosa(g, o.tipo, V.sx(o.x), V.sy(o.y) + Math.sin(e.t * 4 + o.id) * 3);
  }

  function muebles(g, e) {
    for (const m of e.muebles) {
      const x = V.sx(m.x), y = V.sy(m.y);
      V.pintaCosa(g, m.tipo, x, y, { blanco: m.golpeT > 0.06 });
      if (m.vida < m.vidaMax) UI.barra(g, x - 30, y - m.radio * K - 18, 60, 10, m.vida / m.vidaMax, '#c8d2e0');
    }
  }

  function enemigos(g, e) {
    for (const en of e.enemigos) {
      const x = V.sx(en.x), y = V.sy(en.y) + Math.sin(e.t * 5 + en.id) * 2;
      V.pintaCosa(g, en.tipo, x, y, { blanco: en.golpeT > 0.06 }, 1 + en.golpeT * 1.6);   // sin voltear; al recibir, se hinchan un instante
      if (en.tipo === 'reunion' && en.vida < en.vidaMax) UI.barra(g, x - 36, y - en.radio * K - 22, 72, 14, en.vida / en.vidaMax, UI.C.rojo);
    }
  }

  const BALA = {
    grapadora(g) { g.fillStyle = '#1a0f1f'; g.fillRect(-8, -3, 16, 6); g.fillStyle = '#e8eef7'; g.fillRect(-6, -1, 12, 3); },
    ayudante(g) { g.fillStyle = '#1a0f1f'; g.fillRect(-8, -3, 16, 6); g.fillStyle = '#ffd84a'; g.fillRect(-6, -1, 12, 3); },
    clips(g) { g.fillStyle = '#1a0f1f'; g.fillRect(-6, -4, 12, 8); g.fillStyle = '#c8d2e0'; g.fillRect(-4, -2, 8, 4); },
    taladro(g) { g.fillStyle = '#1a0f1f'; g.fillRect(-12, -4, 24, 8); g.fillStyle = '#ff8a2a'; g.fillRect(-10, -2, 20, 4); g.fillStyle = '#ffd84a'; g.fillRect(4, -2, 6, 4); },
    extintor(g) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(0, 0, 11, 0, 7); g.fill(); g.fillStyle = '#c8d2e0'; g.beginPath(); g.arc(-4, -3, 5, 0, 7); g.fill(); },
    raton(g) { g.fillStyle = '#1a0f1f'; g.fillRect(-7, -7, 14, 14); g.fillStyle = '#3a8ee6'; g.fillRect(-5, -5, 10, 10); },
    cinta(g) { caja(g, 18, 8, '#e8d9a8'); },
    perforadora(g) { g.fillStyle = '#1a0f1f'; g.beginPath(); g.arc(0, 0, 5, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, 0, 3, 0, 7); g.fill(); },
    abrecartas(g) { caja(g, 26, 6, '#e0e6ee'); },
    boli(g) { caja(g, 12, 5, '#3b5bdb'); },
    impresora(g) { caja(g, 14, 18, '#ffffff'); g.fillStyle = '#9fb0c8'; g.fillRect(-4, -5, 8, 2); g.fillRect(-4, 0, 8, 2); },
    trituradora(g) { for (const dy of [-5, 0, 5]) { g.fillStyle = '#1a0f1f'; g.fillRect(-9, dy - 2, 18, 4); g.fillStyle = '#ffffff'; g.fillRect(-7, dy - 1, 14, 2); } },
    router(g) { g.strokeStyle = '#5fe05f'; g.lineWidth = 4; g.beginPath(); g.arc(-6, 0, 10, -0.9, 0.9); g.stroke(); },
    laser(g) { g.fillStyle = 'rgba(255,59,45,0.45)'; g.fillRect(-26, -4, 52, 8); g.fillStyle = '#ff3b2d'; g.fillRect(-24, -2, 48, 4); },
    proyector(g) { g.fillStyle = 'rgba(255,243,160,0.75)'; g.beginPath(); g.arc(0, 0, 10, 0, 7); g.fill(); },
    taza(g) { g.fillStyle = '#1a0f1f'; g.beginPath(); g.arc(0, 0, 8, 0, 7); g.fill(); g.fillStyle = '#8a4a22'; g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fill(); },
    industrial(g) { caja(g, 22, 10, '#5a6070'); g.fillStyle = '#ffd23a'; g.fillRect(-7, -1, 14, 2); },
  };
  // una bala rectangular de w×h con contorno oscuro
  function caja(g, w, h, color) { g.fillStyle = '#1a0f1f'; g.fillRect(-w / 2, -h / 2, w, h); g.fillStyle = color; g.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4); }
  function balas(g, e) {
    for (const b of e.balas) {
      g.save(); g.translate(V.sx(b.x), V.sy(b.y)); g.rotate(Math.atan2(b.vy, b.vx));
      BALA[b.quien === 'jugador' ? b.arma : 'ayudante'](g);
      g.restore();
    }
  }

  // el becario con lo que lleva puesto (aspecto.js)
  function jugador(g, e, aspecto) {
    const j = e.jugador;
    if (j.invulT > 0 && Math.floor(j.invulT * 14) % 2) return;
    const x = V.sx(j.x), y = V.sy(j.y);
    UI.becario(g, e.aj, aspecto, x, y + Math.sin(e.t * 6) * 2, V.DIBUJO.jugador[1]);   // sin voltear: nada cambia de mano
    if (j.frenoT > 0) { g.fillStyle = 'rgba(232,65,58,0.35)'; g.beginPath(); g.arc(x, y, 40, 0, Math.PI * 2); g.fill(); }
  }

  // la cabina del ascensor de emergencia baja desde arriba y se para justo encima del jugador
  function ascensor(g, e, H) {
    if (e.ascensorT < 0 && e.fin !== 'ascensor') return;
    const j = e.jugador, falta = Math.max(0, e.ascensorT) / e.stats.espera, x = V.sx(j.x), y = V.sy(j.y) - 70 - falta * H * 0.55;
    g.fillStyle = '#1a0f1f'; g.fillRect(x - 3, 0, 6, Math.max(0, y - 50));
    UI.panel(g, x - 54, y - 56, 108, 84, UI.C.naranja, '#ffc07a', '#c85a10', 4);
    UI.panel(g, x - 40, y - 40, 80, 56, '#b8c4d6', '#e8eef7', '#8a97ab', 3);
    g.fillStyle = '#1a0f1f'; g.fillRect(x - 1, y - 38, 2, 52);
    T(g, tr('ASCENSOR'), x, y - 48, 11, '#ffffff', 'center', 3);
  }

  V.dibujar = function (g, e, W, H, aspecto) {
    const AJ = e.aj, ini = Math.max(0, Math.floor(V.camY / AJ.altoPlanta)), fin = V.camY + H / K;
    g.fillStyle = '#120a1c'; g.fillRect(0, 0, W, H);
    recepcion(g, W);
    for (let n = ini; n * AJ.altoPlanta < fin; n++) planta(g, AJ, n, W);
    paredes(g, AJ, W, H);
    V.barrera(g, e, W);
    muebles(g, e); objetos(g, e); V.becarios(g, e); enemigos(g, e); V.jefe(g, e);
    balas(g, e); V.proyectiles(g, e); V.ayudantes(g, e); jugador(g, e, aspecto); ascensor(g, e, H);
    g.save(); g.scale(K, K); g.translate(0, -V.camY);
    B.efectos.dibujarMundo(g, (gg, t, x, y, tam, color) => T(gg, t, x, y, tam * 0.75, color, 'center', 2));
    g.restore();
  };
})(BAS);
