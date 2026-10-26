// Fans of Cooking · CONTROLES: el teclado compartido. Cada tecla pulsada se apunta aquí y, en cada paso, se vuelca en la entrada de su cocinero
// (moverse, coger, usar, cambiar). Sin ratón: todo lo de la partida se hace con teclas; las pantallas tienen botones por si acaso.
'use strict';
const CONTROLES = (() => {
  const abajo = new Set(), pulsadas = new Set();   // las que están pulsadas ahora y las que se han pulsado desde el último paso (flancos)
  let activo = true;
  addEventListener('keydown', e => {
    if (!activo || e.repeat) { if (activo && esDeJuego(e.code)) e.preventDefault(); return; }
    if (esDeJuego(e.code)) { abajo.add(e.code); pulsadas.add(e.code); e.preventDefault(); }
  });
  addEventListener('keyup', e => { abajo.delete(e.code); });
  addEventListener('blur', () => abajo.clear());
  const TODAS = new Set(); for (const j of ['j1', 'j2']) for (const k in COOK.teclas[j]) for (const c of COOK.teclas[j][k]) TODAS.add(c);
  function esDeJuego(code) { return TODAS.has(code); }
  const alguna = (lista, set) => lista.some(c => set.has(c));

  // vuelca las teclas en los cocineros. En solitario las dos manos (WASD y flechas) llevan al cocinero activo.
  function volcar(P) {
    for (const c of P.cocineros) {
      const e = c.entrada; e.mx = 0; e.my = 0;
      if (c.ia) continue;   // al compañero IA no le llegan teclas
      const juegos = P.modo === 'dobles' ? [c.i ? 'j2' : 'j1'] : (c.i === P.activo ? ['j1', 'j2'] : []);
      for (const j of juegos) {
        const K = COOK.teclas[j];
        if (alguna(K.izquierda, abajo)) e.mx -= 1; if (alguna(K.derecha, abajo)) e.mx += 1;
        if (alguna(K.arriba, abajo)) e.my -= 1; if (alguna(K.abajo, abajo)) e.my += 1;
        if (alguna(K.coger, pulsadas)) e.coger = true;
        if (alguna(K.usar, pulsadas)) e.lanzar = true;
        if (alguna(K.usar, abajo)) e.usar = true; else if (!alguna(K.usar, abajo) && juegos.length === 1) e.usar = false;
        if (alguna(K.cambiar, pulsadas) && P.modo === 'solo') e.cambiar = true;
      }
      if (P.modo !== 'dobles' && c.i === P.activo) e.usar = ['j1', 'j2'].some(j => alguna(COOK.teclas[j].usar, abajo));
      if (P.modo === 'dobles') e.usar = alguna(COOK.teclas[c.i ? 'j2' : 'j1'].usar, abajo);
    }
    pulsadas.clear();
  }
  const pausaPulsada = () => { const si = alguna(COOK.teclas.pausa, pulsadas); return si; };
  function limpia() { pulsadas.clear(); abajo.clear(); }
  return { volcar, limpia, activar: v => { activo = v; if (!v) limpia(); }, pulsada: code => pulsadas.has(code), pausaPulsada };
})();
