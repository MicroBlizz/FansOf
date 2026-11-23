// Fans of Island · adaptadores/dibujo: LA VISTA (IS.creaVista(sesion, lienzo)): lo que cambia solo de dibujo y no es del juego: el reloj
// del dibujo, la cámara que sigue a CrazyBunny, las partículas de adorno (salpicaduras) y el estado del fondo vivo. Cada fotograma
// dibuja(): cámara, fondo, terreno, lo de detrás, lo del carril y lo de delante, leyendo el estado de la sesión (sesion.estado).
// Las piezas están en dibujo-base.js, dibujo-fondo.js, dibujo-terreno.js y dibujo-escena.js (IS.Dibujo).
'use strict';
{
  const { T } = IS.MEDIDAS;
  const COLORES_SALPICA = { agua: ['#ffffff', '#bfeaff', '#7cc6ee'], astillas: ['#6b4428', '#b77c45', '#fff6e0'], cangrejo: ['#ff5a4a', '#ff8a6a', '#ffffff'] };

  IS.creaVista = (sesion, lienzo) => {
    const v = { L: lienzo, ctx: lienzo.ctx, sesion, nivel: sesion.nivel, fisica: sesion.fisica, reloj: 0, cx: 0, cz: 0, cam: { x: 0, z: 0 },
      parts: [], fondo: IS.Dibujo.creaFondo() };
    function mueveCamara() {
      const J = sesion.estado.J, cam = v.cam;
      cam.x += (J.x + J.mira * 36 - lienzo.vw * 0.45 - cam.x) * 0.1;
      cam.x = Math.max(0, Math.min(v.nivel.COLS * T - lienzo.vw, cam.x));
      cam.z += (Math.max(0, J.z - lienzo.vh * 0.3) - cam.z) * 0.08;
      v.cx = Math.round(cam.x); v.cz = Math.round(cam.z);
    }
    return {
      avanza(dt) { v.reloj += dt; return v.reloj; },   // el reloj del dibujo (también corre mientras carga)
      reinicia() { v.parts = []; v.cam.x = sesion.estado.J.x - lienzo.vw * 0.4; v.cam.z = 0; },   // una partida nueva: cámara en CrazyBunny y sin salpicaduras
      salpica(x, y, z, n, col) {
        const cols = COLORES_SALPICA[col];
        for (let i = 0; i < n; i++) v.parts.push({ x, y, z, vx: (Math.random() - 0.5) * 120, vz: 90 + Math.random() * 140, t: 0.35 + Math.random() * 0.3, c: cols[i % cols.length] });
      },
      pasoParts(dt) { v.parts = v.parts.filter(p => { p.vz -= 700 * dt; p.x += p.vx * dt; p.z += p.vz * dt; p.t -= dt; return p.t > 0; }); },
      dibuja() {
        mueveCamara();
        const D = IS.Dibujo;
        D.fondo(v); D.terreno(v); D.atras(v); D.carril(v); D.delante(v);
      },
    };
  };
}
