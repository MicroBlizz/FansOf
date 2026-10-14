// Fans of Karts · EL PASE DE TEMPORADA, en grande (HTML encima del juego): diez niveles que se suben con XP (cada carrera da algo; más
// si quedas arriba, en la contrarreloj y en el PvP). Cada nivel tiene su premio básico y su premio premium (el pase premium se compra
// con gemas); se cobran solos al subir. Abajo, los rangos de la liga online y sus premios al acabar la temporada.
'use strict';

const RANGOS = [
  { min: 0, nombre: 'RECLUTA', color: '#bdb6d6', premio: 10 }, { min: 1050, nombre: 'SUPERVISOR', color: '#5ef27a', premio: 25 },
  { min: 1150, nombre: 'DIRECTOR', color: '#22e3ff', premio: 50 }, { min: 1250, nombre: 'VICEPRESIDENTE', color: '#c35cff', premio: 100 },
  { min: 1400, nombre: 'CEO DE LA LIGA', color: '#ffcb3d', premio: 200 },
];
const rangoDe = puntos => { let r = RANGOS[0]; for (const x of RANGOS) if (puntos >= x.min) r = x; return r; };
const PK = { caja: null, aviso: '' };
const icono24 = t => { const i = img(fotoIcono(t)); i.style.cssText = 'width:24px;height:24px'; return i; };

// un premio del pase: su foto y su texto
function casillaPase(r, fila, i) {
  const ya = i < nivelPase(), cobrado = !!SAVE.cobrado[i + fila], bloq = fila === 'p' && !SAVE.premium;
  const txt = r.oro ? '+' + r.oro + ' ' + tr('ORO') : r.gemas ? '+' + r.gemas + ' ' + tr('GEMAS') : tr(COS[r.cos].nombre);
  const foto = r.cos ? fotoCos(COS[r.cos], JUGABLES[PANT.piloto].id) : fotoMonton(r.oro ? 'oro' : 'gema', r.oro ? Math.min(6, Math.ceil(r.oro / 100)) : Math.min(6, Math.ceil(r.gemas / 10)));
  return el((r.cos ? 'button' : 'div') + '.kt-rec' + (fila === 'p' ? '.p' : '') + (!ya || bloq ? '.apagado' : ''), r.cos ? { 'data-k': 1, on: () => abreFicha(r.cos) } : {},
    img(foto), el('span', {}, txt), cobrado ? marca(SVG_HECHO) : bloq ? marca(SVG_CANDADO) : null);
}
function pintaPaseHtml() {
  if (!PK.caja) { PK.caja = el('section.kt-scr', { id: 'kt-pase' }); document.body.appendChild(PK.caja); }
  const scroll = PK.caja.querySelector('.kt-body'), arriba = scroll ? scroll.scrollTop : 0;
  const nv = nivelPase(), N = KPASE.length, lleno = nv >= N, xp = SAVE.xp - nv * KECO.xpNivel;
  const w = el('div.kt-wrap', { style: 'max-width:640px' },
    el('div.kt-pase-top', {},
      el('div.kt-d.ol', { style: 'font-size:24px' }, tr('PASE DE TEMPORADA')),
      el('div.kt-temp', {}, trf('TEMPORADA %1: %2', KTEMP.n, tr(KTEMP.nombre)) + ' · ' + trf('QUEDAN %1 DÍAS', diasTemporada())),
      el('div.kt-nivel', {}, el('div.kt-num.ol', {}, String(nv)), el('div.kt-barra', {}, el('i', { style: 'width:' + (lleno ? 100 : xp / KECO.xpNivel * 100) + '%' }), el('span.ol', {}, lleno ? tr('PASE COMPLETO') : trf('%1 / %2 XP PARA EL NIVEL %3', xp, KECO.xpNivel, nv + 1)))),
      el('div', { style: 'font-weight:700;font-size:15px' }, tr('Cada carrera da XP: más si quedas arriba, en la contrarreloj y online.'))),
    !SAVE.premium ? el('div.kt-banners', {}, el('button.kt-banner.gema', { 'data-k': 1, on: () => { const r = compraPremium(); PK.aviso = r === true ? '' : tr(r); if (r !== true) play('deny'); pintaPaseHtml(); } },
      img(fotoCos(COS['kart-carrito'], JUGABLES[PANT.piloto].id)),
      el('div', {}, el('h3.ol', {}, tr('PASE PREMIUM')), el('p', {}, tr('Desbloquea la fila morada: más gemas y oro, el carrito de micropagos, la pintura de oro y más.')),
        el('span.kt-btn.gema', {}, tr('COMPRAR'), img(fotoIcono('gema')), String(KECO.premium))))) : null,
    PK.aviso ? el('div.kt-aviso', { style: 'margin:-4px 0 10px;text-align:center' }, PK.aviso) : null,
    el('div.kt-cols', {}, el('div', {}, tr('NIV.')), el('div', { style: 'color:#9ef07a' }, tr('BÁSICO')), el('div', { style: 'color:#f3a6ff' }, tr('PREMIUM'))),
    KPASE.map((n, i) => el('div.kt-fila', {}, el('div.kt-lv.ol' + (i < nv ? '.ya' : ''), {}, String(i + 1)), casillaPase(n.g, 'g', i), casillaPase(n.p, 'p', i))),
    el('div.kt-h3.ol', {}, tr('MISIONES ONLINE DE HOY')), misionesHtml(),
    el('div.kt-h3.ol', {}, tr('LIGA ONLINE: PREMIOS AL ACABAR LA TEMPORADA')),
    el('div.kt-liga', {}, [...RANGOS].reverse().map(r => el('div.kt-rango' + (rangoDe(SAVE.liga) === r ? '.yo' : ''), {},
      el('span.ol', { style: 'color:' + r.color }, tr(r.nombre) + (rangoDe(SAVE.liga) === r ? ' · ' + tr('TÚ') : '')), el('span.ol', { style: 'display:flex;align-items:center;gap:6px' }, icono24('gema'), String(r.premio))))),
    el('p', { style: 'font-weight:700;font-size:14px;color:var(--ink-dim);text-align:center' }, tr('Los rangos salen de tus puntos del PvP. Al acabar la temporada, el servidor te da las gemas de tu rango y los puntos se acercan a 1000.')));
  PK.caja.replaceChildren(cabecera('PASE', () => ve('titulo')), el('main.kt-body', {}, w));
  PK.caja.hidden = false; PK.caja.querySelector('.kt-body').scrollTop = arriba; NAV.raiz = null;
}
function pantallaPase() {
  paseo(14, 34); velo(0.4); calmaLienzo();
  if (!PK.caja || PK.caja.hidden) { PK.aviso = ''; pintaPaseHtml(); }
  if (KPREMIOS.length) return;
  animaFicha();
  if (TK.modal) navega(TK.modal, cierraFicha); else navega(PK.caja, () => ve('titulo'));
}

// después de cada carrera online: los puntos de liga (los da el servidor) y, si has ganado con más jugadores, el obsequio del CEO
function ligaTrasCarrera(r, jugadores) {
  if (!r || r.error) return;
  if (r.puntos != null) {
    const antes = rangoDe(SAVE.liga); SAVE.liga = r.puntos; const ahora = rangoDe(SAVE.liga);
    if (ahora.min > antes.min) avisaPremio('¡ASCENSO!', [{ ico: 'cos', txt: trf('Nuevo rango de liga: %1', tr(ahora.nombre)) }], ahora.color);
    guardaPartida();
  }
  if (r.puesto === 1 && jugadores >= 2 && !r.privada) obsequioCeo();      // en las salas con amigos no (se podría farmear con dos cuentas)
}
