// Fans Of Pets · adaptador · ANIMACIÓN: qué cara pone la criatura en cada instante por encima de su dibujo (parpadea de vez en cuando,
// bosteza si tiene sueño, mastica mientras come, pone ojos de cachorrito cuando pide algo y cara triste cuando lo está). Puro: solo
// tiempo y estado; no sabe de imágenes ni de lienzo (eso es de arte.js, que compone las piezas de caras.js).
// Las caras: '' (la base), 'parpadeo', 'bostezo', 'masca', 'cachorrito' y 'triste'. Las cifras en PETS.animacion.
'use strict';
PT.creaAnimador = (reglas, azar = Math.random) => {
  let parpadeoEn = -1, bostezoEn = -1;
  const entre = ([a, b]) => a + azar() * (b - a);

  // la cara en el segundo t. e: { cara (forzada: la escena de pruebas), dormida, comiendo, sonolienta, pidiendo, triste }
  function cara(t, e) {
    if (e.cara) return e.cara;
    if (e.dormida) return '';                                           // dormida: los ojos cerrados los pone arte.js
    if (e.comiendo) return Math.floor(t / reglas.mascaCada) % 2 ? 'masca' : '';
    if (parpadeoEn < 0) { parpadeoEn = t + entre(reglas.parpadeoCada); bostezoEn = t + entre(reglas.bostezoCada); }
    return bostezo(t, e) || parpadeo(t) || (e.pidiendo ? 'cachorrito' : e.triste ? 'triste' : '');
  }
  function bostezo(t, e) {
    if (!e.sonolienta || t < bostezoEn) return '';
    if (t < bostezoEn + reglas.bostezoDura) return 'bostezo';
    bostezoEn = siguiente(t, bostezoEn + reglas.bostezoDura, reglas.bostezoCada);
    return '';
  }
  function parpadeo(t) {
    if (t < parpadeoEn) return '';
    if (t < parpadeoEn + reglas.parpadeoDura) return 'parpadeo';
    parpadeoEn = siguiente(t, parpadeoEn + reglas.parpadeoDura, reglas.parpadeoCada);
    return '';
  }
  // el siguiente, contado desde que acabó el anterior (fin); si el tiempo dio un salto (pestaña en segundo plano), desde ahora
  function siguiente(t, fin, rango) {
    const en = fin + entre(rango);
    return en > t ? en : t + entre(rango);
  }
  return { cara };
};
