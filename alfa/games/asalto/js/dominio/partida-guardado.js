// Fans of Asalto · DOMINIO · La partida guardada, vista desde fuera: arma el JSON que se guarda a partir de lo que la partida enseña
// (más lo suyo que no enseña, que ella misma pasa) y saca del JSON la configuración con la que se rehace. Leer y validar lo guardado es
// de guardado.js; esto solo da forma. Puro.
'use strict';
AS.partidaGuardado = (() => {
  // p: la partida (por sus getters); c: lo que no enseña { gratis, mejoras, rarezas, sigId, misiones, escalones, piedras, anuncios, premios }
  const aJSON = (p, c) => ({ v: 1, zona: p.zona, sinFin: p.sinFin, n: p.oleada, oro: p.oro, vidas: p.vidas, plumas: p.plumas, altar: p.altar, tiradas: p.tiradas,
    gratis: c.gratis, empujones: p.empujones, equipo: p.equipo, reliquias: p.reliquias, sigId: c.sigId, cuenta: p.cuenta, mejoras: c.mejoras, rarezas: c.rarezas,
    guiada: p.guiada, racha: p.racha, fallos: p.fallos, misiones: c.misiones, escalones: c.escalones, esencia: p.esencia, tienda: p.tienda, piedras: c.piedras, vivo: p.altarVivo, anuncios: c.anuncios,
    maquina: p.maquina, dificultad: p.dificultad, estallidos: p.estallidos, despertar: p.despertar.abiertos, oferta: p.despertar.oferta, fase: p.fase, premios: c.premios });
  // la configuración con la que se crea la partida que va a cargar j; equipo = el equipo puesto de ahora
  const cfgDe = (j, equipo) => ({ zona: j.zona, sinFin: !!j.sinFin, guiada: !!j.guiada, maquina: j.maquina, dificultad: j.dificultad, mejoras: j.mejoras, rarezas: j.rarezas, despertar: j.despertar, equipo });
  return { aJSON, cfgDe };
})();
