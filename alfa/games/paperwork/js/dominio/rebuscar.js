// Fans Of Paperwork · dominio · REBUSCAR: lo que pasa al echar un vistazo a un archivador y al vaciarlo. La dureza del papel resta a cada
// vistazo (menos con guantes y con la herramienta de la zona). Un archivador vacío suelta sus documentos (más en el archivo del jefe o del
// CEO y en los repletos) con el sello que le toque (dominio/sellos.js); al clasificarlos pasan a expedientes y una parte se vende por oro.
// Además da experiencia, cuenta para la especialidad del documento y llena el medidor de cofres. Al limpiar la planta se baja a la siguiente.
// Cada función recibe e (la partida), B (PW.bonos.calcula(e)), el azar (función 0 a 1) y una lista de sucesos donde apunta lo que pasa.
'use strict';
PW.rebuscar = (() => {
  const AJ = PW.AJ, C = PW.curvas;

  function botinDe(e, B, m, azar) {
    const rango = C.rangoEspecialidad(e.c.especialidad[m] || 0);
    const repleto = azar() < B.repleto ? AJ.especiales.repletoMulti : 1;
    const copia = e.c.fotocopia === m && e.c.plan.fotocopiadora ? AJ.fotocopia.multi : 1;
    return Math.max(1, Math.round(PW.planta.multiPlanta(e.r.planta) * repleto * copia * B.botin * AJ.especialidad.premio[rango]));
  }
  // clasificar: los documentos sueltos de m que llegan a una receta pasan a expedientes; una parte (r.venta) se vende al momento
  function clasifica(e, B, m, azar, sucesos) {
    const r = e.r, receta = PW.bonos.recetaDe(B, m);
    const lotes = Math.floor(r.sueltos[m] / receta);
    if (!lotes) return;
    r.sueltos[m] -= lotes * receta;
    const t = azar(), multi = t < B.x3 ? 3 : t < B.x3 + B.x2 ? 2 : 1;
    // lo que toca vender se va sumando con decimales (restoVenta): al 50 %, de cada dos expedientes sueltos se vende uno, no ninguno
    const hechos = lotes * multi, aVender = r.restoVenta[m] + hechos * r.venta, vendidos = Math.min(hechos, Math.floor(aVender + 1e-9));
    r.restoVenta[m] = aVender - vendidos;
    const oro = Math.round(vendidos * C.valorExpediente(m) * PW.bonos.precioDe(B, m));
    r.expedientes[m] += hechos - vendidos;
    r.oro += oro;
    e.c.totales.oro += oro;
    if (multi > 1) sucesos.push({ t: 'clasificado', m, multi });
  }
  function ganaXp(e, B, m, sucesos) {
    const r = e.r, tope = C.topeNivel(e.c.trituradora.nivel);
    r.xp += (m + 1) * B.xp;
    while (r.nivel < tope && r.xp >= C.xpParaSubir(r.nivel)) {
      r.xp -= C.xpParaSubir(r.nivel);
      r.nivel++;
      e.c.nivelMax = Math.max(e.c.nivelMax, r.nivel);
      sucesos.push({ t: 'nivel', n: r.nivel });
    }
    if (r.nivel >= tope) r.xp = Math.min(r.xp, C.xpParaSubir(r.nivel));
  }
  function llenaMedidor(e, B, sucesos) {
    const r = e.r;
    if (!B.abierto.cofres) return;
    r.medidor += B.medidor;
    if (r.medidor < AJ.cofre.medidor) return;
    r.medidor -= AJ.cofre.medidor;
    PW.extras.guardaCofre(e);
    sucesos.push({ t: 'cofre' });
  }
  function subeEspecialidad(e, m, sucesos) {
    const antes = C.rangoEspecialidad(e.c.especialidad[m] || 0);
    e.c.especialidad[m] = (e.c.especialidad[m] || 0) + 1;
    if (C.rangoEspecialidad(e.c.especialidad[m]) > antes) sucesos.push({ t: 'especialidad', m, rango: antes + 1 });
  }
  // precinto: el archivador estaba precintado por la auditoría y se ha vaciado a tiempo
  function vacia(e, B, m, i, azar, sucesos, precinto) {
    const sello = PW.sellos.tira(B, azar), n = botinDe(e, B, m, azar) * PW.sellos.multi(sello) * (precinto ? AJ.auditoria.multi : 1);
    e.r.vaciados++;
    e.c.totales.archivadores++;
    subeEspecialidad(e, m, sucesos);
    sucesos.push({ t: 'vacio', i, m, n, sello });
    if (!PW.sellos.guarda(e, m, n, sello)) { e.r.sueltos[m] += n; clasifica(e, B, m, azar, sucesos); }
    ganaXp(e, B, m, sucesos);
    llenaMedidor(e, B, sucesos);
    PW.encargos.cuenta(e, B, sucesos);
  }
  // pone al equipo en la planta n (nueva: la primera vez que se pisa en este turno, que es cuando puede haber auditoría)
  // sorteo: si la planta puede salir especial (no al ir a ella a mano: las flechas no son una tirada gratis)
  function ponPlanta(e, B, n, azar, sucesos, sorteo = true) {
    const r = e.r, nueva = n > r.plantaMax;
    r.planta = PW.planta.crea(n, azar, B, e.c.especialidad, nueva, sorteo);
    r.repes = 0;
    r.plantaMax = Math.max(r.plantaMax, n);
    e.c.plantaMax = Math.max(e.c.plantaMax, n);
    sucesos.push({ t: 'planta', n, especial: r.planta.especial, zona: C.zonaDe(n), nueva });
  }
  const bajaPlanta = (e, B, azar, sucesos) => ponPlanta(e, B, e.r.planta.n + 1, azar, sucesos);
  // la planta está limpia: se baja si ya se ha limpiado las veces que pide el modo auto (c.bajar; 0 = quedarse); si no, se repite
  function alLimpiar(e, B, azar, sucesos) {
    const r = e.r;
    r.repes = (r.repes || 0) + 1;
    if (e.c.bajar > 0 && r.repes >= e.c.bajar) return bajaPlanta(e, B, azar, sucesos);
    const repes = r.repes;
    ponPlanta(e, B, r.planta.n, azar, sucesos);
    r.repes = repes;
  }
  // el jugador lleva al equipo a otra planta ya pisada en este turno (de una auditoría en marcha no se escapa).
  // Resultado: PW.ok(n), 'atascando', 'auditoria' o 'no-disponible'
  function irA(e, B, n, azar, sucesos) {
    if (PW.trituradora.atascando(e)) return PW.error('atascando');
    if (e.r.planta.auditoria > 0) return PW.error('auditoria');
    if (!(Number.isInteger(n) && n >= 1 && n <= e.r.plantaMax) || n === e.r.planta.n) return PW.error('no-disponible', { n });
    ponPlanta(e, B, n, azar, sucesos, false);
    return PW.ok(n);
  }
  // cuántas veces hay que limpiar una planta para bajar sola (0 = no bajar). Resultado: PW.ok(veces) o 'desconocido'
  function fijaBajar(e, veces) {
    if (!AJ.planta.bajar.includes(veces)) return PW.error('desconocido', { veces });
    e.c.bajar = veces;
    return PW.ok(veces);
  }
  // lo que de verdad lee un vistazo de d de base en el archivador i, tras la dureza de su papel (0 si no hay archivador)
  function lee(e, B, i, d) {
    const a = e.r.planta.archivadores[i];
    return a && a.vida > 0 ? C.trasDureza(d, PW.bonos.dureza(B, a.m, e.r.planta.n)) : 0;
  }
  // rebusca en el archivador i con d de base (sinDureza: el vistazo no nota el papel). Devuelve true si el archivador se vacía
  function rebusca(e, B, i, d, azar, sucesos, sinDureza = false) {
    const res = PW.planta.rebusca(e.r.planta, i, sinDureza ? d : lee(e, B, i, d));
    if (!res.ok || !res.valor.vacio) return false;
    vacia(e, B, res.valor.m, i, azar, sucesos, res.valor.precinto);
    if (PW.planta.limpia(e.r.planta)) alLimpiar(e, B, azar, sucesos);
    return true;
  }
  // un vistazo del líder (o de un toque) al archivador i; y, con suerte de carrito, también al de al lado
  function vistazo(e, B, i, base, azar, sucesos) {
    const planta = e.r.planta, d = lee(e, B, i, base);
    sucesos.push({ t: 'vistazo', i, d, duro: d < base * 0.5 });
    const vecino = (i + 1) % PW.AJ.planta.columnas ? i + 1 : i - 1;   // el de la derecha; al final de la fila, el de la izquierda
    const conCarrito = azar() < B.carrito && vecino < planta.archivadores.length && planta.archivadores[vecino] && planta.archivadores[vecino].vida > 0;
    rebusca(e, B, i, base, azar, sucesos);
    if (conCarrito && planta === e.r.planta) rebusca(e, B, vecino, base, azar, sucesos);
  }

  return { rebusca, vistazo, clasifica, lee, bajaPlanta, ponPlanta, alLimpiar, irA, fijaBajar };
})();
