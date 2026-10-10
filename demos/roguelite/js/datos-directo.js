// Fans of Roguelite · El directo: los canales que mandan raids (sus nombres salen en lo que va pasando) y cuántos espectadores
// trae cada cosa que pasa. La partida se emite «en directo»; el contador de espectadores está en la barra de arriba.
'use strict';

const CANALES = ['ConejoFan_88', 'LagLord', 'ExDeMicroblizz', 'TioDelPase', 'DespedidoUnLunes', 'NerfEsto', 'GemaPerdida', 'Ardilla_Rabiosa',
  'ClipItPls', 'MamaDelStreamer', 'Becario_42', 'ElCEO_Real', 'ZorroSigiloso', 'ParcheDia1', 'CAOSenjoyer', 'RoguelikeNoLite'];
// cuántos espectadores trae cada cosa
const ESPECTA = { critico: 3, chaos: 8, castor: 6, ganaJefe: 40, revive: 15, gordo: 20, legendaria: 6, victoria: 120, ardilla: 10 };
