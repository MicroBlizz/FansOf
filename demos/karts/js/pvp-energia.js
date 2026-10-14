// Fans of Karts · CAOS PRIMORDIAL en el PvP: el contador y el botón de ILIMITADO (la «tienda») de core (ENERGIA, core/js/sistema/energia.js) en HTML encima del lienzo,
// visibles en el menú principal y en las pantallas del PvP. Lo cobra y lo valida el servidor (karts_pvp8_*): aquí solo se pregunta y se enseña. Estando solo en la sala no se gasta nada.
'use strict';
const CAJA_ENERGIA = document.createElement('div'); CAJA_ENERGIA.id = 'fok-energia'; CAJA_ENERGIA.className = 'wallet'; CAJA_ENERGIA.hidden = true;
document.body.appendChild(CAJA_ENERGIA);
let energiaVisible = false, energiaTic = 0, energiaHtml = '', energiaPant = '', energiaPide = 0;
// el medidor de core (el botón del monedero: icono y n/5) lleva a la sección «Caos primordial» de la tienda común
function energiaPinta() {
  if (typeof ENERGIA === 'undefined') return;
  const h = ENERGIA.botonMonedero();
  if (h === energiaHtml) return;
  energiaHtml = h; CAJA_ENERGIA.innerHTML = h; CAJA_ENERGIA.hidden = !h;
  const b = CAJA_ENERGIA.querySelector('button'); if (b) b.onclick = () => { play('select'); ENERGIA.abrirTienda(); };
}
// cada paso de dibujo: el medidor se enseña en el menú principal y en las pantallas del PvP, y se pide al servidor cada vez que se entra en ellas
function energiaVista() {
  const ver = PANT.id === 'titulo' || PANT.id === 'pvp';
  if (!ver) { if (energiaVisible) { energiaVisible = false; CAJA_ENERGIA.hidden = true; energiaHtml = ''; energiaPant = ''; } return; }
  energiaVisible = true;
  // se pregunta al servidor al entrar en cada pantalla (y mientras no haya respuesta, cada 5 s: la cuenta puede tardar en estar lista)
  if (typeof ENERGIA !== 'undefined' && (PANT.id !== energiaPant || (!ENERGIA.estado && RELOJ - energiaPide > 5))) { energiaPant = PANT.id; energiaPide = RELOJ; ENERGIA.cargar().then(energiaPinta); }
  if (RELOJ - energiaTic > 1) { energiaTic = RELOJ; energiaPinta(); }
  else if (CAJA_ENERGIA.hidden && energiaHtml) CAJA_ENERGIA.hidden = false;
}
// ¿se puede buscar carrera? Sin caos primordial (y sin ilimitado) se enseña el aviso con la oferta y no se entra en la cola
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
