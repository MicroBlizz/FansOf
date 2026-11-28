// Fans of Pop · el camino de Yoshi en el mapa (tarea 324, flag 'pop-recursos-yoshi' en js/yoshi-nuevo.js): en los 7 mundos que lo tienen,
// la carretera se pinta con su suelo, salen sus adornos entre los niveles y cada nivel es su plataforma (la del jefe, la de «VS»).
// Si el flag está cerrado o el dibujo aún no ha llegado, devuelve null o false y js/mapa.js pinta lo de siempre.
'use strict';
// el suelo del camino del mundo (su imagen), o null si no toca
function ppCaminoSuelo(fondo) {
  const w = PP_YOSHI.camino(fondo);
  return (w && PP_YOSHI.activo() && PP_IMG['cm-' + w + '-suelo']) || null;
}
// la carretera con el suelo de Yoshi: un borde y el dibujo repetido, que baja con la cámara
function ppCaminoCarretera(c, tramo, suelo, borde) {
  tramo(54, borde);
  const pat = c.createPattern(suelo, 'repeat');
  pat.setTransform(new DOMMatrix().scale(0.5).translateSelf(0, PP_MAPA.cam * PP_PASO * 2));
  tramo(44, pat);
}
// los adornos entre niveles (PP_YOSHI.adorno dice cuáles), con su sombra y un balanceo suave
function ppCaminoAdornos(c, fondo, N, t) {
  const w = PP_YOSHI.camino(fondo);
  for (let i = 0; i < N; i++) {
    const a = PP_YOSHI.adorno(i); if (!a) continue;
    const [x, y] = ppNivelPos(i), ay = y - PP_PASO / 2;
    if (ay < -70 || ay > PP_V.H + 70) continue;
    const ax = Math.max(60, Math.min(480, x > 270 ? x - a.aparte : x + a.aparte));
    c.save(); c.globalAlpha = 0.18; c.fillStyle = '#3a2040';
    c.beginPath(); c.ellipse(ax, ay + a.lado * 0.42, a.lado * 0.36, a.lado * 0.09, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    c.translate(ax, ay + a.lado * 0.45); c.rotate(Math.sin(t * 1.6 + i * 1.3) * 0.05); if (a.gira) c.scale(-1, 1);
    ppDibujaEn(c, 'cm-' + w + '-adorno-' + a.n, 0, -a.lado * 0.45, a.lado, true); c.restore();
  }
}
// la plataforma de un nivel, movida para que el centro de su cara caiga en (x, y), donde va el número; false si no la hay
function ppCaminoPlataforma(c, fondo, jefe, x, y, lado) {
  const w = PP_YOSHI.camino(fondo), pk = w + (jefe ? '-vs' : '-nivel');
  if (!w || !PP_IMG['cm-' + pk]) return false;
  const [dx, dy] = PP_YOSHI.cara[pk] || [0, 0];
  return !!ppDibujaEn(c, 'cm-' + pk, x - dx * lado, y - dy * lado, lado, true);
}
