// Fans of Pop · EL RELIEVE DE LA BANDEJA (tarea #110, Daniel 19-11-2026): con el botón de silicona, la bandeja plana no casaba
// con él. En los mundos cuyo estilo pide `relieve`, la bandeja (cuadrada o con forma, la de siempre o una comprada) se dibuja
// como el molde de un pop-it de verdad: canto grueso con luz arriba y sombra abajo, y un asiento hundido bajo cada botón.
// Las medidas son datos (PP_RELIEVE) y las cuentas, dominio puro; el dibujo va sobre el lienzo de la bandeja (js/bandeja.js).
'use strict';

const PP_RELIEVE = Object.freeze({
  canto: 5,          // píxeles que asoma el canto por debajo
  luz: 3,            // píxeles de luz en el filo de arriba
  asiento: 0.47,     // radio del asiento, en celdas (el botón mide 0,46)
  sombra: 0.06,      // lo que baja la sombra del asiento, en celdas
});
// las casillas con botón: [x, y] del centro de cada una, en celdas (dominio)
function ppRelieveAsientos(mask, n) {
  const sal = [];
  for (let i = 0; i < n * n; i++) if (mask[i]) sal.push([(i % n) + 0.5, Math.floor(i / n) + 0.5]);
  return sal;
}
// el canto: una capa oscura que asoma por debajo del borde y un filo claro por arriba, siguiendo la forma
function ppBandejaCanto(c, T, cs) {
  c.save(); c.globalCompositeOperation = 'destination-over'; c.translate(0, PP_RELIEVE.canto);
  ppBandejaMancha(c, T, cs, cs * 0.68, '#55305f'); c.restore();
  c.save(); c.translate(0, -PP_RELIEVE.luz); c.globalAlpha = 0.45;
  ppBandejaMancha(c, T, cs, cs * 0.635, '#ffffff'); c.restore();
}
// el asiento de cada botón: una sombra redonda algo caída, el aro del molde y un filo de luz abajo a la derecha
function ppBandejaAsientos(c, T, cs) {
  const r = cs * PP_RELIEVE.asiento;
  for (const [x, y] of ppRelieveAsientos(T.mask, T.n)) {
    const cx = x * cs, cy = y * cs;
    c.beginPath(); c.arc(cx, cy + cs * PP_RELIEVE.sombra, r, 0, Math.PI * 2); c.fillStyle = 'rgba(70,25,80,0.22)'; c.fill();
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fillStyle = 'rgba(70,25,80,0.16)'; c.fill();
    c.lineWidth = Math.max(1.5, cs * 0.03); c.lineCap = 'round';
    c.beginPath(); c.arc(cx, cy, r, Math.PI * 1.05, Math.PI * 1.75); c.strokeStyle = 'rgba(70,25,80,0.3)'; c.stroke();
    c.beginPath(); c.arc(cx, cy, r, Math.PI * 0.05, Math.PI * 0.75); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke();
  }
}
