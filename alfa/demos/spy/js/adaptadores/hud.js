// Fans of Spy · ADAPTADORES · La pantalla por encima del 3D (todo HTML): arriba, la barra con el orden de los turnos, el estado
// de alerta y la vida; abajo, la radio de Lola, el panel de la carta elegida, la mano de cartas y el botón de acabar el turno; y
// las ventanas (menú, pausa, cómo se juega y final). No sabe nada de las reglas: principal.js le pasa los datos ya masticados y
// recibe los toques por las funciones de `acciones`. Los textos van en español: core los traduce solos (idioma/en.js).
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const el = (id) => document.getElementById(id);
  let acciones = null;
  function crea(etiqueta, clase, texto) {
    const e = document.createElement(etiqueta);
    if (clase) e.className = clase;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }
  function boton(texto, clase, alPulsar) {
    const b = crea('button', 'spy-btn ' + clase, texto);
    b.type = 'button';
    b.addEventListener('click', (ev) => { ev.stopPropagation(); alPulsar(); });
    return b;
  }

  // Engancha los botones fijos. acciones = { carta(i), modo(m), usar(), cancelar(), acabar(), seguir(), callar(), pausa(), girar(), centrar() }.
  function monta(a) {
    acciones = a;
    S.iconos.cara(el('spy-lola-cara'), 'lola');
    el('spy-acabar').addEventListener('click', () => acciones.acabar());
    el('spy-seguir').addEventListener('click', (ev) => { ev.stopPropagation(); acciones.seguir(); });
    el('spy-lola').addEventListener('click', () => acciones.callar());
    el('spy-pausa').addEventListener('click', () => acciones.pausa());
    el('spy-girar').addEventListener('click', () => acciones.girar());
    el('spy-centrar').addEventListener('click', () => acciones.centrar());
  }

  // La mano: una carta por hueco. c = { i, id, nombre, corto, color, fondo, coste, ruido, elegida, apagada, senalada }.
  function carta(c) {
    const b = crea('button', 'spy-carta' + (c.elegida ? ' elegida' : '') + (c.apagada ? ' apagada' : '') + (c.senalada ? ' senalada' : ''));
    b.type = 'button';
    b.style.setProperty('--fam', c.color); b.style.setProperty('--fondo', c.fondo);
    const cabecera = crea('span', 'spy-carta-cab'), dibujo = crea('canvas');
    cabecera.append(crea('i', '', c.corto), crea('b', '', String(c.coste)));
    S.iconos.carta(dibujo, c.id);
    b.append(cabecera, dibujo, crea('span', 'spy-carta-nombre', c.nombre));
    if (c.ruido) b.append(crea('span', 'spy-carta-ruido', 'Hace ruido'));
    b.addEventListener('click', () => acciones.carta(c.i));
    return b;
  }
  function mano(cartas) {
    const caja = el('spy-mano');
    caja.textContent = '';
    caja.classList.toggle('llena', cartas.length > 5);
    for (const c of cartas) caja.append(carta(c));
  }

  // El panel de la carta elegida. d = null (ninguna) o { texto, aviso, modo, costeEfecto, costeAndar, soloModo, pide, elegido, usar }.
  function accion(d) {
    const caja = el('spy-accion');
    caja.hidden = !d;
    if (!d) return;
    caja.textContent = '';
    const fila = crea('div', 'spy-accion-fila'), modos = crea('div', 'spy-modos');
    for (const [m, nombre, coste] of [['efecto', 'EFECTO', d.costeEfecto], ['andar', 'ANDAR 3', d.costeAndar]]) {
      const b = boton(nombre, 'spy-modo' + (d.modo === m ? ' activo' : ''), () => acciones.modo(m));
      b.append(crea('b', '', String(coste)));
      b.disabled = !!d.soloModo && d.soloModo !== m;
      modos.append(b);
    }
    fila.append(modos);
    if (d.usar) fila.append(boton(d.usar, 'spy-naranja spy-usar', () => acciones.usar()));
    fila.append(boton('X', 'spy-rojo spy-cancelar', () => acciones.cancelar()));
    caja.append(crea('p', 'spy-accion-texto', d.texto));
    if (d.aviso) caja.append(crea('p', 'spy-accion-aviso' + (d.avisoMalo ? ' malo' : ''), d.aviso));
    caja.append(fila);
  }

  // La barra de turnos. fichas = [{ tipo, nombre, en, ahora, fantasma, estado }].
  function orden(fichas) {
    const caja = el('spy-orden');
    caja.textContent = '';
    for (const f of fichas) {
      const ficha = crea('div', 'spy-ficha' + (f.ahora ? ' ahora' : '') + (f.fantasma ? ' fantasma' : '') + (f.estado ? ' est-' + f.estado : '')), cara = crea('canvas');
      S.iconos.cara(cara, f.tipo);
      const pie = crea('span', 'spy-ficha-pie', f.ahora ? 'AHORA' : f.en === null ? 'DESPUÉS' : 'en ' + f.en);
      ficha.append(cara, crea('span', 'spy-ficha-nombre', f.nombre), pie);
      caja.append(ficha);
    }
  }

  // La fila de estado: la planta, la alerta y la vida (una zanahoria por punto).
  function estado(d) {
    el('spy-planta').textContent = d.planta;
    const alerta = el('spy-alerta');
    alerta.className = d.alerta.activa ? 'alerta' : d.sospecha ? 'sospecha' : '';
    alerta.textContent = d.alerta.activa ? 'ALERTA ' + d.alerta.turnos : d.sospecha ? 'SOSPECHAN' : 'TRANQUILO';
    const vida = el('spy-vida');
    vida.textContent = '';
    vida.setAttribute('aria-label', 'Vida ' + d.vida);
    for (let i = 0; i < d.vidaMax; i++) vida.append(crea('i', i < d.vida ? 'llena' : ''));
  }
  // La línea de abajo: cartas jugadas, mazo, coste y el botón de acabar el turno (o de esperar si no se ha jugado nada).
  function cuenta(d) {
    const caja = el('spy-cuenta'), b = el('spy-acabar');
    caja.textContent = '';
    caja.append(crea('span', '', 'Cartas ' + d.jugadas + '/' + d.tope), crea('span', '', 'Mazo ' + d.mazo), crea('span', d.gasto ? 'gasto' : '', 'Coste ' + d.gasto));
    b.textContent = d.espera ? 'ESPERAR' : 'ACABAR TURNO';
    b.disabled = !!d.bloqueado;
    b.classList.toggle('senalada', !!d.senalada);
  }

  // La radio de Lola: su frase y, si el paso lo pide, el botón de seguir.
  function lola(texto, conSeguir) {
    el('spy-lola').hidden = !texto;
    el('spy-lola-texto').textContent = texto || '';
    el('spy-seguir').hidden = !conSeguir;
  }
  // Un cartel que sale un momento en medio de la pantalla.
  function cartel(texto, clase) {
    const caja = el('spy-cartel'), c = crea('div', 'spy-aviso ' + (clase || ''), texto);
    while (caja.children.length > 2) caja.firstChild.remove();
    caja.append(c);
    setTimeout(() => c.remove(), 1700);
  }
  const destello = (k) => { el('spy-destello').style.opacity = String(Math.min(0.75, k)); };
  const centrar = (visible) => { el('spy-centrar').hidden = !visible; };
  // Enseña u oculta todo lo de la partida (se oculta en el menú).
  function partida(visible) { for (const id of ['spy-cabecera', 'spy-pie', 'spy-vista']) el(id).hidden = !visible; }

  // Una ventana: d = null (cerrarla) o { clase, titulo, sub, lineas: [nodos o textos], botones: [[texto, clase, función]] }.
  function ventana(d) {
    const caja = el('spy-ventana'), cuerpo = el('spy-ventana-cuerpo');
    caja.hidden = !d;
    if (!d) return;
    cuerpo.className = 'spy-tarjeta ' + (d.clase || '');
    cuerpo.textContent = '';
    if (d.titulo) cuerpo.append(crea('h2', '', d.titulo));
    if (d.sub) cuerpo.append(crea('h3', '', d.sub));
    for (const l of d.lineas || []) cuerpo.append(typeof l === 'string' ? crea('p', '', l) : l);
    const fila = crea('div', 'spy-botones');
    for (const [texto, clase, hace] of d.botones || []) fila.append(boton(texto, clase, hace));
    cuerpo.append(fila);
  }

  S.hud = Object.freeze({ monta, mano, accion, orden, estado, cuenta, lola, cartel, destello, centrar, partida, ventana, crea });
})(SPY);
