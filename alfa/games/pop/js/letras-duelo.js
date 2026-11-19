// Fans of Pop · LETRAS DEL DUELO (tarea #129, reporte 23 de Pepins: «en el duelo se ve todo muy pequeño»). En los duelos (jefes y
// niveles difíciles del camino, el CEO de la portada y contra gente) la cabecera, la regla y los textos que flotan (los de Lola) van
// más grandes. Aquí, las reglas sin dibujo: el tamaño y la duración de un texto que flota y cómo se parte un texto en líneas.
// El dibujo está en js/pintar.js (ppPintaFlota), js/nimnivel.js (ppMarcadorNim) y js/duelo.js (ppPintaDuelo).
'use strict';
// alto del panel de arriba en los duelos (antes 150): cabe la regla en dos líneas
const PP_CABECERA_DUELO = 182;   // con 960 de alto el tablero empieza en 200: el panel acaba justo ahí
const PP_FLOTA = Object.freeze({
  normal: Object.freeze({ tam: 34, dura: 1, grande: false }),   // fuera de los duelos, como siempre
  tamDuelo: 44, letrasPorSegundo: 22, durMin: 1.4, durMax: 2.8, anchoDuelo: 480,
});
// Un texto que flota: fuera de los duelos, el de siempre (1 s); en un duelo, más grande y más rato cuanto más largo sea (para
// que dé tiempo a leer los consejos de Lola)
function ppFlotaEstilo(s, enDuelo) {
  if (!enDuelo) return PP_FLOTA.normal;
  const dura = Math.min(PP_FLOTA.durMax, Math.max(PP_FLOTA.durMin, String(s).length / PP_FLOTA.letrasPorSegundo));
  return Object.freeze({ tam: PP_FLOTA.tamDuelo, dura, grande: true });
}
// La opacidad con `k` de 0 (sale) a 1 (se va): el normal se apaga desde el principio; el grande se queda entero el 60 % del rato
function ppFlotaAlfa(k, grande) {
  const f = Math.min(1, Math.max(0, k));
  return grande ? Math.min(1, (1 - f) / 0.4) : 1 - f;
}
// Parte `s` en líneas de como mucho `ancho` (lo mide `mide`, que da el ancho de un trozo). Palabra a palabra; una palabra que no
// cabe sola va en su propia línea.
function ppPartirLineas(s, ancho, mide) {
  const lineas = [];
  for (const p of String(s).split(' ').filter(Boolean)) {
    const ultima = lineas.length ? lineas[lineas.length - 1] : null, junta = ultima === null ? p : ultima + ' ' + p;
    if (ultima !== null && mide(junta) <= ancho) lineas[lineas.length - 1] = junta;
    else lineas.push(p);
  }
  return lineas.length ? lineas : [''];
}
