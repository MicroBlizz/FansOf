// Fans of Zombies · LAS ESTACIONES (dominio): el año pasa con los días (AJ.estaciones.dias por estación, empieza en invierno) y cada
// estación cambia el juego: cuándo amanece y anochece, el hambre y la sed, si dejas huellas, cuánto se oye lo que haces (la lluvia tapa,
// las hojas crujen), cuánto ven y corren los fans, si la carne se pudre y qué da el huerto. Al cambiar, un aviso (e.estacion). ADR 076.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  const E = (AJ) => AJ.estaciones;
  Z.estacionDe = (AJ, min) => E(AJ).orden[Math.floor((Z.diaDe(min) - 1) / E(AJ).dias) % E(AJ).orden.length];
  Z.estacion = (AJ, min) => E(AJ)[Z.estacionDe(AJ, min)];
  Z.amanece = (AJ, min) => Z.estacion(AJ, min).amanece;
  Z.anochece = (AJ, min) => Z.estacion(AJ, min).anochece;
  // el día del año en que cambia de estación: aviso con su parche de Microblizz
  Z.pasoEstacion = function (AJ, e) {
    const k = Z.estacionDe(AJ, e.min);
    if (e.estacion === k) return;
    const antes = e.estacion; e.estacion = k;
    if (antes) e.eventos.push({ tipo: 'estacion', estacion: k });
  };
  // el ruido que haces según el tiempo (la lluvia lo tapa) y los pasos (las hojas secas crujen)
  Z.ruidoEstacion = (AJ, e, r) => r * Z.estacion(AJ, e.min).ruido * Z.lluviaRopa(AJ, e.jugador, Z.estacion(AJ, e.min));   // el chubasquero (js/equipo.js)
  Z.pasosEstacion = (AJ, e) => Z.estacion(AJ, e.min).pasos;
  // qué tabla de botín usa un sitio: el huerto da según la estación
  Z.tipoBotin = (AJ, e, tipo) => (tipo === 'huerto' ? 'huerto_' + Z.estacionDe(AJ, e.min) : tipo);
  // ¿sale podrida la carne? sin luz siempre; en verano, a veces
  Z.carnePodrida = (AJ, e, azar) => e.sinLuz || azar() < (Z.estacion(AJ, e.min).pudre || 0);
})(ZOM);
