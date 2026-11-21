// Fans Of · /gestion · FLUJO · dominio (tarea #321): de la lista de tareas del tablero (gestion_tareas) y una fecha `ahora`, todo lo que pinta la pestaña «Flujo»:
// juegos con tareas, cuántas hay en cada columna, las dadas por buenas esta semana, lo que entró en cada columna las últimas 4 semanas, lo que más lleva
// esperando revisión y qué espera a quién. Funciones PURAS: sin pantalla, sin red y sin reloj (la fecha entra como parámetro). Es el único global del Flujo (la vista cuelga de él).
// Las semanas van de lunes a domingo en la hora del navegador. Guía: docs/gestion/LEEME.md (Flujo).
'use strict';
const FLUJO = (() => {
  const DIA = 86400000;
  const SIN_JUEGO = '_sin';   // la clave de las tareas sin juego en el desplegable
  const COLUMNAS = Object.freeze(['idea', 'refinando', 'pendiente', 'en_curso', 'en_revision', 'hecho']);
  const NOMBRES = Object.freeze({ idea: 'Ideas', refinando: 'Refinando', pendiente: 'Pendiente', en_curso: 'En curso', en_revision: 'En revisión', hecho: 'Hecho (14 días)' });   // gestion_tareas solo trae lo hecho en los últimos 14 días: el nombre lo dice
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const MOVIMIENTOS = Object.freeze(['en_curso', 'en_revision', 'hecho']);   // los pasos que cuenta el gráfico de semanas, en su orden
  const MAX_ATASCOS = 8;

  const claveDe = t => (t.juego ? String(t.juego) : SIN_JUEGO);
  const lista = x => (Array.isArray(x) ? x : []);
  const ms = cuando => { const n = new Date(cuando).getTime(); return Number.isFinite(n) ? n : null; };

  // El lunes a las 00:00 (hora local) de la semana de `fecha`
  function lunesDe(fecha) {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }
  const masDias = (fecha, n) => { const d = new Date(fecha); d.setDate(d.getDate() + n); return d; };
  const etiquetaDia = d => d.getDate() + ' ' + MESES[d.getMonth()];

  // Cuándo pasó la tarea por última vez a `estado` (ms), o null si su historial no lo dice
  function ultimoPaso(t, estado) {
    const pasos = lista(t.historial).filter(h => h && h.a === estado).map(h => ms(h.cuando)).filter(n => n !== null);
    return pasos.length ? Math.max(...pasos) : null;
  }

  // Los juegos que tienen tareas, de más a menos (a igualdad, por nombre); nombreDe(id) da el nombre bonito
  function juegos(tareas, nombreDe) {
    const n = {};
    lista(tareas).forEach(t => { const k = claveDe(t); n[k] = (n[k] || 0) + 1; });
    const nombre = k => (k === SIN_JUEGO ? 'Sin juego' : nombreDe(k));
    return Object.keys(n).map(clave => ({ clave, nombre: nombre(clave), n: n[clave] }))
      .sort((a, b) => b.n - a.n || a.nombre.localeCompare(b.nombre, 'es'));
  }
  // Las tareas de un juego ('' = todos)
  const deJuego = (tareas, clave) => lista(tareas).filter(t => !clave || claveDe(t) === clave);

  // Cuántas tareas hay en cada columna (solo las columnas con alguna, en el orden del tablero)
  function porColumna(tareas) {
    const n = {};
    tareas.forEach(t => { n[t.estado] = (n[t.estado] || 0) + 1; });
    return COLUMNAS.filter(c => n[c]).map(id => ({ id, nombre: NOMBRES[id], n: n[id] }));
  }
  const cuenta = (columnas, id) => (columnas.find(c => c.id === id) || { n: 0 }).n;

  // Las hechas cuyo último paso a «hecho» es desde el lunes de esta semana
  function hechasEstaSemana(tareas, ahora) {
    const desde = lunesDe(ahora).getTime();
    return tareas.filter(t => t.estado === 'hecho' && ultimoPaso(t, 'hecho') >= desde).length;
  }

  // Las últimas 4 semanas (la actual la última): cuántos pasos del historial entraron en en_curso, en_revision y hecho
  function semanas(tareas, ahora) {
    const pasos = tareas.flatMap(t => lista(t.historial)).filter(h => h && MOVIMIENTOS.includes(h.a));
    return [3, 2, 1, 0].map(atras => {
      const ini = masDias(lunesDe(ahora), -7 * atras), fin = masDias(ini, 7).getTime();
      const dentro = pasos.filter(h => { const c = ms(h.cuando); return c !== null && c >= ini.getTime() && c < fin; });
      const de = estado => dentro.filter(h => h.a === estado).length;
      return { etiqueta: etiquetaDia(ini), curso: de('en_curso'), rev: de('en_revision'), hecho: de('hecho') };
    });
  }

  // El color de un atasco según los días: verde (menos de 1), naranja (de 1 a 3) o rojo (más de 3)
  const nivelDe = dias => (dias > 3 ? 'rojo' : dias >= 1 ? 'naranja' : 'verde');
  // Desde cuándo espera revisión: su último paso a en_revision; si el historial no lo trae, cuando se tocó o se creó
  const esperaDesde = t => ultimoPaso(t, 'en_revision') ?? ms(t.actualizado) ?? ms(t.creado);
  const tituloDe = t => String(t.titulo || t.corto || '#' + t.id);

  // Hasta 8 tareas en revisión, de la que más lleva a la que menos, con sus días (un decimal) y su color
  function atascos(tareas, ahora) {
    const ya = new Date(ahora).getTime();
    return tareas.filter(t => t.estado === 'en_revision').map(t => {
      const desde = esperaDesde(t), dias = desde === null ? 0 : Math.max(0, Math.round((ya - desde) / DIA * 10) / 10);
      return { id: t.id, titulo: tituloDe(t), dias, nivel: nivelDe(dias) };
    }).sort((a, b) => b.dias - a.dias || a.id - b.id).slice(0, MAX_ATASCOS);
  }

  // A quién espera una tarea: el texto antes de los dos puntos de `esperando` («Yoshi: …» → Yoshi); si no hay
  // (o lo de antes es largo, o los dos puntos son de un enlace, «https://…»), «Alguien»
  function quienEspera(texto) {
    const m = /^([^:]{1,24}):(?:\s+|$)(.*)$/s.exec(String(texto).trim());
    return m && m[1].trim() ? { quien: m[1].trim(), falta: m[2].trim() } : { quien: 'Alguien', falta: String(texto).trim() };
  }
  // Las tareas no hechas que esperan a alguien, juntas por persona
  function esperas(tareas) {
    return tareas.filter(t => t.estado !== 'hecho' && String(t.esperando || '').trim())
      .map(t => ({ id: t.id, titulo: tituloDe(t), ...quienEspera(t.esperando) }))
      .sort((a, b) => a.quien.localeCompare(b.quien, 'es') || a.id - b.id);
  }

  // La frase del semáforo de arriba, según los números (como el boceto aprobado por Pepins)
  function aviso(donde, { rev, curso, hecho, ideas }) {
    if (rev && rev >= hecho / 2) return `${donde} esperan revisión ${rev} tareas y ${hecho} se hicieron en los últimos 14 días. El atasco está en revisar.`;
    if (!rev && !curso && ideas) return `${donde} todo son ideas (${ideas}): falta refinarlas y empezar alguna.`;
    if (!rev && !curso && !ideas) return `${donde} no hay nada abierto ahora mismo.`;
    return `${donde}: ${rev} esperando revisión, ${curso} en curso y ${hecho} hechas en los últimos 14 días.`;
  }

  // Todo lo que pinta la pestaña para el juego `clave` ('' = todos los juegos), con `nombre` el nombre que se enseña del juego
  function resumen(tareas, ahora, { clave = '', nombre = '' } = {}) {
    const L = deJuego(tareas, clave), columnas = porColumna(L);
    const n = { rev: cuenta(columnas, 'en_revision'), curso: cuenta(columnas, 'en_curso'), hecho: cuenta(columnas, 'hecho'), ideas: cuenta(columnas, 'idea') };
    const donde = clave ? 'En ' + nombre : 'En todos los juegos';
    return { total: L.length, hechas: hechasEstaSemana(L, ahora), rev: n.rev, curso: n.curso, aviso: aviso(donde, n),
      columnas, semanas: semanas(L, ahora), atascos: atascos(L, ahora), esperas: esperas(L) };
  }

  return { SIN_JUEGO, COLUMNAS, lunesDe, ultimoPaso, juegos, deJuego, porColumna, hechasEstaSemana, semanas, nivelDe, atascos, quienEspera, esperas, aviso, resumen };   // sin congelar: la vista (adaptadores/vista-flujo.js) cuelga de aquí FLUJO.vista
})();
