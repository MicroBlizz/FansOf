// Fans Of Decks · Telemetría anónima de partida: cada reunión, café o Economato que se resuelve y cómo acaba la partida (victoria, derrota o abandonada), con un UUID al azar por partida.
// El cuándo y el cómo se manda lo lleva core (core/js/sistema/telemetria.js: flag «decks-telemetria», el interruptor «Datos de partida anónimos» de Opciones y la cuenta); aquí solo se arma lo de Decks.
// Servidor: servidor/68-decks-telemetria.sql. Los ganchos están en partida.js: dcNuevaPartida, dcNodoResuelto y dcFinPartida.
'use strict';
TELEMETRIA.configurar({ rpc: 'enviar_decks', flag: 'decks-telemetria', descripcion: 'Mandar el progreso anónimo de cada partida de Decks para equilibrar el juego' });
const dcTelResumen = (estado, r) => ({
  version: String(NUCLEO.version || '').slice(0, 24), alfa: !!NUCLEO.alfa, lider: r.lider, ventaja: r.ventaja || '', paro: r.paro || 0, estado, cap: dcActo().cap,
  reuniones: r.stats.reuniones, turnos: r.stats.turnos, minutos: Math.round((Date.now() - r.empezada) / 60000), mazo: r.mazo.length, ascendidas: r.mazo.filter(c => c.asc).length,
});
function dcTelEmpieza(r) { r.tel = { id: TELEMETRIA.nueva(), n: 0 }; TELEMETRIA.estado(r.tel.id, dcTelResumen('en curso', r)); }
// un nodo resuelto (reunión, pausa, Economato, correo…): el tipo es el del mapa; las cifras, las de ahora
function dcTelNodo(r, tipo) {
  if (!r || !r.tel) return;
  TELEMETRIA.evento(r.tel.id, { n: r.tel.n++, tipo: String(tipo || 'nodo').toLowerCase().replace(/[^a-z]/g, '').slice(0, 16) || 'nodo', cap: dcActo().cap, dia: r.dia, hp: Math.round(r.hp), hpmax: r.hpMax, mazo: r.mazo.length,
    asc: r.mazo.filter(c => c.asc).length, nominas: r.nominas, turnos: r.stats.turnos, reuniones: r.stats.reuniones });
  TELEMETRIA.estado(r.tel.id, dcTelResumen('en curso', r));
}
function dcTelFin(r, estado) { if (r && r.tel) TELEMETRIA.estado(r.tel.id, dcTelResumen(estado, r), true); }
