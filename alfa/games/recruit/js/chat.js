// Fans of Recruit · EL DIRECTO: la misión se retransmite y el chat (falso) comenta lo que pasa, como en Fans of Rumble. Cada
// cosa que ocurre (cae un becario, sueltas a un fan, llega el jefe…) puede sacar una frase; si no pasa nada, charlan. Los
// espectadores suben cuando haces algo sonado.
'use strict';

const CHAT = { lineas: [], gente: 1200, prox: 300 };
const CHAT_GENTE = [['LagLord', '#63cfe0'], ['Becario_42', '#a3e635'], ['ConejoFan_88', '#ff9ac8'], ['ExDeMicroblizz', '#ffb347'], ['VacaLover', '#f9a8d4'], ['Zanahoria_Pro', '#ff9a3c'], ['KPI_Enjoyer', '#c4a1ff'], ['MamaDeBunny', '#ffe56e']];
// cada frase: un texto (lo dice cualquiera) o [quién, texto]
const CHAT_FRASES = {
  inicio: ['¡dale, conejo!', 'hoy cae Microblizz', ['MamaDeBunny', 'abrígate, hijo'], 'primera vez aquí, ¿qué es esto?'],
  becario: [['Becario_42', 'yo solo traía el café'], 'F por el becario', 'era su primer día', 'eso no lo cubre el seguro', ['KPI_Enjoyer', 'productividad: -1']],
  dron: ['dron abajo', ['KPI_Enjoyer', 'mis KPIs, noooo'], 'la flecha siempre baja, qué raro'],
  fan: ['¡FAN LIBRE!', ['ConejoFan_88', '¡ese soy yo!'], '+1 suscriptor', 'esa cinta era de obra'],
  arma: ['METRALLETA GOD', 'ahora sí que sí', ['LagLord', 'eso está rotísimo']],
  mecha: [['LagLord', 'la vaca es OP, nerf pls'], ['VacaLover', 'MUUUUUUUU'], '¿por qué es rosa? da igual'],
  mechaRota: [['VacaLover', 'NOOO, LA VACA'], 'F en el chat', 'la vaca sigue, respeto'],
  dano: ['JAJAJA', ['LagLord', 'eso ha sido lag'], 'clip, clip, clip', ['MamaDeBunny', '¡ten cuidado!']],
  caos: ['CAOOOOS', '¡¡SALTO DEL CAOS!!', 'me tiembla la pantalla', 'CLIP ESO'],
  jefe: ['viene el de RRHH', ['ExDeMicroblizz', 'ese robot cerró mi juego'], 'SURVIVALBOT, NO'],
  jefe2: ['le queda poco', 'está echando humo', ['KPI_Enjoyer', 'rendimiento a la baja']],
  jefeMuerto: ['CANCELADO, JAJAJA', 'GG', ['ExDeMicroblizz', 'justicia poética'], 'que le den el finiquito'],
  fin: ['F', 'horas extra sin pagar', 'se acabó el directo'],
  charla: ['¿cuándo sale la misión 2?', 'Microblizz, no compres esto', ['ExDeMicroblizz', 'yo programé ese ascensor'], 'saludos desde Albacete', ['LagLord', 'voy a 3 FPS y lo gozo'],
    'ese cartel de sinergia…', 'hola, chat', ['Becario_42', '¿esto cuenta como prácticas?'], ['MamaDeBunny', '¿has comido?'], 'necesito esa corona'],
};
function nuevoChat() { CHAT.lineas = []; CHAT.gente = 1100 + ((Math.random() * 300) | 0); CHAT.prox = 240; }
function chat(ev) {
  const lista = CHAT_FRASES[ev] || CHAT_FRASES.charla, dichas = CHAT.lineas.map(l => l.s), nuevas = lista.filter(x => !dichas.includes(Array.isArray(x) ? x[1] : x));
  const f = pick(nuevas.length ? nuevas : lista), fijo = Array.isArray(f), quien = fijo ? CHAT_GENTE.find(g => g[0] === f[0]) : pick(CHAT_GENTE.filter(g => g[0] !== 'Becario_42' && g[0] !== 'MamaDeBunny'));
  CHAT.lineas.push({ q: quien[0], c: quien[1], s: fijo ? f[1] : f, t: 0 });
  if (CHAT.lineas.length > 2) CHAT.lineas.shift();
  if (ev !== 'charla') CHAT.gente += ev === 'jefeMuerto' ? 900 : ev === 'caos' || ev === 'mecha' ? 160 : 24 + ((Math.random() * 40) | 0);
  CHAT.prox = rand(380, 620);
}
function pasoChat() {
  for (const l of CHAT.lineas) l.t++;
  if (CHAT.lineas.length && CHAT.lineas[0].t > 330) CHAT.lineas.shift();
  if (--CHAT.prox <= 0) chat('charla');
}
// los espectadores, como los pone un directo: 987 o 1,2K
function genteChat() { const n = CHAT.gente; return n < 1000 ? String(n | 0) : (n / 1000).toFixed(1).replace('.', ',') + 'K'; }
