// Fans of Toys · aplicación · SESIÓN: la partida en curso y los récords, y la única puerta para guardarlos. Las pantallas llaman a
// sesion.eligeMejora, decideNoticia, produce y sigue: cada una pasa la jugada al dominio (TY.creaJuego), se queda con la partida nueva,
// apunta el récord si el año ha terminado y guarda. Puertos: almacen { carga() → json | null, guarda(json) }, juego y semilla() → número.
// Lo guardado: { v: 1, nivel, partidas, victorias, record, partida | null }.
'use strict';
TY.creaSesion = ({ almacen, juego, semilla, nivelMaximo }) => {
  const numero = (n, defecto = 0) => (Number.isFinite(n) ? n : defecto);
  const partidaValida = p => !!p && p.v === 1 && typeof p.fase === 'string' && Array.isArray(p.mejoras) && Array.isArray(p.oferta) ? p : null;
  const lee = json => {
    const j = json && json.v === 1 ? json : {};
    return { v: 1, nivel: Math.max(0, Math.min(nivelMaximo, numero(j.nivel) | 0)), partidas: numero(j.partidas), victorias: numero(j.victorias),
      record: numero(j.record, null), partida: partidaValida(j.partida) };
  };
  let datos = lee(almacen.carga());
  const guarda = () => almacen.guarda(datos);

  // al terminar un año: cuenta la partida, sube el nivel si se ha llegado más lejos y apunta el récord
  const apunta = partida => {
    const antes = { nivel: datos.nivel, record: datos.record };
    datos = { ...datos, partidas: datos.partidas + 1, victorias: datos.victorias + (partida.fin.tipo === 'ascendido' ? 1 : 0),
      nivel: Math.max(datos.nivel, Math.min(nivelMaximo, partida.fin.trimestres)), record: Math.max(datos.record ?? -Infinity, partida.beneficioTotal) };
    return { nivelAntes: antes.nivel, nivel: datos.nivel, esRecord: antes.record === null || partida.beneficioTotal > antes.record };
  };
  let cierre = null;   // lo que cambió al terminar la última partida (para la pantalla del final)

  const juega = resultado => {
    if (!resultado.ok) return resultado;
    const partida = resultado.valor;
    if (partida.fase === 'fin') cierre = apunta(partida);
    datos = { ...datos, partida };
    guarda();
    return resultado;
  };

  return {
    get partida() { return datos.partida; },
    get datos() { return datos; },
    get cierre() { return cierre; },
    enCurso: () => !!datos.partida && datos.partida.fase !== 'fin',
    empieza() { cierre = null; datos = { ...datos, partida: juego.nueva({ semilla: semilla(), nivel: datos.nivel }) }; guarda(); return datos.partida; },
    eligeMejora: id => juega(juego.eligeMejora(datos.partida, id)),
    decideNoticia: indice => juega(juego.decideNoticia(datos.partida, indice)),
    produce: eleccion => juega(juego.produce(datos.partida, eleccion)),
    sigue: () => juega(juego.sigue(datos.partida)),
    abandona() { datos = { ...datos, partida: null }; guarda(); },
    borra() { datos = lee(null); cierre = null; guarda(); },
  };
};
