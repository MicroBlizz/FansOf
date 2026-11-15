// Fans Of Paperwork · dominio · PARTIDA: el estado entero y su forma guardada. Dos partes: el recorrido (r: lo que se pierde en el Despido)
// y la carrera (c: lo que se queda para siempre). Las fábricas devuelven PW.ok / PW.error; lo guardado se valida al cargarlo y lo que
// falte se rellena con el valor de una partida nueva (así una versión vieja del guardado sigue sirviendo).
'use strict';
PW.partida = (() => {
  const NM = () => PW.DOCUMENTOS.length;
  const ceros = () => new Array(NM()).fill(0);
  const entero = n => Number.isFinite(n) && n >= 0;

  function recorridoNuevo(c, azar) {
    const r = { planta: null, sueltos: ceros(), expedientes: ceros(), oro: 0, nivel: 1, xp: 0, utiles: { gafas: 0, cafe: 0, carrito: 0, guantes: 0, fundas: 0 }, temporales: 0, bonoCarta: {}, pedido: null,
      herramientas: PW.ZONAS.map(() => 0), caducados: 0, urgentes: [], equipo: PW.equipo.nuevo(),
      mejorasDoc: ceros(), restoVenta: ceros(), estanteria: 0, medidor: 0, objetos: {}, activos: {}, venta: 0.5, tiempo: 0, plantaMax: 1, vaciados: 0 };
    r.planta = PW.planta.crea(1, azar, PW.bonos.calcula({ r, c }), c.especialidad);
    return r;
  }
  function carreraNueva() {
    return { trituradora: { nivel: 0, atasco: 0, espera: 0, intento: 0, hambre: 0, multi: 0 },
      municion: { caducados: true, docs: PW.DOCUMENTOS.map((d, i) => i === 0) }, oferta: [], fotocopia: -1, sancion: 0, recuerdos: {}, especialidad: ceros(), plan: {}, indemnizacion: 0,
      despidos: 0, autoDespido: 0, nivelMax: 1, plantaMax: 1, correo: { falta: 20, vuela: 0, x: 0 }, sindicato: { guardados: 0, falta: PW.AJ.sindicato.cada },
      totales: { archivadores: 0, oro: 0, estanterias: 0, correos: 0, cofres: 0 }, tiempoTotal: 0 };
  }
  function nueva(azar) {
    const c = carreraNueva();
    return { v: 1, r: recorridoNuevo(c, azar), c };
  }
  // rellena lo que falte con lo de una partida nueva, sin tocar lo que ya hay
  // (y alarga las listas por documento si el juego tiene documentos nuevos)
  function rellena(guardado, base) {
    for (const k in base) {
      const b = base[k], g = guardado[k], objeto = b && typeof b === 'object';
      if (g === undefined || (g === null && objeto)) guardado[k] = b;
      else if (Array.isArray(b) && Array.isArray(g)) while (g.length < b.length) g.push(b[g.length]);
      else if (objeto && !Array.isArray(b) && g && typeof g === 'object') rellena(g, b);
    }
    return guardado;
  }
  function valida(e) {
    const r = e.r, c = e.c;
    if (!Array.isArray(r.sueltos) || r.sueltos.length !== NM() || !r.sueltos.every(entero)) return 'documentos';
    if (!Array.isArray(r.expedientes) || !r.expedientes.every(entero)) return 'expedientes';
    if (!entero(r.oro) || !(r.nivel >= 1)) return 'recorrido';
    if (!r.planta || !Array.isArray(r.planta.archivadores)) return 'planta';
    if (!entero(c.trituradora.nivel) || !entero(c.indemnizacion)) return 'carrera';
    return '';
  }
  // Resultado: la partida guardada, o 'partida-invalida' con el campo que falla
  function desdeJson(j, azar) {
    if (!j || typeof j !== 'object' || !j.r || !j.c) return PW.error('partida-invalida', { campo: 'raiz' });
    // una partida de antes de los documentos (0.1) no tiene archivadores ni documentos sueltos: no se rellena, se empieza de nuevo
    if (!j.r.planta || !Array.isArray(j.r.planta.archivadores) || !Array.isArray(j.r.sueltos)) return PW.error('partida-invalida', { campo: 'formato' });
    const e = JSON.parse(JSON.stringify(j));
    rellena(e, nueva(azar));
    const mal = valida(e);
    return mal ? PW.error('partida-invalida', { campo: mal }) : PW.ok(e);
  }
  const aJson = e => JSON.parse(JSON.stringify(e));

  return { nueva, desdeJson, aJson, recorridoNuevo };
})();
