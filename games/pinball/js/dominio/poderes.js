// Fans of Pinball · dominio · PODERES: lo que hace cada criatura mientras es la bola (salto del caos de CrazyBunny, dinamita de
// BoomBeaver, emboscada de SlyFox, bolsa de basura de JunkCoon) y las mejoras que dependen de los golpes (Rebote explosivo, Estela de
// fuego). Las cifras de la criatura según su nivel están en la bola (b.cif, de PB.progreso.cifras).
'use strict';
PB.poderes = (() => {
  const avisa = (s, b, poder, x = b.x, y = b.y) => PB.emite(s, 'poder', { criatura: b.criatura, poder, x, y });
  // cada cuántos golpes salta CrazyBunny, suelta basura JunkCoon y explota Rebote explosivo
  function cuenta(s, b) {
    const c = b.cif, rx = s.cif.rebote;
    if (c.poder === 'salto' && b.golpes % c.cada === 0) { avisa(s, b, 'salto'); PB.golpes.explota(s, b.x, b.y, c.radio, c.danoPoder, 'salto'); }
    if (c.poder === 'basura' && b.golpes % c.cada === 0) { avisa(s, b, 'basura'); PB.proyectiles.bolsa(s, b); }
    if (rx && b.golpes % rx.cada === 0) PB.golpes.explota(s, b.x, b.y, rx.radio, rx.dano, 'rebote');
  }
  function enciendeEstela(s, b) {
    b.estela = s.cif.estela.segundos; b.rastroT = 0; b.rastro.length = 0; b.quemados.clear();
  }
  // tras golpear la cosa `o` (g = { dano, fuerte, critico })
  function alGolpear(s, b, o, g, murio, emboscada) {
    if (b.dinamita) { b.dinamita = false; PB.golpes.explota(s, o.x, o.y, b.cif.radio, b.cif.danoPoder, 'dinamita'); }
    if (emboscada && murio) { b.oculta = true; avisa(s, b, 'emboscada'); }
    if (g.fuerte && s.cif.estela) enciendeEstela(s, b);
    b.golpes += 1;
    cuenta(s, b);
  }
  // BoomBeaver: tras un golpe fuerte de pala, lo siguiente que toca explota
  function golpeFuertePala(s, b) {
    if (b.cif.poder !== 'dinamita' || b.dinamita) return;
    b.dinamita = true; avisa(s, b, 'dinamita');
  }
  // SlyFox: sin tocar nada un rato, se esconde
  function emboscada(s, b, dt) {
    b.desdeToque += dt;
    if (b.cif.poder !== 'emboscada' || b.oculta || b.desdeToque < b.cif.espera) return;
    b.oculta = true; avisa(s, b, 'emboscada');
  }
  // la estela deja un punto cada poco y quema (una vez por estela) lo que toca alguno de sus puntos
  function estela(s, b, dt) {
    if (b.estela <= 0) return;
    const e = s.cif.estela;
    b.estela -= dt; b.rastroT += dt;
    if (b.rastroT >= e.cada) { b.rastroT = 0; b.rastro.push({ x: b.x, y: b.y }); }
    for (const o of s.sala.rompibles.concat(s.sala.enemigos)) quema(s, b, o, e.dano);
    if (b.estela <= 0) b.rastro.length = 0;
  }
  function quema(s, b, o, dano) {
    if (!o.vivo || b.quemados.has(o.id)) return;
    if (!b.rastro.some(p => Math.hypot(p.x - o.x, p.y - o.y) < o.r + 3)) return;
    b.quemados.add(o.id);
    PB.golpes.aplica(s, o, dano);
  }
  function paso(s, b, dt) { emboscada(s, b, dt); estela(s, b, dt); }
  return { alGolpear, golpeFuertePala, paso };
})();
