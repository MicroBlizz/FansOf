// Fans Of · /gestion → Paperwork → Calibrado (ADR 122, tarea #60): elegir un jugador tipo, las horas, las semillas y cifras de ajustes.js
// que cambiar; el worker (calibrado-worker.js) juega las partidas con las cifras de ahora y con las cambiadas, y aquí se dibujan las dos
// líneas de cada gráfica (con cruz y tooltip al pasar), las tablas de hitos, del final y de las fórmulas, y el texto del cambio para
// llevarlo a mano a web/games/paperwork/js/ajustes.js. No guarda nada en el servidor ni en el repo. Usa $() de gestion/index.html.
'use strict';
(() => {
  const D = GESTION_PW_CALIBRADO.dibujo;
  const HORAS = { activo: 6, hora: 48, dia: 168 };
  const GRAFICAS = [['trituradora', 'Niveles de la Trituradora'], ['plantaMax', 'Planta más honda'], ['meritos', 'Puntos de mérito'],
    ['paquetes', 'Paquetes del sindicato abiertos'], ['grapas', 'Grapas de oro sin gastar'], ['despidos', 'Despidos']];
  let worker = null, cifras = null, ultimo = null;
  const pan = () => $('pan-pw-calibrado');

  // un pedido al worker; si el worker falla (un archivo que no carga, una excepción), la promesa se rechaza con su mensaje
  function pide(nombre, datos, alProgreso) {
    return new Promise((resuelve, rechaza) => {
      worker.onerror = ev => { ev.preventDefault(); rechaza(new Error(ev.message || 'error del worker')); };
      worker.onmessage = ev => {
        if (ev.data.progreso !== undefined) { if (alProgreso) alProgreso(ev.data.progreso); return; }
        resuelve(ev.data.respuesta);
      };
      worker.postMessage({ pide: nombre, datos });
    });
  }
  function filaCambio(ruta = '', valor = '') {
    const f = document.createElement('div');
    f.className = 'pwc-cambio';
    f.innerHTML = `<input type="text" list="pwc-rutas" placeholder="cifra, p. ej. trituradora.capacidadBase" value="${D.esc(ruta)}" aria-label="Cifra">`
      + `<input type="number" step="any" placeholder="valor nuevo" value="${D.esc(valor)}" aria-label="Valor nuevo"><span class="meta pwc-ahora"></span>`
      + '<button type="button" class="enlace">quitar</button>';
    const [r, , ahora, quitar] = f.children;
    const pinta = () => { const c = cifras.cifras.find(x => x[0] === r.value); ahora.textContent = c ? `ahora ${c[1]}` : ''; };
    r.oninput = pinta; quitar.onclick = () => f.remove(); pinta();
    $('pwc-cambios').appendChild(f);
  }
  function formulario() {
    pan().innerHTML = `<div class="caja"><b>Calibrado de Fans Of Paperwork</b><div class="meta">Juega partidas enteras a cámara rápida con un jugador tipo, con las cifras de ahora (versión ${D.esc(cifras.version)}) y con las que cambies, y compara. Nada se guarda: el cambio que te guste se lleva a mano a ajustes.js.</div>`
      + `<div class="pwc-form"><label>Jugador tipo <select id="pwc-perfil">${cifras.perfiles.map(([id, n]) => `<option value="${id}">${D.esc(n)}</option>`).join('')}</select></label>`
      + '<label>Horas de reloj <input type="number" id="pwc-horas" min="1" max="336" value="6"></label>'
      + '<label>Partidas por lado (semillas) <input type="number" id="pwc-semillas" min="1" max="7" value="3"></label></div>'
      + `<datalist id="pwc-rutas">${cifras.cifras.map(([r]) => `<option value="${D.esc(r)}">`).join('')}</datalist>`
      + '<div class="meta" style="margin-top:10px">Cifras que cambiar</div><div id="pwc-cambios"></div>'
      + '<div class="filtros" style="margin-top:8px"><button type="button" id="pwc-anadir">Añadir cifra</button><button type="button" class="fuerte" id="pwc-jugar">Jugar y comparar</button><span class="meta" id="pwc-estado" role="status"></span></div>'
      + '<div class="aviso" id="pwc-aviso" role="alert"></div></div><div id="pwc-resultado"></div><div class="pwc-tip" id="pwc-tip" hidden></div>';
    $('pwc-perfil').onchange = () => { $('pwc-horas').value = HORAS[$('pwc-perfil').value] || 6; };
    $('pwc-anadir').onclick = () => filaCambio();
    $('pwc-jugar').onclick = jugar;
    filaCambio('trituradora.capacidadBase', '');
  }
  function leeCambios() {
    return [...document.querySelectorAll('#pwc-cambios .pwc-cambio')].map(f => ({ ruta: f.children[0].value.trim(), valor: f.children[1].value }))
      .filter(c => c.ruta || c.valor !== '').map(c => ({ ruta: c.ruta, valor: c.valor === '' ? NaN : Number(c.valor) }));
  }
  const ERRORES = { 'ruta-desconocida': d => `La cifra «${d.ruta}» no existe o no es un número.`, 'valor-invalido': d => `Falta el valor nuevo de «${d.ruta}».`,
    'perfil-desconocido': () => 'Ese jugador tipo no existe.' };
  async function jugar() {
    const datos = { cambios: leeCambios(), perfil: $('pwc-perfil').value, horas: Math.min(336, Math.max(1, +$('pwc-horas').value || 6)),
      semillas: Array.from({ length: Math.min(7, Math.max(1, +$('pwc-semillas').value || 1)) }, (_, k) => [7, 3, 11, 5, 13, 2, 17][k]) };
    $('pwc-aviso').textContent = ''; $('pwc-jugar').disabled = true; $('pwc-estado').textContent = 'Jugando…';
    let r;
    try { r = await pide('compara', datos, p => { $('pwc-estado').textContent = `Jugando… ${Math.round(p * 100)} %`; }); }
    catch (e) { $('pwc-aviso').textContent = `El calibrado ha fallado: ${e.message}`; return; }
    finally { $('pwc-jugar').disabled = false; $('pwc-estado').textContent = ''; }
    if (r.error) { $('pwc-aviso').textContent = (ERRORES[r.error] || (() => r.error))(r.datos || {}); return; }
    ultimo = { ...r, horas: datos.horas, semillas: datos.semillas.length };
    pintaResultado();
  }
  function pintaResultado() {
    const r = ultimo, tMax = r.horas * 3600;
    const graficas = GRAFICAS.map(([c, titulo]) => D.grafica({ id: c, titulo, tMax,
      series: [{ nombre: 'Ahora', n: 1, puntos: r.base.series[c] }, { nombre: 'Con el cambio', n: 2, puntos: r.cambiado.series[c] }] })).join('');
    $('pwc-resultado').innerHTML = `<div class="caja"><div class="pwc-leyenda"><span><i class="pwc-m1"></i>Ahora</span><span><i class="pwc-m2"></i>Con el cambio</span><span class="meta">Mediana de ${r.semillas} partida${r.semillas > 1 ? 's' : ''} por lado</span></div><div class="pwc-graficas">${graficas}</div></div>`
      + `<div class="caja"><b>Cuándo cae cada nivel</b>${D.tablaHitos(r.base.resumen, r.cambiado.resumen, r.semillas)}</div>`
      + `<div class="caja"><b>Al acabar</b>${D.tablaFinal(r.base.resumen, r.cambiado.resumen)}</div>`
      + (r.texto ? `<div class="caja"><b>El cambio, para ajustes.js</b><pre class="pwc-texto">${D.esc(r.texto)}</pre></div>` : '')
      + `<details class="caja"><summary><b>Fórmulas</b> (sin jugar, sin bonos)</summary>${D.tablasFormulas(r.formulas, r.nivel)}</details>`;
    document.querySelectorAll('#pwc-resultado svg[data-g]').forEach(engancha);
  }
  // la cruz y el tooltip: el punto más cercano en el tiempo de cada línea
  function engancha(svg) {
    const c = svg.dataset.g, tMax = +svg.dataset.tmax, cruz = svg.querySelector('.pwc-cruz'), tip = $('pwc-tip');
    const fuera = () => { cruz.setAttribute('visibility', 'hidden'); tip.hidden = true; };
    svg.onpointerleave = fuera;
    svg.onpointermove = ev => {
      const caja = svg.getBoundingClientRect(), t = D.tDeX((ev.clientX - caja.left) * D.W / caja.width, tMax);
      const b = ultimo.base.series[c], k = ultimo.cambiado.series[c], ib = D.cercano(b, t), ik = D.cercano(k, t), x = D.xDeT(b[ib][0], tMax);
      cruz.setAttribute('x1', x); cruz.setAttribute('x2', x); cruz.setAttribute('visibility', 'visible');
      tip.innerHTML = `<b>${D.horas(b[ib][0])}</b><span><i class="pwc-m1"></i>Ahora: ${D.num(b[ib][1])}</span><span><i class="pwc-m2"></i>Con el cambio: ${D.num(k[ik][1])}</span>`;
      tip.hidden = false;
      tip.style.left = Math.min(window.innerWidth - tip.offsetWidth - 8, ev.clientX + 14) + 'px';
      tip.style.top = (ev.clientY + 14) + 'px';
    };
  }
  async function cargar() {
    if (worker) return;
    pan().innerHTML = '<div class="caja ayuda">Cargando las reglas del juego…</div>';
    worker = new Worker(`paperwork/calibrado-worker.js?v=${Date.now()}`);
    try { cifras = await pide('cifras'); }
    catch (e) { pan().innerHTML = `<div class="caja aviso">No se ha podido cargar el calibrado: ${D.esc(e.message)}</div>`; worker.terminate(); worker = null; return; }
    formulario();
  }
  GESTION_NAV.seccion({ id: 'calibrado', pan: 'pan-pw-calibrado', juego: 'paperwork', etiqueta: 'Calibrado', orden: 2, cargar });
})();
