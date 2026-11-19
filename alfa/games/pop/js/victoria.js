// Fans of Pop · PANTALLA DE VICTORIA, las reglas sin dibujo (Pepins, 19-11-2026: «he visto esta y es mucho mejor que la nuestra»):
// la nota según las estrellas, las casillas de datos del nivel (toques, mínimo, tiempo, intento), la frase de debajo y la cuenta de
// las monedas que suben. Sin reloj, azar, SAVE ni DOM: todo entra por parámetro. La pantalla está en js/pantalla-victoria.js.
'use strict';
// Los fondos de cada nota: arriba (c1), abajo (c2), el panel y si va en degradado de arriba abajo (lineal) o en círculo
const pvFondo = (nombre, c1, c2, panel, lineal = false) => Object.freeze({ nombre, c1, c2, panel, lineal });
const PP_VIC_FONDOS = Object.freeze([
  Object.freeze([pvFondo('melocoton', '#ffd8c2', '#f39a86', 'rgba(190, 80, 60, 0.28)'), pvFondo('rosa-suave', '#ffe0ef', '#f59cc6', 'rgba(180, 50, 110, 0.26)')]),
  Object.freeze([pvFondo('cielo-suave', '#d6f0ff', '#7cbdf0', 'rgba(20, 80, 160, 0.26)'), pvFondo('menta-suave', '#d9fbe9', '#7fd6b4', 'rgba(10, 110, 90, 0.26)'),
    pvFondo('crema-rosa', '#fff4dc', '#ffb8d8', 'rgba(180, 60, 110, 0.24)', true)]),
  Object.freeze([pvFondo('rosa-pop', '#ffd7ec', '#ff7cbc', 'rgba(196, 40, 120, 0.30)'), pvFondo('cielo', '#b8e6ff', '#4b9fe6', 'rgba(15, 70, 160, 0.30)'),
    pvFondo('menta', '#c8fae1', '#3dbf98', 'rgba(10, 110, 90, 0.30)')]),
  Object.freeze([pvFondo('rosa-pop', '#ffd7ec', '#ff6eb5', 'rgba(196, 40, 120, 0.30)'), pvFondo('azul-cielo', '#8cd7ff', '#1e64c8', 'rgba(10, 60, 150, 0.32)'),
    pvFondo('rosa-azul', '#ffbee1', '#78beff', 'rgba(255, 255, 255, 0.28)', true), pvFondo('menta', '#c8fae1', '#28b48c', 'rgba(10, 110, 90, 0.30)')]),
]);
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
  // El fondo de la pantalla: al azar entre los colores de su nota (Pepins, 19-11-2026: «al azar, pero distinto por nota»; nada de
  // naranja ni lila). `azar` es un número de 0 a 1 que pone la pantalla; aquí no se tira ningún dado.
  fondo(estrellas, azar) {
    const n = Math.max(0, Math.min(3, Math.floor(Number(estrellas) || 0))), lista = PP_VIC_FONDOS[n];
    const k = Math.min(lista.length - 1, Math.max(0, Math.floor((Number(azar) || 0) * lista.length)));
    return lista[k];
  },
  // Las monedas que suben de 0 a `total`: lo que se ve con `k` de 0 (empieza) a 1 (acaba); frena al final y siempre acaba en el total
  cuenta(total, k) {
    const f = Math.min(1, Math.max(0, k));
    return Math.round(total * (1 - (1 - f) * (1 - f) * (1 - f)));
  },
});
