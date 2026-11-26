// Fans of Pop · REGALO DIARIO (tarea #262, Pepins 20-11-2026: «se ve pobre y desfasado»; boceto B: el regalo de hoy grande). El día de la
// semana decide el regalo; el domingo, el más gordo. La ventana enseña la caja y lo que toca hoy, y el calendario de los 7 días (mezcla de los bocetos A y B).
// Se abre desde el botón lateral (js/ofertas.js) y sola al llegar al camino (ppAlLlegarAlCamino, js/pase.js). Estilo: css/regalo.css.
// DÍAS SEGUIDOS (tarea #383, ADR 221; solo en pruebas: alfa y desarrollo): el regalo no va por día de la semana, sino por tu día del
// camino de 7, con un día de perdón, y debajo un contador con metas (3, 7, 14 y 30 días). Las reglas, en js/dias-seguidos.js; aquí solo
// se guarda (SAVE.diasSeguidos), se dan los premios y se pinta.
'use strict';
const PP_REGALOS = [{ monedas: 30 }, { ayudas: { martillo: 1 } }, { monedas: 50 }, { ayudas: { toques3: 1 } }, { perlas: 2 }, { ayudas: { bomba: 1 } },
  { perlas: 5, ayudas: { martillo: 1, bomba: 1 }, infinitas: 30 }];
// los premios de las metas de días seguidos, en el orden de PP_DIAS_SEGUIDOS.METAS (3, 7, 14 y 30 días; «Moderados», Pepins 25-11-2026)
const PP_METAS_SEGUIDOS = [{ monedas: 50 }, { perlas: 3 }, { perlas: 5, ayudas: { martillo: 1, bomba: 1, toques3: 1 } }, { perlas: 10, infinitas: 30 }];
const ppDiaSemana = () => (new Date().getDay() + 6) % 7;
// cómo está cada día respecto a hoy: 'pasado', 'hoy' o 'futuro' (el regalo no se reinicia al faltar: un día pasado solo ya pasó)
function ppRegaloEstados(hoy) { return PP_REGALOS.map((_, k) => (k < hoy ? 'pasado' : k === hoy ? 'hoy' : 'futuro')); }
// el icono pequeño de un día: el cofre el domingo; si no, perlas, monedas o la primera ayuda
function ppRegaloIcono(p, px) {
  if (p.infinitas) return ppIcono('i-cofre', px + 8, '#ff9ccf');
  if (p.perlas) return ppIcono('i-perla', px, '#bfeaff');
  if (p.monedas) return ppIcono('i-moneda', px);
  return ppIcono('i-' + Object.keys(p.ayudas)[0], px, '#ffd1ec');
}
// la cifra de un día bajo su icono: lo que da (el domingo, varias cosas: «+»)
function ppRegaloCifra(p) { return p.infinitas ? tr('Todo') : p.monedas || p.perlas || `x${Object.values(p.ayudas)[0]}`; }
const ppDiasSeguidosActivo = () => typeof NUCLEO !== 'undefined' && !!(NUCLEO.alfa || NUCLEO.desarrollo);
// el día de hoy para los días seguidos: día de España con el reloj de confianza (HORA), no el del aparato, para que cambiar la fecha no dé regalos
const ppRegaloDia = () => new Date(typeof HORA !== 'undefined' ? HORA.ahora() : Date.now()).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
const ppRegaloMira = () => PP_DIAS_SEGUIDOS.mira(SAVE.diasSeguidos, ppRegaloDia());
// ¿está abierto ya el regalo de hoy? (lo preguntan el botón lateral y la llegada al camino)
// (al estrenar los días seguidos, quien ya abrió hoy el regalo de antes no abre otro)
function ppRegaloCogido() {
  const viejo = SAVE.regaloDia === ppHoy();
  return ppDiasSeguidosActivo() ? ppRegaloMira().abierto || (!SAVE.diasSeguidos && viejo) : viejo;
}
// cuántos días seguidos llevas: con el de hoy ya abierto, los que llevas; sin abrir, los que harás al abrirlo
function ppRegaloLlevas(m) {
  if (m.abierto) return m.total === 1 ? tr('Llevas 1 día seguido') : tr('Llevas {n} días seguidos', { n: m.total });
  return m.total === 1 ? tr('Hoy es tu primer día seguido') : tr('Con el de hoy, {n} días seguidos', { n: m.total });
}
// las frases de los días seguidos bajo el premio: cuántos llevas y cómo está tu día de perdón
function ppRegaloSeguidosTexto(m) { return [ppRegaloLlevas(m), m.perdon ? tr('Te queda un día de perdón') : tr('Ya has gastado tu día de perdón')]; }
// el contador bajo el camino: la barra hacia la meta siguiente y su premio. Cuenta los días ya abiertos (sin abrir el de hoy, uno menos)
function ppRegaloMetaTexto(c, abierto) {
  const n = c.hechos + c.faltan;
  if (!abierto && c.faltan === 1) return tr('¡Ábrelo y llegas a los {n} días!', { n });
  return c.faltan === 1 ? tr('A los {n} días · falta 1', { n }) : tr('A los {n} días · faltan {f}', { n, f: c.faltan });
}
function ppRegaloContador(m) {
  const c = PP_DIAS_SEGUIDOS.contador(m.abierto ? m.total : m.total - 1);
  return `<div class="pp-rg-cuenta"><div class="pp-rg-barra"><i style="width:${Math.round(c.progreso * 100)}%"></i></div>
    <div class="pp-rg-meta"><span>${ppRegaloMetaTexto(c, m.abierto)}</span>${ppPremioCandyHtml(PP_METAS_SEGUIDOS[c.meta], 24)}</div></div>`;
}
function ppRegaloTira(hoy, seguidos) {
  const dias = seguidos ? PP_REGALOS.map((_, k) => tr('Día {n}', { n: k + 1 })) : [tr('Lun'), tr('Mar'), tr('Mié'), tr('Jue'), tr('Vie'), tr('Sáb'), tr('Dom')], est = ppRegaloEstados(hoy);
  return `<div class="pp-rg-tira">${PP_REGALOS.map((p, k) => `<div class="pp-rg-dia pp-rg-${est[k]}${k === 6 ? ' pp-rg-gordo' : ''}"><span>${ppRegaloIcono(p, k === 6 ? 46 : 40)}</span><em>${ppRegaloCifra(p)}</em><b>${dias[k]}</b></div>`).join('')}</div>`;
}
function ppVentanaRegalo() {
  ppTutorial(ppDiasSeguidosActivo() ? 'regaloSeguidos' : 'regalo');
  const m = ppDiasSeguidosActivo() ? ppRegaloMira() : null, hoy = m ? m.paso : ppDiaSemana(), cogido = ppRegaloCogido();
  const sub = cogido ? tr('Ya has abierto el de hoy. ¡Vuelve mañana!') : m ? tr('Día {n} de 7: el día 7, el más gordo', { n: hoy + 1 }) : tr('Día {n} de 7: el domingo, el más gordo', { n: hoy + 1 });
  const seguidos = m ? `<p class="pp-rg-seguidos"><b>${ppRegaloSeguidosTexto(m).join('</b><span>')}</span></p>` : '';
  const t = ppAbre(`<h2>${tr('Regalo diario')}</h2><p class="pp-sub">${sub}</p>
    <div class="pp-rg-halo${cogido ? ' pp-rg-quieto' : ''}">${ppIcono('i-regalo', 130, '#9cf0a0')}</div>
    <div class="pp-rg-premio">${ppPremioCandyHtml(PP_REGALOS[hoy], 40)}</div>${seguidos}${ppRegaloTira(hoy, !!m)}${m ? ppRegaloContador(m) : ''}`, true);
  if (!cogido) t.appendChild(ppBoton(tr('¡ABRIR!'), 'pp-btn', () => ppRegaloAbre(hoy)));
  ppBotonVolver(t, ppCierra, { color: 'coral' });
}
// días seguidos: apunta el regalo de hoy en SAVE.diasSeguidos y dice qué día del camino toca y la frase de lo que ha pasado
// (null si ya estaba abierto: no se da dos veces)
function ppRegaloFrase(r) {
  if (r.completo) return tr('¡Camino completo! Recuperas tu día de perdón');
  if (r.caso === 'perdon') return tr('¡Uf! Has gastado tu día de perdón');
  return r.caso === 'reinicia' ? tr('Camino nuevo: vuelves al día 1') : '';
}
function ppRegaloApunta() {
  const r = PP_DIAS_SEGUIDOS.abre(SAVE.diasSeguidos, ppRegaloDia());
  if (!r.ok) return null;
  SAVE.diasSeguidos = { ...r.estado };
  return { paso: r.paso, clave: r.estado.ultimo, frase: ppRegaloFrase(r), meta: r.meta, total: r.total };
}
// para el panel DEV: como si hubieran pasado `n` días desde el último regalo (mueve atrás el día apuntado). Sin ningún día apuntado
// (una partida que aún no ha abierto ninguno de días seguidos), como si el primero se hubiera abierto hace `n` días: antes no hacía
// nada y no avisaba (Pepins, 25-11-2026, tarea 383)
const PP_REGALO_DEV_PRIMERO = Object.freeze({ paso: 0, total: 1, perdon: true });
function ppRegaloDevPasan(n) {
  const e = PP_DIAS_SEGUIDOS.estado(SAVE.diasSeguidos);
  SAVE.diasSeguidos = { ...(e.ultimo ? e : PP_REGALO_DEV_PRIMERO), ultimo: new Date(Date.parse(ppRegaloDia()) - n * 86400000).toISOString().slice(0, 10) };
  SAVE.regaloDia = '';
}
// si hoy se llega a una meta de días seguidos, se da su premio (perlas con su motivo del servidor, 'seguidos', y una clave por día para
// no cobrarlo dos veces) y se enseña debajo del regalo
function ppRegaloMetaCobra(a) {
  if (!(a.meta >= 0)) return '';
  const p = PP_METAS_SEGUIDOS[a.meta];
  ppDaPremio(p, { motivo: 'seguidos', clave: 'seguidos:' + a.clave });
  return `<div class="pp-rg-cuenta pp-rg-logro"><b>${tr('¡Meta de {n} días seguidos!', { n: a.total })}</b>${ppPremioCandyHtml(p, 32)}</div>`;
}
// abrir el de hoy: se da el premio, se guarda el día y sale lo que ha tocado
function ppRegaloAbre(hoy) {
  const a = ppDiasSeguidosActivo() ? ppRegaloApunta() : { paso: hoy, clave: ppHoy(), frase: '', meta: -1 };
  if (!a) { ppVentanaRegalo(); return; }
  hoy = a.paso;
  ppDaPremio(PP_REGALOS[hoy], { motivo: 'regalo', clave: 'regalo:' + a.clave }); SAVE.regaloDia = ppHoy(); ppGuarda(); play('ppVictoria'); ppVibra([20, 30, 20]);
  const frase = a.frase ? `<p class="pp-rg-seguidos"><b>${a.frase}</b></p>` : '';
  const logro = ppRegaloMetaCobra(a);   // la meta de hoy, si la hay, se cobra aquí y se enseña bajo el regalo
  const t = ppAbre(`<h2>${tr('¡Toma!')}</h2><div class="pp-rg-halo">${ppIcono('i-regalo', 130, '#9cf0a0')}</div><div class="pp-rg-premio">${ppPremioCandyHtml(PP_REGALOS[hoy], 48)}</div>${frase}${logro}`);
  t.appendChild(ppBoton(tr('¡GENIAL!'), 'pp-btn', ppCierra)); ppPintaLateral();
}
