// Fans of Toys · dominio · REGLAS DEL MES: junta en una sola ficha lo que cambian las mejoras elegidas y la noticia del mes.
// Cada clave se combina a su manera (TY.Reglas.COMBINA): `por` multiplica, `pon` se queda con el último valor, `mas` suma y `max` el mayor.
// Lo que no toca nadie vale lo de TY.Reglas.BASE. Puro: no lee AJUSTES ni el reloj.
'use strict';
TY.Reglas = (() => {
  const BASE = { demanda: 1, costeUnidad: 1, precioLujo: 1, moldeCoste: 1, publicidadCoste: 1, publicidadFallo: 0, almacenCoste: 1, caroDemanda: null,
    baratoDemanda: null, moda: null, mesMinimo: 0, liquidacion: 0, eventoCoste: 1, azarMinimo: -1, demandaLujo: 1, sinModa: false };
  const COMBINA = { demanda: 'por', costeUnidad: 'por', precioLujo: 'por', moldeCoste: 'por', publicidadCoste: 'por', almacenCoste: 'por', eventoCoste: 'por',
    demandaLujo: 'por', publicidadFallo: 'mas', caroDemanda: 'max', baratoDemanda: 'max', moda: 'max', mesMinimo: 'max', liquidacion: 'max', azarMinimo: 'max', sinModa: 'pon' };
  const COMO = {
    por: (a, b) => a * b,
    mas: (a, b) => a + b,
    max: (a, b) => (a === null ? b : Math.max(a, b)),
    pon: (a, b) => b,
  };
  const suma = (ficha, efecto) => {
    for (const clave of Object.keys(efecto)) if (COMBINA[clave]) ficha[clave] = COMO[COMBINA[clave]](ficha[clave], efecto[clave]);
    return ficha;
  };
  return {
    BASE, COMBINA,
    // la ficha del mes: las mejoras de la partida (por id, buscadas en `mejoras`) y lo que la noticia cambia este mes
    delMes(partida, mejoras) {
      const ficha = { ...BASE };
      for (const id of partida.mejoras) { const m = mejoras.find(x => x.id === id); if (m) suma(ficha, m.efecto); }
      return suma(ficha, partida.efectosMes || {});
    },
  };
})();
