// Fans Of Pets · adaptador · DEV: utilidades para probar el prototipo sin esperar horas. Solo en modo desarrollo (NUCLEO.desarrollo): una barra
// en el juego y, en el panel DEV de core (UTILIDADES_JUEGO), lo mismo. Adelantar el tiempo suma al desfase del reloj del juego y simula lo que pasa.
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
    [tr('CRECER YA'), creceYa], [tr('ASCENDER YA'), asciendeYa], [tr('REINICIAR'), reinicia], [tr('CRIATURA'), otraCriatura]];

  function botonesEn(contenedor) {
    for (const [t, fn] of BOTONES) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = t;
      b.onclick = fn;
      contenedor.append(b);
    }
  }
  function barra() {
    const el = PT.$('#pt-dev');
    el.hidden = !NUCLEO.desarrollo;
    if (!NUCLEO.desarrollo) return;
    el.innerHTML = '<b>DEV</b>';
    botonesEn(el);
  }
  // la sección de Pets en el panel DEV de core
  function panel(c) {
    const fila = document.createElement('div');
    fila.className = 'fila';
    botonesEn(fila);
    c.append(fila);
  }
  return { barra, panel };
})();
const UTILIDADES_JUEGO = NUCLEO.desarrollo ? [{ titulo: 'Fans Of Pets', pinta: c => PT.dev.panel(c) }] : [];
