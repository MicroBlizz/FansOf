// Fans Of Pets · GUARDADO: la partida del prototipo, solo en este navegador (el plan la llevará al servidor con la hora del servidor; aún no).
// Guarda la fase (entrevista, huevos, horario, huevo, bebé), el modo de ritmo, la semilla de los huevos, la criatura, el horario de vida,
// las necesidades y el reloj. Las respuestas de la entrevista NO se guardan. Nada se comparte con otros juegos.
'use strict';
const PT_NUEVA = () => ({
  v: 1, fase: 'entrevista', ritmo: PETS.ritmoPorDefecto, semilla: 0, huevos: [], criatura: '',
  horario: { despierta: PETS.horario.despierta, acuesta: PETS.horario.acuesta },
  huevoDesde: 0, nacio: 0, ultimo: 0, desfase: 0, crecido: 0, avisoCrecido: false,   // crecido: minutos que lleva creciendo bien cuidada
  nec: Object.assign({}, PETS.nacer), dormida: false, motivo: '', despiertaHasta: 0, nocheMala: false, muted: false,
  siesta: false,   // ya la ha despertado de noche alguna vez: eso desbloqueará la siesta (aún no está en el prototipo)
});
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = PT_NUEVA();
  if (!s || typeof s !== 'object' || s.v !== 1) return n;
  for (const k in n) if (s[k] === undefined) s[k] = n[k];
  if (s.criatura && !ptCriatura(s.criatura)) return n;   // una criatura que ya no existe: se empieza de cero
  return s;
})();
function ptGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } }
function ptReinicia() { const n = PT_NUEVA(); for (const k in SAVE) delete SAVE[k]; Object.assign(SAVE, n); ptGuarda(); }
// la hora del juego: la del aparato más lo que se haya adelantado con DEV (el plan pide la del servidor; llegará con el progreso en la nube)
const ptAhora = () => Date.now() + (SAVE.desfase || 0);
// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 1; }
function volMusica() { return 0; }
function musicUpdate() { /* Pets aún no tiene música */ }
