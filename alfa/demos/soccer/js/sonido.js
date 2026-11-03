// Fans of Soccer · Sonido: usa el altavoz de la serie (tone, noise y applyVolume de core/js/sistema/sonido.js), sin archivos.
// Aquí están el volumen del jugador (cuatro niveles: alto, medio, bajo y silencio; lo guarda principal.js) y las notas sueltas
// que pide principal.js. Sin música todavía (paso A4 de la hoja de ruta).
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const NIVELES = [1, 0.6, 0.3, 0];
  const SN = S.sonido = { nivel: 0, niveles: NIVELES.length };

  SN.volumen = () => NIVELES[SN.nivel];
  const avisar = () => { if (typeof applyVolume === 'function') applyVolume(); };
  // El nivel guardado: si no es uno de los cuatro, se queda el alto.
  SN.poner = (i) => { SN.nivel = Number.isInteger(i) && i >= 0 && i < NIVELES.length ? i : 0; avisar(); };
  SN.siguiente = () => { SN.poner((SN.nivel + 1) % NIVELES.length); return SN.nivel; };

  const listo = () => typeof AC !== 'undefined' && AC && SN.volumen() > 0;
  // Una nota: f hercios durante `dura` segundos; `sube` multiplica el tono al final (0.5 = baja una octava).
  SN.nota = (f, dura, tipo, sube, retraso) => {
    if (!listo()) return;
    tone(f, sube ? f * sube : f, dura, tipo || 'square', 0.1, retraso || 0);
  };
})(SOCCER);

// lo que pide el motor de sonido de la serie
function sonidoApagado() { return SOCCER.sonido.volumen() === 0; }
function volGeneral() { return SOCCER.sonido.volumen(); }
function volMusica() { return 0; }
function musicUpdate() { /* Soccer no tiene música todavía */ }
