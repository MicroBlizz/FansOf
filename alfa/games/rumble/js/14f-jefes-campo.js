// Fans of Rumble · Jefes al campo (en la partida): saca al jefe de su sede cuando JEFES_CAMPO lo dice, y al caer le quita vida a la sede.
// Las reglas (cuándo sale, cuánto quita) están en 14e-jefes-campo-reglas.js. Mientras se prueba, solo en modo desarrollo (NUCLEO.desarrollo).
'use strict';
const jefeCampoWi = () => (G.bossWi == null ? CEO_WI : G.bossWi);
// en cada paso de la partida (updateGame): ¿le toca salir al jefe?
function jefeCampoTick() {
  if (!NUCLEO.desarrollo) return;
  const b = bases.e, wi = jefeCampoWi();
  if (!b || !JEFES_CAMPO.debeSalir({ modo: G.mode, hp: b.hp, maxHp: b.maxHp, yaSalio: !!S.e.jefeSalio, wi })) return;
  S.e.jefeSalio = true;
  jefeCampoSale(JEFES_CAMPO.datos(wi), b);
}
function jefeCampoSale(J, b) {
  const u = spawnUnit('e', J.unidad, b.x, b.y + 46);
  u.jefeCampo = true; u.summon = true;   // no renace ni hace secuela: sale una vez
  u.deployT = u.deployMax = 1.1; u.face = 1;
  ring(u.x, u.y, 12, 150, 'rgba(255,51,72,.85)', 0.8, 7); puff(u.x, u.y, 18, '#9fb3d6', 70, 9, true); shake(10);
  banner('¡SALE EL JEFE!', `${J.nombre}: «${tr(J.frase)}»`, 'enemy', true);
  play('womp'); chatSay('boss');
}
// desde kill(): si el que cae es el jefe, la sede se lleva un golpe
function jefeCampoCae(t, src) {
  const b = bases.e; if (!b || !b.alive) return;
  const dmg = JEFES_CAMPO.golpeAlCaer(b.maxHp, jefeCampoWi()); if (!dmg) return;
  hurt(b, dmg, src && src.team === 'p' ? src : null, 'aoe');
  ring(b.x, b.y, 20, 220, 'rgba(255,203,61,.9)', 0.7, 6); shake(8);
  addNum(b.x, b.y, TOPS[b.skin + '_base'] + 30, '¡JEFE ABATIDO!', '#ffcb3d', 17);
  banner('¡JEFE ABATIDO!', 'Su sede se lleva un buen golpe', 'player');
}
