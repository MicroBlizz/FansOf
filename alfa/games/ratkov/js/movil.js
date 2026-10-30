// Fans of Ratkov · LO DEL MÓVIL: si sales del juego en plena incursión (una llamada, un mensaje, bloquear el móvil), se pone en PAUSA solo;
// mientras dura una incursión la pantalla no se apaga; y vibra un poco al recibir un disparo, al despedir a alguien y en la cerradura
// (se apaga en Opciones > VIBRACIÓN).
'use strict';
// vibrar: solo en el móvil y si no está apagado en Opciones
function vibra(patron) {
  if (AJUSTES.vibra === false || !ENT.tactil || !navigator.vibrate) return;
  try { navigator.vibrate(patron); } catch (e) { /* el móvil no deja */ }
}

// la pausa al salir: el juego no sigue mientras no miras
document.addEventListener('visibilitychange', () => {
  if (document.hidden && typeof RAID !== 'undefined' && RAID.activa && !RAID.pausa && JUG && JUG.vivo) { ENT.dispara = false; ENT.fuego = false; ENT.mx = 0; ENT.mz = 0; abrePausa(); }
  if (!document.hidden) mantenEncendida();
});

// la pantalla encendida durante la incursión (el móvil suelta el permiso al salir del juego: al volver se pide otra vez)
let CANDADO_PANTALLA = null;
function mantenEncendida() {
  const quiere = typeof RAID !== 'undefined' && RAID.activa && !document.hidden;
  if (quiere && !CANDADO_PANTALLA && navigator.wakeLock) {
    CANDADO_PANTALLA = 'pidiendo';
    navigator.wakeLock.request('screen').then(c => { CANDADO_PANTALLA = c; c.addEventListener('release', () => { CANDADO_PANTALLA = null; }); }).catch(() => { CANDADO_PANTALLA = null; });
  } else if (!quiere && CANDADO_PANTALLA && CANDADO_PANTALLA !== 'pidiendo') { CANDADO_PANTALLA.release().catch(() => {}); CANDADO_PANTALLA = null; }
}
setInterval(mantenEncendida, 2000);   // cada poco se mira si hay incursión (empieza y acaba en sitios distintos)
