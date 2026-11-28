// Fans of Pop · RAID, los objetos en la pantalla (adaptador de pantalla, tarea 448, nodo n8; Pepins 28-11-2026): qué pasa al tocar un botón de la
// barra de objetos de la raid abierta `r` (la crea js/raid/adaptadores/pantalla.js) y al usarlo en el tablero o contra el jefe CEO.
// · Salen del inventario del juego (SAVE.ayudas, js/potenciadores.js): «+3 toques» actúa al tocar su botón; la BOMBA y el MARTILLO se eligen (el
//   botón queda marcado) y los usa el siguiente toque en el tablero; el martillo, además, contra el CEO cuando ha bajado a pelear.
// · Se DESCUENTAN del inventario solo cuando el servidor los cuenta (aviso 'objetos' de la sincronía con el total de la raid, guardado en
//   SAVE.raidCuentas por firma, PP_RAID_SUCESOS.cuenta): una respuesta perdida no regala ninguno y, sin red o con un
//   fallo, no se pierde ninguno. Mientras van de camino no se pueden volver a usar (cuenta lo pendiente).
// · Hay un tope por raid de cada tipo (PP_CFG.raid.objetos.tope, el mismo del servidor).
// Lee de Pop: SAVE, ppTengo, ppGuarda, ppBoing, ppPlop, ppArpegio, ppVibra, play, tr. Depende de PP_RAID_OBJETOS y PP_RAID_SUCESOS.
'use strict';
const PP_RAID_USA = (() => {
  // los botones de la barra, con el dibujo y el nombre que ya tienen en el juego (PP_CFG.ayudas)
  const BOTONES = Object.freeze(['toques3', 'bomba', 'martillo'].map(k => Object.freeze({ k, icono: 'i-' + k, nombre: PP_CFG.ayudas[k].nombre })));
  const MOTIVOS = Object.freeze({ tope_objetos: 'Ya has usado todos los de esta raid.', sin_objeto: 'No te quedan. Consigue más en la tienda.', sin_jefe: 'El jefe CEO aún no ha bajado.' });
  const ELIGE = Object.freeze({ bomba: 'Toca dónde va la bomba', martillo: 'Toca dónde va el martillo' });
  const cifras = () => PP_CFG.raid.objetos;

  // los de k que tiene en el inventario y no van ya de camino al servidor
  const mios = (r, k) => Math.max(0, ppTengo(k) - r.sinc.pendientes()[k]);
  // cuántos puede usar aún: los suyos, sin pasar del tope de la raid
  function quedan(r, k) {
    const s = r.sinc.estado();
    return s ? Math.min(mios(r, k), Math.max(0, cifras().tope - s.yo.objetos[k])) : 0;
  }
  // lo que enseña la barra: cuántos quedan de cada uno y cuál está elegido
  const lista = r => BOTONES.map(b => ({ k: b.k, n: quedan(r, b.k), elegido: r.elegido === b.k }));
  function letrero(r, texto, color = '#fff') {
    const v = r.vista();
    r.fx.flota(texto, 270, v.y + v.h - 150, color, 30);
  }
  function suelta(r) { r.elegido = null; r.hudT = 0; }   // hudT a cero: la barra se repinta en el siguiente fotograma
  function rechazo(r, motivo) {
    ppBoing(0.7);
    if (MOTIVOS[motivo]) letrero(r, tr(MOTIVOS[motivo]));
  }
  // sin ninguno que usar: o no tiene, o ya llegó al tope de esta raid
  const sinNinguno = (r, k) => rechazo(r, mios(r, k) > 0 ? 'tope_objetos' : 'sin_objeto');

  function masToques(r) {
    const res = r.sinc.usar('toques3');
    if (!res.ok) { rechazo(r, res.motivo); return; }
    letrero(r, tr('+{n} toques', { n: res.toques }), '#b8ffb0');
    ppArpegio(1, 4, 0.07, 0.12); ppVibra(20);
  }
  // se toca el botón del objeto k
  function pulsa(r, k) {
    const estaba = r.elegido === k;
    suelta(r);
    if (estaba) { play('select'); return; }   // tocarlo otra vez lo suelta
    if (quedan(r, k) < 1) { sinNinguno(r, k); return; }
    if (k === 'toques3') { masToques(r); return; }
    r.elegido = k;
    play('select');
    letrero(r, tr(ELIGE[k]));
  }
  // un toque en la burbuja (x, y) con un objeto elegido; true si se lo ha quedado el objeto (ya no es un toque normal)
  function enTablero(r, x, y, px, py) {
    const k = r.elegido;
    if (!k) return false;
    if (quedan(r, k) < 1) { suelta(r); sinNinguno(r, k); return true; }   // ya no quedan: se dice, y el toque no se gasta como uno normal
    const alcanza = PP_RAID_OBJETOS.celdas({ k, x, y }, cifras());
    if (!alcanza.some(([a, b]) => r.sinc.viva(a, b))) { ppBoing(0.75); return true; }   // ahí no queda nada: no se gasta y sigue elegido
    const res = r.sinc.usar(k, x, y);
    suelta(r);
    if (!res.ok) { rechazo(r, res.motivo); return true; }
    PP_RAID_SUCESOS.revienta(r, res.reventadas, px, py, res.tocadas);
    r.fx.tiembla(k === 'bomba' ? 0.7 : 0.45);
    ppArpegio(k === 'bomba' ? 0 : 3, 4, 0.05, 0.14); ppVibra(k === 'bomba' ? 40 : 25);
    return true;
  }
  // un toque al CEO con el martillo elegido y el jefe peleando: un martillazo; true si lo ha sido
  function enCeo(r, px, py) {
    if (r.elegido !== 'martillo' || !r.resumen || !r.resumen.jefe.activo || quedan(r, 'martillo') < 1) return false;
    const res = r.sinc.usar('martillo');
    suelta(r);
    if (!res.ok) { rechazo(r, res.motivo); return true; }
    r.golpe = 1;
    r.fx.tiembla(0.75);
    r.fx.flota('-' + res.golpes, px, py - 40, '#ff8f8a', 56);
    ppPlop(0.45); ppVibra(40);
    r.voces.ceo('golpe', true);
    return true;
  }

  // lo ya descontado del inventario en ESTA raid (por su firma: PP_RAID_SUCESOS.cuenta)
  const descontados = r => PP_RAID_SUCESOS.cuenta(r).gastados;
  // el servidor cuenta `total` = { toques3, bomba, martillo } usados en esta raid: sale del inventario lo que aún no se había descontado.
  // Así una respuesta que se pierde no regala objetos (el siguiente estado los cuenta) y nada se descuenta dos veces
  function confirmados(r, total) {
    if (!r.firma) return;
    const ya = descontados(r);
    let cambia = false;
    SAVE.ayudas = SAVE.ayudas || {};
    for (const k of PP_RAID_OBJETOS.TIPOS) {
      const falta = (total[k] || 0) - ya[k];
      if (falta <= 0) continue;
      SAVE.ayudas[k] = Math.max(0, ppTengo(k) - falta);
      ya[k] += falta;
      cambia = true;
    }
    if (!cambia) return;
    ppGuarda();
    r.hudT = 0;
  }
  // la tanda con objetos no ha valido: no se ha gastado ninguno; si el motivo se entiende, se dice
  function error(r, motivo) {
    r.hudT = 0;
    if (r.abierta() && MOTIVOS[motivo]) letrero(r, tr(MOTIVOS[motivo]));
  }
  const MANEJA = Object.freeze({ objetos: confirmados, error });
  const recibe = (r, nombre, datos) => { if (MANEJA[nombre]) MANEJA[nombre](r, datos); };

  return Object.freeze({ BOTONES, lista, quedan, pulsa, enTablero, enCeo, recibe });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_USA;
