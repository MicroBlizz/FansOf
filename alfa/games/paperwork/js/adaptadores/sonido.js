// Fans Of Paperwork · adaptador · SONIDO: los efectos y la música del motor de sonido de core (play, musicSet; todo sintetizado) y el interruptor
// de silencio, que se guarda con la partida. Las funciones sueltas de abajo son las que pide el motor de core (ganchos por nombre). La música
// es la canción de la facción de cada zona, con el tono de Shepard (ADR 107): no vuelve a empezar, sigue subiendo; contra la Trituradora, la del jefe.
'use strict';
PW.creaSonido = almacen => ({
  toca(nombre = 'select') { if (typeof play === 'function') play(nombre); },
  get apagado() { return !!almacen.leeExtra('muted'); },
  alterna() {
    almacen.escribeExtra('muted', !this.apagado);
    if (typeof applyVolume === 'function') applyVolume();
  },
});
if (typeof M !== 'undefined') M.shepard = true;
function sonidoApagado() { return PW.sonido ? PW.sonido.apagado : false; }
function volGeneral() { return sonidoApagado() ? 0 : 1; }
function volMusica() { return 0.3; }
// qué canción toca: la de la zona, o la del jefe mientras se ataca a la Trituradora
function musicUpdate() {
  if (typeof AC === 'undefined' || !AC || !M.bus || !PW.casos || !PW.casos.partida) return;
  const e = PW.casos.partida;
  const quiere = PW.trituradora.atacando(e) ? 'boss' : PW.ZONAS[PW.curvas.zonaDe(e.r.planta.n)].musica;
  const want = typeof TRACKS !== 'undefined' && TRACKS[quiere] ? quiere : 'menu';
  if (want !== M.want) { M.want = want; musicSet(want); }
}
