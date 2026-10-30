// Fans Of Decks · Logros por líder y ventajas fiscales propias de cada líder (idea de Arkioner, 24-10-2026).
// Cada líder tiene 4 ventajas solo suyas: 2 se abren superando sus niveles de paro (hito paroLider) y 2 con sus logros (hito logro), uno de su facción y otro de veteranía.
// Los logros se miran al ganar una reunión (dcLogrosReunion, desde combate.js) y al ganar la partida (dcLogrosPartida, desde paro.js). DCP.meta.logros = { id: 1 }, DCP.meta.ganadas = { líder: n }.
'use strict';
const DC_VETERANO = 25;   // reuniones ganadas con un líder para su logro de veteranía
const DC_LOGROS = {
  'bunny-racha': { lider: 'bunny', nombre: 'Racha salvaje', texto: 'Remata una reunión con una racha de +5.', cumple: C => Math.max(0, ...Object.values(C.tiposTurno)) >= 5 },
  'directora-llena': { lider: 'directora', nombre: 'Lleno absoluto', texto: 'Gana una reunión a la que llegaron 5 rivales.', cumple: C => C.rivales.length >= 5 },
  'twitch-rapido': { lider: 'twitchking', nombre: 'Speedrun', texto: 'Gana una reunión en 2 turnos o menos.', cumple: C => C.turno <= 2 },
  'epic-nivel5': { lider: 'epicchampion', nombre: 'Nivel máximo', texto: 'Gana una reunión después de llegar al nivel 5.', cumple: C => (C.nivel || 0) >= 5 },
  'necro-vida': { lider: 'necrolord', nombre: 'Al borde de la tumba', texto: 'Gana una reunión con 10 de vida o menos.', cumple: () => DCP.run.hp <= 10 },
  'gamer-comunidad': { lider: 'progamer', nombre: 'Toda la comunidad', texto: 'Remata una reunión en un turno con 5 tipos de carta distintos.', cumple: C => Object.keys(C.tiposTurno).length >= 5 },
  'vikingo-turno1': { lider: 'vikingo', nombre: 'Olvidado y temido', texto: 'Gana una reunión en el primer turno.', cumple: C => C.turno === 1 },
  'ciber-intacto': { lider: 'cybermarine', nombre: 'Sin un rasguño', texto: 'Gana una reunión de 3 turnos o más sin perder vida.', cumple: C => C.turno >= 3 && DCP.run.hp >= C.hpInicio },
  'meme-campana': { lider: 'memelord', nombre: 'Viral total', texto: 'Supera la campaña con MemeLord.', partida: true, cumple: () => true },
};
for (const k of ['bunny', 'directora', 'twitchking', 'epicchampion', 'necrolord', 'progamer', 'vikingo', 'cybermarine', 'memelord'])
  DC_LOGROS[k + '-veterano'] = { lider: k, nombre: 'Empleado del mes', texto: 'Gana 25 reuniones con este líder.', veterano: true };
// Las de cada líder: [clave, nombre, texto, efecto, hito].
const DC_VENTAJAS_LIDER = {
  bunny: [['bunnyZanahorias', 'Zanahorias de la cafetería', 'Te curas 4 tras cada reunión ganada.', { curaReunion: 4 }, 2], ['bunnyMadriguera', 'Madriguera en el archivo', 'Empiezas cada reunión con 6 de bloqueo.', { bloqueoInicial: 6 }, 5],
    ['bunnyPrima', 'Prima por velocidad', 'Empiezas cada reunión con 1 de Fuerza.', { fuerzaInicial: 1 }, 'bunny-racha'], ['bunnyPata', 'Pata de conejo del jefe', '+12 de vida máxima.', { vidaMax: 12 }, 'bunny-veterano']],
  directora: [['dirDerechos', 'Derechos de autor', '+8 de bonus por cada reunión ganada.', { nominas: 8 }, 2], ['dirAlfombra', 'Alfombra roja', 'Empiezas cada reunión con 6 de bloqueo.', { bloqueoInicial: 6 }, 5],
    ['dirTaquilla', 'Éxito de taquilla', 'Empiezas la partida con 80 de bonus.', { nominasIniciales: 80 }, 'directora-llena'], ['dirFans', 'Club de fans', '+12 de vida máxima.', { vidaMax: 12 }, 'directora-veterano']],
  twitchking: [['twDonaciones', 'Donaciones del chat', '+8 de bonus por cada reunión ganada.', { nominas: 8 }, 2], ['twDirecto', 'Directo de 24 horas', 'Robas 1 carta más en el primer turno de cada reunión.', { manoInicial: 1 }, 5],
    ['twClip', 'Clip viral', 'Empiezas cada reunión con 1 CAOS extra.', { caosInicial: 1 }, 'twitch-rapido'], ['twSubs', 'Suscriptores fieles', 'Te curas 4 tras cada reunión ganada.', { curaReunion: 4 }, 'twitchking-veterano']],
  epicchampion: [['epicArmadura', 'Armadura de gala', 'Empiezas cada reunión con 6 de bloqueo.', { bloqueoInicial: 6 }, 2], ['epicPocion', 'Poción de oficina', 'Empiezas la partida con un Botiquín de oficina.', { meriendasIniciales: ['botiquin'] }, 5],
    ['epicLeyenda', 'Leyenda del departamento', 'Empiezas cada reunión con 1 de Fuerza.', { fuerzaInicial: 1 }, 'epic-nivel5'], ['epicEscudero', 'Escudero en prácticas', '+12 de vida máxima.', { vidaMax: 12 }, 'epicchampion-veterano']],
  necrolord: [['necroBaja', 'Baja indefinida', '+12 de vida máxima.', { vidaMax: 12 }, 2], ['necroCripta', 'Cripta climatizada', 'Te curas 4 tras cada reunión ganada.', { curaReunion: 4 }, 5],
    ['necroZombi', 'Turno zombi', 'Empiezas cada reunión con 1 de Fuerza.', { fuerzaInicial: 1 }, 'necro-vida'], ['necroPension', 'Pensión de ultratumba', '+8 de bonus por cada reunión ganada.', { nominas: 8 }, 'necrolord-veterano']],
  progamer: [['gamerSilla', 'Silla gaming', 'Empiezas cada reunión con 5 de bloqueo.', { bloqueoInicial: 5 }, 2], ['gamerParche', 'Parche del día uno', 'Robas 1 carta más en el primer turno de cada reunión.', { manoInicial: 1 }, 5],
    ['gamerCombo', 'Combo perfecto', 'Empiezas cada reunión con 1 CAOS extra.', { caosInicial: 1 }, 'gamer-comunidad'], ['gamerPatrocinio', 'Patrocinio', 'Empiezas la partida con 80 de bonus.', { nominasIniciales: 80 }, 'progamer-veterano']],
  vikingo: [['vikHidromiel', 'Hidromiel de la máquina', 'Te curas 4 tras cada reunión ganada.', { curaReunion: 4 }, 2], ['vikEscudo', 'Escudo de madera', 'Empiezas cada reunión con 6 de bloqueo.', { bloqueoInicial: 6 }, 5],
    ['vikSaqueo', 'Saqueo del economato', 'El Economato te hace un 15 % de descuento.', { descuento: 0.15 }, 'vikingo-turno1'], ['vikBarba', 'Barba legendaria', '+14 de vida máxima.', { vidaMax: 14 }, 'vikingo-veterano']],
  cybermarine: [['ciberImplante', 'Implante de productividad', '+8 de bonus por cada reunión ganada.', { nominas: 8 }, 2], ['ciberCortafuegos', 'Cortafuegos', 'Empiezas cada reunión con 6 de bloqueo.', { bloqueoInicial: 6 }, 5],
    ['ciberChasis', 'Chasis sin rasguños', '+12 de vida máxima.', { vidaMax: 12 }, 'ciber-intacto'], ['ciberOverclock', 'Overclock', 'La habilidad de tu líder se carga con 1 de CAOS menos.', { carga: 1 }, 'cybermarine-veterano']],
  memelord: [['memeRepost', 'Repost', '+8 de bonus por cada reunión ganada.', { nominas: 8 }, 2], ['memeTendencia', 'Tendencia del día', 'Robas 1 carta más en el primer turno de cada reunión.', { manoInicial: 1 }, 5],
    ['memePlantilla', 'Plantilla de meme', 'Empiezas la partida con un objeto al azar.', { objetoInicial: 1 }, 'meme-campana'], ['memeLikes', 'Mil likes', 'Te curas 4 tras cada reunión ganada.', { curaReunion: 4 }, 'memelord-veterano']],
};
for (const lider in DC_VENTAJAS_LIDER) for (const [k, nombre, texto, fx, h] of DC_VENTAJAS_LIDER[lider])
  DC_VENTAJAS[k] = Object.assign({ nombre, texto, lider, hito: typeof h === 'number' ? { paroLider: h, lider } : { logro: h } }, fx);
// ---------- hitos ----------
function dcHitoCumplido(h) {
  if (h.paroSuma) return dcParoSuma() >= h.paroSuma;
  if (h.paroLider) return dcParoAbierto(h.lider) >= h.paroLider;
  if (h.logro) return !!(DCP.meta.logros || {})[h.logro];
  return true;
}
function dcHitoTexto(h) {
  if (h.paroSuma) return tr(h.paroSuma === 1 ? 'Supera 1 nivel de paro con cualquier líder' : 'Supera {n} niveles de paro sumando todos los líderes', { n: h.paroSuma });
  if (h.paroLider) return tr('Supera el paro +{n} con {l}', { n: h.paroLider - 1, l: tr(DC_LIDERES[h.lider].nombre) });
  if (h.logro) { const L = DC_LOGROS[h.logro]; return tr('Logro «{l}»: {t}', { l: tr(L.nombre), t: tr(L.texto) }) + (L.veterano ? ' ' + tr('({n} de {m})', { n: (DCP.meta.ganadas || {})[L.lider] || 0, m: DC_VETERANO }) : ''); }
  return '';
}
// ---------- conseguir logros ----------
function dcConsigue(id) {
  const M = DCP.meta; M.logros = M.logros || {}; if (M.logros[id]) return; M.logros[id] = 1;
  const v = Object.keys(DC_VENTAJAS).find(k => DC_VENTAJAS[k].hito && DC_VENTAJAS[k].hito.logro === id);
  play('levelup'); toast(tr('¡Logro! {l}', { l: tr(DC_LOGROS[id].nombre) }) + (v ? ' · ' + tr('Nueva ventaja fiscal: {v}', { v: tr(DC_VENTAJAS[v].nombre) }) : ''));
}
function dcLogrosReunion(C) {
  const k = DCP.run.lider, M = DCP.meta; M.ganadas = M.ganadas || {}; M.ganadas[k] = (M.ganadas[k] || 0) + 1;
  for (const id in DC_LOGROS) { const L = DC_LOGROS[id]; if (L.lider !== k || L.partida) continue; if (L.veterano ? M.ganadas[k] >= DC_VETERANO : L.cumple(C)) dcConsigue(id); }
}
function dcLogrosPartida() { const k = DCP.run.lider; for (const id in DC_LOGROS) if (DC_LOGROS[id].lider === k && DC_LOGROS[id].partida) dcConsigue(id); }
