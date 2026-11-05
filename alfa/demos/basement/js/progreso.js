// Fans of Basement · Progreso (dominio, sin DOM ni reloj ni localStorage): lo que se queda entre bajadas. Las monedas, los
// cursos de formación comprados, el equipo y las mascotas que tienes (y lo que llevas puesto), los paquetes sin abrir, el récord
// de planta y los jefes vencidos. También suma los efectos de todo eso en las estadísticas de la siguiente bajada (statsDe).
// Las reglas devuelven BAS.ok(valor) o BAS.error(codigo): nunca lanzan por una regla incumplida.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  B.ok = (valor) => Object.freeze({ ok: true, valor });
  B.error = (codigo, datos) => Object.freeze({ ok: false, codigo, datos: datos || null });

  const entero = (n, min, max) => Math.max(min, Math.min(max, Math.floor(Number(n) || 0)));
  const esObjeto = (x) => !!x && typeof x === 'object' && !Array.isArray(x);

  B.progresoNuevo = () => ({
    monedas: 0, record: 0, bajadas: 0, cursos: [], equipo: { tiene: {}, puesto: {} }, mascotas: {}, mascota: null,
    paquetes: { normal: 0, jefe: 0 }, jefes: 0, vencidos: [],
  });

  // Copia profunda (el progreso se trata como inmutable: cada regla devuelve uno nuevo).
  B.copiaProgreso = (p) => ({
    ...p, cursos: [...p.cursos], equipo: { tiene: { ...p.equipo.tiene }, puesto: { ...p.equipo.puesto } },
    mascotas: { ...p.mascotas }, paquetes: { ...p.paquetes }, vencidos: [...p.vencidos],
  });

  // Lee lo guardado (formatos for-basement-v1 y v2). Lo que falte o no valga vuelve a su valor de partida.
  B.progresoDesde = function (AJ, datos) {
    const p = B.progresoNuevo();
    if (!esObjeto(datos)) return p;
    p.monedas = entero(datos.monedas, 0, 1e9);
    p.record = entero(datos.record, 0, 9999);
    p.bajadas = entero(datos.bajadas, 0, 1e9);
    p.jefes = entero(datos.jefes, 0, 1e6);
    p.vencidos = Array.isArray(datos.vencidos) ? [...new Set(datos.vencidos.map((n) => entero(n, 0, 9999)))].filter((n) => B.jefes.dePlanta(AJ, n)) : [];
    p.cursos = Array.isArray(datos.cursos) ? leeCursos(AJ, datos.cursos) : desdeNiveles(AJ, datos.niveles);
    leeEquipo(AJ, p, datos.equipo);
    leeMascotas(AJ, p, datos);
    for (const t of Object.keys(AJ.paquetes)) p.paquetes[t] = entero(esObjeto(datos.paquetes) ? datos.paquetes[t] : 0, 0, 999);
    return p;
  };

  // Solo los cursos que existen y en orden válido (cada uno con el anterior de su columna ya comprado).
  function leeCursos(AJ, lista) {
    const quedan = new Set(lista), cursos = [];
    for (const c of AJ.formacion) if (quedan.has(c.id) && B.cursoAbierto(AJ, cursos, c.id)) cursos.push(c.id);
    return cursos;
  }

  // Las partidas de la 0.1.0 tenían tres mejoras con nivel: cada nivel pasa a ser un curso de su columna.
  function desdeNiveles(AJ, niveles) {
    if (!esObjeto(niveles)) return [];
    const col = { cafe: 'bienestar', caja: 'logistica', dano: 'productividad' }, cursos = [];
    for (const k of Object.keys(col)) {
      const n = entero(niveles[k], 0, 99);
      AJ.formacion.filter((c) => c.col === col[k]).slice(0, n).forEach((c) => cursos.push(c.id));
    }
    return cursos;
  }

  function leeEquipo(AJ, p, eq) {
    if (!esObjeto(eq)) return;
    for (const hueco of Object.keys(AJ.equipo)) for (const r of AJ.rarezas) {
      if (esObjeto(eq.tiene) && eq.tiene[hueco + ':' + r] === true) p.equipo.tiene[hueco + ':' + r] = true;
    }
    for (const hueco of Object.keys(AJ.equipo)) {
      const r = esObjeto(eq.puesto) ? eq.puesto[hueco] : null;
      if (p.equipo.tiene[hueco + ':' + r]) p.equipo.puesto[hueco] = r;
    }
  }

  function leeMascotas(AJ, p, d) {
    if (esObjeto(d.mascotas)) for (const id of Object.keys(AJ.mascotas)) {
      const n = entero(d.mascotas[id], 0, AJ.nivelMascota.max);
      if (n > 0) p.mascotas[id] = n;
    }
    p.mascota = p.mascotas[d.mascota] ? d.mascota : null;
  }

  B.progresoAGuardar = (p) => ({ formato: 'for-basement-v2', ...B.copiaProgreso(p) });

  // Al terminar una bajada: se cobran las monedas, los paquetes que traías y los jefes vencidos, y se apuntan el récord y las
// plantas cuyo jefe ya has vencido (la próxima vez ese jefe suelta un paquete normal, no el del jefe).
  B.cobrar = function (p, resultado) {
    const r = resultado || {}, q = B.copiaProgreso(p), paq = r.paquetes || {};
    q.monedas += Math.max(0, Math.floor(r.monedas || 0));
    q.record = Math.max(q.record, r.planta || 0);
    q.bajadas += 1;
    q.jefes += Math.max(0, r.jefes || 0);
    sumaPaquetes(q, paq);
    for (const n of r.jefesNuevos || []) if (!q.vencidos.includes(n)) q.vencidos.push(n);
    return q;
  };
  function sumaPaquetes(q, paq) { for (const t of Object.keys(q.paquetes)) q.paquetes[t] += Math.max(0, paq[t] || 0); }

  // ---------- estadísticas de la bajada: la base de ajustes + los efectos de los cursos y del equipo puesto ----------
  B.efectosDe = function (AJ, p) {
    const suma = {};
    const anade = (ef) => { for (const k of Object.keys(ef)) suma[k] = (suma[k] || 0) + ef[k]; };
    for (const c of AJ.formacion) if (p.cursos.includes(c.id)) anade(c.ef);
    for (const hueco of Object.keys(p.equipo.puesto)) anade(AJ.equipo[hueco][p.equipo.puesto[hueco]].ef);
    return suma;
  };

  B.statsDe = function (AJ, p) {
    const e = B.efectosDe(AJ, p), v = (k) => e[k] || 0, menos = (k, tope) => 1 - Math.min(tope, v(k));
    return Object.freeze({
      cafeMax: AJ.cafe.base + v('cafe'),
      caja: AJ.caja.base + v('caja'),
      dano: Math.round(AJ.arma.dano * (1 + v('dano')) * 10) / 10,
      cadencia: AJ.arma.cadencia * menos('cadencia', 0.6),
      alcance: AJ.arma.alcance + v('alcance'),
      multi: 1 + v('multi'),
      iman: AJ.iman + v('iman'),
      espera: Math.max(1, AJ.ascensor.espera - v('espera')),
      gasto: menos('gasto', 0.6),
      crunch: menos('crunch', 1),
      valor: 1 + v('valor'),
      taza: AJ.cafe.taza + v('taza'),
      vel: 1 + v('vel'),
      freno: Math.min(1, v('freno')),
      mascota: B.mascotaDe(AJ, p),
    });
  };

  // La mascota puesta, con el daño de su nivel (o null).
  B.mascotaDe = function (AJ, p) {
    const id = p.mascota, nivel = p.mascotas[id];
    if (!id || !nivel) return null;
    const m = AJ.mascotas[id];
    return Object.freeze({ id, nivel, dano: Math.round(m.dano * (1 + AJ.nivelMascota.dano * (nivel - 1)) * 10) / 10, cadencia: m.cadencia, alcance: m.alcance, cafeCada: m.cafeCada || 0 });
  };
})(BAS);
