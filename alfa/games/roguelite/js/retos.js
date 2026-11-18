// Fans of Roguelite · Los retos: cosas de una vez (ganar sin recibir daño, 10 Zanahorazos, el premio gordo…) que dan
// monedas para La Madriguera. reto(id) se llama desde donde pasa cada cosa; aquí se comprueba, se apunta y se celebra.
'use strict';

const retoHecho = id => !!GUARDA.retos[id];
function reto(id) {
  const r = RETOS.find(r => r.id === id);
  if (!r || retoHecho(id)) return false;
  GUARDA.retos[id] = 1; GUARDA.monedas += r.premio; guarda();
  log('¡Reto cumplido: {n}! +{p} monedas para La Madriguera.', { n: tr(r.n), p: r.premio });
  RETOS_COLA.push(r);
  if (RETOS_COLA.length === 1) celebraRetos();
  return true;
}
// las celebraciones salen de una en una (si caen dos seguidos, o con un combo, no se pisan)
const RETOS_COLA = [];
async function celebraRetos() {
  try {
    await espera(1.0);
    while (RETOS_COLA.length) {
      const r = RETOS_COLA[0], y = ESC.Y + Math.max(ESC.corte + 70, 96);
      sonido('reto'); chatEv('reto', null, 0.8, 0);
      rotulo(PAN.W / 2, y, formatea(tr('¡RETO: {n}!'), { n: tr(r.n) }), '#7be04a', 2.2);
      rotulo(PAN.W / 2, y + 12, formatea(tr('+{n} para La Madriguera'), { n: r.premio }), COL.oro, 2.2);
      await espera(2.3);
      RETOS_COLA.shift();
    }
  } catch (e) { RETOS_COLA.length = 0; if (e !== CANCELADO) throw e; }
}
// los que dependen de cómo vas (se miran al cambiar algo)
function mirarRetos() {
  if (!H) return;
  if (HUECOS.every(k => H.objs[k])) reto('tres');
  if (Object.keys(H.habs).filter(id => HABILIDADES[id].rar === 'legendary').length >= 3) reto('legend');
}
const retosHechos = () => RETOS.filter(r => retoHecho(r.id)).length;
