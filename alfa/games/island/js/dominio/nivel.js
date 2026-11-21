// Fans of Island · dominio/nivel: EL NIVEL. IS.creaNivel() devuelve sus 78 columnas de isla con huecos de agua, puentes, islas flotantes,
// enemigos, zanahorias, peces, cangrejos y la bandera, más los adornos del paisaje (siempre los mismos). Puro: sin reloj, azar ni pantalla.
'use strict';
{
  const { T, D, CARRIL } = IS.MEDIDAS, ruido = IS.ruido;
  const COLS = 78, INICIO = 2, META = 72;
  const FRENTE = [4, 15, 21, 36, 49, 64, 70], FONDO = [1, 5, 8, 14, 23, 25, 34, 39, 46, 50, 57, 63, 66, 71, 75];

  // lo que se dibuja y no se juega: el fondo, el frente y las rocas del mar
  function paisaje(n) {
    for (const c of FONDO) n.ATRAS.push({ c, giro: ruido(c, 2, 3) * 6.28, tipo: ruido(c, 3, 4) < 0.5 ? 0 : 1, y: 4 + Math.floor(ruido(c, 5, 6) * 10) });
    for (const c of FRENTE) n.DELANTE.push({ c, giro: ruido(c, 4, 5) * 6.28 });
    for (const c of [6, 20, 47, 64]) n.ROCAS_MAR.push({ x: (c + 0.5) * T, y: D + 12 });
  }
  // el recorrido, de izquierda a derecha: tramos de tierra o agua, pilas de bloques, plataformas, zanahorias y enemigos
  function recorrido(n) {
    const tierra = (a, b, s) => { for (let c = a; c <= b; c++) n.NIV[c].s = s; };
    const apila = (c, ...t) => { n.NIV[c].pila = t; };
    const plat = (a, b, z, tipo) => n.PLAT.push({ a, b, z, tipo, x0: a * T + (tipo === 'isleta' ? 5 : 0), x1: (b + 1) * T - (tipo === 'isleta' ? 5 : 0) });
    const zana = (c, z) => n.ZANAS0.push({ x: (c + 0.5) * T, z });
    const enemigo = c => n.ENEM0.push(c);
    apila(12, 'c'); zana(5, 12); zana(6, 12); zana(12, 46);
    tierra(18, 19, -1);
    tierra(20, 25, 1); zana(22, 100); enemigo(24);
    apila(26, 'r'); apila(27, 'r', 'r');
    tierra(28, 31, -1); plat(28, 31, 0, 'tabla'); zana(30, 12);
    enemigo(35); zana(33, 12); plat(37, 39, 64, 'isleta'); zana(38, 76);
    tierra(41, 43, -1); zana(42, 60);
    tierra(44, 51, 1); enemigo(47); enemigo(50);
    tierra(52, 53, 1); apila(53, 'c');
    plat(55, 56, 64, 'isleta'); plat(58, 59, 104, 'isleta'); zana(59, 116);
    tierra(56, 57, -1);
    tierra(60, 61, -1); plat(60, 61, 0, 'tabla');
    enemigo(65); zana(67, 12); zana(68, 12);
    paisaje(n);
  }
  // qué adorno cae según el número del ruido: [hasta, tipo, y]; la altura y el giro salen de más ruido
  const ADORNOS = [
    [0.35, 'mata', (c, k) => 38 + Math.floor(ruido(c, k, 15) * 12), () => 0],
    [0.45, 'flor', (c, k) => 14 + Math.floor(ruido(c, k, 16) * 8), (c, k) => ruido(c, k, 17) * 6],
    [0.52, 'estrella', () => D - 3, (c, k) => ruido(c, k, 18) * 6],
    [0.6, 'concha', () => D - 2, (c, k) => ruido(c, k, 19) * 6]];
  // detalles de una columna (siempre los mismos): rocas en el mar, matas, flores, estrellas y conchas en tierra
  function decoraColumna(n, c) {
    if (n.NIV[c].s < 0) { if (ruido(c, 9, 9) < 0.5) n.ROCAS_MAR.push({ x: (c + ruido(c, 9, 8)) * T, y: D + 10 }); return; }
    for (let k = 0; k < 3; k++) {
      const r = ruido(c, k, 13), x = (c + ruido(c, k, 14)) * T, a = ADORNOS.find(e => r < e[0]);
      if (a) n.DECO.push({ t: a[1], x, y: a[2](c, k), giro: a[3](c, k) });
    }
  }
  IS.creaNivel = () => {
    const n = { COLS, INICIO, META, CANG0: [9, 33, 50, 67], PLAT: [], ZANAS0: [], ENEM0: [], ATRAS: [], DELANTE: [], DECO: [], ROCAS_MAR: [],
      // cada columna: s = altura del suelo en bloques (-1 = agua), pila = bloques encima (r roca, c caja), v = variante del dibujo
      NIV: Array.from({ length: COLS }, (_, i) => ({ s: 0, pila: [], v: Math.floor(ruido(i, 1, 2) * 3) })),
      PECES0: [{ c: 19, y: CARRIL }, { c: 42.5, y: CARRIL }, { c: 57, y: CARRIL }, { c: 30, y: D - 4 }, { c: 61, y: D - 4 }] };   // en los huecos y delante de los puentes
    recorrido(n);
    for (let c = 0; c < COLS; c++) decoraColumna(n, c);
    return n;
  };
}
