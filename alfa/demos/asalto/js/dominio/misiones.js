// Fans of Asalto · DOMINIO · Las misiones de la partida: metas cortas que se ven mientras se juega. Cada misión mira un contador de la
// partida (líneas, héroes absorbidos, enemigos derrotados…) y sube por escalones: al llegar a la meta de un escalón se cobra (oro y
// plumas, algo más en cada escalón) y pasa al siguiente. Aquí solo se eligen, se mide por dónde van y se dice cuáles toca cobrar: quien
// guarda los escalones cobrados y paga es la partida (partida.js). Todo puro: el azar se le pasa.
'use strict';
AS.misiones = (() => {
  // las de una partida nueva: al azar, o las de la partida guiada
  function elige(datos, azar, guiada) {
    const M = datos.misiones;
    return (guiada ? M.guia : azar.baraja(Object.keys(M.lista))).slice(0, M.cuantas);
  }
  // las de una partida guardada: las que sigan existiendo y, si faltan (una partida de antes de las misiones), las primeras de la lista
  function valida(datos, ids) {
    const M = datos.misiones, buenas = [...new Set((Array.isArray(ids) ? ids : []).filter(id => M.lista[id]))].slice(0, M.cuantas);
    for (const id of Object.keys(M.lista)) if (buenas.length < M.cuantas && !buenas.includes(id)) buenas.push(id);
    return buenas;
  }
  // el premio del escalón n (0 el primero)
  const premio = (datos, id, n) => ({ oro: datos.misiones.lista[id].oro + n * datos.misiones.porEscalon, plumas: datos.misiones.lista[id].plumas + n * datos.misiones.porEscalon });
  // cómo va una misión: { id, escalon, acabada, va, meta, oro, plumas }. escalones = { id: cuántos se han cobrado }
  function estadoDe(datos, id, escalones, cuenta) {
    const m = datos.misiones.lista[id], n = Math.min(escalones[id] || 0, m.metas.length), acabada = n >= m.metas.length;
    const meta = m.metas[Math.min(n, m.metas.length - 1)];
    return { id, escalon: n, acabada, meta, va: Math.min(meta, cuenta[m.stat] || 0), ...premio(datos, id, Math.min(n, m.metas.length - 1)) };
  }
  const estado = (datos, ids, escalones, cuenta) => ids.map(id => estadoDe(datos, id, escalones, cuenta));
  // la primera que toca cobrar ahora mismo (o null): se cobra de una en una, porque cobrar cambia su escalón
  const porCobrar = (datos, ids, escalones, cuenta) => estado(datos, ids, escalones, cuenta).find(e => !e.acabada && e.va >= e.meta) || null;
  return { elige, valida, premio, estado, porCobrar };
})();
