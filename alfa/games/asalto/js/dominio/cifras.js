// Fans of Asalto · DOMINIO · Las cifras del combate: lo que ha hecho cada héroe en la batalla, en cuatro cuentas: el daño hecho a los
// enemigos (`dano`), el daño aguantado (`aguante`: la vida que le quitan y lo que para su escudo), la curación que ha dado (`cura`) y
// los enemigos derrotados (`bajas`). La batalla apunta aquí cada golpe a nombre del héroe que lo da (por su `ref`, el id del héroe en
// la partida) y lleva además el total de la batalla, que se cuenta aparte: si todo está bien apuntado, la suma de los héroes da el
// total. Fuera de la batalla se guardan las del último combate y las de la partida entera. Puro: sin reloj ni azar.
'use strict';
AS.cifras = (() => {
  const CAMPOS = ['dano', 'aguante', 'cura', 'bajas'];
  const fila = tipo => ({ tipo, dano: 0, aguante: 0, cura: 0, bajas: 0 });
  /* ---------- dentro de la batalla ---------- */
  const deBatalla = () => ({ heroes: {}, total: fila('') });
  // un héroe entra en la batalla: sale en las cifras aunque no llegue a hacer nada
  const alta = (C, u) => { if (u.ref) C.heroes[u.ref] = fila(u.tipo); };
  // suma n a la cuenta `campo` de la batalla y, si `u` es un héroe de la batalla, a la suya
  function apunta(B, u, campo, n) {
    if (!(n > 0)) return;
    B.cifras.total[campo] += n;
    const f = u && u.lado === 'heroe' && B.cifras.heroes[u.ref];
    if (f) f[campo] += n;
  }
  /* ---------- fuera: el último combate y la partida entera ---------- */
  const vacio = () => Object.freeze({ ultimo: Object.freeze({}), partida: Object.freeze({}) });
  const copia = f => Object.freeze({ tipo: f.tipo, dano: f.dano, aguante: f.aguante, cura: f.cura, bajas: f.bajas });
  const congela = tabla => { const t = {}; for (const ref in tabla) t[ref] = copia(tabla[ref]); return Object.freeze(t); };
  // al acabar un combate: sus cifras pasan a ser las del último y se suman a las de la partida
  function suma(c, heroes) {
    const partida = {};
    for (const ref in c.partida) partida[ref] = { ...c.partida[ref] };
    for (const ref in heroes) {
      const f = partida[ref] || (partida[ref] = fila(heroes[ref].tipo));
      for (const k of CAMPOS) f[k] += heroes[ref][k];
    }
    return Object.freeze({ ultimo: congela(heroes), partida: congela(partida) });
  }
  const total = (tabla, campo) => Object.values(tabla).reduce((s, f) => s + f[campo], 0);
  // los héroes de una tabla ordenados por una cuenta, de más a menos: [{ ref, tipo, v, parte (de 0 a 1 sobre el mejor) }]
  function lista(tabla, campo) {
    const l = Object.keys(tabla).map(ref => ({ ref, tipo: tabla[ref].tipo, v: tabla[ref][campo] })).sort((a, b) => b.v - a.v);
    const mejor = l.length ? l[0].v : 0;
    return l.map(x => ({ ...x, parte: mejor > 0 ? x.v / mejor : 0 }));
  }
  function tablaGuardada(datos, j) {
    const t = {};
    for (const ref in (j && typeof j === 'object' ? j : {})) {
      const g = j[ref];
      if (!g || !datos.heroes[g.tipo]) continue;
      const f = fila(g.tipo);
      for (const k of CAMPOS) f[k] = Number.isFinite(g[k]) && g[k] > 0 ? g[k] : 0;
      t[ref] = f;
    }
    return congela(t);
  }
  // de la partida guardada: lo que venga roto se queda fuera; sin nada guardado (una partida de antes), vacío
  const deJSON = (datos, j) => (j ? Object.freeze({ ultimo: tablaGuardada(datos, j.ultimo), partida: tablaGuardada(datos, j.partida) }) : vacio());
  return { CAMPOS, deBatalla, alta, apunta, vacio, suma, total, lista, deJSON };
})();
