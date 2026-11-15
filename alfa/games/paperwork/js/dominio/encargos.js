// Fans Of Paperwork · dominio · ENCARGOS: lo que llega con prisa. El pedido del CEO (un correo puede traer uno: vaciar tantos archivadores
// antes de que acabe el plazo; cumplirlo paga oro y un cofre, fallarlo quita una parte de la próxima Indemnización) y la auditoría de
// IAhorro (cada AJ.auditoria.cada plantas precinta unos archivadores con cuenta atrás: vaciados a tiempo dan más; los que queden se los lleva).
// El pedido va en r.pedido ({ n, hechos, falta } o null); la sanción acumulada, en c.sancion; la auditoría, en la planta (dominio/planta.js).
'use strict';
PW.encargos = (() => {
  const AJ = PW.AJ, P = AJ.pedido;

  // el CEO pide: tantos archivadores como el equipo vacía en el plazo, y un poco más
  function abre(e) {
    const n = Math.max(P.minimo, Math.round((e.r.ritmoVacio || 0) * P.plazo * P.apuro));
    e.r.pedido = { n, hechos: 0, falta: P.plazo };
    return e.r.pedido;
  }
  // un archivador vaciado cuenta para el pedido; al completarlo paga
  function cuenta(e, B, sucesos) {
    const p = e.r.pedido;
    if (!p) return;
    p.hechos++;
    if (p.hechos < p.n) return;
    const oro = PW.extras.premioOro(e, P.premioSegundos) * B.correos;
    e.r.pedido = null;
    e.r.oro += oro;
    PW.extras.guardaCofre(e);
    sucesos.push({ t: 'pedido-ok', oro });
  }
  function avanzaPedido(e, dt, sucesos) {
    const p = e.r.pedido;
    if (!p) return;
    p.falta -= dt;
    if (p.falta > 0) return;
    e.r.pedido = null;
    e.c.sancion = Math.min(P.sancionMax, e.c.sancion + P.sancion);
    sucesos.push({ t: 'pedido-mal', sancion: e.c.sancion });
  }
  function avanzaAuditoria(e, B, dt, azar, sucesos) {
    const p = e.r.planta;
    if (!(p.auditoria > 0)) return;
    p.auditoria -= dt;
    if (p.auditoria > 0) return;
    const n = PW.planta.requisa(p);
    if (n) sucesos.push({ t: 'requisa', n });
    if (PW.planta.limpia(p)) PW.rebuscar.bajaPlanta(e, B, azar, sucesos);
  }
  // el ritmo de archivadores vaciados por segundo, suavizado (con él se mide el pedido)
  function mideRitmo(e, antes, dt) { e.r.ritmoVacio = PW.suaviza(e.r.ritmoVacio, e.c.totales.archivadores - antes, dt); }
  // mientras se atasca la Trituradora nadie rebusca: los plazos se paran
  function avanza(e, B, dt, azar, sucesos) {
    if (PW.trituradora.atascando(e)) return;
    avanzaPedido(e, dt, sucesos);
    avanzaAuditoria(e, B, dt, azar, sucesos);
  }
  return { abre, cuenta, avanza, mideRitmo };
})();
