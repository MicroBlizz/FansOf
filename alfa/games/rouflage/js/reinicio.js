// Fans of Rouflage · REINICIO TOTAL (solo rol alfa): en Opciones, un botón que borra todo el progreso y las compras de esta cuenta en Rouflage (armario, gotas, acciones,
// pase, diario, tutoriales…) para poder probar las compras desde cero. Solo lo ven las cuentas con el rol «alfa» (o el modo desarrollo). Sube la partida vacía a la nube
// antes de recargar, para que no vuelva. Lo del servidor (puntos del PvP) no se toca.
'use strict';

const REINICIO = { alfa: null };      // null: sin comprobar · true/false: lo que dijo el servidor
function reinicioMuestra(si) { const b = E('b-reinicio'); if (b) b.hidden = !si; }
// al abrir Opciones: el botón sale si la cuenta tiene el rol alfa (se pregunta una vez por sesión)
function reinicioRevisa() {
  if (NUCLEO.desarrollo) return reinicioMuestra(true);
  if (REINICIO.alfa !== null) return reinicioMuestra(REINICIO.alfa);
  reinicioMuestra(false);
  if (typeof CUENTA === 'undefined' || !CUENTA.activa) return;
  CUENTA.rpc('tiene_rol', { p_rol: 'alfa' }).then(v => { REINICIO.alfa = v === true; reinicioMuestra(REINICIO.alfa); }).catch(() => { /* sin red: no sale */ });
}
function reinicioPregunta() {
  play('select');
  confirmBox(tr('¿BORRAR TODO?'), tr('Se borra TODO tu progreso y tus compras de Rouflage (armario, Gotas, Acciones, pase, diario…), aquí y en tu cuenta. No se puede deshacer. Solo para probar desde cero.'), tr('BORRAR TODO'), reinicioHaz);
}
async function reinicioHaz() {
  try { await RFS.reinicia(); } catch (_) { /* sin permiso o sin red: se sigue */ }
  for (const k of Object.keys(SAVE)) delete SAVE[k];
  guardaPartida();
  try { if (typeof CUENTA !== 'undefined' && CUENTA.activa) await CUENTA.sincronizar(false); } catch (_) { /* se recarga igual */ }
  location.reload();
}
function preparaReinicio() { E('b-reinicio').onclick = reinicioPregunta; }
