// Fans of Pop · PESTAÑA AMIGOS, lo que pasa al tocar (tarea #145, ADR 189): el regalo de Lola, recoger el corazón de un amigo y darle las
// gracias con una frase ya hecha, RECOGER TODO, mandar un corazón a uno o a todos (con su ventana de resumen), añadir y quitar amigos y abrir
// un enlace ?amigo=CODIGO al arrancar. Los corazones se recogen con el buzón de la #96 (PP_CORAZON_SRV.recoger: solo lo que cabe) y el móvil
// suma lo que devuelve (ppSumaVida). La ventana de la lista está en js/pantalla-amigos-ventana.js.
'use strict';
// vuelve a la lista y pide otra vez el latido (lo que ha cambiado se ve al llegar)
const ppAmVuelve = () => { ppAmigosAbre(); };
// lo que se gana (corazones y una ayuda), con los dibujos del juego, como el regalo diario
function ppAmPremioHtml(corazones, ayuda) {
  const h = [];
  if (corazones) h.push(`<span class="pp-precio">${ppIcono('i-vida', 44, '#ff4a6a')}x${corazones}</span>`);
  if (ayuda) h.push(`<span class="pp-precio">${ppIcono('i-' + ayuda, 44, '#ffd1ec')}x1</span>`);
  return `<span class="pp-premios">${h.join(' ')}</span>`;
}
const ppAmLlenoTexto = () => (ppInfinitas() ? tr('Tienes corazones infinitos: vuelve cuando se acaben.') : tr('Tienes los corazones llenos: vuelve cuando gastes uno.'));
const ppAmFiesta = () => { play('ppPremio'); ppVibra([20, 30, 20]); };
/* ---------- el regalo de Lola ---------- */
function ppVentanaLola(aviso = '') {
  const hay = ppAmLolaHay();
  const t = ppAbre(`<h2>${tr('Regalo de Lola')}</h2>`);
  t.classList.add('pp-am');
  t.appendChild(ppCompMini('lola', 120));
  t.appendChild(ppAmEl('p', 'pp-sub', hay ? tr('Hoy: 1 corazón y 1 ayuda sorpresa.') : tr('Ya has abierto el de hoy. ¡Vuelve mañana!')));
  t.appendChild(ppAmEl('p', 'pp-am-tope', tr('Cada día te deja otro. Tus amigos también te pueden mandar.')));
  if (aviso) t.appendChild(ppAmEl('p', 'pp-am-aviso', aviso));
  if (hay) t.appendChild(ppBoton(tr('ABRIR'), 'pp-btn pp-pago', ppAmLolaToca));   // el dorado grande: lo primero que se ve
  const invitar = ppBoton(tr('INVITAR AMIGOS'), 'pp-btn', () => ppAmInvita(invitar));
  const pie = ppAmEl('div', 'pp-am-pie pp-am-pie-suelto');
  pie.append(invitar, ppAmEl('p', 'pp-am-estado'));
  t.append(pie, ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppAmVuelve));
  ppAmEnlacePrepara();
}
function ppAmLolaToca() {
  const r = ppAmLolaAbre();
  if (!r.ok) { ppVentanaLola(r.error === 'lleno' ? ppAmLlenoTexto() : ''); return; }
  ppAmFiesta();
  const t = ppAbre(`<h2>${tr('¡Toma!')}</h2>`);
  t.classList.add('pp-am');
  t.append(ppCompMini('lola', 110), ppAmEl('div', 'pp-rg-premio'));
  t.lastChild.innerHTML = ppAmPremioHtml(r.corazones, r.ayuda);
  t.appendChild(ppBoton(tr('¡GENIAL!'), 'pp-btn', ppAmVuelve));
}
/* ---------- el corazón de un amigo y sus gracias ---------- */
const ppAmEsAmigo = codigo => !!(codigo && ppAmAmigoDe(codigo));
async function ppAmRecogeUno(boton, caja) {
  boton.disabled = true;
  const r = await PP_CORAZON_SRV.recoger(ppVidas(), PP_CFG.vida, ppInfinitas(), 1);
  const suma = r.ok ? PP_CORAZONES_REGLAS.aRecoger(r.recogidos, ppVidas(), PP_CFG.vida, ppInfinitas()) : 0;
  if (suma > 0) { ppSumaVida(suma); PP_AM.sube = true; ppAmFiesta(); }
  ppBuzonRefresca(true);   // el globito del buzón del camino (js/pantalla-buzon.js)
  ppAmigosLatido();
  if (suma > 0) { caja.className = 'pp-rg-premio'; caja.innerHTML = ppAmPremioHtml(suma, null); boton.hidden = true; return; }
  boton.disabled = false;
  caja.className = 'pp-am-aviso';
  caja.textContent = ppAmRecogeAviso(r);
}
// por qué no se ha sumado nada: sin sitio para más corazones, el buzón ya vacío o el motivo del servidor
function ppAmRecogeAviso(r) {
  if (!r.ok) return ppCorazonAviso(r.motivo);
  return PP_CORAZONES_REGLAS.caben(ppVidas(), PP_CFG.vida, ppInfinitas()) ? tr('Ya no queda ningún corazón por recoger.') : ppAmLlenoTexto();
}
function ppAmFrases(codigo, estado) {
  const caja = ppAmEl('div', 'pp-am-frases');
  for (const f of PP_AMIGOS_REGLAS.FRASES) {
    const b = ppBoton(ppAmFraseTexto(f.id), 'pp-am-frase' + (PP_AM.frase === f.id ? ' pp-on' : ''), () => {
      PP_AM.frase = f.id;
      caja.querySelectorAll('.pp-am-frase').forEach(x => x.classList.toggle('pp-on', x === b));
    });
    caja.appendChild(b);
  }
  const manda = ppBoton(tr('MANDAR GRACIAS'), 'pp-btn2 pp-am-ancho', () => ppAmGracias(codigo, manda, estado));
  return [caja, manda];
}
// lo que pasó con el corazón de vuelta de «¡Te devuelvo uno!» (tabla de funciones con tr('literal'), para el control de idioma)
const PP_AM_DEVUELTO = {
  enviado: () => tr('¡Gracias enviadas! Y un corazón de vuelta.'), ya: () => tr('¡Gracias enviadas! El corazón ya se lo mandaste hoy.'),
  lleno: () => tr('¡Gracias enviadas! Hoy ya no le caben más corazones.'),
};
const ppAmDevuelto = c => (PP_AM_DEVUELTO[c] ? PP_AM_DEVUELTO[c]() : tr('¡Gracias enviadas!'));
async function ppAmGracias(codigo, boton, estado) {
  boton.disabled = true;
  const r = await PP_AMIGOS_SRV.gracias(codigo, PP_AM.frase);
  if (!r.ok) { boton.disabled = false; estado.textContent = ppAmAviso(r.motivo); return; }
  estado.textContent = ppAmDevuelto(r.corazon);
  boton.hidden = true;
}
function ppVentanaRegaloAmigo(g) {
  const nombre = ppAmNombre(g);
  const t = ppAbre(`<h2></h2>`);
  t.classList.add('pp-am');
  t.firstChild.textContent = tr('¡{nombre} te manda un corazón!', { nombre });
  const caja = ppAmEl('div', 'pp-rg-premio');
  const recoge = ppBoton(tr('RECOGER'), 'pp-btn2 pp-oro', () => ppAmRecogeUno(recoge, caja));
  t.append(ppAmCara(g.perfil, 110), caja, recoge);
  if (ppAmEsAmigo(g.codigo)) {
    const estado = ppAmEl('p', 'pp-am-estado');
    t.appendChild(ppAmEl('p', 'pp-am-tope', tr('Dale las gracias (si quieres):')));
    t.append(...ppAmFrases(g.codigo, estado), estado);
  }
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppAmVuelve));
}
/* ---------- RECOGER TODO ---------- */
// primero el de Lola (es solo de hoy) y luego los de los amigos que quepan; lo que no cabe se queda esperando
async function ppAmRecogeAmigos() {
  const n = ppAmRegalosN();
  if (!n) return { suma: 0, quedan: 0, aviso: '' };
  const r = await PP_CORAZON_SRV.recoger(ppVidas(), PP_CFG.vida, ppInfinitas(), n);
  if (!r.ok) return { suma: 0, quedan: n, aviso: ppCorazonAviso(r.motivo) };
  const suma = PP_CORAZONES_REGLAS.aRecoger(r.recogidos, ppVidas(), PP_CFG.vida, ppInfinitas());
  if (suma > 0) ppSumaVida(suma);
  return { suma, quedan: r.quedan === null ? n - suma : r.quedan, aviso: '' };
}
function ppAmResultadoTodo(lola, amigos) {
  const corazones = (lola.ok ? 1 : 0) + amigos.suma, algo = corazones > 0;
  if (algo) { PP_AM.sube = true; ppAmFiesta(); }
  const t = ppAbre(`<h2>${algo ? tr('¡Recogido!') : tr('Tus regalos te esperan')}</h2>`);
  t.classList.add('pp-am');
  if (algo) { t.appendChild(ppAmEl('div', 'pp-rg-premio')); t.lastChild.innerHTML = ppAmPremioHtml(corazones, lola.ok ? lola.ayuda : null); }
  const notas = [amigos.aviso];
  if (!lola.ok && lola.error === 'lleno') notas.push(tr('El regalo de Lola te espera: ábrelo cuando gastes un corazón.'));
  if (amigos.quedan > 0 && !amigos.aviso) notas.push(tr('Te quedan {n} en el buzón: recógelos cuando gastes corazones.', { n: amigos.quedan }));
  for (const x of notas.filter(Boolean)) t.appendChild(ppAmEl('p', 'pp-sub', x));
  t.appendChild(ppBoton(algo ? tr('¡GENIAL!') : tr('VOLVER'), algo ? 'pp-btn' : 'pp-btn2 pp-azul', ppAmVuelve));
}
async function ppAmRecogeTodo() {
  const boton = $pp('.pp-am-todo'); if (boton) boton.disabled = true;
  const lola = ppAmLolaHay() ? ppAmLolaAbre() : { ok: false, error: 'ya_abierto' };
  const amigos = await ppAmRecogeAmigos();
  ppBuzonRefresca(true);
  ppAmResultadoTodo(lola, amigos);
  ppAmigosLatido();
}
/* ---------- mandar corazones ---------- */
async function ppAmMandaCorazon(a, boton) {
  boton.disabled = true;
  const r = await PP_AMIGOS_SRV.corazon([a.codigo]);
  if (r.ok && r.resumen.enviados) ppAmFiesta();
  PP_AM.aviso = !r.ok ? ppAmAviso(r.motivo) : r.resumen.enviados ? tr('¡Corazón enviado a {nombre}!', { nombre: ppAmNombre(a) }) : tr('Hoy ya no le caben más.');
  await ppAmigosLatido();
  if (ppAmAbierta()) ppVentanaAmigos();
}
// el título y la frase de la ventana de resumen de «a todos», según el caso de las reglas
function ppAmResumenTextos(s) {
  const titulo = s.enviados === 1 ? tr('¡1 corazón enviado!') : tr('¡{n} corazones enviados!', { n: s.enviados });
  if (s.caso === 'todos') return [titulo, tr('Mañana puedes volver a mandar.')];
  if (s.caso === 'algunos') return [titulo, tr('A {n} de tus amigos ya no les caben más hoy, o ya les mandaste uno.', { n: s.llenos + s.ya })];
  if (s.caso === 'ninguno') return [tr('Hoy ya no se puede mandar más'), tr('Ya les mandaste uno hoy o ya tienen sus 5. ¡Mañana más!')];
  return [tr('Aún no tienes amigos'), tr('Invita a alguien con tu enlace y mandaos corazones.')];
}
function ppAmVentanaResumen(s) {
  if (s.enviados) ppAmFiesta();
  const [titulo, sub] = ppAmResumenTextos(s);
  const t = ppAbre(`<h2></h2><div class="pp-cofre">${ppIcono('i-vida', 84, '#ff4a6a')}</div>`);
  t.classList.add('pp-am');
  t.firstChild.textContent = titulo;
  t.appendChild(ppAmEl('p', 'pp-sub', sub));
  t.appendChild(ppBoton(s.enviados ? tr('¡GENIAL!') : tr('VOLVER'), s.enviados ? 'pp-btn' : 'pp-btn2 pp-azul', ppAmVuelve));
}
async function ppAmCorazonATodos() {
  const boton = $pp('.pp-am-todos'); if (boton) boton.disabled = true;
  const r = await PP_AMIGOS_SRV.corazonATodos();
  if (r.ok) { ppAmVentanaResumen(r.resumen); return; }
  const l = ppAmLatidoBueno();
  if (r.motivo === 'sin_amigos') { ppAmVentanaResumen({ enviados: 0, llenos: 0, ya: 0, caso: l && l.amigos.length ? 'ninguno' : 'sin_amigos' }); return; }
  PP_AM.aviso = ppAmAviso(r.motivo);
  if (ppAmAbierta()) ppVentanaAmigos();
}
/* ---------- añadir y quitar ---------- */
async function ppAmAnade(s, boton) {
  boton.disabled = true;
  const r = await PP_AMIGOS_SRV.anadir(s.codigo);
  PP_AM.aviso = r.ok ? tr('¡{nombre} y tú ya sois amigos!', { nombre: ppAmNombre(s) }) : ppAmAviso(r.motivo);
  if (r.ok) ppAmFiesta();
  await ppAmigosLatido();
  if (ppAmAbierta()) ppVentanaAmigos();
}
async function ppAmQuita(a) {
  const r = await PP_AMIGOS_SRV.quitar(a.codigo);
  PP_AM.hoja = null; PP_AM.quitar = false;
  PP_AM.aviso = r.ok ? tr('{nombre} ya no está en tu lista.', { nombre: ppAmNombre(a) }) : ppAmAviso(r.motivo);
  await ppAmigosLatido();
  if (ppAmAbierta()) ppVentanaAmigos();
}
/* ---------- el enlace ?amigo=CODIGO ---------- */
async function ppAmEnlaceAnade(codigo, aviso, botones) {
  botones.hidden = true;
  const r = await PP_AMIGOS_SRV.anadir(codigo);
  aviso.textContent = r.ok ? tr('¡Ya sois amigos!') : ppAmAviso(r.motivo);
  if (r.ok) ppAmFiesta();
  botones.replaceChildren(ppBoton(tr('VER AMIGOS'), 'pp-btn', ppAmigosAbre), ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
  botones.hidden = false;
}
function ppAmEnlaceBotones(codigo, q, aviso) {
  const botones = ppAmEl('div', 'pp-am-columna');
  if (q.ok && !q.propio && !q.ya) {
    botones.append(ppBoton(tr('AÑADIR'), 'pp-btn', () => ppAmEnlaceAnade(codigo, aviso, botones)), ppBoton(tr('AHORA NO'), 'pp-btn2 pp-azul', ppCierra));
  } else if (q.ok && q.ya) botones.append(ppBoton(tr('VER AMIGOS'), 'pp-btn', ppAmigosAbre), ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
  else botones.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
  return botones;
}
// quien invita: su personaje si llega; si no, el dibujo de AMIGOS de la barra en grande
function ppAmEnlaceCara(q) {
  if (q.perfil) return ppAmCara(q.perfil, 110);
  const caja = ppAmEl('span', 'pp-am-icono-grande');
  caja.innerHTML = `<svg class="pp-barra-ico" viewBox="0 0 48 48" aria-hidden="true">${PP_BARRA_ICONOS.amigos}</svg>`;
  return caja;
}
function ppAmEnlaceTexto(q) {
  if (!q.ok) return ppAmAviso(q.motivo);
  if (q.propio) return ppAmAviso('propio');
  return q.ya ? ppAmAviso('ya') : tr('Así os podéis mandar corazones y retaros a duelos.');
}
function ppAmEnlaceVentana(codigo, q) {
  const invita = q.ok && !q.propio && !q.ya;
  const t = ppAbre('<h2></h2>');
  t.classList.add('pp-am');
  t.firstChild.textContent = invita ? tr('{nombre} te invita a ser amigos', { nombre: q.nombre || tr('Alguien') }) : tr('Enlace de amigo');
  if (invita) t.appendChild(ppAmEnlaceCara(q));
  const aviso = ppAmEl('p', 'pp-sub', ppAmEnlaceTexto(q));
  t.append(aviso, ppAmEnlaceBotones(codigo, q, aviso));
}
// al arrancar con ?amigo=CODIGO y el flag abierto: espera a los flags y a la cuenta, pregunta quién es y lo enseña cuando no haya otra
// ventana abierta (como el enlace de corazón, js/pantalla-corazones-enlace.js); luego quita el código de la dirección
function ppAmigosEnlaceArranca() {
  const codigo = AMIGOS.codigoDe(location.search);
  if (!codigo) return;
  setTimeout(async () => {
    if (!ppAmigosActivo()) return;
    await ppCorazonEsperaCuenta(10);
    const q = await PP_AMIGOS_SRV.quien(codigo);
    await ppCorazonEsperaHueco();
    ppAmEnlaceVentana(codigo, q);
    AMIGOS.quitaCodigoUrl();
  }, 2500);
}
