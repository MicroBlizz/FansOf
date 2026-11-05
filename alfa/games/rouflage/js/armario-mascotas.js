// Fans of Rouflage · MASCOTAS (el registro): ARD.MASCOTAS[id](c, o) dibuja la mascota `id` con los pies en 0,0 mirando a la derecha, y
// ARD.mascotaIcono(id) la pinta como icono en el armario. Los dibujos son las mascotas vivas (mascotas-vivas*.js), que se apuntan aquí con
// registraMascotasVivas, y las clásicas (los dibujos de antes, mascotas-clasicas.js) como «<id>-clasico». Cómo se mueven en la
// partida: mascotas.js.
'use strict';
Object.assign(ARD, (() => {
  const MASCOTAS = {};
  const mascotaIcono = id => (c, w, t) => { c.save(); c.translate(w * 0.47, w * 0.8); c.scale(w / 38, w / 38); if (MASCOTAS[id]) MASCOTAS[id](c, { t: t == null ? 0.6 : t, mov: 0, susto: false, sem: 0 }); c.restore(); };      // con t, animada (arPintaVista)
  return { MASCOTAS, mascotaIcono };
})());
