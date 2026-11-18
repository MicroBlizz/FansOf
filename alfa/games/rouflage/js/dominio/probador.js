// Fans of Rouflage · DOMINIO: LA CUENTA DE PROBADOR (rol alfa, ADR 146; core/js/sistema/probador.js). Lo que decide Rouflage:
// · por dónde va una compra con euros de la tienda (viaEuros): con cuenta de probador la lleva core (MONEDAS.compraReal, que en la alfa y en
//   localhost no cobra y pide la entrega al servidor), igual que donde hay pago de verdad; si no, lo de siempre;
// · qué hacer con lo que devuelve esa compra (trasCompra): ya entregada, o la compra de prueba de siempre si core cae en ella;
// · qué es un estado de la cuenta que se puede aplicar (esEstado: lo que devuelven rf_estado y el regalo de probador);
// · qué se limpia de la partida de este navegador tras resetear la cuenta (limpia), para que al recargar mande el servidor y ninguna copia de
//   aquí vuelva a subir lo borrado. Sigue lo que borra el servidor (servidor/162, _rouflage_resetear):
//     siempre    las partidas y los premios diarios pendientes de mandar (rfCola, rfDiarioCola)
//     recursos   Gotas, Acciones, lo comprado en la tienda, la cuenta del gachapón, la colección, lo puesto, el DESBLOQUEAR TODO de pruebas y el pase premium
//     progreso   los puntos y cobros del pase, el calendario del diario (no el día del último cobro: es un tope), misiones, semana, logros,
//                talentos, tutoriales y guías vistos, y los mapas abiertos ganando
//   Se quedan las preferencias (canción, mapa elegido, menú de pintar, avisos), Mi escenario y el tope de Gotas del día.
// Reglas puras: sin pantalla, sin SAVE, sin reloj ni almacén (la partida llega de fuera).
'use strict';

RF.Probador = (() => {
  const viaEuros = ({ pago, probador, servidor }) => (pago || probador ? 'pago' : servidor ? 'servidor' : 'local');
  // qué hacer con lo que devuelve MONEDAS.compraReal: una compra de verdad o de probador ya la ha entregado el servidor ('hecha'); si core
  // cae en la compra de prueba local ({ prueba: true }: en desarrollo, con un producto que aún no está en el servidor), se entrega por el
  // camino de prueba de siempre, el del servidor o el de la partida local; cualquier otra cosa, nada
  const trasCompra = (r, { servidor }) => (r && r.real ? 'hecha' : r && r.prueba ? (servidor ? 'servidor' : 'local') : 'nada');
  const esEstado = e => !!e && typeof e === 'object' && Number.isFinite(e.gotas) && Number.isFinite(e.acciones);

  const PENDIENTE = ['rfCola', 'rfDiarioCola'];
  const RECURSOS = ['tienda', 'gacha', 'gachaCasa'];
  const PROGRESO = ['misiones', 'semana', 'logros', 'talentos', 'tuto', 'guia', 'jugado', 'gana', 'mapasGana'];
  // lo que hay en el navegador fuera de la partida y es progreso: partidas jugadas, la ayuda y los avisos ya vistos
  const CLAVES_PROGRESO = ['rouflage-jugadas', 'rouflage-ayuda', 'rouflage-perfil-visto', 'rouflage-guarda-visto', 'rouflage-aviso-cuenta'];
  const toca = que => ({ recursos: que === 'recursos' || que === 'todo', progreso: que === 'progreso' || que === 'todo' });

  function limpiaRecursos(p) {
    p.gotas = 0; p.acciones = 0;
    for (const k of RECURSOS) delete p[k];
    if (p.armario && typeof p.armario === 'object') Object.assign(p.armario, { tengo: [], unidades: {}, puesto: {}, todo: false });
    if (p.pase && typeof p.pase === 'object') { p.pase.premium = false; delete p.pase.repes; }
  }
  function limpiaProgreso(p) {
    for (const k of PROGRESO) delete p[k];
    const pase = p.pase && typeof p.pase === 'object' ? p.pase : null;
    if (pase) { p.pase = { xp: 0, premium: !!pase.premium, purp: [] }; if (pase.repes !== undefined) p.pase.repes = pase.repes; }
    const ultimo = p.diario && typeof p.diario === 'object' ? p.diario.ultimo : undefined;
    delete p.diario;
    if (ultimo) p.diario = { dia: 0, ultimo, mes: '', delMes: 0, hito: '' };
  }
  // limpia la partida `p` (se cambia la que llega) según `que`: 'recursos' | 'progreso' | 'todo'. Otro valor no toca nada. Devuelve `p`
  function limpia(p, que) {
    const t = toca(que);
    if (!p || typeof p !== 'object' || (!t.recursos && !t.progreso)) return p;
    for (const k of PENDIENTE) delete p[k];
    if (t.recursos) limpiaRecursos(p);
    if (t.progreso) limpiaProgreso(p);
    return p;
  }
  // las claves del navegador, fuera de la partida, que hay que borrar con ese reseteo
  const claves = que => (toca(que).progreso ? CLAVES_PROGRESO.slice() : []);

  return { viaEuros, trasCompra, esEstado, limpia, claves };
})();
