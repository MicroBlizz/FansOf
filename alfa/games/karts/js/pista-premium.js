// Fans of Karts · EDICIÓN PREMIUM: la copa premium (viene con el pase premium). Cada pista premium es su pista normal con un trazado
// nuevo: mismo nombre, mundo, paisaje, colores, música y física, pero con cruces, rectas largas, zonas de saltos y atajos propios.
// Sus datos van en pista-premium-1..4.js (uno por mundo). El id es el de la pista normal con «-p» (oficinas-p…).
// En el online, si alguien de la sala tiene el pase premium, las pistas premium entran en la votación para todos (pvp-sala.js).
'use strict';

function pistaPremium(baseId, o) {
  const b = PISTAS.find(p => p.id === baseId);
  const d = Object.assign({}, b, { id: baseId + '-p', base: baseId, premium: true, invertida: false, tramos: [], atajos: [], puente: undefined }, o);
  PISTAS.push(d);
  return d;
}
// las pistas normales de un mundo o las premium (m: 0..3)
const pistasMundo = (m, premium) => PISTAS.filter(p => p.mundo === m + 1 && !!p.premium === !!premium);
// ¿puede jugar esta pista quien no tiene el pase? (las premium, solo con el pase; en el online, si alguien de la sala lo tiene)
const pistaAbierta = d => !d.premium || !!SAVE.premium;
