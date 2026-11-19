// Fans of Pop · CÓMO SE CONSIGUEN LOS COMPAÑEROS EN EL JUEGO (aplicación; tarea #142, ADR 157, nodo n7). Solo con el flag `companeros`
// abierto: el rescate de un nivel (solo la primera vez en tu vida, sin elegir a quién dejar), el cofre de estrellas, el primer jefe
// (MechaVaca), los duelos contra la máquina (Patito, Zorrito y Hurón) y el compañero de un premio del pase o de la Feria (ppDaPremio,
// js/ofertas.js). Cada uno se anuncia con un aviso flotante («¡Nuevo compañero: X!» o «+1 X repetido»). Las reglas (quién sale, qué
// escalón o tramo da cuál) son puras, en js/coleccion.js; aquí solo se lee el azar (Math.random), la partida guardada y el dibujo.
// Con el flag cerrado, nada de esto hace nada y Pop sigue como siempre.
'use strict';
/* ---------- conseguir uno y avisarlo ---------- */
// conseguir un compañero por una vía y anunciarlo (el rescate lo anuncia su ventana). Devuelve el resultado de la regla
function ppViaGana(id, rescate = false) {
  const r = ppColeGana(id, rescate);
  if (r.ok && !rescate) ppViaAviso(id, r);
  return r;
}
// el texto del aviso: nuevo, repetido o repetido que ya no hace falta (sus monedas)
function ppViaTexto(id, r) {
  const n = tr(ppSlimeDe(id).nombre);
  if (r.nuevo) return tr('¡Nuevo compañero: {n}!', { n });
  return r.sobra ? tr('+1 {n} repetido · +{m} monedas', { n, m: r.sobra }) : tr('+1 {n} repetido', { n });
}
// el aviso flotante, encima de las ventanas (sin tapar los botones: no se puede tocar) y se va solo; varios se apilan
function ppViaAviso(id, r) {
  let caja = $pp('#pp-via-avisos');
  if (!caja) { caja = document.createElement('div'); caja.id = 'pp-via-avisos'; $pp('#pp-ui').appendChild(caja); }
  const el = document.createElement('div');
  el.className = 'pp-via-aviso' + (r.nuevo ? ' pp-via-nuevo' : '');
  el.innerHTML = `${ppViaDibujoHtml(id, 44)}<b>${ppViaTexto(id, r)}</b>`;
  caja.appendChild(el);
  play('ppPremio');
  setTimeout(() => el.remove(), 3400);
}
// el dibujo en HTML (texto): el de Yoshi si ya está; si no, el SVG de los Animales o la bolita de color de los de siempre
function ppViaDibujoHtml(id, px) {
  if (ppTieneImg('sl-' + id) || !PP_COMP.NUEVOS[id]) return ppIcono('sl-' + id, px, ppSlimeDe(id).color);
  return `<span class="pp-ico pp-via-svg" style="width:${px}px;height:${px}px">${ppCompSvg(id)}</span>`;
}
// un compañero como premio (escalón del pase o tramo de la Feria): su dibujo y su nombre
const ppViaPremioHtml = (id, px) => `<span class="pp-precio">${ppViaDibujoHtml(id, px)}${tr(ppSlimeDe(id).nombre)}</span>`;

/* ---------- al ganar un nivel (ppSalaHecha, js/partida.js) ---------- */
// `nuevo`: el nivel era nuevo en el camino; `presos`: los atrapados del nivel. Con el flag, los rescatados quedan en T.rescates
function ppViasAlGanar(T, nuevo, presos) {
  if (!ppCompanerosActivo()) return;
  if (presos.length) T.rescates = presos.map(ppViaRescata);
  for (let k = 0; k < ((T.premio && T.premio.cofresAbiertos) || 0); k++) ppViaGana(PP_COLE.deCofre(ppCole(), Math.random));
  const jefe = nuevo && T.d.jefe ? PP_COLE.deJefe(ppCole()) : null;
  if (jefe) ppViaGana(jefe);
  if (T.nim) ppViaDuelo(!!T.d.jefe);   // un nivel con duelo (difícil o jefe) es una victoria contra la máquina
}
// un atrapado rescatado: a la colección (solo la primera vez en tu vida) y a su equipo si hay sitio. { id, nuevo, enEquipo }
function ppViaRescata(id) {
  const r = ppColeGana(id, true);
  if (r.ok && r.nuevo) PP_P.rescatados.push(id);   // para la ventana del final del camino
  return { id, nuevo: !!(r.ok && r.nuevo), enEquipo: ppEquipoDe(PP_COLE.modoDe(id)).includes(id) };
}
// una victoria contra la máquina (`jefe`: un jefe del camino): cuenta para los logros y da los compañeros que ya tocan
function ppViaDuelo(jefe) {
  if (!ppCompanerosActivo()) return;
  const r = PP_COLE.cuentaDuelo(ppCole(), jefe);
  ppColeGuarda(r.nuevos.reduce(ppColeMete, r.estado));
  for (const id of r.nuevos) ppViaAviso(id, { nuevo: true, sobra: 0 });
}

/* ---------- la ventana del rescate con el flag (la de siempre, js/pantallas.js, sigue igual con el flag cerrado) ---------- */
// ya no hay que elegir ni echar a nadie: si su equipo estaba lleno, se le pone desde Mi equipo
function ppVentanaRescateCole(rescates) {
  const T = PP_P.T;
  const t = ppAbre(`<h2>${tr('¡Nivel superado!')}</h2>${ppEstrellasHtml(T.estrellas)}${ppPremioHtml(T.premio)}${ppFeriaLinea(T)}`, true);
  const fila = document.createElement('div'); fila.className = 'pp-fila-slimes';
  for (const x of rescates) fila.appendChild(ppFichaSlime(x.id, true));
  t.insertAdjacentHTML('beforeend', rescates.map(x => `<p class="pp-sub"><b>${tr('¡{n} se une a tu colección!', { n: tr(ppSlimeDe(x.id).nombre) })}</b></p>`).join(''));
  t.appendChild(fila);
  const fuera = rescates.find(x => !x.enEquipo);
  if (fuera) {
    t.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('Tu equipo está lleno: lo puedes poner cuando quieras desde Mi equipo.')}</p>`);
    t.appendChild(ppBoton(tr('MI EQUIPO'), 'pp-btn2 pp-menta', () => { ppAlCamino(); PP_ALB.modo = PP_COLE.modoDe(fuera.id); ppVentanaCompaneros('equipo'); }));
  }
  t.appendChild(ppBoton(tr('¡SIGUIENTE!'), 'pp-btn', ppAlCamino));
}
