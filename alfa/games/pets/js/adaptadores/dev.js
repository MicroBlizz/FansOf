// Fans Of Pets · adaptador · DEV: utilidades para probar el prototipo sin esperar horas. Solo en modo desarrollo (NUCLEO.desarrollo) y solo en el
// panel DEV de core (UTILIDADES_JUEGO, sección «Fans Of Pets»): nada propio encima del juego (Arkioner, 1-11-2026). Adelantar el tiempo suma al
// desfase del reloj del juego y simula lo que pasa.
'use strict';
PT.dev = (() => {
  const ui = PT.ui;
  function adelanta(horas) {
    PT.pantallas.trasSimular(PT.casos.adelanta(horas));
    PT.pantallas.pinta();
  }
  function eclosionaYa() {
    const p = PT.casos.partida;
    if (p.fase !== 'huevo') return;
    adelanta(Math.max(0, (p.eclosionaEn - PT.casos.ahora()) / (60 * PT_MINUTO)) + 1 / 60);
  }
  function reinicia() {
    PT.casos.reinicia();
    Object.assign(ui, { paso: 'hola', respuestas: [], elegido: -1, anim: '', bocadillo: '', volverA: '', bufanda: false, triste: false, menu: '' });
    PT.pantallas.pinta();
  }
  // crece a la etapa siguiente (o queda lista para ascender) sin esperar: avanza hora a hora cuidándola en cada una (si se adelanta de golpe,
  // las necesidades llegan a cero y deja de crecer). Tope de horas por si nunca llega
  function creceYa() {
    const p = PT.casos.partida, m = p.mascota;
    if (!m || p.fase !== 'mascota') return;
    const etapa = m.etapa;
    for (let h = 0; h < 240 && m.etapa === etapa && !m.listaParaCrecer; h++) {
      for (const t of m.cuidados) if (t !== 'chuche' && t !== 'jugar') PT.casos.cuida(t);
      PT.pantallas.trasSimular(PT.casos.adelanta(1));
    }
    PT.pantallas.pinta();
  }
  // la adulta asciende ya: le regala los días buenos que le falten
  function asciendeYa() {
    const p = PT.casos.partida, m = p.mascota;
    if (!m || p.fase !== 'mascota' || !m.esAdulta) return;
    while (!m.carrera.puedeAscender) m.carrera.cierraDia({ bueno: true, alMinimo: false });   // solo DEV: toca la carrera por dentro
    creceYa();
  }
  // cambia a la siguiente criatura que ya tiene dibujo, para verlas todas sin repetir la entrevista: retoca la partida guardada y la vuelve
  // a cargar (el dominio no tiene por qué saber de este atajo)
  function otraCriatura() {
    const ids = PT.arte.ids(), c = PT.casos.partida.criatura, i = c ? ids.indexOf(c.id) : -1;
    PT.casos.cargaDe({ ...PT.casos.partida.aJson(), criatura: ids[(i + 1) % ids.length] });
    PT.pantallas.pinta();
  }
  const BOTONES = [['+1 h', () => adelanta(1)], ['+6 h', () => adelanta(6)], [tr('+1 día'), () => adelanta(24)], [tr('ECLOSIONAR YA'), eclosionaYa],
    [tr('CRECER YA'), creceYa], [tr('ASCENDER YA'), asciendeYa], [tr('REINICIAR'), reinicia], [tr('CRIATURA'), otraCriatura], [tr('ESCENA DE ANIMACIONES'), abreEscena]];

  // LA ESCENA DE ANIMACIONES: una criatura sola en la oficina con tres botoneras (criatura, etapa y animación) para ver cada dibujo y cada
  // cara viva sin esperar a que toque en la partida (Arkioner, 1-11-2026). No toca la partida: solo PT.ui.escena, y SALIR la quita.
  // Las jefas van por rama. Las animaciones de cuidado se repiten en bucle; las de cara (parpadeo, bostezo, masticar) se fuerzan
  const ETAPAS = [['bebe', 'bebé'], ['nino', 'niña'], ['adolescente', 'adolescente'], ['adulto', 'adulta'],
    ...PETS.ascenso.ramas.map(r => ['jefe:' + r, 'jefa: ' + r])];
  const ANIMACIONES = [['base', 'Quieta'], ['parpadeo', 'Parpadeo'], ['bostezo', 'Bostezo'], ['masca', 'Masticar'], ['cachorrito', 'Cachorrito'], ['sonolienta', 'Con sueño'],
    ['comer', 'COMER'], ['beber', 'BEBER'], ['banar', 'DUCHA'], ['dientes', 'DIENTES'], ['cara', 'CARA'], ['bano', 'BAÑO'], ['dormir', 'DORMIR'], ['triste', 'Triste']];
  const CUIDADOS = ['comer', 'beber', 'banar', 'dientes', 'cara', 'bano'];
  function abreEscena() {
    ui.escena = { id: PT.arte.ids()[0], etapa: 'bebe', anim: 'base' };
    const panel = document.getElementById('dev-panel');
    if (panel) panel.hidden = true;
    PT.pantallas.pinta();
  }
  function cierraEscena() {
    ui.escena = null;
    PT.pantallas.pinta();
  }
  const botonera = (clase, lista, actual) => `<div class="pt-fila pt-escena">${lista.map(([k, t]) =>
    `<button type="button" class="pt-btn pt-mini${k === actual ? ' activo' : ''}" data-${clase}="${k}">${PT.esc(t)}</button>`).join('')}</div>`;
  // el HTML de la caja: tres botoneras y SALIR
  function cajaEscena() {
    const s = ui.escena, criaturas = PT.arte.ids().map(id => [id, PT.criaturas.nombre(PT.criaturas.busca(id)) + (PT.arte.sobreMolde(id) ? '' : ' *')]);
    return `<p class="pt-estado">${PT.esc(tr('Escena de animaciones'))} · ${PT.esc(tr('* dibujo de antes de las plantillas: sin cara viva'))}</p>` +
      botonera('criatura', criaturas, s.id) + botonera('etapa', ETAPAS.map(([k, t]) => [k, tr(t)]), s.etapa) +
      botonera('anim', ANIMACIONES.map(([k, t]) => [k, tr(t)]), s.anim) + `<div class="pt-fila"><button type="button" class="pt-btn" id="pt-escena-salir">${PT.esc(tr('SALIR'))}</button></div>`;
  }
  function enganchaEscena() {
    for (const clave of ['criatura', 'etapa', 'anim']) {
      document.querySelectorAll(`[data-${clave}]`).forEach(b => { b.onclick = () => { ui.escena[clave === 'criatura' ? 'id' : clave] = b.dataset[clave]; PT.pantallas.pinta(); }; });
    }
    document.getElementById('pt-escena-salir').onclick = cierraEscena;
  }
  // el dibujo de la escena: la criatura elegida con su animación; el blob si aún no hay dibujo
  function escena(ctx, t) {
    const s = ui.escena, [etapa, rama] = s.etapa.split(':'), r = PETS.tamano[etapa], dura = PETS.poseSegundos + 0.8;
    const e = { rama, dormida: s.anim === 'dormir', triste: s.anim === 'triste', sonolienta: s.anim === 'sonolienta', anim: '', at: 0,
      cara: ['parpadeo', 'bostezo', 'masca', 'cachorrito'].includes(s.anim) ? s.anim : '' };
    if (CUIDADOS.includes(s.anim)) { e.anim = s.anim; e.at = t - (t % dura); }   // en bucle: cada vez que acaba, otra
    if (!PT.arte.tiene(s.id, etapa) || !PT.arte.criatura(ctx, s.id, etapa, 270, 440, r, t, e)) PT.pintor.bebe(ctx, 270, 440, r, PT.criaturas.color(PT.criaturas.busca(s.id).fac), t, e);
  }

  // la sección de Pets en el panel DEV de core
  function panel(c) {
    const fila = document.createElement('div');
    fila.className = 'fila';
    for (const [t, fn] of BOTONES) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = t;
      b.onclick = fn;
      fila.append(b);
    }
    c.append(fila);
  }
  return { panel, cajaEscena, enganchaEscena, escena };
})();
const UTILIDADES_JUEGO = NUCLEO.desarrollo ? [{ titulo: 'Fans Of Pets', pinta: c => PT.dev.panel(c) }] : [];
