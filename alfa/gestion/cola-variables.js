// Fans Of · /gestion, pestaña COLA, vista «Configuración»: el apartado «Variables de Actions». Lista las variables del repo que cambian cómo corren los workflows
// (en qué runner salen la alfa y los workflows de Yoshi, la pausa de generar recursos) y pinta un botón por valor posible. Solo pinta: los botones los atiende cola.js (data-var y data-valor)
// y la API de GitHub la llama COLA_CONTROL (cola-control.js, que se carga antes). Una variable nueva se añade a VARIABLES. Guía: docs/guia/herramientas/runner.md.
'use strict';
const COLA_VARIABLES = (() => {
  const VARIABLES = [
    { nombre: 'ALFA_RUNNER', titulo: 'Runner de la alfa', defecto: 'ubuntu-latest',
      texto: 'Dónde corre alfa.yml en cada subida a main. En GitHub gasta cerca de 1 minuto de la cuota por subida; en Yoshi no gasta, pero si Yoshi está apagado la alfa espera (hasta 24 h).',
      opciones: [['ubuntu-latest', 'GitHub (gasta minutos)'], ['yoshi-alfa', 'Yoshi']] },
    // Los runners de Yoshi que también pueden ir a GitHub mientras Yoshi está caído (ADR 172). Sin fijar, Yoshi: no gastan minutos.
    ...[['SMOKE_TEST_RUNNER', 'yoshi-smoke-test', 'Runner del smoke-test', 'smoke-test.yml en cada subida a main (la marca que pide la release). En GitHub gasta unos 20-30 minutos por subida.'],
      ['LANGUAGE_CHECK_RUNNER', 'yoshi-language-check', 'Runner de idioma y tests', 'language-check.yml y tests-herramientas.yml en cada subida a main. En GitHub gastan unos 8 minutos por subida entre los dos.'],
      ['BALANCE_RUNNER', 'yoshi-balance', 'Runner del balance', 'balance.yml, a mano. En GitHub gasta lo que dure la tanda (hasta 2 h).'],
      ['ANDROID_RUNNER', 'yoshi-android', 'Runner de las APK', 'android.yml, miércoles y viernes. En GitHub gasta unos 5-10 minutos por juego que haya que compilar.'],
      ['PLAY_STORE_RUNNER', 'yoshi-play-store', 'Runner de Google Play', 'android-play.yml (AAB, miércoles y viernes) y los manuales de la ficha, los productos y los avisos. En GitHub, unos 5 minutos por AAB.'],
    ].map(([nombre, yoshi, titulo, que]) => ({ nombre, titulo, defecto: yoshi,
      texto: que + ' En Yoshi no gasta, pero si Yoshi está apagado espera (hasta 24 h).', opciones: [[yoshi, 'Yoshi'], ['ubuntu-latest', 'GitHub (gasta minutos)']] })),
    { nombre: COLA_CONTROL.VARIABLE, titulo: 'Pausa de generar recursos', defecto: '0',
      texto: 'La misma pausa de la barra de arriba. En pausa, los runners de generar recursos no cogen más pedidos.',
      opciones: [['0', 'En marcha'], ['1', 'En pausa']] },
  ];
  const escapa = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const valorDe = (v, valores) => (valores && valores[v.nombre] !== undefined ? valores[v.nombre] : v.defecto);

  /** El apartado. `e`: { valores ({NOMBRE: valor} o null si no se han leído), fallo (texto si no se pudieron leer), ocupado, sinMandos }. */
  function html(e) {
    const filas = VARIABLES.map(v => {
      const actual = e.valores ? valorDe(v, e.valores) : null, fija = !e.valores || e.valores[v.nombre] !== undefined;
      const botones = v.opciones.map(([valor, texto]) => `<button type="button" data-var="${v.nombre}" data-valor="${valor}" class="${valor === actual ? 'on' : ''}"`
        + `${e.ocupado || e.sinMandos || e.valores === null || valor === actual ? ' disabled' : ''}>${texto}</button>`).join('');
      return `<div class="cl-var"><b>${v.titulo}</b> <span class="meta">(${v.nombre}${fija ? '' : ' · sin fijar, vale ' + v.defecto})</span><p class="meta">${v.texto}</p><div class="cl-bar">${botones}</div></div>`;
    }).join('');
    const pie = e.sinMandos ? '<p class="meta">Con este token (solo lectura) se pueden ver, no cambiar.</p>' : '';
    return `<section class="caja cl-cfg"><h3>Variables de Actions</h3>`
      + (e.fallo ? `<p class="aviso">${escapa(e.fallo)}</p>` : e.valores === null ? '<p class="meta">Leyendo…</p>' : '') + filas + pie + '</section>';
  }
  return { VARIABLES, valorDe, html };
})();
