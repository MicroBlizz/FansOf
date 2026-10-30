// Fans of Jump · Compartir una partida desde el parte de incidencias: una tarjeta (foto de la pantalla con tus cifras encima) por el menú
// del móvil si deja mandar imágenes (Android, iPhone); si no, se descarga la imagen y el texto se copia al portapapeles. Lleva el enlace
// del juego. En el reto del día, el texto reta a batirte en el mismo río.
'use strict';

const COMPARTE_URL = 'https://fansof.games/games/jump/';

// la tarjeta: la pantalla de ahora (el parte se ve detrás) con una franja abajo con las cifras y el enlace
function tarjetaComparte() {
  const J = JUEGO, k = 2, c2 = document.createElement('canvas'), W = PAN.W, H = PAN.H;
  c2.width = W * k; c2.height = H * k;
  const g = c2.getContext('2d');
  g.drawImage(cv, 0, 0, c2.width, c2.height);
  g.scale(k, k);
  const fh = 58, y = H - fh;
  g.fillStyle = 'rgba(61,42,92,0.92)'; g.fillRect(0, y, W, fh);
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `800 11px ${FUENTE}`;
  g.fillText((RETO.activo ? tr('Reto del día') + ' · ' : '') + tr('{m} m de huida', { m: J.metros }) + ' · ' + J.puntos.toLocaleString('es-ES') + ' €', W / 2, y + 14);
  g.font = `22px ${FUENTE_LOGO}`; g.fillText('FANS OF JUMP', W / 2, y + 33);
  g.font = `700 7px ${FUENTE}`; g.fillStyle = '#ffd86a'; g.fillText('fansof.games', W / 2, y + 49);
  return c2;
}
function textoComparte() {
  const J = JUEGO, p = J.puntos.toLocaleString('es-ES');
  return (RETO.activo
    ? tr('Reto del día de Fans of Jump: he huido {m} m y Microblizz ha perdido {p} €. Mismo río para todos: ¿me ganas?', { m: J.metros, p })
    : tr('He huido {m} m de Microblizz en Fans of Jump y le he costado {p} €. ¿Me ganas?', { m: J.metros, p })) + ' ' + COMPARTE_URL;
}
function comparte() {
  if (JUEGO.modo !== 'fin') return;
  SONIDO.boton();
  const texto = textoComparte();
  tarjetaComparte().toBlob(blob => {
    const archivo = blob && new File([blob], 'fans-of-jump.png', { type: 'image/png' });
    if (archivo && navigator.canShare && navigator.canShare({ files: [archivo] })) { navigator.share({ files: [archivo], title: 'Fans of Jump', text: texto }).catch(() => { /* cancelado */ }); return; }
    if (navigator.share) { navigator.share({ title: 'Fans of Jump', text: texto, url: COMPARTE_URL }).catch(() => { /* cancelado */ }); return; }
    // en el PC: se descarga la imagen y el texto va al portapapeles
    if (blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = archivo.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).catch(() => { /* sin permiso */ });
    toast(tr('Imagen guardada y texto copiado: mándaselo a tus amigos'));
  }, 'image/png');
}
// el icono: una flecha que sale de una caja
function iconoComparte(x, y) {
  caja(x - 5, y - 1, 10, 6.5, 1.2, null, PASTEL.texto, 1);
  trazo(x, y + 1.5, x, y - 6, 1.1, PASTEL.texto, null);
  trazo(x, y - 6, x - 3, y - 3, 1.1, PASTEL.texto, null); trazo(x, y - 6, x + 3, y - 3, 1.1, PASTEL.texto, null);
}
