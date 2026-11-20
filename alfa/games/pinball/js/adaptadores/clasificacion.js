// Fans of Pinball · adaptador · CLASIFICACIÓN: el ÚNICO punto de enganche con la clasificación contra otros jugadores (PROTOTIPO.md,
// «Récord y clasificación»). Hoy NO habla con el servidor: las funciones que hacen falta (marca y ranking del sin fin, como las de
// Basement en servidor/115) piden un SQL nuevo con el sí de Pepins o Arkioner. Mientras, envia() no manda nada y lee() devuelve solo el
// récord propio de este móvil. Cuando el SQL esté aplicado, se cambia este archivo por uno que llame a esas funciones con el mismo contrato:
//   envia({ planta, puntos, semana }) → PB.ok({ enviado: bool, motivo })
//   lee() → PB.ok({ semana: { clave, planta, puntos }, siempre: { planta, puntos }, lista: [{ nombre, planta, puntos, puesto, tu }], cierraEn: ms })
'use strict';
PB.creaClasificacionLocal = ({ sesion, diario }) => ({
  envia: () => PB.ok({ enviado: false, motivo: 'sin_servidor' }),
  lee() {
    const D = sesion.datos, clave = diario.claveSemana();
    const semana = D.semana.clave === clave ? { ...D.semana } : { clave, planta: 0, puntos: 0 };
    const lista = semana.planta ? [{ nombre: 'Tú', planta: semana.planta, puntos: semana.puntos, puesto: 1, tu: true }] : [];
    return PB.ok({ semana, siempre: { ...D.record }, lista, cierraEn: diario.hastaLunes() });
  },
});
