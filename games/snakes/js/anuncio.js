// Fans of Snakes · El anuncio con premio (de PRUEBA): siempre voluntario, nunca a la fuerza ni en mitad de la partida. Por ahora
// solo sale en la alfa y en desarrollo; en la web de verdad el botón no aparece hasta que estén AdMob y el sí de Arkioner.
// verAnuncio(alAcabar): pide el anuncio a la capa común y, si se ve entero, da el premio.
'use strict';

const PUBLI = { activo: false, t: 0, alAcabar: null };
const hayAnuncios = () => !!(NUCLEO.alfa || NUCLEO.desarrollo);

// mientras sale el anuncio (capa común ANUNCIOS de core) la partida espera y no se dibuja nada propio
function verAnuncio(alAcabar) { PUBLI.activo = true; ANUNCIOS.ver('snakes').then(r => { PUBLI.activo = false; if (r.visto) alAcabar(); }); }
function toqueAnuncio() { /* el anuncio de core recoge sus propios toques */ }
function pintaAnuncioPremio() {}
