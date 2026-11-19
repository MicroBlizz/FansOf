// Fans of Pop · PANTALLA DE VICTORIA, las reglas sin dibujo (Pepins, 19-11-2026: «he visto esta y es mucho mejor que la nuestra»):
// la nota según las estrellas, las casillas de datos del nivel (toques, mínimo, tiempo, intento), la frase de debajo y la cuenta de
// las monedas que suben. Sin reloj, azar, SAVE ni DOM: todo entra por parámetro. La pantalla está en js/pantalla-victoria.js.
'use strict';
const PP_VICTORIA = Object.freeze({
  // la palabra grande de arriba: 3 estrellas, perfecto; 2, genial; 1, superado
  nota(estrellas) { return estrellas >= 3 ? 'perfecto' : estrellas === 2 ? 'genial' : 'superado'; },
  // segundos como 0:08 o 12:40 (nunca negativo ni con decimales)
  reloj(seg) {
    const s = Math.max(0, Math.floor(Number(seg) || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  },
  // Las casillas de datos. `r` = { duelo, toques, minimo, errores, seg, intento }. En un duelo no hay toques ni mínimo: salen los errores.
  datos(r) {
    const propias = r.duelo ? [['errores', String(r.errores || 0)]] : [['toques', String(r.toques)], ['minimo', String(r.minimo)]];
    const todas = propias.concat([['tiempo', PP_VICTORIA.reloj(r.seg)], ['intento', String(Math.max(1, r.intento || 1))]]);
    return Object.freeze(todas.map(([clave, valor]) => Object.freeze({ clave, valor })));
  },
  // La frase de debajo de las casillas: el piropo si lo has bordado, o qué hace falta para las 3 estrellas
  frase(r) {
    if (r.duelo) return Object.freeze({ clave: (r.errores || 0) === 0 ? 'limpio' : 'sinErrores' });
    return Object.freeze(r.toques <= r.minimo ? { clave: 'minimo' } : { clave: 'faltan', n: r.minimo });
  },
  // Cuánta fiesta lleva cada nota: trocitos de confeti y destellos alrededor de las estrellas (Pepins, 19-11-2026: «que sea una
  // fiesta conseguir 3 estrellas»; «más fiesta», 19-11). `oleadas`: cuántas tandas de confeti caen. Con 0 estrellas (sin toques) no hay fiesta: solo unas burbujitas tranquilas.
  fiesta(estrellas) {
    const n = Math.max(0, Math.min(3, Math.floor(Number(estrellas) || 0)));
    return Object.freeze([{ confeti: 0, oleadas: 0, brillos: 0, burbujas: 6 }, { confeti: 0, oleadas: 0, brillos: 3, burbujas: 6 }, { confeti: 24, oleadas: 1, brillos: 6, burbujas: 0 },
      { confeti: 70, oleadas: 3, brillos: 16, burbujas: 0 }][n]);
  },
  // Lo que llevas hecho al quedarte sin toques: burbujas explotadas de las que había (para la barra de «¡Casi!»)
  progreso(quedan, total) {
    const t = Math.max(0, Math.floor(total || 0)), q = Math.min(t, Math.max(0, Math.floor(quedan || 0)));
    return Object.freeze({ hechas: t - q, total: t, pct: t ? Math.round((t - q) * 100 / t) : 0 });
  },
  // Las estrellas en texto para compartir el resultado: ★ ganadas y ☆ las que faltan
  estrellasTexto(estrellas) {
    const n = Math.max(0, Math.min(3, Math.floor(Number(estrellas) || 0)));
    return '★'.repeat(n) + '☆'.repeat(3 - n);
  },
  // Las monedas que suben de 0 a `total`: lo que se ve con `k` de 0 (empieza) a 1 (acaba); frena al final y siempre acaba en el total
  cuenta(total, k) {
    const f = Math.min(1, Math.max(0, k));
    return Math.round(total * (1 - (1 - f) * (1 - f) * (1 - f)));
  },
});
