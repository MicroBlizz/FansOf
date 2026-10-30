// Fans of Ratkov · AJUSTES: el nombre del juego para core (la partida en la nube), los ajustes de este navegador (sonido,
// música, calidad) y la partida (SAVE): las chapas, el alijo, lo que llevas puesto, el animal elegido, los encargos y las cuentas.
// Se carga antes de lo común (NUCLEO.juego, en index.html). Cada objeto guardado es { id, n } (n = cuántos); las armas llevan además
// sus piezas (mods), su anomalía (anom), su efecto secundario (efecto) y las balas del cargador (bal).
'use strict';
const AJUSTES = { id: 'ratkov', guardado: 'forat-partida', mudo: false, sinMusica: false, calidad: 'auto', autoApunta: true, dificultad: 'becario' };
try { Object.assign(AJUSTES, JSON.parse(localStorage.getItem('forat-ajustes') || '{}')); } catch (_) { /* sin guardar */ }
if (AJUSTES.vertical === 'palancas') AJUSTES.autoApunta = false;   // el ajuste de antes (solo de pie)
function guardaAjustes() { try { localStorage.setItem('forat-ajustes', JSON.stringify({ mudo: AJUSTES.mudo, sinMusica: AJUSTES.sinMusica, calidad: AJUSTES.calidad, autoApunta: AJUSTES.autoApunta, dificultad: AJUSTES.dificultad, teclas: AJUSTES.teclas, vibra: AJUSTES.vibra })); } catch (_) { /* sin guardar */ } }

// la partida de alguien que empieza: una pistola con su munición, dos vendas, una mochila pequeña y unas chapas
function partidaNueva() {
  return {
    v: 1, chapas: 600, animal: 'bunny', desbloq: ['bunny'], menuMus: 'olvidados',
    alijo: [{ id: 'm9', n: 40 }, { id: 'venda', n: 2 }, { id: 'te', n: 1 }, { id: 'abrecartas', n: 1, dur: 4 }, { id: 'metralleta', n: 1, mods: {}, bal: 0 }],
    equipo: { arma1: { id: 'pistola', n: 1, mods: {}, bal: 8 }, arma2: null, chaleco: null, casco: null, mochila: { id: 'mochila-p', n: 1 } },
    mochila: [{ id: 'm9', n: 32 }],           // lo que llevas dentro de la mochila (se pierde si caes)
    bolsillos: [{ id: 'venda', n: 1 }, null, null],
    rinonera: [],                                // la riñonera: lo de dentro no se pierde nunca
    encargos: {}, mejoras: {}, cuentas: { incursiones: 0, salidas: 0, caidas: 0, bajas: 0, carroneros: 0, auditor: 0, lag: 0, mejor: 0, anomalias: 0, alcantarilla: 0 },
    visto: { como: false }, uid: 1,
  };
}
const SAVE = (() => { let s = null; try { s = JSON.parse(localStorage.getItem(AJUSTES.guardado) || 'null'); } catch (_) { s = null; } return s && s.v === 1 ? Object.assign(partidaNueva(), s) : partidaNueva(); })();
function guardaPartida() { try { localStorage.setItem(AJUSTES.guardado, JSON.stringify(SAVE)); } catch (_) { /* sin guardar */ } if (typeof copiaSeguridad === 'function') copiaSeguridad(); if (typeof CUENTA !== 'undefined') CUENTA.cambio(); }
// core pregunta si se está jugando (para no interrumpir con avisos de la cuenta)
window.enPartida = () => typeof RAID !== 'undefined' && !!RAID.activa;
