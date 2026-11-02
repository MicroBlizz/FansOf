// Fans Of · FRENTE DE TEMPORADA: una galaxia (o cualquier mapa de casillas) que las facciones se disputan con los puntos de la comunidad.
// Es el SISTEMA común y no sabe nada de ningún juego: el juego le da su mapa, sus facciones y los puntos de sus jugadores.
// Reglas (decididas el 01-11-2026, docs/decisiones/027):
// · Cada día se recalcula el mapa: en cada casilla, la facción atacante con más puntos se la queda si supera los del dueño más su defensa.
// · Los puntos de una casilla pierden una parte cada día (decae); al cambiar de dueño se ponen a cero.
// · Las facciones de IA reparten puntos de relleno cada día por su frontera, para que el mapa se mueva aunque juegue poca gente.
// · El domingo se cierra la semana: gana la facción con más casillas (si empatan, la de más puntos acumulados).
// Todo es determinista: el mismo mapa, la misma semilla y los mismos aportes dan siempre el mismo resultado (se puede simular en el aparato
// y, más adelante, en el servidor). Sin DOM: se prueba en Node (tests/core/frente.test.mjs).
'use strict';
const FRENTE = (() => {
  const DIA_MS = 86400000;

  // ---------- el calendario: semanas de lunes a domingo, en la hora local ----------
  function lunesDe(fecha) {
    const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    return d;
  }
  function claveSemana(fecha) {
    const l = lunesDe(fecha), dd = n => String(n).padStart(2, '0');
    return l.getFullYear() + '-' + dd(l.getMonth() + 1) + '-' + dd(l.getDate());
  }
  // días ya cerrados de esta semana: el lunes, 0 (el mapa de salida); el domingo, 6
  function diasCerrados(fecha) { return Math.min(6, Math.floor((fecha - lunesDe(fecha)) / DIA_MS)); }
  function semanaAnterior(fecha) { return claveSemana(new Date(lunesDe(fecha).getTime() - 3 * DIA_MS)); }
  function semillaDe(texto) { let h = 7; for (const ch of String(texto)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h || 1; }
  function azar(semilla) {
    let a = semilla >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  // ---------- un día de guerra ----------
  // Casillas que una facción puede atacar: las que no son suyas, tocan una suya y no están cerradas.
  function frontera(mapa, duenos, fac) {
    const fuera = [];
    for (const id in mapa) {
      if (duenos[id] === fac || mapa[id].cerrada) continue;
      if (mapa[id].vecinos.some(v => duenos[v] === fac)) fuera.push(id);
    }
    return fuera;
  }
  function suma(puntos, id, fac, n) {
    const p = puntos[id] || (puntos[id] = {});
    p[fac] = (p[fac] || 0) + n;
  }
  // La IA reparte su relleno en tandas por su frontera, al azar pero con la semilla del día.
  function rellenoIA(mapa, duenos, puntos, cfg, R) {
    for (const fac of cfg.facciones) {
      const objetivos = frontera(mapa, duenos, fac);
      if (!objetivos.length) continue;
      const tanda = cfg.relleno / cfg.tandas;
      for (let i = 0; i < cfg.tandas; i++) suma(puntos, objetivos[Math.floor(R() * objetivos.length)], fac, tanda);
    }
  }
  // Quien más puntos tiene en una casilla se la queda si supera al dueño más su defensa.
  function resuelve(mapa, duenos, puntos, dia, cambios, cfg) {
    for (const id in puntos) {
      const p = puntos[id], dueno = duenos[id], defensa = (p[dueno] || 0) + (mapa[id].defensa || cfg.defensa);
      let mejor = null, max = 0;
      for (const fac in p) if (fac !== dueno && p[fac] > max) { max = p[fac]; mejor = fac; }
      if (mejor && max > defensa) { cambios.push({ dia, casilla: id, de: dueno, a: mejor }); duenos[id] = mejor; puntos[id] = {}; }
    }
  }
  function decae(puntos, cfg) {
    for (const id in puntos) for (const fac in puntos[id]) puntos[id][fac] *= 1 - cfg.decae;
  }

  // ---------- la semana entera ----------
  // cfg: { mapa: { id: { dueno, vecinos: [ids], defensa?, cerrada? } }, facciones: [ids], semilla, dias (0–7),
  //        aportes: [{ dia, casilla, faccion, puntos }], relleno (puntos de IA por facción y día), tandas, defensa, decae,
//        pesos? ({ faccion: multiplicador } de los aportes, ver pesosPilotos) }
  // Devuelve { duenos, puntos, cambios, ranking: [{ faccion, casillas, puntos }] }.
  function simula(entrada) {
    const cfg = Object.assign({ relleno: 60, tandas: 4, defensa: 20, decae: 0.3, aportes: [] }, entrada);
    const duenos = {}, puntos = {}, cambios = [], acumulados = {};
    for (const id in cfg.mapa) duenos[id] = cfg.mapa[id].dueno;
    for (let dia = 0; dia < cfg.dias; dia++) {
      rellenoIA(cfg.mapa, duenos, puntos, cfg, azar(semillaDe(cfg.semilla + ':' + dia)));
      for (const a of cfg.aportes) if (a.dia === dia && cfg.mapa[a.casilla] && !cfg.mapa[a.casilla].cerrada) {
        const n = a.puntos * (cfg.pesos && cfg.pesos[a.faccion] || 1);
        suma(puntos, a.casilla, a.faccion, n);
        acumulados[a.faccion] = (acumulados[a.faccion] || 0) + n;
      }
      resuelve(cfg.mapa, duenos, puntos, dia, cambios, cfg);
      decae(puntos, cfg);
    }
    return { duenos, puntos, cambios, ranking: ranking(duenos, cfg.facciones, acumulados) };
  }
  function ranking(duenos, facciones, acumulados) {
    const cuenta = {};
    for (const id in duenos) cuenta[duenos[id]] = (cuenta[duenos[id]] || 0) + 1;
    return facciones.map(f => ({ faccion: f, casillas: cuenta[f] || 0, puntos: Math.round(acumulados[f] || 0) }))
      .sort((a, b) => b.casillas - a.casillas || b.puntos - a.puntos || (a.faccion < b.faccion ? -1 : 1));
  }

  // Peso por pilotos (decidido el 01-11-2026): cada punto de una facción vale la raíz de (media de pilotos por facción ÷ sus pilotos),
  // entre min y max. Una facción pequeña y activa puede ganar a la más popular. Las facciones sin pilotos no aportan: no llevan peso.
  function pesosPilotos(pilotos, facciones, min = 0.5, max = 2) {
    const con = facciones.filter(f => pilotos[f] > 0), pesos = {};
    if (!con.length) return pesos;
    const media = con.reduce((a, f) => a + pilotos[f], 0) / facciones.length;
    for (const f of con) pesos[f] = Math.min(max, Math.max(min, Math.sqrt(media / pilotos[f])));
    return pesos;
  }

  return { simula, pesosPilotos, frontera, claveSemana, diasCerrados, semanaAnterior, semillaDe };
})();
if (typeof module !== 'undefined') module.exports = FRENTE;
