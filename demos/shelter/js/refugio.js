// Fans of Shelter · EL REFUGIO: la madriguera de CrazyBunny se construye con lo que picas y talas de día, y lo construido se queda
// para siempre (SAVE.refugio), aunque te pillen de noche. Cinco niveles: tienda, cabaña, casa de piedra, casa con empalizada y fortín.
// Cada nivel da algo permanente (corazones, planos de la mesa, despensa de salida, una zanahoria más, daño) y cambia el edificio de la escena.
'use strict';

const REFUGIO = [
  null,
  { nombre: 'Tienda', que: 'Donde empieza todo', cuesta: {} },
  { nombre: 'Cabaña de madera', que: '+1 corazón y el plano de la zanahoria de fuego', cuesta: { madera: 10, piedra: 4 } },
  { nombre: 'Casa de piedra', que: 'Despensa (empiezas con recursos) y el plano del orbe', cuesta: { madera: 16, piedra: 10, hierro: 4 } },
  { nombre: 'Casa con empalizada', que: '+1 corazón y una zanahoria más de salida', cuesta: { madera: 20, piedra: 14, hierro: 8, cristal: 2 } },
  { nombre: 'Fortín', que: '¡Refugio terminado! +1 daño para siempre', cuesta: { madera: 24, piedra: 20, hierro: 12, cristal: 6 } },
];
const nivelRefugio = () => SAVE.refugio || 1;
const refugioSiguiente = () => REFUGIO[nivelRefugio() + 1] || null;
// ¿la mesa enseña esta receta? (los planos se ganan construyendo)
function planoAbierto(id) {
  if (id === 'fuego') return nivelRefugio() >= 2;
  if (id === 'orbe') return nivelRefugio() >= 3;
  return true;
}
// lo que el refugio da al empezar una partida
function aplicaRefugio() {
  const n = nivelRefugio();
  J.vidaMax = 5 + (n >= 2 ? 1 : 0) + (n >= 4 ? 1 : 0); J.vida = J.vidaMax;
  if (n >= 3) { J.inv.madera += 4; J.inv.piedra += 2; }
  if (n >= 4) J.arma.zanahorias++;
  if (n >= 5) J.arma.dano++;
}
// construir el siguiente nivel (desde la mesa). Devuelve true si se ha hecho
function construyeRefugio() {
  const sig = refugioSiguiente();
  if (!sig) { toast(tr('El refugio ya está terminado')); return false; }
  if (!tieneRecursos(sig.cuesta)) { toast(tr('Te faltan recursos')); SONIDO.no(); return false; }
  for (const k in sig.cuesta) J.inv[k] -= sig.cuesta[k];
  SAVE.refugio = nivelRefugio() + 1; guarda();
  const n = SAVE.refugio;
  if (n === 2 || n === 4) { J.vidaMax++; J.vida = Math.min(J.vidaMax, J.vida + 1); }
  if (n === 4) J.arma.zanahorias++;
  if (n === 5) J.arma.dano++;
  SONIDO.cofre(); tiembla(1);
  if (MAPA.refugio) chispas((MAPA.refugio.i + 0.5) * CAS, (MAPA.refugio.j + 0.5) * CAS, PALETA.Y, 24, 60);
  aviso(n === 5 ? tr('¡Refugio terminado!') : tr('¡Refugio: {n}!', { n: tr(sig.nombre) }), 3, PALETA.Y);
  return true;
}
// el edificio sobre la tienda pintada de la escena (img/refugio_<nivel>.png, con los pies en la casilla de MAPA.refugio)
function pintaRefugio(ctx, cam) {
  const n = nivelRefugio(); if (n < 2 || !MAPA.refugio || !hayImagen('refugio_' + n)) return;
  pintaSpr(ctx, 'refugio_' + n, (MAPA.refugio.i + 0.5) * CAS - cam.x, (MAPA.refugio.j + 1) * CAS - cam.y, { ancla: 'pies' });
}
