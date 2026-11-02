// Fans of Nova · PANTALLA DE LA ESTACIÓN: reparar, la nave con sus anclajes, la tienda de módulos, el taller de tamaños y cambiar un arma.
// Solo pantalla (DOM): las reglas de cada acción están en cartas.js, tienda.js y estacion-nave.js. La abre nvPanelesDOM (interfaz.js).
'use strict';
function nvRenderEstacion(S) {
  const cont = document.getElementById('nv-paneles'), vieja = cont.querySelector('.nv-panel'), scroll = vieja ? vieja.scrollTop : 0; cont.textContent = '';   // repintar no mueve el scroll
  const n = S.nave, p = nvEl('nv-panel'); p.appendChild(nvEl('nv-titulo', tr('ESTACIÓN')));
  p.appendChild(nvEl('nv-cdet', tr('Chatarra para gastar') + ': ' + Math.floor(S.cartera)));
  const rep = nvEl('nv-boton', tr('Reparar casco') + ' (40)', 'button'); rep.disabled = S.cartera < 40 || n.hp >= n.hpMax;
  rep.onclick = () => { S.cartera -= 40; n.hp = n.hpMax; nvRenderEstacion(S); }; p.appendChild(rep);
  const armas = n.armas.filter(w => w.portador !== 'defensa');
  const aviso = nvEl('nv-cdet nv-aviso'), repinta = () => nvRenderEstacion(S);   // la nave con sus anclajes: tocar uno y otro cambia las armas de sitio
  p.appendChild(nvLienzoNave(S, repinta, aviso)); p.appendChild(nvEl('nv-cdet nv-anclaje', nvTextoAnclaje(S))); p.appendChild(nvLeyendaAnclajes(S)); p.appendChild(aviso);
  if (S.estTienda) nvRenderTienda(S, p);
  else if (S.estTaller) nvEstacionTaller(S, p, armas);
  else if (!S.estSel) nvEstacionInicio(S, p, armas);
  else nvEstacionSustituir(S, p);
  const sa = nvEl('nv-boton', tr('Salir'), 'button');
  sa.onclick = () => { cont.textContent = ''; S.estTaller = null; S.estTienda = null; S.estSlot = null; S.est.cd = 25; S.est = null; S.estVista = null; S.estado = 'juego'; };
  p.appendChild(sa); nvInfo(p, S.estTienda ? 'tienda' : S.estTaller ? 'taller' : 'estacion'); cont.appendChild(p);
  p.scrollTop = scroll; requestAnimationFrame(() => { p.scrollTop = scroll; });
}
// Taller: unir 2 armas iguales en una mayor, o dividir una en 2 menores
function nvEstacionTaller(S, p, armas) {
  const n = S.nave, T = S.estTaller; T.sel = T.sel.filter(w => armas.includes(w));
  const libres = nvRanuras(n.rango, S).filter(r => r.cara !== 'popa' && !n.armas.some(w => w.slot === r.id)).length;
  p.appendChild(nvEl('nv-titulo', tr('TALLER DE TAMAÑOS')));
  const rc = nvEl('nv-receta'); for (const t of ['S + S → M', 'M + M → L', 'L → M + M', 'M → S + S']) rc.appendChild(nvEl('', t)); p.appendChild(rc);
  p.appendChild(nvEl('nv-cdet', tr('Ranuras libres') + ': ' + libres + ' · ' + tr('Más tamaño = mucho más daño, alcance y bala')));
  for (const w of armas) { const t = nvTile(w, T.sel.includes(w)); t.onclick = () => { T.sel = T.sel.includes(w) ? T.sel.filter(x => x !== w) : T.sel.concat(w).slice(-2); nvRenderEstacion(S); }; p.appendChild(t); }
  p.appendChild(nvEl('nv-cdet', tr(nvPistaTaller(T.sel))));
  nvBotonesTaller(S, p, T);
  const at = nvEl('nv-boton', tr('Atrás'), 'button'); at.onclick = () => { S.estTaller = null; nvRenderEstacion(S); }; p.appendChild(at);
}
function nvPistaTaller(sel) {
  const [a, b] = sel;
  if (sel.length === 1) return a.tam === 'S' ? 'Toca otra pequeña para unirlas en una mediana' : 'Toca otra del mismo tamaño para unirlas, o divide esta';
  if (sel.length === 2) return nvPuedeUnir(a, b) ? 'Se unen en una ' + (a.tam === 'S' ? 'mediana' : 'grande') : 'Tienen que ser del mismo tamaño y no grandes';
  return 'Toca 2 armas del mismo tamaño para unirlas, o 1 para dividirla';
}
function nvBotonesTaller(S, p, T) {
  const [a, b2] = T.sel;
  const u = nvEl('nv-boton', tr(a && a.tam === 'M' ? 'Unir en una grande' : 'Unir en una mediana'), 'button'); u.disabled = !(T.sel.length === 2 && nvPuedeUnir(a, b2)); u.prepend(nvIcono('taller', 'unir', '#ffd93d', 26));
  u.onclick = () => { nvUneArmas(S, a, b2); T.sel = []; nvRenderEstacion(S); }; p.appendChild(u);
  const uno = T.sel.length === 1 && NV_ANT_TAM[a.tam], ok = uno && nvRanuraLibre(S, a.portador);
  const d = nvEl('nv-boton', tr(a && a.tam === 'L' ? 'Dividir en 2 medianas' : 'Dividir en 2 pequeñas') + (uno && !ok ? ' · ' + tr('sin ranura libre') : ''), 'button'); d.disabled = !ok; d.prepend(nvIcono('taller', 'dividir', '#ffd93d', 26));
  d.onclick = () => { nvDivideArma(S, a); T.sel = []; nvRenderEstacion(S); }; p.appendChild(d);
}
function nvEstacionInicio(S, p, armas) {
  const ti = nvEl('nv-boton', tr('Tienda de módulos') + ' · ' + tr('comprar, mejorar y reciclar'), 'button'); ti.onclick = () => { S.estTienda = { tab: 'comprar', aviso: '' }; nvRenderEstacion(S); }; p.appendChild(ti);
  const ta = nvEl('nv-boton', tr('Taller de tamaños') + ' · ' + tr('unir y dividir armas'), 'button'); ta.onclick = () => { S.estTaller = { sel: [] }; nvRenderEstacion(S); }; p.appendChild(ta);
  p.appendChild(nvEl('nv-cdet', tr('Cambiar un arma')));
  for (const w of armas) { const t = nvTile(w, false); t.onclick = () => { S.estSel = { w, ofertas: nvOfertasEstacion(S, w.slot) }; nvRenderEstacion(S); }; p.appendChild(t); }
}
function nvEstacionSustituir(S, p) {
  p.appendChild(nvEl('nv-cdet', tr('Sustituir') + ': ' + nvNombreArma(S.estSel.w)));
  for (const o of S.estSel.ofertas) {
    const b = nvEl('nv-carta', '', 'button'); b.style.setProperty('--col', NOVA_ARMAS.cargas[o.carga].color); b.disabled = S.cartera < o.precio;
    const V = o.variante ? NV_VAR_ID[o.variante] : null;
    b.appendChild(nvEl('nv-ctipo', tr(NOVA_RAREZAS[o.rareza].nombre).toUpperCase())); b.lastChild.style.color = NOVA_RAREZAS[o.rareza].color;
    b.appendChild(nvEl('nv-cnom', tr(V ? V.nombre : NOVA_ARMAS.portadores[o.portador].nombre) + ' · ' + tr(NOVA_ARMAS.cargas[o.carga].nombre)));
    b.appendChild(nvEl('nv-cdet', tr(V ? V.efecto : NOVA_ARMAS.portadores[o.portador].fuerte) + ' · ' + o.precio));
    nvConIcono(b, 'arma', o.variante || o.portador, NOVA_ARMAS.cargas[o.carga].color, 48);
    b.onclick = () => { nvCompraArma(S, o, S.estSel.w); S.estSel = null; nvRenderEstacion(S); };
    p.appendChild(b);
  }
  const at = nvEl('nv-boton', tr('Atrás'), 'button'); at.onclick = () => { S.estSel = null; nvRenderEstacion(S); }; p.appendChild(at);
}
