// Fans of Pop · LA EDAD en el juego (tarea #254, Pepins 20-11-2026): la pregunta «¿En qué año naciste?» (una sola vez) y la puerta que
// deja o no vender con euros. Las reglas están en js/edad.js. En SAVE.edad solo se guarda 'menor' o 'adulto', nunca el año.
// · ppAntesDeVender(siVende, alNo): lo que lleva dinero pasa por aquí (ppCompraEuros y ppCompraPack lo hacen solos). Adulto: sigue; sin saber:
//   pregunta; menor (o «Ahora no» en esta sesión): avisa y no sigue.
// · ppVentaCerrada(): para esconder las ofertas con euros, la hucha de pago, el pase de pago y la pestaña Perlas a quien dijo ser menor.
'use strict';
let PP_EDAD_SALTADA = false;   // «Ahora no»: esta sesión se trata como menor, sin guardar nada (la próxima vez se vuelve a preguntar)
const ppEdadDecide = () => PP_EDAD.decide(SAVE.edad, PP_EDAD_SALTADA);
const ppVentaCerrada = () => ppEdadDecide() === 'cierra';
function ppAntesDeVender(siVende, alNo) {
  const d = ppEdadDecide();
  if (d === 'vende') { siVende(); return; }
  if (d === 'pregunta') { ppEdadPide(siVende, alNo); return; }
  ppFlota(tr('Las compras no están disponibles para menores'), 270, 300, '#ff6ec7');
  if (alNo) alNo();
}
function ppEdadRespuesta(texto, siAdulto, alNo) {
  const r = PP_EDAD.clasifica(texto, new Date().getFullYear(), PP_CFG.edad.mayor);
  if (!r.ok) { const e = $pp('#pp-edad-error'); if (e) e.textContent = tr('Escribe un año de cuatro cifras, por ejemplo 2012.'); play('deny'); return; }
  SAVE.edad = r.edad; ppGuarda(); ppCierra();
  if (r.edad === 'adulto') siAdulto(); else if (alNo) alNo();
}
function ppEdadPide(siAdulto, alNo) {
  const t = ppAbre(`<h2>${tr('Antes de seguir')}</h2><p class="pp-sub">${tr('¿En qué año naciste?')}</p>
    <input id="pp-edad-anio" class="pp-edad-campo" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="4" aria-label="${tr('Año de nacimiento')}">
    <p id="pp-edad-error" class="pp-sub pp-edad-error"></p>
    <p class="pp-sub"><small>${tr('Así te enseñamos solo lo que toca. No guardamos tu año, solo si eres menor de edad o no.')}</small></p>`);
  const i = $pp('#pp-edad-anio');
  t.appendChild(ppBoton(tr('ACEPTAR'), 'pp-btn', () => ppEdadRespuesta(i.value, siAdulto, alNo)));
  t.appendChild(ppBoton(tr('Ahora no'), 'pp-btn2 pp-azul', () => { PP_EDAD_SALTADA = true; ppCierra(); if (alNo) alNo(); }));
  i.onkeydown = e => { if (e.key === 'Enter') ppEdadRespuesta(i.value, siAdulto, alNo); };
}
