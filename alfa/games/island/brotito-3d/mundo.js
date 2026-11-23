// Fans of Island · prototipo Brotito 3D, mundo: un trozo de isla de 10 bloques con un Brotito que se mueve con las MISMAS reglas del juego
// (IS.pasoBrotito y IS.poseBrotito de dominio/brotitos.js, la física de dominio/fisica.js) y su dibujo en lonchas tal cual (PILAS_B de
// arte-personajes.js). El modelo 3D (brotito-3d.js) lee este mismo estado, así que los dos Brotitos hacen siempre lo mismo a la vez.
// IS.Prototipo3D: crea() da { estado, paso(dt), pinta(lienzo), postura() }.
'use strict';
{
  const { T, CARRIL, D } = IS.MEDIDAS;
  const { K, girada } = IS.Lonchas;
  const GIRO_DER = -Math.PI / 2 + 0.5, GIRO_IZQ = Math.PI / 2 - 0.5;   // los de dominio/jugador.js: de perfil, un poco hacia nosotros
  const COLS = 12, TIERRA = [1, 10];                                  // columnas 1 a 10 con un bloque; 0 y 11, mar
  const NIV = Array.from({ length: COLS }, (_, c) => (c >= TIERRA[0] && c <= TIERRA[1] ? { s: 0, pila: [1] } : { s: -1, pila: [] }));
  const ANCHO = 360, ALTO = 150, BASE = 118, CX = 16;                // el lienzo pequeño del dibujo (se amplía sin suavizar)
  const sy = (y, z) => BASE + Math.round(y * K) - Math.round(z);

  function crea() {
    const fis = IS.creaFisica({ COLS, NIV, PLAT: [] });
    const estado = { fis, J: { x: 99999, z: 32 }, siguiendo: false, fija: null, lento: false };
    const nuevo = () => ({ x: 5.5 * T, y: CARRIL, z: fis.arribaCol(5), vx: 0, vz: 0, mira: -1, giro: GIRO_IZQ, t: 0.2, estado: 'quieto', muerto: 0 });
    estado.e = nuevo();
    const mundo = () => ({ J: estado.J, fis, azar: Math.random, giroDer: GIRO_DER, giroIzq: GIRO_IZQ });
    function paso(dt) {   // un fotograma: si hay postura fija, el Brotito se queda donde está
      const e = estado.e;
      if (estado.fija && !e.muerto) { IS.giraBicho(mundo(), e, dt); return; }
      IS.pasoBrotito(mundo(), e, dt);
      if (e.muerto > 1.3 || e.z < -200) estado.e = nuevo();
    }
    const postura = () => (estado.fija && !estado.e.muerto ? estado.fija : IS.poseBrotito(estado.e));
    const visible = () => !(estado.e.muerto > 0.35);   // como dibujo-escena.js: pisado, se ve aplastado un momento y desaparece
    return { estado, paso, postura, visible, pisa: () => { if (!estado.e.muerto) estado.e.muerto = 0.01; } };
  }

  function suelo(g) {   // cielo, mar y los 10 bloques de tierra (cara de arriba con hierba y frente de arena)
    const cielo = g.createLinearGradient(0, 0, 0, ALTO);
    cielo.addColorStop(0, '#7fd3ff'); cielo.addColorStop(1, '#d8f4ff');
    g.fillStyle = cielo; g.fillRect(0, 0, ANCHO, ALTO);
    g.fillStyle = '#2f9fd6'; g.fillRect(0, sy(0, -8), ANCHO, ALTO);
    const x0 = TIERRA[0] * T - CX, x1 = (TIERRA[1] + 1) * T - CX, arriba = sy(0, 32), frente = sy(D, 32);
    g.fillStyle = '#6cc24a'; g.fillRect(x0, arriba, x1 - x0, frente - arriba);
    g.fillStyle = '#4f9e2a'; g.fillRect(x0, frente - 1, x1 - x0, 2);
    g.fillStyle = '#e8c27a'; g.fillRect(x0, frente + 1, x1 - x0, 32);
    g.fillStyle = '#c99a52'; for (let c = TIERRA[0]; c <= TIERRA[1] + 1; c++) g.fillRect(c * T - CX, frente + 1, 1, 32);
  }
  function sombra(g, x, z, sueloZ) {
    const r = Math.round(13 * Math.max(0.45, 1 - (z - sueloZ) / 140));
    g.fillStyle = 'rgba(30,20,50,0.28)';
    const y = sy(CARRIL, sueloZ);
    for (let i = -r; i <= r; i++) { const h = Math.round(Math.sqrt(1 - (i / r) ** 2) * r * K); g.fillRect(x + i, y - h, 1, 2 * h + 1); }
  }
  function pinta(lienzo, p) {   // el Brotito en lonchas, igual que dibujo-escena.js (ente con PILAS_B, su giro y su sombra)
    const g = lienzo.getContext('2d'); g.imageSmoothingEnabled = false;
    suelo(g);
    const e = p.estado.e, J = p.estado.J;
    if (p.estado.siguiendo) { const s = girada(IS.arte.PILA_ZANA, 0.6); g.drawImage(s.c, Math.round(J.x - CX) - (s.c.width >> 1), sy(CARRIL + 6, 32) - s.suelo); }
    if (!p.visible()) return;
    const sx = Math.round(e.x - CX), sz = p.estado.fis.sueloDe({ x: e.x, z: e.z + 0.5 }, 4);
    if (sz > -Infinity) sombra(g, sx, e.z, sz);
    const s = girada(IS.arte.PILAS_B[p.postura()], e.giro);
    g.drawImage(s.c, sx - (s.c.width >> 1), sy(CARRIL, e.z) - s.suelo);
  }
  // de una x de la pantalla (0 a 1 del ancho del lienzo) a la x del mundo
  const xMundo = f => CX + f * ANCHO;
  IS.Prototipo3D = Object.freeze({ crea, pinta, xMundo, ANCHO, ALTO, CX, TIERRA, COLS });
}
