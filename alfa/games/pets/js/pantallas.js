// Fans Of Pets · PANTALLAS: la parte de abajo de cada fase (entrevista de Lola, los 3 huevos, el horario de vida, el huevo que incuba y el bebé)
// y el bocadillo. Se pintan al cambiar de fase o tras un cuidado (ptPantalla) y cada segundo se refresca solo lo que cambia con el reloj (ptRefresca).
// Lo que hace cada botón está en cuidados.js; los dibujos, en pintar.js.
'use strict';
const PT_UI = { paso: 'hola', respuestas: [], elegido: -1, anim: '', at: -9, wob: 0, bufanda: false, bocadillo: '', volverA: '' };
const $pt = s => document.querySelector(s);
const ptEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const PT_NOMBRE_NEC = { hambre: 'Hambre', sed: 'Sed', sueno: 'Sueño', limpieza: 'Limpieza', diversion: 'Diversión' };
const PT_HUEVO_X = [110, 270, 430], PT_HUEVO_Y = 430;

function ptDice(texto, quien) {   // el bocadillo: quién habla y qué dice
  PT_UI.bocadillo = texto;
  const b = $pt('#pt-bocadillo'); b.hidden = !texto;
  $pt('#pt-quien').textContent = quien || ''; $pt('#pt-dice').textContent = texto || '';
}
function ptBoton(id, texto, clase = '') { return `<button type="button" class="pt-btn ${clase}" id="${id}">${ptEsc(texto)}</button>`; }

// la caja de abajo, según la fase
function ptPantalla() {
  const caja = $pt('#pt-caja'); let h = '';
  $pt('#pt-elige').hidden = SAVE.fase !== 'huevos';
  if (!NUCLEO.desarrollo) {
    ptDice('');
    h = `<h2 class="pt-titulo">${tr('Fans Of Pets está en el horno')}</h2><p class="pt-nota">${tr('Es un prototipo y de momento solo se abre en modo desarrollo. Vuelve pronto.')}</p>`;
  } else if (SAVE.fase === 'entrevista') h = ptCajaEntrevista();
  else if (SAVE.fase === 'huevos') {
    ptDice(tr(PT_LOLA.huevos), 'Lola');
    h = `<h2 class="pt-titulo">${tr('Elige un huevo')}</h2><p class="pt-nota">${tr('Se ve el color de la facción, pero no qué criatura hay dentro.')}</p>` +
      ptBoton('pt-quedo', PT_UI.elegido < 0 ? tr('TOCA UN HUEVO') : tr('ME QUEDO ESTE'), 'pt-grande');
  } else if (SAVE.fase === 'horario' || PT_UI.volverA) h = ptCajaHorario();
  else if (SAVE.fase === 'huevo') {
    h = `<h2 class="pt-titulo">${tr('Huevo misterioso')}</h2><p class="pt-nota" id="pt-eclosion"></p>` +
      `<div class="pt-fila">${ptBoton('pt-tocar', tr('TOCAR'))}${ptBoton('pt-abrigar', tr('ABRIGAR'))}</div>`;
    if (!PT_UI.bocadillo) ptDice(tr('Está incubando. Dentro alguien prepara su primer día de trabajo.'));
  } else if (SAVE.fase === 'bebe') h = ptCajaBebe();
  caja.innerHTML = h;
  ptEngancha(); ptRefresca();
}
function ptCajaEntrevista() {
  const p = PT_UI.paso;
  if (p === 'hola') { ptDice(tr(PT_LOLA.hola), 'Lola'); return `<h2 class="pt-titulo">${tr('Entrevista de trabajo')}</h2>` + ptBoton('pt-empezar', tr('EMPEZAR'), 'pt-grande'); }
  if (p === 'fin') { ptDice(tr(PT_LOLA.fin), 'Lola'); return ptBoton('pt-yahora', tr('¿Y AHORA QUÉ?'), 'pt-grande'); }
  const q = PT_ENTREVISTA[p];
  ptDice(tr(q.p), 'Lola');
  return `<p class="pt-nota">${tr('Pregunta {n} de {total}', { n: p + 1, total: PT_ENTREVISTA.length })}</p>` + (q.nota ? `<p class="pt-nota pt-aviso">${tr(q.nota)}</p>` : '') +
    `<div class="pt-respuestas">${q.r.map((r, i) => `<button type="button" class="pt-btn pt-respuesta" data-r="${i}">${ptEsc(tr(r))}</button>`).join('')}</div>`;
}
function ptOpcionesHora(sel) {
  let o = ''; for (let m = 0; m < 24 * 60; m += PETS.horario.paso) o += `<option value="${m}"${m === sel ? ' selected' : ''}>${ptHora(m)}</option>`;
  return o;
}
function ptCajaHorario() {
  ptDice(tr(PT_LOLA.horario), 'Lola');
  return `<h2 class="pt-titulo">${tr('Horario de vida')}</h2>` +
    `<div class="pt-fila pt-horas"><label>${tr('Se despierta')}<select id="pt-despierta">${ptOpcionesHora(SAVE.horario.despierta)}</select></label>` +
    `<label>${tr('Se acuesta')}<select id="pt-acuesta">${ptOpcionesHora(SAVE.horario.acuesta)}</select></label></div>` +
    `<p class="pt-nota">${tr('Fuera de esas horas duerme y las necesidades bajan más despacio. Puedes despertarla de noche, pero se levanta con sueño.')}</p>` +
    `<p class="pt-nota pt-aviso" id="pt-horario-error" hidden></p>` + ptBoton('pt-horario-listo', tr('LISTO'), 'pt-grande');
}
function ptCajaBebe() {
  const c = ptCriatura(SAVE.criatura);
  const barras = ptVisibles().map(k => `<div class="pt-nec"><span>${tr(PT_NOMBRE_NEC[k])}</span><div class="pt-barra"><i id="pt-b-${k}"></i></div></div>`).join('');
  return `<h2 class="pt-titulo">${ptEsc(ptNombre(c))} <small>${tr('bebé')} · ${ptEsc(ptFaccion(c.fac))}</small></h2><p class="pt-nota" id="pt-estado"></p>` +
    `<div class="pt-necs">${barras}</div>` +
    `<div class="pt-fila">${ptBoton('pt-comer', tr('COMER'))}${ptBoton('pt-beber', tr('BEBER'))}${ptBoton('pt-dormir', tr('DORMIR'))}${ptBoton('pt-banar', tr('BAÑAR'))}</div>` +
    `<div class="pt-fila pt-pie"><span id="pt-crece"></span>${ptBoton('pt-horario', tr('HORARIO'), 'pt-chico')}${ptBoton('pt-sonido', '', 'pt-chico')}</div>`;
}

// lo que cambia con el reloj: la hora, la cuenta atrás del huevo, las barras, el estado y lo que falta para crecer
function ptRefresca() {
  const ahora = ptAhora(), dia = ptEnHorario(ahora);
  $pt('#pt-reloj').textContent = ptHora(ptMinDelDia(ahora)) + ' · ' + (dia ? tr('de día') : tr('de noche'));
  const ec = $pt('#pt-eclosion'); if (ec) ec.textContent = tr('Eclosiona en {t}', { t: ptDura((ptEclosionEn() - ahora) / PT_MIN) });
  if (SAVE.fase !== 'bebe' || PT_UI.volverA) return;
  for (const k of ptVisibles()) { const b = $pt('#pt-b-' + k); if (b) { b.style.width = Math.round(SAVE.nec[k]) + '%'; b.className = SAVE.nec[k] < PETS.triste ? 'mal' : SAVE.nec[k] < 55 ? 'medio' : ''; } }
  const est = $pt('#pt-estado');
  if (est) est.textContent = SAVE.dormida ? (SAVE.motivo === 'siesta' ? tr('Durmiendo la siesta') : tr('Durmiendo: se levanta a las {h}', { h: ptHora(SAVE.horario.despierta) }))
    : !dia ? tr('Despierta de noche, con sueño') : ptTriste() ? tr('Triste: necesita cuidados') : tr('Despierta y con ganas de trabajar (poco)');
  const dor = $pt('#pt-dormir'); if (dor) dor.textContent = SAVE.dormida ? tr('DESPERTAR') : tr('DORMIR');
  for (const id of ['#pt-comer', '#pt-beber', '#pt-banar']) { const b = $pt(id); if (b) b.classList.toggle('pt-apagado', SAVE.dormida); }
  const cr = $pt('#pt-crece');
  if (cr) cr.textContent = SAVE.crecido >= ptBebeMin() ? tr('Lista para crecer') : !ptCrece() ? tr('No crece: está descuidada') : tr('Crece en {t}', { t: ptDura(ptBebeMin() - SAVE.crecido) });
  const so = $pt('#pt-sonido'); if (so) so.textContent = SAVE.muted ? tr('SONIDO: NO') : tr('SONIDO: SÍ');
}
