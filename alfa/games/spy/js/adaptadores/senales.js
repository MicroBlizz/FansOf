// Fans of Spy · ADAPTADORES · Los bocadillos «!» y «?» que lleva un guardia encima de la cabeza: dibujos de cómic de Yoshi
// (img/caras/alerta.webp y duda.webp) en 2D, que miran siempre a la cámara. Se colocan como imágenes de la página sobre el lienzo,
// en el punto de pantalla donde cae la cabeza (se proyecta con la matriz de la cámara) y con un tamaño que baja con la distancia.
// Si una imagen no carga, la marca de «!» y «?» por código de escena.js se pinta igual: ver `disponible`.
// SPY.senales.pinta(lista): lista de { x, y, z, tipo: 'alerta' | 'duda', tamano } (en el mundo). Se llama una vez por imagen.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const GL = S.gl, TIPOS = ['alerta', 'duda'];
  const listas = {};      // tipo -> true cuando la imagen cargó
  let capa = null;        // el contenedor, encima del lienzo
  const pool = [];        // las imágenes que ya se crearon, para reutilizarlas

  for (const t of TIPOS) {
    const img = new Image();
    img.onload = () => { listas[t] = true; };
    img.onerror = () => { listas[t] = false; };   // sin imagen: sigue la marca de código
    img.src = 'img/caras/' + t + '.webp?v=' + S.AJ.version;
  }
  const disponible = (tipo) => listas[tipo] === true;

  function creaCapa(lienzo) {
    const c = document.createElement('div');
    c.id = 'spy-senales'; c.setAttribute('aria-hidden', 'true');
    lienzo.parentElement.insertBefore(c, lienzo.nextSibling);
    return c;
  }
  // Pasa un punto del mundo a píxeles dentro del lienzo, y dice cuántos píxeles mide una unidad a esa distancia. null si queda detrás.
  function proyecta(m, x, y, z, ancho, alto) {
    const cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13], cw = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (cw <= 0.01) return null;
    return { px: (cx / cw * 0.5 + 0.5) * ancho, py: (1 - (cy / cw * 0.5 + 0.5)) * alto, unidad: Math.abs(m[5]) / cw * alto * 0.5 };
  }
  function imagen(i, tipo) {
    if (!pool[i]) { pool[i] = new Image(); pool[i].alt = ''; pool[i].className = 'spy-senal'; capa.append(pool[i]); }
    if (pool[i].dataset.tipo !== tipo) { pool[i].dataset.tipo = tipo; pool[i].src = 'img/caras/' + tipo + '.webp?v=' + S.AJ.version; }
    return pool[i];
  }
  function pinta(lista) {
    const lienzo = GL.gl.canvas;
    if (!capa) capa = creaCapa(lienzo);
    // la capa se pone justo encima del lienzo, con su medida en píxeles de pantalla
    Object.assign(capa.style, { left: lienzo.offsetLeft + 'px', top: lienzo.offsetTop + 'px', width: lienzo.clientWidth + 'px', height: lienzo.clientHeight + 'px' });
    let usadas = 0;
    for (const s of lista) {
      const p = proyecta(GL.vp, s.x, s.y, s.z, lienzo.clientWidth, lienzo.clientHeight);
      if (!p) continue;
      const lado = Math.max(14, p.unidad * s.tamano), img = imagen(usadas++, s.tipo);
      Object.assign(img.style, { display: 'block', width: lado + 'px', height: lado + 'px', transform: 'translate(' + (p.px - lado / 2).toFixed(1) + 'px,' + (p.py - lado).toFixed(1) + 'px)' });
    }
    for (let i = usadas; i < pool.length; i++) pool[i].style.display = 'none';
  }
  // Quita los bocadillos de la pantalla (al salir de la partida).
  function limpia() { for (const img of pool) img.style.display = 'none'; }
  S.senales = Object.freeze({ pinta, limpia, disponible });
})(SPY);
