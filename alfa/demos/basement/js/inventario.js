// Fans of Basement · Formación, equipo, mascotas y paquetes (dominio, sin DOM ni azar propio): comprar talentos del árbol de
// la formación (y reiniciarlo), ponerse una pieza de equipo o una mascota de las que tienes, comprar paquetes de mensajería y abrirlos.
// Abrir un paquete tira el azar que se le pasa con las probabilidades de ajustes.js (las que se enseñan en la tienda):
// primero la rareza y después si es mascota, arma o equipo. Una pieza repetida se cambia por monedas; una mascota o un arma
// repetida sube de nivel. Y el ascenso tras arreglar el servidor.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  // ---------- formación ----------
  const curso = (AJ, id) => AJ.formacion.find((c) => c.id === id);
  B.costeCurso = (AJ, c) => (c.coste != null ? c.coste : AJ.costeFila[c.fila - 1]);
  // ¿Lo deja fuera un talento de su mismo grupo (las filas clave: eliges uno de dos)?
  B.cursoExcluido = (AJ, cursos, c) => !!c.grupo && AJ.formacion.some((q) => q.grupo === c.grupo && q.id !== c.id && cursos.includes(q.id));
  // Un talento se puede comprar si tienes alguno de la fila de encima de su rama (los de la fila 1, siempre) y no lo excluye otro.
  B.cursoAbierto = function (AJ, cursos, id) {
    const c = curso(AJ, id);
    if (!c || B.cursoExcluido(AJ, cursos, c)) return false;
    return c.fila === 1 || AJ.formacion.some((q) => q.col === c.col && q.fila === c.fila - 1 && cursos.includes(q.id));
  };
  // 'hecho' | 'disponible' | 'excluido' (elegiste el otro de su grupo) | 'bloqueado'
  B.estadoCurso = function (AJ, p, id) {
    if (p.cursos.includes(id)) return 'hecho';
    const c = curso(AJ, id);
    if (c && B.cursoExcluido(AJ, p.cursos, c)) return 'excluido';
    return B.cursoAbierto(AJ, p.cursos, id) ? 'disponible' : 'bloqueado';
  };

  B.comprarCurso = function (AJ, p, id) {
    const c = curso(AJ, id);
    if (!c) return B.error('cursoDesconocido', { id });
    if (p.cursos.includes(id)) return B.error('yaHecho', { id });
    if (B.cursoExcluido(AJ, p.cursos, c)) return B.error('excluido', { id });
    if (!B.cursoAbierto(AJ, p.cursos, id)) return B.error('bloqueado', { id });
    const coste = B.costeCurso(AJ, c);
    if (p.monedas < coste) return B.error('faltanMonedas', { id, coste, faltan: coste - p.monedas });
    const q = B.copiaProgreso(p);
    q.monedas -= coste; q.cursos.push(id);
    return B.ok(q);
  };

  // Deshacer el árbol: te devuelve todo lo gastado menos lo que cuesta reiniciar.
  B.gastadoEnFormacion = (AJ, p) => p.cursos.reduce((s, id) => s + B.costeCurso(AJ, curso(AJ, id)), 0);
  B.reiniciarFormacion = function (AJ, p) {
    if (!p.cursos.length) return B.error('nadaQueReiniciar');
    const devuelve = B.gastadoEnFormacion(AJ, p);
    if (p.monedas + devuelve < AJ.reinicio) return B.error('faltanMonedas', { coste: AJ.reinicio });
    const q = B.copiaProgreso(p);
    q.monedas += devuelve - AJ.reinicio; q.cursos = [];
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
    const mejor = nivel === 0 && B.armaMejor(AJ, q, id, 1);
    q.armas[id] = nivel + 1;
    if (mejor) q.arma = id;   // nueva y mejor que la que llevas: te la pones
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
