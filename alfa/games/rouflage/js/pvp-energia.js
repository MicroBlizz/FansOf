// Fans of Rouflage (prototipo) · CAOS PRIMORDIAL: el medidor de core (ENERGIA, core/js/sistema/energia.js: icono, n/5 y la barra dorada que se llena) fijo en una esquina en
// TODOS los menús (título, PvP, sala, clasificación, final…), igual que el monedero de los demás juegos, y escondido mientras se juega. Lleva a la tienda del caos primordial.
// También lo de antes de buscar partida: sin caos primordial (y sin ilimitado) se enseña el aviso con la oferta. Lo cobra y lo valida el servidor.
'use strict';
const CAJA_ENERGIA = document.createElement('div'); CAJA_ENERGIA.id = 'rf-energia'; CAJA_ENERGIA.className = 'wallet'; CAJA_ENERGIA.hidden = true;
document.body.appendChild(CAJA_ENERGIA);
let energiaHtml = '', energiaPide = 0, energiaEnMenu = false;
function energiaPinta() {
  if (typeof ENERGIA === 'undefined') return;
  const h = energiaEnMenu ? ENERGIA.botonMonedero() : '';
  if (h === energiaHtml) return;
  energiaHtml = h; CAJA_ENERGIA.innerHTML = h; CAJA_ENERGIA.hidden = !h;
  const b = CAJA_ENERGIA.querySelector('button'); if (b) b.onclick = () => { play('select'); ENERGIA.abrirTienda(); };
}
// lo llama pantalla(): con cualquier menú a la vista se enseña, y se le pregunta al servidor al entrar (y cada pocos segundos mientras no haya respuesta)
function energiaMenu(hayMenu) {
  energiaEnMenu = !!hayMenu;
  if (energiaEnMenu && typeof ENERGIA !== 'undefined' && (!ENERGIA.estado || Date.now() - energiaPide > 20000)) { energiaPide = Date.now(); ENERGIA.cargar().then(energiaPinta); }
  energiaPinta();
}
setInterval(() => { if (energiaEnMenu) { energiaPinta(); if (typeof ENERGIA !== 'undefined' && !ENERGIA.estado && Date.now() - energiaPide > 5000) { energiaPide = Date.now(); ENERGIA.cargar().then(energiaPinta); } } }, 1000);
// ¿se puede buscar partida? Sin caos primordial (y sin ilimitado) se enseña el aviso con la oferta y no se entra en la cola
function energiaPermite() {
  if (typeof ENERGIA === 'undefined' || !ENERGIA.sinEnergia()) return true;
  ENERGIA.avisoSin(); return false;
}
// el servidor dijo «sin_energia» (la nuestra estaba pasada): se vuelve a leer y se enseña el aviso
function energiaError(e) {
  if (typeof ENERGIA === 'undefined' || !ENERGIA.esError(e)) return false;
  ENERGIA.cargar().then(() => { energiaPinta(); ENERGIA.avisoSin(); });
  return true;
}
