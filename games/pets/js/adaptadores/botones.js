// Fans Of Pets · adaptador · BOTONES: lo que hace cada botón de la pantalla. Cada uno llama a su caso de uso (PT.casos) y cuenta el
// resultado con su animación, su sonido y una frase; las reglas (qué se puede hacer y cuándo) están en el dominio, no aquí.
'use strict';
PT.botones = (() => {
  const $ = PT.$, ui = PT.ui, sonido = n => PT.sonido.toca(n);
  const clic = (id, fn) => {
    const b = $('#' + id);
    if (b) b.onclick = () => { sonido(); fn(); };
  };
  const pinta = () => PT.pantallas.pinta();
  const dice = t => PT.pantallas.dice(t);

  function engancha() {
    clic('pt-empezar', () => { ui.paso = 0; ui.respuestas = []; pinta(); });
    document.querySelectorAll('.pt-respuesta').forEach(b => { b.onclick = () => { sonido(); responde(+b.dataset.r); }; });
    clic('pt-yahora', finEntrevista);
    clic('pt-quedo', meQuedoEste);
    clic('pt-horario-listo', guardaHorario);
    clic('pt-tocar', () => { ui.wob = 1.2; dice(PT.frase('tocar')); });
    clic('pt-abrigar', () => { ui.bufanda = true; dice(PT.frase('abrigar')); });
    for (const t of ['comer', 'beber', 'banar', 'dientes', 'cara', 'bano', 'chuche']) clic('pt-' + t, () => cuida(t));
    clic('pt-dormir', dormir);
    clic('pt-horario', () => { ui.volverA = PT.casos.partida.fase; ui.menu = ''; pinta(); });
    clic('pt-sonido', () => { PT.sonido.alterna(); PT.pantallas.refresca(); });
    enganchaCasa();
  }
  // los menús de la casa, el ascenso, la carta y otro huevo
  function enganchaCasa() {
    for (const m of ['aseo', 'jugar', 'mas', 'album', 'logros', 'despedir']) clic('pt-' + m, () => { ui.menu = m; pinta(); });
    clic('pt-volver', () => { ui.menu = ['album', 'logros', 'despedir'].includes(ui.menu) && PT.casos.partida.fase === 'mascota' ? 'mas' : ''; pinta(); });
    document.querySelectorAll('.pt-cobrar').forEach(b => { b.onclick = () => { sonido(); cobra(b.dataset.id); }; });
    document.querySelectorAll('.pt-minijuego').forEach(b => { b.onclick = () => { sonido(); juega(b.dataset.juego); }; });
    clic('pt-contraoferta', contraoferta);
    clic('pt-ascender', asciende);
    clic('pt-despedir-si', () => { if (PT.casos.despide().ok) { ui.menu = ''; pinta(); } });
    clic('pt-otro-huevo', () => { PT.casos.otroHuevo(); ui.menu = ''; pinta(); });
    document.querySelectorAll('.pt-ritmo').forEach(b => { b.onclick = () => { sonido(); eligeRitmoYHuevos(+b.dataset.r); }; });
  }

  // la entrevista: cada respuesta se apunta solo en memoria; la del ritmo sí cambia la partida
  function responde(i) {
    const q = PT.ENTREVISTA[ui.paso];
    ui.respuestas.push(i);
    if (q.ritmo) PT.casos.eligeRitmo(q.valores[i]);
    ui.paso = ui.paso + 1 < PT.ENTREVISTA.length ? ui.paso + 1 : 'fin';
    pinta();
  }
  // tras otro huevo: el ritmo elegido y los huevos nuevos
  function eligeRitmoYHuevos(i) {
    const q = PT.ENTREVISTA.find(x => x.ritmo);
    if (!PT.casos.eligeRitmo(q.valores[i]).ok) return;
    PT.casos.huevosNuevos(azarDeVerdad());
    ui.elegido = -1;
    pinta();
  }
  function azarDeVerdad() {
    try { return crypto.getRandomValues(new Uint32Array(1))[0]; } catch (e) { return Math.floor(Math.random() * 4294967296); }   // sin crypto: vale Math.random
  }
  function finEntrevista() {
    PT.casos.terminaEntrevista(ui.respuestas, azarDeVerdad());
    ui.respuestas = [];   // las respuestas no se guardan ni se envían
    ui.elegido = -1;
    pinta();
  }
  // tocar un huevo lo marca; «me quedo este» lo elige
  function eligeHuevo(i) {
    ui.elegido = i;
    sonido('pop');
    const b = $('#pt-quedo');
    if (b) b.textContent = tr('ME QUEDO ESTE');
    document.querySelectorAll('#pt-elige button').forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
  }
  function meQuedoEste() {
    if (ui.elegido < 0) return;
    if (PT.casos.eligeHuevo(ui.elegido).ok) pinta();
  }

  function guardaHorario() {
    const r = PT.casos.ponHorario({ despierta: +$('#pt-despierta').value, acuesta: +$('#pt-acuesta').value });
    if (!r.ok) {
      const err = $('#pt-horario-error');
      err.hidden = false;
      err.textContent = tr('Tiene que estar despierta al menos {d} h y dormir al menos {n} h.', { d: PETS.horario.minDespierta / 60, n: PETS.horario.minDuerme / 60 });
      sonido('deny');
      return;
    }
    if (PT.casos.partida.fase === 'huevo' && !ui.volverA) ui.bocadillo = '';   // acaba de empezar a incubar
    ui.volverA = '';
    pinta();
  }

  // los cuidados del bebé
  function anima(tipo) {
    ui.anim = tipo;
    ui.at = performance.now() / 1000;
  }
  const SONIDO_CUIDADO = { comer: 'pop', beber: 'blip', banar: 'heal', dientes: 'heal', cara: 'heal', bano: 'blip', chuche: 'pop' };
  const FRASE_ERROR = { durmiendo: 'durmiendo', empacho: 'empacho', 'muchas-chuches': 'muchasChuches', 'muchas-jugadas': 'muchasJugadas' };
  function cuida(tipo) {
    const r = PT.casos.cuida(tipo);
    if (!r.ok) {
      dice(r.error === 'llena' ? tr(PT.FRASES.llena[tipo] || PT.FRASES.llena.comer) : PT.frase(FRASE_ERROR[r.error] || 'durmiendo'));
      sonido('deny');
      if (r.error === 'muchas-chuches') PT.pantallas.refresca();
      return;
    }
    anima(tipo);
    sonido(SONIDO_CUIDADO[tipo]);
    dice(PT.frase(tipo));
    PT.pantallas.refresca();
  }
  const TRAS_DORMIR = { dormir: ['dormir', 'note', 'dormir'], despertar: ['despertar', '', 'despertar'], noche: ['despertar', 'womp', 'noche'] };   // animación, sonido, frase
  function dormir() {
    const r = PT.casos.dormirODespertar();
    if (!r.ok) return;
    const [animacion, son, frase] = TRAS_DORMIR[r.valor];
    anima(animacion);
    if (son) sonido(son);
    dice(PT.frase(frase));
    PT.pantallas.refresca();
  }

  // un minijuego: se abre en otra pestaña y, de momento, cuenta como jugado al abrirlo (prototipo)
  function juega(id) {
    const r = PT.casos.juega(id);
    if (!r.ok) {
      dice(PT.frase(FRASE_ERROR[r.error] || 'durmiendo'));
      sonido('deny');
      return;
    }
    const m = PT.casos.partida.mascota.minijuegos.find(x => x.id === id);
    if (m) window.open(m.ruta, '_blank', 'noopener');
    anima('jugar');
    sonido('levelup');
    dice(PT.frase('jugar'));
    PT.pantallas.refresca();
  }
  // cobrar un logro: el premio entra en la cartera (por el adaptador de retos y los casos de uso)
  function cobra(id) {
    const d = PT.LOGROS.find(l => l.id === id);
    if (!d || !PT.retos.cobrar(id)) return;
    sonido('levelup');
    const datos = { nombre: d.nombre ? tr(d.nombre) : '', faccion: d.faccion ? PT.criaturas.faccion(d.faccion) : '' };
    const p = typeof d.r === 'number' ? { ganada: d.r } : d.r;
    const premio = PT.MONEDAS.filter(c => p[c] > 0).map(c => `${p[c]} ${MONEDAS.nombre(c)}`).join(' ' + tr('y') + ' ');
    pinta();
    dice(tr(PT.FRASES.logroCobrado, { logro: tr(d.txt, datos), premio }));
  }
  function contraoferta() {
    const r = PT.casos.contraoferta();
    if (!r.ok) {
      dice(tr(PT.FRASES.sinContraofertas));
      sonido('deny');
      return;
    }
    sonido('heal');
    pinta();
    dice(tr(PT.FRASES.contraoferta));
  }
  function asciende() {
    const r = PT.casos.asciende();
    if (!r.ok) return;
    ui.menu = '';
    sonido('levelup');
    pinta();
  }

  return { engancha, eligeHuevo, anima };
})();
