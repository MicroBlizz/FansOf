// Fans Of Sótano · dominio · PARTIDA: el estado entero y su forma guardada. Dos partes: el recorrido (r: lo que se pierde en el Despido)
// y la carrera (c: lo que se queda para siempre). Las fábricas devuelven SO.ok / SO.error; lo guardado se valida al cargarlo y lo que
// falte se rellena con el valor de una partida nueva (así una versión vieja del guardado sigue sirviendo).
'use strict';
SO.partida = (() => {
  const NM = () => SO.MATERIALES.length;
  const ceros = () => new Array(NM()).fill(0);
  const entero = n => Number.isFinite(n) && n >= 0;

  function recorridoNuevo(c, azar) {
    const r = { planta: null, materiales: ceros(), piezas: ceros(), oro: 0, nivel: 1, xp: 0, pico: { dano: 0, velocidad: 0, radio: 0 },
      mejorasMat: ceros(), dinamita: 0, medidor: 0, objetos: {}, activos: {}, venta: 0.5, tiempo: 0, plantaMax: 1, rotos: 0 };
    r.planta = SO.planta.crea(1, azar, SO.bonos.calcula({ r, c }), c.expedientes);
    return r;
  }
  function carreraNueva() {
    return { trituradora: { nivel: 0, dano: 0, espera: 0, intento: 0 }, recuerdos: {}, expedientes: ceros(), plan: {}, indemnizacion: 0,
      despidos: 0, autoDespido: 0, nivelMax: 1, plantaMax: 1, correo: { falta: 20, vuela: 0, x: 0 }, sindicato: { guardados: 0, falta: SO.AJ.sindicato.cada },
      totales: { bloques: 0, oro: 0, dinamitas: 0, correos: 0, cofres: 0 }, tiempoTotal: 0 };
  }
  function nueva(azar) {
    const c = carreraNueva();
    return { v: 1, r: recorridoNuevo(c, azar), c };
  }
  // rellena lo que falte con lo de una partida nueva, sin tocar lo que ya hay
  // (y alarga las listas por material si el juego tiene materiales nuevos)
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
    if (!Array.isArray(r.materiales) || r.materiales.length !== NM() || !r.materiales.every(entero)) return 'materiales';
    if (!Array.isArray(r.piezas) || !r.piezas.every(entero)) return 'piezas';
    if (!entero(r.oro) || !(r.nivel >= 1)) return 'recorrido';
    if (!r.planta || !Array.isArray(r.planta.bloques)) return 'planta';
    if (!entero(c.trituradora.nivel) || !entero(c.indemnizacion)) return 'carrera';
    return '';
  }
  // Resultado: la partida guardada, o 'partida-invalida' con el campo que falla
  function desdeJson(j, azar) {
    if (!j || typeof j !== 'object' || !j.r || !j.c) return SO.error('partida-invalida', { campo: 'raiz' });
    const e = JSON.parse(JSON.stringify(j));
    rellena(e, nueva(azar));
    const mal = valida(e);
    return mal ? SO.error('partida-invalida', { campo: mal }) : SO.ok(e);
  }
  const aJson = e => JSON.parse(JSON.stringify(e));

  return { nueva, desdeJson, aJson, recorridoNuevo };
})();
