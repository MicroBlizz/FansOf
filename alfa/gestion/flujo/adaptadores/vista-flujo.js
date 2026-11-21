// Fans Of · /gestion · FLUJO · adaptador · VISTA (tarea #321): pinta la pestaña «Flujo» con lo que calcula el dominio (FLUJO.resumen y FLUJO.juegos), como
// el boceto aprobado por Pepins: filtro de juego, aviso de semáforo, tres cifras, el gráfico redondo de columnas, las barras de las últimas 4 semanas,
// lo que más lleva esperando revisión y qué espera a quién. HTML y SVG en texto, sin librerías; los estilos, en flujo/flujo.css (todo bajo #pan-flujo).
// Recibe `esc` (de /gestion) y `enlace(id)` (el enlace directo a esa tarea en el Tablero); no sabe nada del servidor ni de los eventos (principal.js).
'use strict';
FLUJO.vista = (() => {
  const COLOR_COLUMNA = { idea: '--fl-idea', refinando: '--fl-rosa', pendiente: '--fl-suave', en_curso: '--fl-curso', en_revision: '--fl-rev', hecho: '--fl-hecho' };
  const COLOR_NIVEL = { verde: '--fl-hecho', naranja: '--fl-rev', rojo: '--fl-rojo' };
  const COLOR_PERSONA = { yoshi: '--fl-curso', arkioner: '--fl-hecho', pepins: '--fl-rosa', alguien: '--fl-idea' };
  const OTROS = ['--fl-rev', '--fl-curso', '--fl-rosa', '--fl-hecho'];
  const SERIES = [['curso', '--fl-curso', 'empezadas'], ['rev', '--fl-rev', 'a revisión'], ['hecho', '--fl-hecho', 'dadas por buenas']];
  const SEMAFORO = '<svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true"><rect x="12" y="2" width="20" height="40" rx="10" fill="var(--fl-fg)"/><circle cx="22" cy="12" r="6" fill="var(--fl-idea-f)"/><circle cx="22" cy="22" r="6" fill="var(--fl-rev)"/><circle cx="22" cy="32" r="6" fill="var(--fl-idea-f)"/></svg>';
  const ICONOS = {
    hecho: '<path d="M6 16 l6 6 l12 -13" fill="none" stroke="var(--fl-hecho)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>',
    rev: '<circle cx="15" cy="15" r="11" fill="none" stroke="var(--fl-rev)" stroke-width="4"/><path d="M15 8 v8 l5 3" fill="none" stroke="var(--fl-rev)" stroke-width="4" stroke-linecap="round"/>',
    curso: '<path d="M8 6 l16 9 l-16 9 z" fill="var(--fl-curso)" stroke="var(--fl-curso)" stroke-width="3" stroke-linejoin="round"/>',
  };
  const decimal = n => String(n).replace('.', ',');

  // El color de la bolita de una persona: las de siempre con el suyo, las demás uno fijo según su nombre
  function colorPersona(quien) {
    const k = String(quien).toLowerCase();
    if (COLOR_PERSONA[k]) return COLOR_PERSONA[k];
    return OTROS[[...k].reduce((s, c) => s + c.charCodeAt(0), 0) % OTROS.length];
  }

  // Arriba: título, «Todos los juegos» y el desplegable con cada juego (de más a menos tareas)
  function cabecera(juegos, clave, cuando, esc) {
    const opciones = juegos.map(j => `<option value="${esc(j.clave)}"${j.clave === clave ? ' selected' : ''}>${esc(j.nombre)} (${j.n})</option>`).join('');
    return `<header class="fl-cab"><div><div class="fl-migas">Gestión › Tablero › Flujo</div><h1>Flujo del trabajo</h1>`
      + `<div class="fl-migas">Cómo avanza el trabajo del equipo. Datos del tablero de ${esc(cuando)}.</div></div>`
      + `<div class="fl-filtro"><button type="button" data-fl-todos aria-pressed="${!clave}">Todos los juegos</button>`
      + `<label class="fl-elige"><span class="fl-oculto">Elige un juego</span><select data-fl-juego${clave ? ' class="activo"' : ''}><option value="">Elige un juego…</option>${opciones}</select></label></div></header>`;
  }

  const cifra = (icono, fondo, n, texto) => `<div class="fl-sem"><div class="fl-bola" style="background: var(${fondo})"><svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">${ICONOS[icono]}</svg></div><div><b>${n}</b><span>${texto}</span></div></div>`;
  const cifras = r => `<section class="fl-semaforos" aria-label="Resumen">${cifra('hecho', '--fl-hecho-f', r.hechas, 'dadas por buenas esta semana')}`
    + `${cifra('rev', '--fl-rev-f', r.rev, 'esperando que las revises')}${cifra('curso', '--fl-curso-f', r.curso, 'en curso ahora')}</section>`;

  // El gráfico redondo: un aro por columna, del largo de su parte, y el total en medio
  function dona(columnas, total, esc) {
    const R = 70, L = 2 * Math.PI * R;
    let ini = 0, aros = '';
    columnas.forEach(c => {
      const largo = L * c.n / total;
      aros += `<circle cx="95" cy="95" r="${R}" fill="none" stroke="var(${COLOR_COLUMNA[c.id]})" stroke-width="30" stroke-dasharray="${Math.max(largo - 3, 1).toFixed(2)} ${L.toFixed(2)}" stroke-dashoffset="${(-ini).toFixed(2)}" transform="rotate(-90 95 95)"/>`;
      ini += largo;
    });
    const svg = `<svg width="190" height="190" viewBox="0 0 190 190" role="img" aria-label="Tareas por columna"><circle cx="95" cy="95" r="${R}" fill="none" stroke="var(--fl-idea-f)" stroke-width="30"/>${aros}`
      + `<text x="95" y="96" text-anchor="middle" font-size="34" font-weight="800" fill="var(--fl-fg)">${total}</text><text x="95" y="118" text-anchor="middle" font-size="13" font-weight="700" fill="var(--fl-suave)">tareas</text></svg>`;
    const leyenda = columnas.map(c => `<div><i style="background: var(${COLOR_COLUMNA[c.id]})"></i><span>${esc(c.nombre)}</span><b>${c.n}</b></div>`).join('');
    return `<section class="fl-tarjeta fl-estrecha"><h2>¿Dónde están las tareas?</h2><div class="fl-dona">${svg}<div class="fl-leyenda">${leyenda}</div></div></section>`;
  }

  // Cada cuánto va una raya de la escala, para que salgan unas pocas
  const pasoDe = max => [100, 50, 10, 5, 2].find(p => max > p * 2) || 1;
  // Las barras de las 4 semanas en un SVG de `ancho` (más estrecho en el móvil, para que la letra no salga diminuta)
  function barras(semanas, ancho) {
    const W = ancho && ancho < 480 ? 340 : 560, estrecho = W < 480;
    const max = Math.max(1, ...semanas.flatMap(s => [s.curso, s.rev, s.hecho])), alto = 170, base = 200, bloque = (W - 40) / semanas.length, barra = estrecho ? 24 : 34, paso = pasoDe(max);
    let s = '';
    for (let v = 0; v <= max; v += paso) {
      const y = base - alto * v / max;
      s += `<line x1="40" x2="${W - 4}" y1="${y}" y2="${y}" stroke="var(--fl-linea)" stroke-width="1"/><text x="34" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--fl-suave)">${v}</text>`;
    }
    semanas.forEach((sem, i) => {
      const cx = 40 + bloque * i + bloque / 2;
      SERIES.forEach(([k, color], j) => {
        const n = sem[k], h = Math.max(n ? 3 : 0, alto * n / max), x = cx - barra * 1.5 - 4 + j * (barra + 4);
        s += `<rect x="${x}" y="${base - h}" width="${barra}" height="${h}" rx="7" fill="var(${color})"/>`;
        if (n) s += `<text x="${x + barra / 2}" y="${base - h - 5}" text-anchor="middle" font-size="12" font-weight="800" fill="var(--fl-fg)">${n}</text>`;
      });
      s += `<text x="${cx}" y="224" text-anchor="middle" font-size="13" font-weight="700" fill="var(--fl-suave)">${estrecho ? '' : 'Semana '}${sem.etiqueta}</text>`;
    });
    return `<svg viewBox="0 0 ${W} 240" width="100%" role="img" aria-label="Tareas que entraron en cada columna por semana">${s}</svg>`;
  }
  const leyendaSemanas = `<div class="fl-leyenda fl-en-fila">${SERIES.map(([, color, nombre]) => `<div><i style="background: var(${color})"></i>${nombre}</div>`).join('')}</div>`;
  const semanas = r => `<section class="fl-tarjeta fl-ancha"><h2>Lo que se movió cada semana</h2><div data-fl-barras>${barras(r.semanas, 0)}</div>${leyendaSemanas}`
    + '<p class="fl-nota">Cuenta los pasos del historial del tablero, que empieza a principios de noviembre de 2026; lo hecho hace más de 14 días ya no llega, así que las semanas viejas salen cortas de «dadas por buenas».</p></section>';

  // Lo que más lleva esperando revisión: una fila por tarea con su barra de color; tocarla abre la tarea en el Tablero
  function atascos(lista, esc, enlace) {
    if (!lista.length) return '<p class="fl-nota">Nada esperando revisión aquí.</p>';
    const max = Math.max(...lista.map(a => a.dias), 0.1);
    return lista.map(a => {
      const color = COLOR_NIVEL[a.nivel];
      return `<a class="fl-atasco" href="${esc(enlace(a.id))}"><span class="fl-id">#${a.id}</span><span class="fl-tit">${esc(a.titulo)}</span>`
        + `<div class="fl-termo"><div style="width: ${Math.max(6, Math.round(100 * a.dias / max))}%; background: var(${color})"></div></div><span class="fl-dias" style="color: var(${color})">${decimal(a.dias)} d</span></a>`;
    }).join('');
  }
  // Qué espera a quién: la bolita con la inicial, la persona, la tarea y lo que falta
  function esperas(lista, esc, enlace) {
    if (!lista.length) return '<p class="fl-nota">Aquí nada está esperando a nadie.</p>';
    return lista.map(e => `<a class="fl-espera" href="${esc(enlace(e.id))}"><div class="fl-cara" style="background: var(${colorPersona(e.quien)})" aria-hidden="true">${esc([...e.quien][0].toUpperCase())}</div>`
      + `<div><strong>${esc(e.quien)}</strong><span>${esc(e.titulo)} (#${e.id})</span>${e.falta ? `<br><small>${esc(e.falta)}</small>` : ''}</div></a>`).join('');
  }
  const listas = (r, esc, enlace) => `<div class="fl-fila"><section class="fl-tarjeta fl-ancha"><h2>Lo que más lleva esperando revisión</h2><div class="fl-lista">${atascos(r.atascos, esc, enlace)}</div>`
    + '<p class="fl-nota">Verde: menos de 1 día · naranja: de 1 a 3 días · rojo: más de 3 días.</p></section>'
    + `<section class="fl-tarjeta fl-estrecha"><h2>Qué espera a quién</h2><div class="fl-lista fl-esperas">${esperas(r.esperas, esc, enlace)}</div></section></div>`;

  // Toda la pestaña. `r` = FLUJO.resumen(...), `juegos` = FLUJO.juegos(...), `clave` el juego elegido ('' = todos)
  function html({ r, juegos, clave, cuando, esc, enlace }) {
    return `<div class="fl-pagina">${cabecera(juegos, clave, cuando, esc)}<div class="fl-aviso" role="status">${SEMAFORO}<span>${esc(r.aviso)}</span></div>${cifras(r)}`
      + `<div class="fl-fila">${dona(r.columnas, r.total, esc)}${semanas(r)}</div>${listas(r, esc, enlace)}</div>`;
  }
  // Pinta en `cont` y rehace las barras con el ancho que tienen de verdad
  function pinta(cont, datos) {
    cont.innerHTML = html(datos);
    ajusta(cont, datos.r);
  }
  function ajusta(cont, r) {
    const sitio = cont.querySelector('[data-fl-barras]');
    if (sitio && sitio.clientWidth) sitio.innerHTML = barras(r.semanas, sitio.clientWidth);
  }
  return { html, pinta, ajusta, barras, colorPersona };
})();
