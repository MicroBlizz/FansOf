// Fans of Pinball · aplicación · GUARDADO: el formato de la partida guardada (con versión) y su comprobación. desdeJson(reglas, json) da
// PB.ok(datos) con una copia limpia, o PB.error con el campo que no vale: una partida guardada rota NO se carga a medias (se empieza de
// cero y la sesión lo dice). Los datos son un objeto plano que la sesión guarda tal cual:
//   { version, fichas, niveles: { criatura: 1..5 }, desbloqueadas: [ids], equipo: [3 ids], historia: { superada, mejorPlanta },
//     sinfinAbierto, record: { planta, puntos }, semana: { clave, planta, puntos }, racha: { dia, dias }, diaPrimera, partidas,
//     partidasHistoria, cortas, retos (los de RETOSL de core), opciones: { sonido, vibracion } }
'use strict';
PB.Guardado = (() => {
  const esCifra = n => Number.isFinite(n) && n >= 0;
  const esTexto = t => typeof t === 'string';
  function nuevo(reglas) {
    const equipo = reglas.criaturas.equipo.slice(), niveles = {};
    for (const id of Object.keys(reglas.criaturas.lista)) niveles[id] = 1;
    return {
      version: reglas.vida.version, fichas: 0, niveles, desbloqueadas: equipo.slice(), equipo,
      historia: { superada: false, mejorPlanta: 0 }, sinfinAbierto: false, record: { planta: 0, puntos: 0 },
      semana: { clave: '', planta: 0, puntos: 0 }, racha: { dia: '', dias: 0 }, diaPrimera: '', partidas: 0, partidasHistoria: 0,
      cortas: 0, retos: null, opciones: { sonido: true, vibracion: true },
    };
  }
  // cada comprobación: [campo, (datos, reglas) => vale]
  const lista = c => Array.isArray(c);
  const ids = (reglas, l) => lista(l) && l.every(id => Boolean(reglas.criaturas.lista[id]));
  const marca = m => m && esCifra(m.planta) && esCifra(m.puntos);
  function nivelesValen(reglas, n) {
    if (!n || typeof n !== 'object') return false;
    return Object.keys(n).every(id => reglas.criaturas.lista[id] && Number.isInteger(n[id]) && n[id] >= 1 && n[id] <= reglas.progreso.nivelMaximo);
  }
  const REGLAS = [
    ['version', (d, r) => d.version === r.vida.version],
    ['fichas', d => esCifra(d.fichas)],
    ['niveles', (d, r) => nivelesValen(r, d.niveles)],
    ['desbloqueadas', (d, r) => ids(r, d.desbloqueadas) && d.desbloqueadas.length > 0],
    ['equipo', (d, r) => ids(r, d.equipo) && d.equipo.length === r.criaturas.equipo.length && d.equipo.every(id => d.desbloqueadas.includes(id))],
    ['historia', d => d.historia && typeof d.historia.superada === 'boolean' && esCifra(d.historia.mejorPlanta)],
    ['sinfinAbierto', d => typeof d.sinfinAbierto === 'boolean'],
    ['record', d => marca(d.record)],
    ['semana', d => marca(d.semana) && esTexto(d.semana.clave)],
    ['racha', d => d.racha && esTexto(d.racha.dia) && esCifra(d.racha.dias)],
    ['contadores', d => esTexto(d.diaPrimera) && esCifra(d.partidas) && esCifra(d.partidasHistoria) && esCifra(d.cortas)],
    ['retos', d => d.retos === null || typeof d.retos === 'object'],
    ['opciones', d => d.opciones && typeof d.opciones.sonido === 'boolean' && typeof d.opciones.vibracion === 'boolean'],
  ];
  function desdeJson(reglas, json) {
    if (!json || typeof json !== 'object') return PB.error('guardado_no_vale', { campo: 'todo' });
    const mal = REGLAS.find(([, vale]) => !vale(json, reglas));
    if (mal) return PB.error('guardado_no_vale', { campo: mal[0] });
    const datos = JSON.parse(JSON.stringify(json));
    datos.niveles = { ...nuevo(reglas).niveles, ...datos.niveles };   // una criatura nueva en los ajustes empieza en el nivel 1
    return PB.ok(datos);
  }
  return { nuevo, desdeJson };
})();
