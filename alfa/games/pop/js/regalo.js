// Fans of Pop · REGALO DIARIO (tarea #262, Pepins 20-11-2026: «se ve pobre y desfasado»; boceto B: el regalo de hoy grande). El día de la
// semana decide el regalo; el domingo, el más gordo. La ventana enseña la caja y lo que toca hoy, el avance de la semana y una tira con los 7 días.
// Se abre desde el botón lateral (js/ofertas.js) y sola al llegar al camino (ppAlLlegarAlCamino, js/pase.js). Estilo: css/regalo.css.
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
function ppRegaloTira(hoy) {
  const dias = [tr('Lun'), tr('Mar'), tr('Mié'), tr('Jue'), tr('Vie'), tr('Sáb'), tr('Dom')], est = ppRegaloEstados(hoy);
  return `<div class="pp-rg-tira">${PP_REGALOS.map((p, k) => `<div class="pp-rg-dia pp-rg-${est[k]}${k === 6 ? ' pp-rg-gordo' : ''}"><span>${ppRegaloIcono(p, 36)}</span><em>${ppRegaloCifra(p)}</em><b>${dias[k]}</b></div>`).join('')}</div>`;
}
function ppVentanaRegalo() {
  ppTutorial('regalo');
  const hoy = ppDiaSemana(), cogido = SAVE.regaloDia === ppHoy();
  const sub = cogido ? tr('Ya has abierto el de hoy. ¡Vuelve mañana!') : tr('Día {n} de 7: el domingo, el más gordo', { n: hoy + 1 });
  const t = ppAbre(`<h2>${tr('Regalo diario')}</h2><p class="pp-sub">${sub}</p>
    <div class="pp-rg-halo${cogido ? ' pp-rg-quieto' : ''}">${ppIcono('i-regalo', 150, '#9cf0a0')}</div>
    <div class="pp-rg-premio">${ppPremioCandyHtml(PP_REGALOS[hoy], 44)}</div>
    <div class="pp-rg-prog"><i style="width:${Math.round(((hoy + 1) / 7) * 100)}%"></i></div>${ppRegaloTira(hoy)}`, true);
  if (!cogido) t.appendChild(ppBoton(tr('¡ABRIR!'), 'pp-btn', () => ppRegaloAbre(hoy)));
  else t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
}
// abrir el de hoy: se da el premio, se guarda el día y sale lo que ha tocado
function ppRegaloAbre(hoy) {
  ppDaPremio(PP_REGALOS[hoy], { motivo: 'regalo', clave: 'regalo:' + ppHoy() }); SAVE.regaloDia = ppHoy(); ppGuarda(); play('ppVictoria'); ppVibra([20, 30, 20]);
  const t = ppAbre(`<h2>${tr('¡Toma!')}</h2><div class="pp-rg-halo">${ppIcono('i-regalo', 130, '#9cf0a0')}</div><div class="pp-rg-premio">${ppPremioCandyHtml(PP_REGALOS[hoy], 48)}</div>`);
  t.appendChild(ppBoton(tr('¡GENIAL!'), 'pp-btn', ppCierra)); ppPintaLateral();
}
