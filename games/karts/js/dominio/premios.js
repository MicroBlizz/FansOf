// Fans Of Karts · dominio · PREMIOS: lo que paga una carrera o una copa y en qué nivel del pase estás. Puro: recibe las cifras (la tabla KECO de js/economia.js)
// y devuelve números; no toca la partida (SAVE), ni el reloj, ni el azar, ni la pantalla. Quien lo llama cobra y avisa.
'use strict';
KD.premios = Object.freeze({
  // el oro y la XP del pase de una carrera. `llegada` = { puesto, monedas }; `modo` = { crono, pvp }; `dif` = 0, 1 o 2 (becario, empleado, CEO)
  pagoDeCarrera(llegada, modo, dif, vip, tabla) {
    const mult = modo.crono ? 1 : tabla.multNivel[dif] * (vip ? tabla.vipOro : 1);
    const base = modo.crono ? tabla.oroCrono : tabla.oroPuesto[llegada.puesto - 1] || tabla.oroDemas;
    const xp = modo.crono ? tabla.xpCrono : modo.pvp ? tabla.xpPvp : tabla.xpPuesto[llegada.puesto - 1] || tabla.xpDemas;
    return { oro: Math.round((base + llegada.monedas * tabla.oroMoneda) * mult), xp };
  },
  // el oro por quedar 1.º, 2.º o 3.º en una copa (0 si no hay premio)
  oroDeCopa(puesto, dif, vip, tabla) {
    if (puesto > 3) return 0;
    return Math.round(tabla.oroCopa[puesto - 1] * tabla.multNivel[dif] * (vip ? tabla.vipOro : 1));
  },
  // el nivel del pase con la XP que llevas (de 0 al máximo)
  nivelDePase(xp, xpPorNivel, maximo) { return Math.min(maximo, Math.floor(xp / xpPorNivel)); },
  // los cosméticos que dan las copas ganadas en nivel CEO: una, dos o cuatro copas
  premiosEjecutivos(copas) {
    const l = [];
    if (copas >= 1) l.push('kart-silla');
    if (copas >= 2) l.push('skin-ceo-bunny');
    if (copas >= 4) l.push('ruedas-oro', 'humo-oro');
    return l;
  },
});
