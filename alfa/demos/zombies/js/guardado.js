// Fans of Zombies · GUARDAR LA PARTIDA (dominio): convierte la partida en datos simples (sin las tablas de ajustes que lleva dentro)
// con su número de versión, y la vuelve a montar al cargar. Si el formato cambia, se sube VERSION y las partidas de antes se rechazan
// con un error con nombre (o se pasan al formato nuevo aquí). Dónde se guarda lo decide la pantalla (js/config.js).
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  Z.VERSION_GUARDADO = 1;
  Z.serializa = function (e) {
    const datos = JSON.parse(JSON.stringify(e, (k, v) => (k === 'T' || k === 'A' || k === 'dif' || k === 'eventos' ? undefined : v)));
    return { v: Z.VERSION_GUARDADO, partida: datos };
  };
  Z.restaura = function (AJ, guardado) {
    if (!guardado || typeof guardado !== 'object' || !guardado.partida) return Z.error('sinPartida');
    if (guardado.v !== Z.VERSION_GUARDADO) return Z.error('versionAntigua', { v: guardado.v });
    const e = guardado.partida, dif = AJ.dificultades[e.dificultad], A = e.jugador && AJ.animales[e.jugador.animal];
    if (!dif || !A || e.zombis.some((z) => !AJ.zombis[z.tipo])) return Z.error('partidaRota');
    e.dif = dif; e.jugador.A = A; e.eventos = [];
    for (const z of e.zombis) z.T = AJ.zombis[z.tipo];
    e.huecos = e.huecos || {}; e.planta = e.planta || 0; if (e.semilla == null) e.semilla = 20261106; e.trozos = e.trozos || {}; Z.pasaExplorado(e); e.torre = e.torre || { visitadas: {} }; e.desmontados = e.desmontados || {}; if (e.diaCorteAgua == null) e.diaCorteAgua = AJ.mundo.corteAgua[1];   // las partidas de antes de las casas: los huecos se añaden al cargar (Z.preparaHuecos)
    return Z.ok(e);
  };
})(ZOM);
