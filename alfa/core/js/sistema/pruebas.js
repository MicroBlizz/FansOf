// Fans Of · MODO PRUEBAS (en Opciones): todo abierto y al máximo para probar, con una copia de la partida para volver a ella.
// Lo común: la copia, todas las cartas al nivel máximo, una copia perfecta (100 %) de cada habilidad y objeto, oro y gemas,
// y los logros que se consigan así quedan cobrados sin dar premio (para que no se llene de avisos ni de gemas).
// Lo de cada juego (mundos, facciones, estrellas de la campaña) se engancha con hook('pruebas', () => { … }).
// El juego llama a botonPruebas(boton) al pintar Opciones y a pruebasClic(alAcabar) al tocar el botón.
'use strict';
const PRUEBAS_COPIA = SAVE_KEY + '-antes-pruebas';   // la partida de antes de activarlo (solo en este navegador)
const PRUEBAS_DINERO = [3000000, 5000];              // oro y gemas
const copiaPruebas = () => { try { return localStorage.getItem(PRUEBAS_COPIA); } catch (e) { return null; } };

// ACTIVAR, QUITAR (si hay copia para volver) o ACTIVADO (activado en una versión antigua, sin copia: no se puede quitar)
function botonPruebas(b) {
  const hay = !!copiaPruebas();
  b.textContent = !SAVE.testAll ? 'ACTIVAR' : hay ? 'QUITAR' : 'ACTIVADO';
  b.disabled = !!SAVE.testAll && !hay;
}

function pruebasClic(alAcabar) {
  play('select');
  if (SAVE.testAll) {
    if (!copiaPruebas()) return;
    confirmBox('QUITAR MODO PRUEBAS', 'Vuelves a la partida que tenías antes de activarlo, tal como estaba.<small>Lo que hayas hecho en el modo pruebas se pierde.</small>', 'VOLVER', volverDePruebas);
    return;
  }
  const nube = typeof CUENTA !== 'undefined' && CUENTA.email ? '<small>Tienes la cuenta abierta: el modo pruebas también se guarda en la nube y lo verás en tus otros aparatos hasta que lo quites aquí.</small>' : '';
  confirmBox('MODO PRUEBAS', 'Todo abierto y al máximo: las cartas al nivel 10, todas las habilidades y objetos con calidad perfecta y toda la campaña con 3 estrellas. Y 3.000.000 de oro y 5.000 gemas.<small>Antes se guarda una copia de tu partida. Para volver a ella, toca QUITAR en este mismo botón.</small>' + nube,
    'ACTIVAR', () => { activarPruebas(); if (alAcabar) alAcabar(); });
}

function activarPruebas() {
  try { localStorage.setItem(PRUEBAS_COPIA, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: no habrá vuelta atrás */ }
  const logrosAntes = Object.assign({}, SAVE.achR || {});
  SAVE.testAll = true; ECO.ganar('pruebas', { gold: PRUEBAS_DINERO[0], gems: PRUEBAS_DINERO[1] });
  // las cartas, al nivel máximo
  for (const k of Object.keys(CFG.cards)) { const us = uSave(k); us.lvl = ECON.maxLvl; us.xp = 0; }
  // una copia perfecta de cada habilidad y objeto del juego (si ya tienes una perfecta, no se repite)
  for (const [k, lista] of [['ab', ABILITIES], ['eq', ITEMS]]) for (const id in lista) {
    const b = bestCopy(k, id); if (b && avgQ(b) >= 1) continue;
    addCopy(k, id, Array.from({ length: Math.max(1, statsOf({ k, id }).length) }, () => 1));
  }
  fire('pruebas');   // lo de cada juego: mundos, facciones y estrellas
  // los logros que salen ahora quedan cobrados, sin premio
  if (typeof achScan === 'function' && SAVE.achR && SAVE.achC) {
    achScan();
    for (const f of ACHF) { const nuevos = (SAVE.achR[f.id] || 0) & ~(logrosAntes[f.id] || 0); if (nuevos) SAVE.achC[f.id] = (SAVE.achC[f.id] || 0) | nuevos; }
    achNew = 0;
  }
  saveGame(); updateWallets(); play('win');
  toast('Modo pruebas activado: todo al máximo', true);
}

// deja la partida de antes tal cual y recarga (así todas las pantallas salen bien). La nube se pone al día sola al abrir.
function volverDePruebas() {
  const t = copiaPruebas(); if (!t) return;
  try {   // el servidor también apunta la vuelta: lo que dio el modo pruebas se le quita (se manda al abrir otra vez)
    const antes = JSON.parse(t); if (typeof ECO_SOMBRA !== 'undefined') ECO_SOMBRA.anota('quitar-pruebas', { gold: SAVE.gold - (antes.gold || 0), gems: SAVE.gems - (antes.gems || 0), tickets: (SAVE.tickets || 0) - (antes.tickets || 0) }, -1);
  } catch (e) { /* sin copia legible: no se apunta */ }
  try { localStorage.setItem(SAVE_KEY, t); localStorage.removeItem(PRUEBAS_COPIA); } catch (e) { toast('No se ha podido volver a tu partida'); return; }
  if (typeof CUENTA !== 'undefined') CUENTA.cambio();
  location.reload();
}
