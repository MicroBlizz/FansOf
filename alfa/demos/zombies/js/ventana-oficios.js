// Fans of Zombies · FABRICAR, COCINAR Y LO DEL SITIO (pantalla): los botones que salen en la ventana de la mochila. Junto al sitio
// abierto: el grifo de la cocina (beber y llenar botella), desmontar el mueble y las recetas «al fuego» si estás en un bidón o en una
// cocina con luz. Debajo de la mochila: lo que se fabrica en cualquier sitio (vendas con tela).
'use strict';
const NOMBRE_RECETA = { venda: 'VENDA (2 TELAS)', filete: 'FILETE (CARNE)', guiso: 'GUISO (JUDÍAS Y AGUA)' };
const boton = (id, txt, ok, extra) => '<button class="vm-accion' + (ok ? '' : ' no') + '" data-accion="' + id + '"' + (extra || '') + '>' + esc(tr(txt)) + '</button>';
function htmlRecetas(e, donde) {
  const AJ = ZOM.AJ, m = e.jugador.mochila;
  return AJ.recetas.filter((r) => (r.donde || null) === donde).map((r) => boton('fabrica', NOMBRE_RECETA[r.id] || r.id, !ZOM.faltaPara(AJ, m, r).length, ' data-receta="' + r.id + '"')).join('');
}
// los botones del sitio abierto (según su tipo)
function htmlAccionesSitio(e) {
  const t = e.tipoAbierto, AJ = ZOM.AJ, m = e.jugador.mochila, partes = [];
  if (t === 'cocina') partes.push(boton('grifo', e.sinAgua ? 'GRIFO (SIN AGUA)' : 'BEBER DEL GRIFO', !e.sinAgua), boton('llenar', 'LLENAR BOTELLA', !e.sinAgua && ZOM.tiene(m, 'botella')));
  if (AJ.desmontar.tipos[t] && !e.desmontados[e.abierto]) partes.push(boton('desmonta', 'DESMONTAR (PALANCA O MARTILLO)', ZOM.tiene(m, 'palanca') || ZOM.tiene(m, 'martillo')));
  const donde = ZOM.dondeCocinas(e, t);
  if (donde) partes.push('<b class="vm-sub">' + esc(tr('COCINAR')) + '</b>' + htmlRecetas(e, donde));
  else if (t === 'cocina') partes.push('<b class="vm-sub">' + esc(tr('Sin luz no se cocina aquí: busca un bidón con fuego.')) + '</b>');
  return partes.length ? '<div class="vm-acciones">' + partes.join('') + '</div>' : '';
}
function htmlFabricar(e) { return '<div class="vm-acciones"><b class="vm-sub">' + esc(tr('FABRICAR')) + '</b>' + htmlRecetas(e, null) + '</div>'; }
function enganchaOficios(v) {
  const e = JUEGO.e, AJ = ZOM.AJ;
  v.querySelectorAll('.vm-accion').forEach((b) => (b.onclick = () => {
    const a = b.dataset.accion;
    if (a === 'grifo') return resultadoMochila(ZOM.bebeGrifo(AJ, e));
    if (a === 'llenar') return resultadoMochila(ZOM.llenaBotella(AJ, e));
    if (a === 'desmonta') { const r = ZOM.empiezaDesmontar(AJ, e, e.abierto, e.tipoAbierto); if (!r.ok) return resultadoMochila(r); return cierraMochila(); }
    resultadoMochila(ZOM.fabrica(AJ, e, b.dataset.receta, ZOM.dondeCocinas(e, e.tipoAbierto)));
  }));
}
