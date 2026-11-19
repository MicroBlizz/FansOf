// Fans of Asalto · ADAPTADORES · El menú y las ventanas de fuera de la partida: elegir zona (o seguir la partida guardada, o el modo
// sin fin de una zona terminada), la dificultad de cada zona, la máquina de invocar, las mejoras permanentes, el equipo y la mochila, la herrería, los logros, la tienda y los ajustes.
// Todo lo que cambia algo pasa por los casos de uso. La escena del menú (tu equipo en la mazmorra, a la luz de las antorchas) se pinta
// en el lienzo, justo en el hueco que le deja la página (#as-escena).
'use strict';
AS.menu = (() => {
  const V = AS.ventanas, PR = AS.progreso;
  // quién sale en la escena del menú si no hay partida a medias (si la hay, sale su equipo)
  const REPARTO = ['heroe-mechavaca', 'heroe-zorro', 'heroe-bunny', 'heroe-mapache', 'heroe-ardilla'].map(tipo => ({ tipo, nivel: 1, dorado: false }));
  let casos = null, t = 0, reparto = REPARTO;
  const elegida = {};   // la dificultad marcada en cada zona (mientras el menú esté abierto): { zona: 0, 1 o 2 }
  const caja = () => $('#as-menu');
  const pluma = n => `${V.ico('pluma')}${n}`;

  // la dificultad marcada en una zona; si ya no está abierta, la primera
  const difDe = zona => (casos.dificultadAbierta(zona, elegida[zona] || 0) ? elegida[zona] || 0 : 0);
  function entra(zona, sinFin) {
    const r = casos.nuevaPartida(zona, sinFin, sinFin ? 0 : difDe(zona));
    if (!r.ok) { AS.suena('noVale'); toast(tr('Termina antes la zona anterior')); return; }
    caja().hidden = true;
    AS.pantalla.empieza(casos);
  }
  function continua() {
    const r = casos.continua();
    if (!r.ok) { toast(tr('La partida guardada ya no vale')); pinta(); return; }
    caja().hidden = true;
    AS.pantalla.empieza(casos);
  }
  function htmlZona(z, i) {
    const g = casos.progreso, abierta = casos.zonaAbierta(i, false), hecha = g.zonas.includes(i), record = g.sinFin[i];
    const botones = !abierta ? V.btn('as-zc' + i, tr('CERRADA'), 'as-cerrada as-chico')
      : V.btn('as-z' + i, tr('ENTRAR'), 'as-rojo') + (hecha ? V.btn('as-sf' + i, tr('SIN FIN') + (record ? ' · ' + record : ''), 'as-azul') : '');
    return `<div class="as-zona${abierta ? '' : ' as-off'}"><div class="as-zt"><b>${tr(z.nombre)}</b><span>${tr('{n} oleadas', { n: z.oleadas })}${hecha ? ' · ' + tr('CONQUISTADA') : ''}</span></div><div class="as-zb">${botones}</div>${abierta ? htmlDificultades(i) : ''}</div>`;
  }
  // las tres dificultades de una zona: la marcada, las abiertas y las que piden superar antes la anterior (con su candado)
  function htmlDificultades(zona) {
    const marcada = difDe(zona), D = ASALTO.dificultades, d = D[marcada];
    const fichas = D.map((x, i) => `<button class="as-dif as-d${i}${i === marcada ? ' as-on' : ''}${casos.dificultadAbierta(zona, i) ? '' : ' as-no'}" data-z="${zona}" data-d="${i}" type="button">${tr(x.nombre)}</button>`).join('');
    const nota = marcada ? tr('Enemigos +{f} % · plumas x{p}', { f: Math.round((d.fuerza - 1) * 100), p: String(d.plumas).replace('.', ',') }) : tr('La de siempre');
    return `<div class="as-difs">${fichas}<span>${nota}</span></div>`;
  }
  function alPulsarDificultad(b) {
    const zona = Number(b.dataset.z), d = Number(b.dataset.d);
    if (!casos.dificultadAbierta(zona, d)) { AS.suena('noVale'); toast(tr('Supera antes esta zona en {dif}', { dif: tr(ASALTO.dificultades[d - 1].nombre) })); return; }
    elegida[zona] = d; AS.suena('clic'); pinta();
  }
  // la máquina con la que se juegan las partidas nuevas, a la vista, con su botón para cambiarla
  function htmlMaquina() {
    return `<button class="as-btn as-azul as-maquina" id="as-m-maquina" type="button">${V.ico('altar')}${tr(ASALTO.maquinas[casos.progreso.maquina].nombre)}<small>${tr('CAMBIAR')}</small></button>`;
  }
  function htmlSeguir() {
    const s = casos.guardada();
    if (!s) return '';
    const donde = tr(ASALTO.zonas[s.zona] ? ASALTO.zonas[s.zona].nombre : '') + (s.dificultad ? ' · ' + tr(ASALTO.dificultades[s.dificultad].nombre) : '') + ' · ' + tr('oleada {n}', { n: s.oleada });
    return `<button class="as-btn as-verde as-seguir" id="as-seguir-partida" type="button">${tr('SEGUIR LA PARTIDA')}<small>${donde}</small></button>`;
  }
  // la mejora que queda más cerca, a la vista en el menú
  function htmlMeta() {
    const m = casos.metas().mejora;
    if (!m) return '';
    return `<p class="as-meta-menu">${tr(m.nombre)}: ${m.plumas >= m.coste ? tr('¡Ya te llegan las plumas!') : tr('Te faltan {n} plumas', { n: m.coste - m.plumas })}</p>`;
  }
  function pinta() {
    const g = casos.progreso, pend = casos.logrosPendientes().length, s = casos.guardada();
    reparto = s && s.heroes.length ? s.heroes : REPARTO;
    caja().innerHTML = `<h1 class="as-logo"><small>FANS OF</small>ASALTO</h1><p class="as-plumas">${pluma(g.plumas)}</p>${htmlMeta()}
      <div class="as-escena" id="as-escena"></div>${htmlSeguir()}
      ${htmlMaquina()}<div class="as-zonas">${ASALTO.zonas.map(htmlZona).join('')}</div>
      <div class="as-rejilla">${V.btn('as-m-mejoras', tr('MEJORAS'), 'as-oro')}${V.btn('as-m-equipo', tr('EQUIPO'), 'as-azul')}${V.btn('as-m-herreria', tr('HERRERÍA'), 'as-azul')}
        ${V.btn('as-m-logros', tr('LOGROS') + (pend ? ' · ' + pend : ''), pend ? 'as-verde' : 'as-azul')}${V.btn('as-m-tienda', tr('TIENDA'), 'as-oro')}${V.btn('as-m-ajustes', tr('AJUSTES'), 'as-azul')}</div>`;
    V.alPulsar('as-seguir-partida', continua); V.alPulsar('as-m-maquina', maquinas);
    for (const b of caja().querySelectorAll('.as-dif')) b.onclick = () => alPulsarDificultad(b);
    ASALTO.zonas.forEach((z, i) => { V.alPulsar('as-z' + i, () => entra(i, false)); V.alPulsar('as-sf' + i, () => entra(i, true)); V.alPulsar('as-zc' + i, () => toast(tr('Termina antes la zona anterior'))); });
    V.alPulsar('as-m-mejoras', mejoras); V.alPulsar('as-m-equipo', equipo); V.alPulsar('as-m-herreria', herreria);
    V.alPulsar('as-m-logros', logros); V.alPulsar('as-m-tienda', tienda); V.alPulsar('as-m-ajustes', ajustes);
  }
  // ventana: 'mejoras' para abrirlo ya en esa ventana (desde el final de la partida)
  function abre(ventana) {
    AS.pantalla.sal(); V.cierra();
    caja().hidden = false;
    pinta();
    AS.suena.musica('menu');
    if (ventana === 'mejoras') mejoras();
  }
  // una ventana del menú: su contenido, el botón de volver y repintar el menú al cerrarla
  function ventana(html) {
    const el = V.abre(html + V.btn('as-volver', tr('VOLVER'), 'as-azul'), 'as-alta');
    V.alPulsar('as-volver', () => { V.cierra(); pinta(); });
    return el;
  }
  const sinPlumas = r => { if (!r.ok) { AS.suena('noVale'); toast(r.error === 'sin-plumas' ? tr('Te faltan plumas') : tr('No se puede')); } return r.ok; };

  function mejoras() {
    const g = casos.progreso;
    const filas = Object.keys(ASALTO.mejoras).map(id => {
      const m = ASALTO.mejoras[id], n = g.mejoras[id] || 0, coste = casos.costeMejora(id);
      return `<li class="as-item">${V.ico(m.icono, 'as-ico2')}<div><b>${tr(m.nombre)} <small>${n}/${m.coste.length}</small></b><span>${tr(m.txt)}</span></div>${coste ? `<button class="as-btn as-oro as-chico" data-m="${id}" type="button">${pluma(coste)}</button>` : `<span class="as-hecho">${tr('AL MÁXIMO')}</span>`}</li>`;
    }).join('');
    const el = ventana(`<h2>${tr('MEJORAS')}</h2><p class="as-plumas">${pluma(g.plumas)}</p><p class="as-nota">${tr('Valen para todas las partidas.')}</p><ul class="as-lista">${filas}</ul>
      <h2>${tr('RAREZAS DE LOS HÉROES')}</h2><p class="as-nota">${tr('Los héroes más raros son más fuertes. Se abren en orden, con plumas y con su zona superada.')}</p><ul class="as-lista">${filasRarezas(g)}</ul>${AS.ventanas.leyendas.dormido(casos)}`);
    for (const b of el.querySelectorAll('[data-m]')) b.onclick = () => { if (sinPlumas(casos.compraMejora(b.dataset.m))) AS.suena('absorbe'); mejoras(); };
    V.alPulsar('as-abre-rareza', () => { if (sinPlumas(casos.abreRareza())) AS.suena('cofre'); mejoras(); });
    V.alPulsar('as-abre-dormido', () => { if (sinPlumas(casos.abreDormido())) AS.suena('cofre'); mejoras(); });   // el Poder Dormido (tarea #109)
  }
  // las máquinas de invocar: la elegida, las abiertas (con su botón de elegir) y las cerradas (con sus plumas o la zona que piden)
  function maquinas() {
    const g = casos.progreso;
    const filas = Object.keys(ASALTO.maquinas).map(id => {
      const m = ASALTO.maquinas[id], abierta = casos.maquinaAbierta(id);
      let fin = `<button class="as-btn as-verde as-chico" data-elige="${id}" type="button">${tr('ELEGIR')}</button>`;
      if (id === g.maquina) fin = `<span class="as-hecho">${tr('ELEGIDA')}</span>`;
      else if (!abierta) fin = g.zonas.includes(m.zona) ? `<button class="as-btn as-oro as-chico" data-abre="${id}" type="button">${pluma(m.plumas)}</button>` : `<span class="as-candado">${tr('Supera antes: {zona}', { zona: tr(ASALTO.zonas[m.zona].nombre) })}</span>`;
      return `<li class="as-item${abierta ? '' : ' as-cerrada'}">${V.ico('altar', 'as-ico2')}<div><b>${tr(m.nombre)}</b><span>${tr(m.txt)}</span></div>${fin}</li>`;
    }).join('');
    const el = ventana(`<h2>${tr('MÁQUINAS')}</h2><p class="as-plumas">${pluma(g.plumas)}</p><p class="as-nota">${tr('Elige con cuál invocas. Vale para las partidas nuevas.')}</p><ul class="as-lista">${filas}</ul>`);
    for (const b of el.querySelectorAll('[data-elige]')) b.onclick = () => { casos.eligeMaquina(b.dataset.elige); AS.suena('clic'); maquinas(); };
    for (const b of el.querySelectorAll('[data-abre]')) b.onclick = () => { if (sinPlumas(casos.abreMaquina(b.dataset.abre))) AS.suena('cofre'); maquinas(); };
  }
  // las 5 rarezas: las abiertas, la siguiente (con su botón de plumas, o la zona que pide) y las que siguen con candado
  function filasRarezas(g) {
    const sig = casos.rarezaSiguiente();
    return ASALTO.rarezas.map((r, i) => {
      const mas = r.mult > 1 ? tr('+{n} % de vida y de daño', { n: Math.round((r.mult - 1) * 100) }) : tr('La de siempre');
      let fin = `<span class="as-hecho">${tr('ABIERTA')}</span>`;
      if (sig && i === sig.i) fin = sig.falta === 'zona' ? `<span class="as-candado">${tr('Supera antes: {zona}', { zona: tr(ASALTO.zonas[r.zona].nombre) })}</span>` : `<button class="as-btn as-oro as-chico" id="as-abre-rareza" type="button">${pluma(r.plumas)}</button>`;
      else if (i > g.rarezas) fin = `<span class="as-candado">${tr('CERRADA')}</span>`;
      return `<li class="as-item${i > g.rarezas ? ' as-cerrada' : ''}"><i class="as-rombo as-q${i}"></i><div><b class="as-q${i}">${tr(r.nombre)}</b><span>${mas}</span></div>${fin}</li>`;
    }).join('');
  }
  const htmlObjeto = o => `${V.ico('equipo-' + o.hueco)}<div><b class="as-r${o.rareza}">${tr(ASALTO.equipo.nombres[o.hueco])}${o.nivel ? ' +' + o.nivel : ''}</b><span>+${o.valor + o.nivel} % ${tr(ASALTO.equipo.stats[o.stat])}</span></div>`;
  function equipo() {
    const g = casos.progreso, E = ASALTO.equipo, s = casos.statsEquipo();
    const puestos = E.huecos.map(h => { const o = g.equipo[h]; return `<li class="as-item">${o ? htmlObjeto(o) + `<button class="as-btn as-azul as-chico" data-quita="${h}" type="button">${tr('QUITAR')}</button>` : `${V.ico('equipo-' + h)}<div><b>${tr(E.nombres[h])}</b><span>${tr('Vacío')}</span></div>`}</li>`; }).join('');
    const mochila = g.mochila.map(o => `<li class="as-item">${htmlObjeto(o)}<button class="as-btn as-verde as-chico" data-pon="${o.id}" type="button">${tr('PONER')}</button><button class="as-btn as-rojo as-chico" data-fuera="${o.id}" type="button">${pluma(E.desencantar[o.rareza])}</button></li>`).join('');
    const suma = Object.keys(s).filter(k => s[k]).map(k => `+${s[k]} % ${tr(E.stats[k])}`).join(' · ');
    const el = ventana(`<h2>${tr('EQUIPO')}</h2><p class="as-nota">${suma || tr('Cada objeto sube una cifra de todos tus héroes.')}</p><ul class="as-lista">${puestos}</ul>
      <h3>${tr('MOCHILA')} ${g.mochila.length}/${E.mochila}</h3><ul class="as-lista">${mochila || `<li class="as-nota">${tr('Vacía. Los jefes y la tienda dan equipo.')}</li>`}</ul>`);
    for (const b of el.querySelectorAll('[data-quita]')) b.onclick = () => { if (!casos.quitaObjeto(b.dataset.quita).ok) toast(tr('La mochila está llena')); AS.suena('clic'); equipo(); };
    for (const b of el.querySelectorAll('[data-pon]')) b.onclick = () => { casos.ponObjeto(b.dataset.pon); AS.suena('clic'); equipo(); };
    for (const b of el.querySelectorAll('[data-fuera]')) b.onclick = () => confirmBox(tr('¿DESHACER?'), tr('El objeto se convierte en plumas.'), tr('SÍ'), () => { casos.deshaceObjeto(b.dataset.fuera); AS.suena('moneda'); equipo(); });
  }
  function herreria() {
    const g = casos.progreso, E = ASALTO.equipo;
    const filas = E.huecos.filter(h => g.equipo[h]).map(h => { const o = g.equipo[h]; return `<li class="as-item">${htmlObjeto(o)}<button class="as-btn as-oro as-chico" data-h="${h}" type="button">${pluma(PR.costeHerreria(ASALTO, o))}</button></li>`; }).join('');
    const el = ventana(`<h2>${tr('HERRERÍA')}</h2><p class="as-plumas">${pluma(g.plumas)}</p><p class="as-nota">${tr('Cada golpe de martillo le da +1 % al objeto puesto.')}</p><ul class="as-lista">${filas || `<li class="as-nota">${tr('Ponte algo en el EQUIPO primero.')}</li>`}</ul>`);
    for (const b of el.querySelectorAll('[data-h]')) b.onclick = () => { if (sinPlumas(casos.mejoraObjeto(b.dataset.h))) AS.suena('para', 2); herreria(); };
  }
  function logros() {
    const g = casos.progreso, pend = casos.logrosPendientes().map(l => l.id);
    const filas = ASALTO.logros.map(l => {
      const hecho = g.logros[l.id], va = l.zona !== undefined ? (g.zonas.includes(l.zona) ? 1 : 0) + '/1' : Math.min(g.stats[l.stat] || 0, l.meta) + '/' + l.meta;
      const der = hecho ? `<span class="as-hecho">${tr('COBRADO')}</span>` : pend.includes(l.id) ? `<button class="as-btn as-verde as-chico" data-l="${l.id}" type="button">${pluma(l.premio)}</button>` : `<span class="as-va">${va}</span>`;
      return `<li class="as-item">${V.ico('trofeo')}<div><b>${tr(l.txt)}</b><span>${pluma(l.premio)}</span></div>${der}</li>`;
    }).join('');
    const el = ventana(`<h2>${tr('LOGROS')}</h2><ul class="as-lista">${filas}</ul>`);
    for (const b of el.querySelectorAll('[data-l]')) b.onclick = () => { if (casos.cobraLogro(b.dataset.l).ok) AS.suena('cofre'); logros(); };
  }
  function tienda() {
    const g = casos.progreso, E = ASALTO.equipo;
    ventana(`<h2>${tr('TIENDA')}</h2><p class="as-plumas">${pluma(g.plumas)}</p>
      <div class="as-oferta"><i class="as-cofre as-pix" style="${AS.dibujos.cssRetrato('cofre', 1)}"></i><div><b>${tr('COFRE DE EQUIPO')}</b><span>${tr('Un objeto al azar: normal, raro o épico.')}</span></div>${V.btn('as-t-cofre', pluma(E.cofreTienda), 'as-oro')}</div>
      <div class="as-oferta">${V.ico('pluma', 'as-ico2')}<div><b>${tr('PLUMAS DE REGALO')}</b><span>${tr('Mira un anuncio y llévate {n} plumas.', { n: E.plumasAnuncio })}</span></div>${V.btn('as-t-anuncio', tr('ANUNCIO'), 'as-verde')}</div>`);
    V.alPulsar('as-t-cofre', () => {
      const r = casos.compraCofre();
      if (!sinPlumas(r)) return;
      const o = r.valor.objeto;
      AS.suena('cofre'); toast(tr(E.rarezas[o.rareza].nombre) + ': ' + tr(E.nombres[o.hueco]) + ' +' + o.valor + ' % ' + tr(E.stats[o.stat]), true); tienda();
    });
    V.alPulsar('as-t-anuncio', () => V.anuncio(() => { casos.regalaPlumas(E.plumasAnuncio); AS.suena('cofre'); tienda(); }));
  }
  function ajustes() {
    const el = V.abre(`<h2>${tr('AJUSTES')}</h2><div id="as-opc"></div>${V.btn('as-borra', tr('BORRAR TODO EL PROGRESO'), 'as-rojo as-chico')}`, 'as-alta');
    V.ajustes(el.querySelector('#as-opc'), { casos }, () => { V.cierra(); pinta(); });
    V.alPulsar('as-borra', () => confirmBox(tr('¿BORRAR TODO?'), tr('Se pierden las plumas, el equipo, las mejoras y los logros.'), tr('SÍ, BORRAR'), () => { casos.borraTodo(); V.cierra(); pinta(); }));
  }
  // dónde cae en el lienzo el hueco que la página deja para la escena (#as-escena); null si no se ve
  function sitioEscena(L) {
    const el = $('#as-escena');
    if (!el) return null;
    const a = el.getBoundingClientRect(), c = L.cv.getBoundingClientRect(), k = L.W / (c.width || 1);
    return a.height > 4 ? { y: Math.round((a.top - c.top) * k), h: Math.round(a.height * k) } : null;
  }
  // la escena: la mazmorra de arriba abajo (el suelo sigue, en penumbra, por detrás de los carteles) y tu equipo en fila bajo las
  // antorchas, cada uno sobre su losa; de vez en cuando uno ensaya un golpe
  function escena(g, L, r) {
    const n = reparto.length, pie = r.y + r.h - 30, luces = AS.mazmorra.luces('sotano', 0, r.y, L.W, r.h, t).slice(0, 3), turno = Math.floor(t / 2.6) % n, fase = t % 2.6;
    AS.mazmorra.pinta(g, 'sotano', 0, r.y, L.W, L.H, t, 0);   // siempre del mismo alto (se guarda pintada una vez); lo que sobra cae fuera
    reparto.forEach((h, i) => {
      const x = n > 1 ? Math.round(62 + i * (L.W - 150) / (n - 1)) : Math.round(L.W / 2 - 14), y = pie - (i % 2) * 14, golpea = i === turno && fase < 0.55;
      AS.tema.elipse(g, x, y + 2, 47, 17, 'rgba(8,4,12,0.55)'); AS.tema.elipse(g, x, y, 44, 15, h.dorado ? AS.tema.C.oro : AS.tema.C.oro2); AS.tema.elipse(g, x, y, 39, 12, '#33364e');
      AS.dibujos.muneco(g, { tipo: h.tipo, anim: golpea ? 'ataque' : 'reposo', tAnim: golpea ? fase : t + i * 0.3, dura: 0.55, lado: 'heroe', dorado: h.dorado, id: i }, x, y);
      luces.push({ x, y: y - 40, r: 100, col: h.dorado ? [255, 215, 90] : null, a: 0.8 });
    });
    return luces;
  }
  function fotograma(dt) {
    const L = AS.lienzo.L, g = L.b, r = sitioEscena(L);
    t += dt;
    g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false;
    g.fillStyle = AS.tema.C.noche; g.fillRect(0, 0, L.W, L.H);
    const luces = r ? escena(g, L, r) : [];
    luces.push({ x: L.W / 2, y: 80, r: 300 + Math.sin(t * 2) * 16, col: [255, 170, 70], a: 0.28 });   // un resplandor detrás del título
    AS.lienzo.presenta(luces, r ? { y0: r.y, y1: L.H, a: 0.6 } : null);
  }
  return { monta: c => { casos = c; }, abre, entra, fotograma, get abierto() { return !caja().hidden; } };
})();
