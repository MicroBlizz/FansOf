// Fans of Pop · LA PRÁCTICA DE COMBOS (tarea 396; reglas en js/combo-guia-reglas.js). Con el flag 'combos', antes del nivel 6 (o del
// próximo nivel normal de quien ya pasó de ahí) sale una vez un tablero de práctica: la manita de Lola marca 4 toques seguidos que hacen
// pop en 3 o más (COMBO x2, x3, x4) y Lola lo va contando; al acabar se entra solo en el nivel de verdad. Se marca como vista al empezar
// (SAVE.tuto.comboGuia): si sales a medias, no vuelve. Con los consejos de Lola apagados no sale. En la práctica solo vale tocar la
// burbuja de la manita, no cuesta corazones, el equipo no actúa (ppEquipoNivel) y no hay puntos de ranking ni misiones (PP_COMBO.toque);
// solo las monedas de sus pasos x3 y x4, como dice Lola.
// · antes(d, seguir): lo llama ppEntra (js/partida.js); si toca práctica la abre y devuelve true, y `seguir()` entra luego en el nivel.
// · bloquea(T, i): ¿se ignora ese toque? (en la práctica, todo lo que no sea la burbuja de la manita)
// · tras(T): tras cada toque bueno; Lola y la manita pasan al siguiente paso y, al acabar los pasos, se pasa al nivel.
// · resuelto(T): por si la práctica se acabara sola: tampoco se gana, se pasa al nivel.
'use strict';
const PP_COMBO_GUIA = (() => {
  const R = PP_COMBO_GUIA_R, ESPERA = 1400, REINTENTO = 400;   // ms tras el último paso (para ver el letrero) y entre miradas si hay pausa
  let seguirCon = null;
  function antes(d, seguir) {
    if (!R.sale(d, PP_COMBO.activo(), !!SAVE.tuto.comboGuia, !!SAVE.sinConsejos)) return false;
    SAVE.tuto.comboGuia = true; SAVE.tuto.combos = true; SAVE.tuto.combo = true; ppGuarda();   // la práctica ya lo explica todo
    seguirCon = seguir;
    // las frases van antes de entrar: así Lola está ocupada y los demás consejos del nivel esperan (no se pierden)
    PP_LOLA.cola.push(...R.PASOS.map(p => ({ t: p.t, toque: true })));
    ppEntraEn(R.nivel(), tr('Práctica de combos'));
    const T = PP_P.T; T.mano = true; T.pista = R.marca(0); T.hechos = 0;
    return true;
  }
  const bloquea = (T, i) => !!T.d.practica && R.bloquea(T.hechos, i);
  // al nivel, cuando se vea el tablero (con la pausa o una ventana abierta, se espera a que se cierren)
  function pasaAlNivel(T, espera) {
    setTimeout(() => {
      if (!PP_P || PP_P.T !== T || !seguirCon) return;   // saliste de la práctica
      if (PP_PANT.actual !== 'sala' || PP_PANT.pausa || !$pp('#pp-modal').hidden) { pasaAlNivel(T, REINTENTO); return; }
      const seguir = seguirCon; seguirCon = null;
      ppMarcaDentro(false); ppLolaCierra(); PP_LOLA.cola.push({ t: R.FINAL });
      seguir();
    }, espera);
  }
  function tras(T) {
    if (!T.d.practica || T.hecho) return;
    T.hechos++;
    const m = R.monedas(T.combo);   // lo que promete Lola («desde x3 ganas monedas»), de verdad y solo esta vez
    if (m) { SAVE.monedas += m; ppGuarda(); ppFlota('+' + m, 270, 330, '#ffb000'); }
    T.pista = R.marca(T.hechos);
    if (T.pista === null) { T.mano = false; pasaAlNivel(T, ESPERA); }
  }
  function resuelto(T) { if (!T.d.practica) return false; pasaAlNivel(T, ESPERA); return true; }
  return Object.freeze({ antes, bloquea, tras, resuelto });
})();
