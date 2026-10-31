// Fans Of Pets · adaptador · PANTALLAS: la parte de abajo de cada fase (entrevista de Lola, los 3 huevos, el horario de vida, el huevo que
// incuba y el bebé) y el bocadillo, en HTML. Se pintan al cambiar de fase o tras un cuidado (PT.pantallas.pinta) y cada pocos segundos se
// refresca solo lo que cambia con el reloj (PT.pantallas.refresca). Lo que hace cada botón está en botones.js; los dibujos, en pintar.js.
'use strict';
// lo que la pantalla recuerda y no es de la partida: la pregunta por la que va la entrevista, el huevo marcado, la animación en curso…
PT.ui = { paso: 'hola', respuestas: [], elegido: -1, anim: '', at: -9, wob: 0, bufanda: false, bocadillo: '', volverA: '', triste: false };
PT.$ = s => document.querySelector(s);
PT.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
PT.NOMBRE_NEC = { hambre: 'Hambre', sed: 'Sed', sueno: 'Sueño', limpieza: 'Limpieza', diversion: 'Diversión' };
PT.HUEVO_X = [110, 270, 430];
PT.HUEVO_Y = 430;

PT.pantallas = (() => {
  const $ = PT.$, ui = PT.ui;
  const boton = (id, texto, clase = '') => `<button type="button" class="pt-btn ${clase}" id="${id}">${PT.esc(texto)}</button>`;

  // el bocadillo: quién habla y qué dice
  function dice(texto, quien) {
    ui.bocadillo = texto;
    $('#pt-bocadillo').hidden = !texto;
    $('#pt-quien').textContent = quien || '';
    $('#pt-dice').textContent = texto || '';
  }

  // la caja de abajo, según la fase
  function pinta() {
    const p = PT.casos.partida;
    $('#pt-elige').hidden = p.fase !== 'huevos';
    $('#pt-caja').innerHTML = NUCLEO.desarrollo ? cajaDeFase(p) : cajaEnElHorno();
    PT.botones.engancha();
    refresca();
  }
  function cajaEnElHorno() {
    dice('');
    return `<h2 class="pt-titulo">${tr('Fans Of Pets está en el horno')}</h2><p class="pt-nota">${tr('Es un prototipo y de momento solo se abre en modo desarrollo. Vuelve pronto.')}</p>`;
  }
  function cajaDeFase(p) {
    if (p.fase === 'entrevista') return cajaEntrevista();
    if (p.fase === 'huevos') return cajaHuevos();
    if (p.fase === 'horario' || ui.volverA) return cajaHorario(p);
    if (p.fase === 'huevo') return cajaHuevo();
    return cajaBebe(p);
  }
  function cajaEntrevista() {
    const paso = ui.paso;
    if (paso === 'hola') {
      dice(tr(PT.LOLA.hola), 'Lola');
      return `<h2 class="pt-titulo">${tr('Entrevista de trabajo')}</h2>` + boton('pt-empezar', tr('EMPEZAR'), 'pt-grande');
    }
    if (paso === 'fin') {
      dice(tr(PT.LOLA.fin), 'Lola');
      return boton('pt-yahora', tr('¿Y AHORA QUÉ?'), 'pt-grande');
    }
    const q = PT.ENTREVISTA[paso];
    dice(tr(q.p), 'Lola');
    const nota = q.nota ? `<p class="pt-nota pt-aviso">${tr(q.nota)}</p>` : '';
    const respuestas = q.r.map((r, i) => `<button type="button" class="pt-btn pt-respuesta" data-r="${i}">${PT.esc(tr(r))}</button>`).join('');
    return `<p class="pt-nota">${tr('Pregunta {n} de {total}', { n: paso + 1, total: PT.ENTREVISTA.length })}</p>${nota}<div class="pt-respuestas">${respuestas}</div>`;
  }
  function cajaHuevos() {
    dice(tr(PT.LOLA.huevos), 'Lola');
    return `<h2 class="pt-titulo">${tr('Elige un huevo')}</h2><p class="pt-nota">${tr('Se ve el color de la facción, pero no qué criatura hay dentro.')}</p>` +
      boton('pt-quedo', ui.elegido < 0 ? tr('TOCA UN HUEVO') : tr('ME QUEDO ESTE'), 'pt-grande');
  }
  function opcionesHora(sel) {
    let o = '';
    for (let m = 0; m < 24 * 60; m += PETS.horario.paso) o += `<option value="${m}"${m === sel ? ' selected' : ''}>${PT.hora(m)}</option>`;
    return o;
  }
  function cajaHorario(p) {
    dice(tr(PT.LOLA.horario), 'Lola');
    return `<h2 class="pt-titulo">${tr('Horario de vida')}</h2>` +
      `<div class="pt-fila pt-horas"><label>${tr('Se despierta')}<select id="pt-despierta">${opcionesHora(p.horario.despierta)}</select></label>` +
      `<label>${tr('Se acuesta')}<select id="pt-acuesta">${opcionesHora(p.horario.acuesta)}</select></label></div>` +
      `<p class="pt-nota">${tr('Fuera de esas horas duerme y las necesidades bajan más despacio. Puedes despertarla de noche, pero se levanta con sueño.')}</p>` +
      `<p class="pt-nota pt-aviso" id="pt-horario-error" hidden></p>` + boton('pt-horario-listo', tr('LISTO'), 'pt-grande');
  }
  function cajaHuevo() {
    if (!ui.bocadillo) dice(tr('Está incubando. Dentro alguien prepara su primer día de trabajo.'));
    return `<h2 class="pt-titulo">${tr('Huevo misterioso')}</h2><p class="pt-nota" id="pt-eclosion"></p>` +
      `<div class="pt-fila">${boton('pt-tocar', tr('TOCAR'))}${boton('pt-abrigar', tr('ABRIGAR'))}</div>`;
  }
  function cajaBebe(p) {
    const c = p.criatura;
    const barras = p.bebe.visibles.map(k => `<div class="pt-nec"><span>${tr(PT.NOMBRE_NEC[k])}</span><div class="pt-barra"><i id="pt-b-${k}"></i></div></div>`).join('');
    return `<h2 class="pt-titulo">${PT.esc(PT.criaturas.nombre(c))} <small>${tr('bebé')} · ${PT.esc(PT.criaturas.faccion(c.fac))}</small></h2><p class="pt-nota" id="pt-estado"></p>` +
      `<div class="pt-necs">${barras}</div>` +
      `<div class="pt-fila">${boton('pt-comer', tr('COMER'))}${boton('pt-beber', tr('BEBER'))}${boton('pt-dormir', tr('DORMIR'))}${boton('pt-banar', tr('BAÑAR'))}</div>` +
      `<div class="pt-fila pt-pie"><span id="pt-crece"></span>${boton('pt-horario', tr('HORARIO'), 'pt-chico')}${boton('pt-sonido', '', 'pt-chico')}</div>`;
  }

  // lo que cambia con el reloj: la hora, la cuenta atrás del huevo, las barras, el estado y lo que falta para crecer
  function refresca() {
    const p = PT.casos.partida, ahora = PT.casos.ahora(), dia = PT.casos.esDia(ahora);
    $('#pt-reloj').textContent = PT.hora(PT.casos.minutoDelDia(ahora)) + ' · ' + (dia ? tr('de día') : tr('de noche'));
    const ec = $('#pt-eclosion');
    if (ec) ec.textContent = tr('Eclosiona en {t}', { t: PT.duracion((p.eclosionaEn - ahora) / PT_MINUTO) });
    if (p.fase !== 'bebe' || ui.volverA) return;
    refrescaBarras(p.bebe);
    refrescaEstado(p, dia);
  }
  function refrescaBarras(b) {
    for (const k of b.visibles) {
      const el = $('#pt-b-' + k);
      if (!el) continue;
      const v = b.necesidades.de(k);
      el.style.width = Math.round(v) + '%';
      el.className = v < PETS.triste ? 'mal' : v < 55 ? 'medio' : '';
    }
  }
  function textoEstado(p, dia) {
    const b = p.bebe;
    if (b.dormida) return b.motivo === 'siesta' ? tr('Durmiendo la siesta') : tr('Durmiendo: se levanta a las {h}', { h: PT.hora(p.horario.despierta) });
    if (!dia) return tr('Despierta de noche, con sueño');
    return b.triste ? tr('Triste: necesita cuidados') : tr('Despierta y con ganas de trabajar (poco)');
  }
  function textoCrece(b) {
    if (b.listoParaCrecer) return tr('Lista para crecer');
    return b.crece ? tr('Crece en {t}', { t: PT.duracion(b.faltaParaCrecer) }) : tr('No crece: está descuidada');
  }
  function refrescaEstado(p, dia) {
    const b = p.bebe, est = $('#pt-estado'), dor = $('#pt-dormir'), cr = $('#pt-crece'), so = $('#pt-sonido');
    if (est) est.textContent = textoEstado(p, dia);
    if (dor) dor.textContent = b.dormida ? tr('DESPERTAR') : tr('DORMIR');
    for (const id of ['#pt-comer', '#pt-beber', '#pt-banar']) {
      const el = $(id);
      if (el) el.classList.toggle('pt-apagado', b.dormida);
    }
    if (cr) cr.textContent = textoCrece(b);
    if (so) so.textContent = PT.sonido.apagado ? tr('SONIDO: NO') : tr('SONIDO: SÍ');
  }

  // lo que pasa al simular y merece una frase (en el orden que importa: nacer, crecer, dormirse, estar triste, despertar)
  function trasSimular(pasa) {
    const p = PT.casos.partida, c = p.criatura;
    if (pasa.nacio) {
      ui.bocadillo = '';
      PT.sonido.toca('levelup');
      pinta();
      dice(tr(PT.FRASES.nace, { nombre: PT.criaturas.nombre(c) }));
      return;
    }
    const b = p.bebe, triste = !!b && !b.dormida && b.triste;
    if (pasa.crecido) dice(tr(PT.FRASES.crecido, { nombre: PT.criaturas.nombre(c) }));
    else if (pasa.durmio) dice(PT.frase('dormir'));
    else if (triste && !ui.triste) dice(PT.frase('triste'));
    else if (pasa.desperto) dice(PT.frase('despertar'));
    ui.triste = !!b && b.triste;
  }

  return { dice, pinta, refresca, trasSimular };
})();
