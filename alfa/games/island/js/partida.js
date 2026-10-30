// Fans of Island · PARTIDA: el nivel en marcha. Quién juega (una persona con aliado de IA, o dos), el orden de cada fotograma,
// la burbuja de rescate cuando uno se cae, el reinicio si caen los dos y la meta.
'use strict';
const IS_P = { mundo: null, jugadores: [], humanos: 1, estado: 'titulo', tiempo: 0, aviso: 0, avisoTexto: '', regadoAvisado: false, cosecha: 0, cosechaTotal: 0 };
const IS_PERSONAJES = [{ id: 'bunny', nombre: 'CrazyBunny' }, { id: 'fox', nombre: 'SlyFox' }];
function isNuevaPartida(humanos, nivel = 'pradera') {
  IS_P.humanos = humanos; IS_ENTRADA.humanos = humanos;
  IS_P.mundo = isCargaNivel(nivel);
  const ini = IS_P.mundo.def.inicio;
  IS_P.jugadores = [isPersonaje(IS_PERSONAJES[0], ini.x, ini.y), isPersonaje(IS_PERSONAJES[1], ini.x - 40, ini.y)];
  IS_P.jugadores[0].companero = IS_P.jugadores[1]; IS_P.jugadores[1].companero = IS_P.jugadores[0];
  IS_P.estado = 'juego'; IS_P.tiempo = 0; IS_P.aviso = 3; IS_P.avisoTexto = ''; IS_P.cosecha = 0; IS_P.cosechaTotal = IS_P.mundo.pequenas.length;
  isEntradaSuelta(); isCamaraColoca(IS_P.mundo, IS_P.jugadores[0], IS_P.jugadores[1], IS_V.W); isMusica('animales');
}
function isPartidaActualiza(dt) {
  if (IS_P.estado !== 'juego') return;
  const m = IS_P.mundo, [a, b] = IS_P.jugadores;
  IS_P.tiempo += dt; IS_P.aviso -= dt;
  isNivelActualiza(m, dt); isBrotesActualiza(m, dt);
  const inB = IS_P.humanos === 2 ? IS_IN[1] : isAliadoEntrada(b, a, m, dt);
  isPersonajeActualiza(a, IS_IN[0], dt, m, b);
  isPersonajeActualiza(b, inB, dt, m, a);
  isZanahoriasActualiza(m, IS_P.jugadores, dt); isPequenasActualiza(m, IS_P.jugadores, dt); isInterruptoresActualiza(m, IS_P.jugadores, dt); isEnemigosActualiza(m, IS_P.jugadores, dt);
  isRescate(a, b); isRescate(b, a);
  isTironDeCuerda(a, b);
  isCamaraSigue(m, a, b, IS_V.W, dt);
  if ((a.estado === 'normal' && isSolapa(a, m.meta)) || (b.estado === 'normal' && isSolapa(b, m.meta))) isMetaAlcanzada();
}
function isRescate(p, otro) {
  if (p.estado === 'normal' && p.y > IS_C.abismo) {
    if (otro.estado === 'normal' && otro.y <= IS_C.abismo) isABurbuja(p, otro);
    else { isNuevaPartida(IS_P.humanos, IS_P.mundo.def.id); if (typeof toast === 'function') toast(tr('Os habéis caído los dos: otra vez desde el principio.')); }
    return;
  }
  if (p.estado === 'burbuja' && otro.estado === 'normal') {
    const toca = otro.x < p.x + p.w + 10 && otro.x + otro.w > p.x - 10 && otro.y < p.y + p.h + 10 && otro.y + otro.h > p.y - 10;
    if (toca || p.burbujaT > IS_C.burbuja.tiempo) isRevienta(p, otro);
  }
}
function isMetaAlcanzada() {
  IS_P.estado = 'fin'; isNivelSuperado(IS_P.mundo.def.id, IS_P.tiempo, IS_P.cosecha); isMusica('win'); isEntradaSuelta();
  isAbreFin(IS_P.tiempo);
}
