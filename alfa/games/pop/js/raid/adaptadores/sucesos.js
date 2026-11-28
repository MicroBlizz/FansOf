// Fans of Pop · RAID, lo que pasa en la pantalla (adaptador de pantalla, tarea 448, nodo n4): qué se ve, suena y se dice con cada suceso de la raid
// abierta `r` (la crea js/raid/adaptadores/pantalla.js): un toque tuyo (reventar «con zumo»: aro, chispas, plop que sube con la racha, vibración,
// +N y temblor), las burbujas que revientan OTROS (aro azul y plop bajito), los COFRES (bailan hasta que el servidor confirma que la burbuja fue
// tuya; entonces lluvia de monedas y se pagan, una sola vez: SAVE.raid), los golpes al JEFE CEO, quedarse sin toques, subir de escalón de premio y
// los cambios de humor del CEO. Lee de Pop: SAVE, ppGuarda, ppPlop, ppBoing, ppArpegio, ppVibra, PP_CHISPAS, tr.
'use strict';
const PP_RAID_SUCESOS = (() => {
  const CRUZ = Object.freeze([[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]]);
  const TOPE_AJENAS = 40;
  const centro = (r, x, y) => PP_RAID_CAMARA.aPantalla(r.cam, r.vista(), x + 0.5, y + 0.5);

  /* ---------- los cofres ---------- */
  // la libreta de cofres cobrados de ESTA raid (otra raid, o la de prueba rehecha, empieza de cero)
  function libreta(r) {
    if (!SAVE.raid || SAVE.raid.firma !== r.firma) SAVE.raid = { firma: r.firma, cofres: [] };
    return SAVE.raid.cofres;
  }
  const claveCofre = (x, y) => y * 512 + x;
  const esCofre = (r, x, y) => !!r.cofres && PP_RAID_COFRES.hayCofre(r.cofres, x, y, 512) && !libreta(r).includes(claveCofre(x, y));
  // el servidor confirma que la burbuja del cofre fue tuya: se paga y llueven monedas
  function pagaCofre(r, x, y) {
    if (!esCofre(r, x, y)) return;
    const monedas = PP_RAID_COFRES.monedasEn(r.cofres, x, y, 512);
    libreta(r).push(claveCofre(x, y));
    SAVE.monedas += monedas;
    ppGuarda();
    if (!r.abierta()) return;
    const [px, py] = centro(r, x, y);
    r.fx.lluvia(px, py, r.vista(), 46);
    r.fx.flota(tr('+{n} monedas', { n: monedas }), 270, Math.max(r.vista().y + 90, py - 50), '#ffe36e', 44);
    r.fx.tiembla(0.5);
    ppArpegio(0, 6, 0.07, 0.12); ppVibra(40);
    r.voces.chat('cofre'); r.voces.ceo('cofre', true);
  }
  // se paga por lo que confirma el servidor, esté o no el cofre aún bailando en pantalla (la respuesta puede tardar)
  function propias(r, lista) { for (const [x, y] of lista) { r.fx.cofreQuita(x, y); pagaCofre(r, x, y); } }

  /* ---------- tus toques ---------- */
  const hayViva = (r, x, y) => CRUZ.some(([dx, dy]) => r.sinc.viva(x + dx, y + dy));
  function sinToques(r) {
    r.hud.sacudeDeposito();
    ppBoing(0.6);
    r.voces.ceo('sinToques', false, 0.7); r.voces.chat('sinToques', 0.6);
  }
  // la racha sube un toque: su nota, su letrero y, en los hitos, fiesta
  function subeRacha(r) {
    r.racha = PP_RAID_ZUMO.toque(r.racha, Date.now());
    const n = r.racha.n;
    r.fx.racha(n);
    if (PP_RAID_ZUMO.esHito(n)) { r.fx.tiembla(0.55); r.voces.chat('racha'); r.voces.ceo('racha', true); }
    return n;
  }
  function revienta(r, celdas, px, py) {
    const tablero = r.sinc.tablero();
    for (const [x, y] of celdas) {
      r.fx.pop(x, y);
      r.lejos.celda(tablero, x, y);
      if (esCofre(r, x, y) && !r.fx.hayCofre(x, y)) r.fx.cofreEspera(x, y, 0);
    }
    ppPlop(PP_RAID_ZUMO.nota(subeRacha(r)));
    ppVibra(celdas.length >= 5 ? 14 : 8);
    if (celdas.length >= 5) r.fx.tiembla(0.22);
    r.fx.flota('+' + celdas.length, px, py - 26, '#fff', 26 + celdas.length * 2);
  }
  // un toque en la burbuja (x, y) (el dedo, en (px, py)); no gasta toque si ahí ya no queda nada que reventar
  function toque(r, x, y, px, py) {
    if (!hayViva(r, x, y)) { ppBoing(0.75); return; }
    const res = r.sinc.tocar(x, y);
    if (res.ok) revienta(r, res.reventadas, px, py);
    else if (res.motivo === 'sin_toques') sinToques(r);
  }
  // un toque al CEO: si ha bajado a pelear, un golpe (gasta un toque); si no, se queja
  function tocaCeo(r, px, py) {
    if (!r.resumen || !r.resumen.jefe.activo) { r.golpe = 0.6; ppBoing(1.2); r.voces.ceo('toque', true); return; }
    const res = r.sinc.golpe();
    if (!res.ok) { if (res.motivo === 'sin_toques') sinToques(r); return; }
    r.golpe = 1;
    r.fx.tiembla(0.4);
    r.fx.flota('-1', px, py - 40, '#ff8f8a', 40);
    ppPlop(0.5 + PP_RAID_ZUMO.nota(subeRacha(r)) * 0.25); ppVibra(18);
    r.voces.ceo('golpe', false, 0.5);
  }

  /* ---------- lo que llega del servidor ---------- */
  function ajenas(r, lista) {
    if (!r.abierta()) return;
    lista.slice(0, TOPE_AJENAS).forEach(([x, y]) => r.fx.pop(x, y, true));
    for (let k = 0; k < Math.min(3, lista.length); k++) ppPlop(0.62 + k * 0.08, k * 0.09);
    r.voces.chat('ajenas', 0.6); r.voces.ceo('ajenas', false, 0.35);
  }
  // repinta en la imagen de puntos los trozos cuya versión ha cambiado
  function repinta(r) {
    const tablero = r.sinc.tablero();
    for (const n of r.trozosZona) {
      const v = r.sinc.version(n);
      if (v !== r.pintadas[n]) { r.lejos.trozo(tablero, n); r.pintadas[n] = v; }
    }
  }
  // al llegar el primer estado: los cofres de la semilla y la firma de esta raid
  function prepara(r, s) {
    const cfg = r.id === 'prueba' ? PP_CFG.raid.prueba.cofres : PP_CFG.raid.cofres;
    r.cofres = PP_RAID_COFRES.indexar(PP_RAID_COFRES.generar(s.semilla, cfg), 512);
    r.firma = s.id + ':' + s.inicio;
    r.voces.chat('hola');
  }
  function premioNuevo(r, s) {
    const e = PP_RAID_PREMIOS.escalon(s.yo.burbujas + s.yo.golpes, PP_CFG.raid);
    const nivel = e ? e.nivel : 0;
    if (r.nivel !== null && nivel > r.nivel && r.abierta()) {
      r.fx.flota(tr('¡Ya tienes el premio de {n} monedas!', { n: PP_RAID_HUD.miles(e.monedas) }), 270, r.vista().y + 150, '#ffe36e', 40);
      ppArpegio(2, 5, 0.08, 0.12);
      r.voces.chat('premio');
    }
    r.nivel = nivel;
  }
  const AVISOS = Object.freeze({ vencido: '¡Tablero vacío! El CEO se ha quedado sin burbujas.', gana: 'La raid ha terminado. ¡Hasta la próxima!' });
  function humorNuevo(r, s) {
    const h = PP_RAID_CEO.humor(s);
    if (h === r.humor) return;
    const primero = r.humor === null;
    r.humor = h;
    if (!r.abierta()) return;
    r.voces.ceo(h, true);
    if (h === 'pelea') { r.voces.chat('pelea'); r.fx.tiembla(0.8); }
    if (h === 'vencido') { r.voces.chat('vencido'); if (!primero) r.fx.confeti(PP_CHISPAS.confeti(540, Math.random)); }
    r.hud.aviso(AVISOS[h] ? tr(AVISOS[h]) : '');
  }
  function estado(r, s) {
    if (!s) return;
    if (!r.cofres) prepara(r, s);
    r.resumen = s;
    r.fx.cofresSolo((x, y) => !r.sinc.viva(x, y));   // un cofre cuya burbuja vuelve a estar viva (la tanda falló) deja de esperar
    repinta(r);
    premioNuevo(r, s);
    humorNuevo(r, s);
    if (r.avisoRed) { r.avisoRed = false; r.hud.aviso(AVISOS[r.humor] ? tr(AVISOS[r.humor]) : ''); }
  }
  const ERRORES = Object.freeze({
    sin_cuenta: 'Entra con tu cuenta para jugar la raid.', sin_rol_alfa: 'La raid de prueba es solo para probadores.',
    sin_red: 'Sin conexión. Reintentando…', raid_no_existe: 'Esta raid ya no existe.',
  });
  function error(r, motivo) {
    r.pintadas.fill(-1);   // lo local pudo quedarse por delante: al siguiente estado se repinta todo
    if (!r.abierta() || !ERRORES[motivo]) return;
    r.avisoRed = motivo === 'sin_red';
    r.hud.aviso(tr(ERRORES[motivo]));
  }
  const MANEJA = Object.freeze({ estado, ajenas, propias, error });
  const recibe = (r, nombre, datos) => { if (MANEJA[nombre]) MANEJA[nombre](r, datos); };

  return Object.freeze({ recibe, toque, tocaCeo });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_SUCESOS;
