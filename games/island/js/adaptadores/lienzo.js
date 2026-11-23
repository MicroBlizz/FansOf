// Fans of Island · adaptadores/lienzo: EL LIENZO NÍTIDO (IS.creaLienzo): se pinta en pequeño (píxeles gordos, ctx) y se copia a la pantalla
// a tamaño real del móvil con un aumento entero y sin suavizar, así no hay borrosidad. ajusta() lo recalcula al girar el móvil. Devuelve
// el objeto vivo { ctx, vw, vh, base, esc, presenta, ajusta }: vw y vh son el ancho y el alto pintados, base la línea del suelo.
'use strict';
IS.creaLienzo = () => {
  const vista = document.getElementById('lienzo'), vctx = vista.getContext('2d');
  const buf = document.createElement('canvas'), ctx = buf.getContext('2d');
  const L = { ctx, vw: 300, vh: 200, base: 140, esc: 2, ajusta, presenta };
  function ajusta() {
    const dpr = window.devicePixelRatio || 1;
    const bw = Math.round(innerWidth * dpr), bh = Math.round(innerHeight * dpr);
    vista.width = bw; vista.height = bh;
    vista.style.width = (bw / dpr) + 'px'; vista.style.height = (bh / dpr) + 'px';
    L.esc = Math.max(2, Math.round(Math.min(bw, bh) / 240));   // cuántas veces se amplía cada píxel
    L.vw = Math.ceil(bw / L.esc); L.vh = Math.ceil(bh / L.esc);
    buf.width = L.vw; buf.height = L.vh;
    L.base = Math.round(L.vh * 0.72);   // la línea del suelo: más abajo, para que se vea menos agua delante (Pepins, 21-11-2026)
    ctx.imageSmoothingEnabled = false; vctx.imageSmoothingEnabled = false;
    document.getElementById('girar').classList.toggle('oculto', innerWidth >= innerHeight);
  }
  function presenta() { vctx.drawImage(buf, 0, 0, L.vw, L.vh, 0, 0, L.vw * L.esc, L.vh * L.esc); }
  addEventListener('resize', ajusta); ajusta();
  return L;
};
