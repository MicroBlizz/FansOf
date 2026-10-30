// Fans of Rouflage · ESCALA DE LOS MENÚS: los menús están pensados para un móvil de 360 px de ancho o más. Si la pantalla mide menos (un móvil pequeño,
// o uno grande con la letra o el zoom del sistema aumentados, que en Chrome hace la página más estrecha), se reducen enteros en la misma proporción
// (la variable CSS --escala-menu, que usa estilo-titulo.css en `.pantalla > *`), en vez de salirse por los lados. La partida no se toca: el lienzo ya se adapta solo.
'use strict';
const ESCALA = { ancho: 360, minimo: 0.7 };
function escalaMenus() {
  const w = document.documentElement.clientWidth || innerWidth;
  const z = Math.max(ESCALA.minimo, Math.min(1, w / ESCALA.ancho));
  document.documentElement.style.setProperty('--escala-menu', String(Math.round(z * 1000) / 1000));
}
escalaMenus();
addEventListener('resize', escalaMenus);
addEventListener('orientationchange', () => setTimeout(escalaMenus, 200));
