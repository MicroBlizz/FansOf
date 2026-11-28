// Fans of Pop · RAID, el premio final (adaptador de pantalla, tarea 448, nodo n6, ADR 243): cuándo se cobra el premio de una raid y su ventana,
// con las de Pop (ppAbre, ppPremioCandyHtml) y el jefe CEO del juego. El cobro en sí es de PP_RAID_COBRO (js/raid/aplicacion/cobro.js).
// · alEstado(r, s): lo llama la raid abierta con cada estado (js/raid/adaptadores/sucesos.js). Si ha terminado (jefe vencido o semana pasada)
//   y hay algo tuyo sin cobrar, deja ver un momento la fiesta, cobra y enseña la ventana; sin red, lo vuelve a intentar mientras siga abierta.
// · alCamino(): lo llama el botón del camino cada vez que se pinta; pregunta UNA vez por sesión si quedó sin cobrar la raid de la semana pasada
//   (el servidor la guarda 7 días; resuelta, se apunta en SAVE.raidAnterior y no se pregunta más) y, si jugaste la de esta semana, si ya acabó.
//   Se repasa cada 10 minutos y al cerrar la raid (repasa()), por si la de esta semana acaba con el juego abierto.
// · hay(): ¿queda un premio por cobrar? (el punto rojo del botón del camino). · anterior(luego): si lo hay de la raid pasada, lo cobra, enseña
//   su ventana y al cerrarla llama a `luego` (abrir la raid de esta semana); devuelve false si no había nada que hacer.
// Lee de Pop: SAVE, ppGuarda, PP_SRV, PP_MI, ppPerfilMuestra, ppAbre, ppCierra, ppBoton, ppIcono, ppPremioCandyHtml, ppFlota, ppVibra, play,
// PP_PANT, PP_CFG, $pp, tr.
'use strict';
const PP_RAID_PREMIO = (() => {
  const FIESTA_MS = 1800, REINTENTO_MS = 8000, REINTENTOS = 5, HUECO_MS = 600, HUECOS = 300, OTRA_VEZ_MS = 60000, REPASO_MS = 600000;
  const SITIOS = Object.freeze(['raid', 'mapa', 'titulo']);   // donde puede salir la ventana (nunca en mitad de un nivel)
  const pend = [];        // premios por cobrar que se conocen: { raid, firma, anterior }
  let C = null, proxima = 0, ocupado = false;
  const cobro = () => C || (C = PP_RAID_COBRO.crea({
    red: PP_RAID_PANTALLA.red(), cuenta: PP_RAID_SUCESOS.cuentaDe, cobrada: PP_RAID_SUCESOS.cobrada, guarda: () => ppGuarda(),
    paga: n => { SAVE.monedas += n; },
    alCobrar: () => { if (!local()) PP_SRV.arranca(); },   // las perlas y el marco ya están en el servidor: se pide el saldo
  }));
  const apunta = (raid, firma, anterior) => { if (!pend.some(p => p.firma === firma)) pend.push({ raid, firma, anterior }); };
  const hay = () => pend.some(p => !PP_RAID_SUCESOS.cobrada(p.firma));
  const local = () => PP_RAID_PANTALLA.local();
  // cobra y devuelve SIEMPRE un resultado. Si el servidor dice que falta el monedero de perlas (aún sin abrir), lo abre y prueba otra vez
  async function cobra(raid, firma) {
    try {
      let res = await cobro().cobra(raid, firma);
      if (!res.ok && res.error === 'sin_monedero' && !local() && await PP_SRV.arranca()) res = await cobro().cobra(raid, firma);
      return res;
    } catch (e) {
      console.warn('Pop: el cobro de la raid ha fallado', e);
      return { ok: false, error: 'fallo', fin: false };
    }
  }

  /* ---------- la ventana ---------- */
  function marco() {
    const d = document.createElement('div'); d.className = 'pp-raid-cobro-marco';
    const m = ppPerfilMuestra('marco', PP_MI.dato('marco', 'raid'), 84);
    if (m) d.appendChild(m);
    d.insertAdjacentHTML('beforeend', `<p class="pp-sub"><b>${tr('¡Marco de la raid!')}</b><br><small>${tr('Póntelo en Mi perfil.')}</small></p>`);
    return d;
  }
  function ventana(p, anterior, alCerrar) {
    play('ppVictoria'); ppVibra([20, 30, 20]);
    const vencido = p.extra > 0;   // el extra solo se da si se vació el tablero
    const t = ppAbre(`<h2>${tr(anterior ? 'Premio de la raid pasada' : '¡Premio de la raid!')}</h2>
      <div class="pp-cofre">${ppIcono('sl-ceo', 104, '#ffd64a')}</div>
      <p class="pp-sub">${tr(vencido ? '¡Vaciamos el tablero entre todos y vencimos al CEO!' : 'Se acabó la semana y quedaron burbujas. ¡La próxima lo vaciamos!')}</p>
      <p class="pp-sub"><b>${tr('Has llegado al premio {n} de {t}', { n: p.nivel, t: PP_CFG.raid.escalones.length })}</b></p>
      ${ppPremioCandyHtml({ monedas: p.monedas, perlas: p.perlas }, 40)}
      ${p.extra ? `<p class="pp-sub"><small>${tr('Con {n} monedas de regalo por vaciar el tablero', { n: p.extra })}</small></p>` : ''}`);
    t.classList.add('pp-raid-cobro');
    if (p.marco) t.appendChild(marco());
    t.appendChild(ppBoton(tr('¡GENIAL!'), 'pp-btn', () => { ppCierra(); if (alCerrar) alCerrar(); }));
  }
  // la enseña cuando haya sitio: sin otra ventana delante y en la raid o el camino. El premio ya está dado; si tarda demasiado, se deja
  function ensena(p, anterior, alCerrar, quedan = HUECOS) {
    if ($pp('#pp-modal').hidden && SITIOS.includes(PP_PANT.actual)) { ventana(p, anterior, alCerrar); return; }
    if (quedan > 0) setTimeout(() => ensena(p, anterior, alCerrar, quedan - 1), HUECO_MS);
  }

  /* ---------- dentro de la raid ---------- */
  // si la raid se cierra antes, se deja: el punto rojo del camino lo recuerda y al volver a entrar se cobra
  async function cobraAbierta(r, raid, quedan = REINTENTOS) {
    if (!r.abierta()) return;
    const res = await cobra(raid, r.firma);
    if (res.ok) { if (!res.repetido) ensena(res.premio, false, null); return; }
    if (!res.fin && quedan > 0) setTimeout(() => cobraAbierta(r, raid, quedan - 1), REINTENTO_MS);
  }
  function alEstado(r, s) {
    if (r.premio || !r.firma || !PP_RAID_PREMIOS.porCobrar(s) || PP_RAID_SUCESOS.cobrada(r.firma)) return;
    r.premio = true;
    apunta(s.id, r.firma, false);
    setTimeout(() => cobraAbierta(r, s.id), FIESTA_MS);
  }

  /* ---------- desde el camino ---------- */
  const jugada = lunes => Object.keys(SAVE.raidCuentas || {}).some(f => f.startsWith(lunes + ':') && !PP_RAID_SUCESOS.cobrada(f));
  // la raid pasada ya está resuelta (cobrada o sin nada): no se pregunta más. Con el servidor de mentira (?raid=local) no se apunta: la
  // partida guardada es la de verdad
  const resuelta = lunes => { if (!local() && SAVE.raidAnterior !== lunes) { SAVE.raidAnterior = lunes; ppGuarda(); } };
  // true si todo quedó mirado; false si algo hay que volver a mirarlo pronto (sin red, sin cuenta aún, o el servidor aún la da por abierta)
  async function mira() {
    const ant = PP_RAID_CAMINO.lunes(1), hoy = PP_RAID_CAMINO.lunes(0);
    let bien = true;
    if (ant && SAVE.raidAnterior !== ant) {
      const m = await cobro().mira(ant);
      if (m.que === 'pendiente') apunta(m.raid, m.firma, true);
      else if (m.que === 'nada') resuelta(ant);
      else bien = false;
    }
    if (hoy && jugada(hoy)) {
      const m = await cobro().mira(hoy);
      if (m.que === 'pendiente') apunta(m.raid, m.firma, false);
      else if (m.que === 'fallo') bien = false;
    }
    return bien;
  }
  // se repasa de vez en cuando (la raid de esta semana puede acabar con el juego abierto) y antes si algo falló
  function alCamino() {
    if (Date.now() < proxima) return;
    proxima = Infinity;
    const luego = bien => { proxima = Date.now() + (bien ? REPASO_MS : OTRA_VEZ_MS); };
    mira().then(luego, e => { console.warn('Pop: no se pudo mirar el premio de la raid', e); luego(false); });
  }
  const repasa = () => { if (proxima !== Infinity) proxima = 0; };   // al cerrar la raid: el camino vuelve a mirar ya
  const enCamino = () => $pp('#pp-modal').hidden && (PP_PANT.actual === 'mapa' || PP_PANT.actual === 'titulo');
  function anterior(luego) {
    if (ocupado) return true;
    const p = pend.find(x => x.anterior && !PP_RAID_SUCESOS.cobrada(x.firma));
    if (!p) return false;
    ocupado = true;
    cobra(p.raid, p.firma).then(res => {
      ocupado = false;
      if (res.ok || res.fin) resuelta(p.raid);
      // la raid se abre después solo si el jugador sigue donde tocó el botón: si ya se ha ido a otra cosa, no se le abre por sorpresa
      if (res.ok && !res.repetido) { if (enCamino()) ventana(res.premio, true, luego); else ensena(res.premio, true, null); return; }
      if (!enCamino()) return;
      if (!res.ok && !res.fin) ppFlota(tr(res.error === 'sin_red' ? 'Sin conexión: el premio de la raid pasada te espera.' : 'El premio de la raid pasada no se ha podido cobrar ahora. Te espera.'), 270, 300, '#ff8a2a');
      luego();
    }).catch(e => console.warn('Pop: el premio de la raid pasada no se pudo enseñar', e));
    return true;
  }
  return Object.freeze({ alEstado, alCamino, repasa, hay, anterior, ventana });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_PREMIO;
