// Tiny Fans · aplicación · PAQUETE DEL DÍA: un regalo de materiales al día, que va al almacén. Los días seguidos suben la racha y la
// racha elige el regalo (reglas.diario.regalos, en rueda). Se apunta en el extra 'diario' de la partida: { dia, racha }.
// Puertos: { reglas, sesion, reloj, eventos }.
'use strict';
TN.creaDiario = ({ reglas, sesion, reloj, eventos }) => {
  const DIA = 86400000;
  // el número de día del calendario del jugador (cambia a su medianoche)
  const hoy = () => { const d = new Date(reloj.ahora()); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / DIA); };
  const dato = () => sesion.partida.extra('diario') || { dia: -1, racha: 0 };
  return {
    get disponible() { return dato().dia !== hoy(); },
    get racha() { return dato().racha; },
    // Resultado: ok({ regalo, racha }) o error('regalo-cogido')
    abre() {
      const d = dato(), dia = hoy();
      if (d.dia === dia) return TN.error('regalo-cogido');
      const racha = d.dia === dia - 1 ? d.racha + 1 : 1, lista = reglas.diario.regalos, regalo = lista[(racha - 1) % lista.length];
      const r = TN.Nido.desdeJson(reglas, sesion.partida.nido), nido = r.ok ? r.valor : TN.Nido.nuevo(reglas);
      nido.guarda(regalo); sesion.partida.ponNido(nido.aJson()); sesion.partida.ponExtra('diario', { dia, racha }); sesion.guarda();
      eventos.emite({ tipo: 'regalo-diario', regalo, racha });
      return TN.ok({ regalo, racha });
    },
  };
};
