// Fans of Basement · Formación, equipo, mascotas y paquetes (dominio, sin DOM ni azar propio): comprar cursos del tablero
// Kanban en orden, ponerse una pieza de equipo o una mascota de las que tienes, comprar paquetes de mensajería y abrirlos.
// Abrir un paquete tira el azar que se le pasa con las probabilidades de ajustes.js (las que se enseñan en la tienda):
// primero la rareza y después si es mascota, arma o equipo. Una pieza repetida se cambia por monedas; una mascota o un arma
// repetida sube de nivel. Y el ascenso tras arreglar el servidor.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  // ---------- formación ----------
  const curso = (AJ, id) => AJ.formacion.find((c) => c.id === id);
  // Un curso se puede comprar si el anterior de su columna ya está (el primero de cada columna, siempre).
  B.cursoAbierto = function (AJ, cursos, id) {
    const c = curso(AJ, id);
    if (!c) return false;
    const col = AJ.formacion.filter((q) => q.col === c.col), i = col.indexOf(c);
    return i === 0 || cursos.includes(col[i - 1].id);
  };
  // 'hecho' | 'disponible' | 'bloqueado'
  B.estadoCurso = (AJ, p, id) => (p.cursos.includes(id) ? 'hecho' : B.cursoAbierto(AJ, p.cursos, id) ? 'disponible' : 'bloqueado');

  B.comprarCurso = function (AJ, p, id) {
    const c = curso(AJ, id);
    if (!c) return B.error('cursoDesconocido', { id });
    if (p.cursos.includes(id)) return B.error('yaHecho', { id });
    if (!B.cursoAbierto(AJ, p.cursos, id)) return B.error('bloqueado', { id });
    if (p.monedas < c.coste) return B.error('faltanMonedas', { id, coste: c.coste, faltan: c.coste - p.monedas });
    const q = B.copiaProgreso(p);
    q.monedas -= c.coste; q.cursos.push(id);
    return B.ok(q);
  };

  // ---------- equipo y mascotas ----------
  B.equipar = function (AJ, p, hueco, rareza) {
    if (!AJ.equipo[hueco]) return B.error('huecoDesconocido', { hueco });
    if (!p.equipo.tiene[hueco + ':' + rareza]) return B.error('noLaTienes', { hueco, rareza });
    const q = B.copiaProgreso(p);
    q.equipo.puesto[hueco] = rareza;
    return B.ok(q);
  };

  B.ponerMascota = function (AJ, p, id) {
    if (!p.mascotas[id]) return B.error('noLaTienes', { id });
    const q = B.copiaProgreso(p);
    q.mascota = id;
    return B.ok(q);
  };

  B.ponerArma = function (AJ, p, id) {
    if (!AJ.armas[id]) return B.error('armaDesconocida', { id });
    if (AJ.armas[id].rareza && !p.armas[id]) return B.error('noLaTienes', { id });
    const q = B.copiaProgreso(p);
    q.arma = id;
    return B.ok(q);
  };

  // ---------- el ascenso ----------
  // Tras arreglar el servidor: un cargo más (más daño y botín para siempre, bichos y jefes más duros) y la campaña otra vez (los
  // jefes vuelven a dar su paquete). Se conserva todo lo demás.
  B.ascender = function (AJ, p) {
    if (!p.final) return B.error('sinFinal');
    if (p.rango >= AJ.rangos.length - 1) return B.error('rangoMaximo');
    const q = B.copiaProgreso(p);
    q.rango += 1; q.final = false; q.vencidos = [];
    return B.ok(q);
  };

  // ---------- paquetes ----------
  B.comprarPaquete = function (AJ, p, tipo) {
    const P = AJ.paquetes[tipo];
    if (!P || P.coste == null) return B.error('noSeVende', { tipo });
    if (p.monedas < P.coste) return B.error('faltanMonedas', { tipo, coste: P.coste, faltan: P.coste - p.monedas });
    const q = B.copiaProgreso(p);
    q.monedas -= P.coste; q.paquetes[tipo] += 1;
    return B.ok(q);
  };

  // Elige una entrada de { clave: peso } con r (0..1).
  function sortea(pesos, r) {
    const claves = Object.keys(pesos).filter((k) => pesos[k] > 0), total = claves.reduce((s, k) => s + pesos[k], 0);
    let x = r * total;
    for (const k of claves) { x -= pesos[k]; if (x < 0) return k; }
    return claves[claves.length - 1];
  }
  B.sortea = sortea;

  // Abre un paquete que tengas: devuelve el progreso nuevo y el premio { tipo: 'equipo'|'mascota', rareza, hueco|id, nuevo, monedas, nivel }.
  B.abrirPaquete = function (AJ, p, tipo, rnd) {
    const P = AJ.paquetes[tipo];
    if (!P) return B.error('paqueteDesconocido', { tipo });
    if (!(p.paquetes[tipo] > 0)) return B.error('noTienesPaquetes', { tipo });
    const q = B.copiaProgreso(p);
    q.paquetes[tipo] -= 1;
    const rareza = sortea(P.rarezas, rnd()), x = rnd() * 100;
    const premio = x < P.mascota ? daMascota(AJ, q, rareza) : (x < P.mascota + (P.arma || 0) && daArma(AJ, q, rareza, rnd())) || daEquipo(AJ, q, rareza, rnd());
    return B.ok({ progreso: q, premio: Object.freeze(premio) });
  };

  function daEquipo(AJ, q, rareza, r) {
    const huecos = Object.keys(AJ.equipo), hueco = huecos[Math.min(huecos.length - 1, Math.floor(r * huecos.length))], k = hueco + ':' + rareza;
    if (q.equipo.tiene[k]) { q.monedas += AJ.repetido[rareza]; return { tipo: 'equipo', hueco, rareza, nuevo: false, monedas: AJ.repetido[rareza] }; }
    q.equipo.tiene[k] = true;
    const puesta = q.equipo.puesto[hueco];
    if (!puesta || AJ.rarezas.indexOf(puesta) < AJ.rarezas.indexOf(rareza)) q.equipo.puesto[hueco] = rareza;   // si es mejor, te la pones
    return { tipo: 'equipo', hueco, rareza, nuevo: true, monedas: 0 };
  }

  // Un arma de esa rareza, al azar entre las que hay (o null si no hay ninguna): nueva, te la pones si llevabas la grapadora;
  // repetida, sube de nivel.
  function daArma(AJ, q, rareza, r) {
    const de = Object.keys(AJ.armas).filter((a) => AJ.armas[a].rareza === rareza), id = de[Math.min(de.length - 1, Math.floor(r * de.length))];
    if (!id) return null;
    const nivel = q.armas[id] || 0;
    if (nivel >= AJ.nivelArma.max) { q.monedas += AJ.repetido[rareza]; return { tipo: 'arma', id, rareza, nuevo: false, nivel, monedas: AJ.repetido[rareza] }; }
    q.armas[id] = nivel + 1;
    if (q.arma === 'grapadora' && nivel === 0) q.arma = id;
    return { tipo: 'arma', id, rareza, nuevo: nivel === 0, nivel: nivel + 1, monedas: 0 };
  }

  function daMascota(AJ, q, rareza) {
    const id = Object.keys(AJ.mascotas).find((m) => AJ.mascotas[m].rareza === rareza);
    const nivel = q.mascotas[id] || 0;
    if (nivel >= AJ.nivelMascota.max) { q.monedas += AJ.repetido[rareza]; return { tipo: 'mascota', id, rareza, nuevo: false, nivel, monedas: AJ.repetido[rareza] }; }
    q.mascotas[id] = nivel + 1;
    if (!q.mascota) q.mascota = id;
    return { tipo: 'mascota', id, rareza, nuevo: nivel === 0, nivel: nivel + 1, monedas: 0 };
  }
})(BAS);
