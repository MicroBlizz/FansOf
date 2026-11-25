// Fans of Pop · REGALO DIARIO (tarea #262, Pepins 20-11-2026: «se ve pobre y desfasado»; boceto B: el regalo de hoy grande). El día de la
// semana decide el regalo; el domingo, el más gordo. La ventana enseña la caja y lo que toca hoy, y el calendario de los 7 días (mezcla de los bocetos A y B).
// Se abre desde el botón lateral (js/ofertas.js) y sola al llegar al camino (ppAlLlegarAlCamino, js/pase.js). Estilo: css/regalo.css.
// DÍAS SEGUIDOS (tarea #383, ADR 221; solo en pruebas: alfa y desarrollo): el regalo no va por día de la semana, sino por tu día del
// camino de 7, con un día de perdón. Las reglas, en js/dias-seguidos.js; aquí solo se guarda (SAVE.diasSeguidos) y se pinta.
'use strict';
const PP_REGALOS = [{ monedas: 30 }, { ayudas: { martillo: 1 } }, { monedas: 50 }, { ayudas: { toques3: 1 } }, { perlas: 2 }, { ayudas: { bomba: 1 } },
  { perlas: 5, ayudas: { martillo: 1, bomba: 1 }, infinitas: 30 }];
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
    <div class="pp-rg-premio">${ppPremioCandyHtml(PP_REGALOS[hoy], 40)}</div>${seguidos}${ppRegaloTira(hoy, !!m)}`, true);
  if (!cogido) t.appendChild(ppBoton(tr('¡ABRIR!'), 'pp-btn', () => ppRegaloAbre(hoy)));
  ppBotonVolver(t, ppCierra);
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
  return { paso: r.paso, clave: r.estado.ultimo, frase: ppRegaloFrase(r) };
}
// para el panel DEV: como si hubieran pasado `n` días desde el último regalo (mueve atrás el día apuntado)
function ppRegaloDevPasan(n) {
  const e = PP_DIAS_SEGUIDOS.estado(SAVE.diasSeguidos);
  if (!e.ultimo) return;
  SAVE.diasSeguidos = { ...e, ultimo: new Date(Date.parse(ppRegaloDia()) - n * 86400000).toISOString().slice(0, 10) };
  SAVE.regaloDia = '';
}
// abrir el de hoy: se da el premio, se guarda el día y sale lo que ha tocado
function ppRegaloAbre(hoy) {
  const a = ppDiasSeguidosActivo() ? ppRegaloApunta() : { paso: hoy, clave: ppHoy(), frase: '' };
  if (!a) { ppVentanaRegalo(); return; }
  hoy = a.paso;
  ppDaPremio(PP_REGALOS[hoy], { motivo: 'regalo', clave: 'regalo:' + a.clave }); SAVE.regaloDia = ppHoy(); ppGuarda(); play('ppVictoria'); ppVibra([20, 30, 20]);
  const frase = a.frase ? `<p class="pp-rg-seguidos"><b>${a.frase}</b></p>` : '';
  const t = ppAbre(`<h2>${tr('¡Toma!')}</h2><div class="pp-rg-halo">${ppIcono('i-regalo', 130, '#9cf0a0')}</div><div class="pp-rg-premio">${ppPremioCandyHtml(PP_REGALOS[hoy], 48)}</div>${frase}`);
  t.appendChild(ppBoton(tr('¡GENIAL!'), 'pp-btn', ppCierra)); ppPintaLateral();
}
