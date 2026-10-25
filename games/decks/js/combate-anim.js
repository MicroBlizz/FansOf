// Fans Of Decks · Las animaciones de la reunión: el rival que embiste, se escuda o manda Spam, los impactos, las cifras flotantes
// y los iconos que vuelan, con sus sonidos (js/sonido.js); la carta jugada que vuela a su blanco, el reparto de la mano y los rótulos. combate-ui.js llama a dcPintaEventos después de pintar; mientras dura, la mano no responde (.dc-ocupado).
'use strict';
// Lo que pasó, animado en orden: cada 'accion' de un rival (o compañero) abre un tramo de medio segundo en el que ese actor se mueve y,
// un poco después, caen sus cifras (daño, cura, bloqueo) con su icono sobre quien las recibe; el golpeado tiembla. Devuelve lo que dura todo.
const DC_PASO = 520;
function dcPintaEventos(C) {
  const s = document.getElementById('dc-combate'), evs = C.eventos.splice(0);
  let total = 0, t = 0, enTramo = false, k = 0, lider = false;
  for (const e of evs) {
    if (e.t === 'accion') { t = total; total += DC_PASO; enTramo = true; k = 0; dcAnimaAccion(s, e, t + 40); continue; }
    const retardo = (enTramo ? t + 230 : 140) + k * 110; k++;
    dcAnimaEvento(s, e, retardo);
    if (!enTramo && e.t === 'dano' && e.r >= 0 && !lider) { lider = true; dcClase(s.querySelector('.dc-lider-arte'), 'dc-brinca', 60); }
  }
  if (!enTramo && evs.length) total = 400 + k * 110;
  // el rival que cae: destello, estallido de chispas y su sonido, a la vez que se desvanece (.dc-sale)
  s.querySelectorAll('.dc-rival.dc-sale').forEach(rv => setTimeout(() => { play('dcKO'); dcOnda(rv.querySelector('.dc-rival-arte'), '#ffffff'); }, 720));
  return total ? total + 250 : 0;
}
function dcClase(el, cls, retardo, dura) { if (!el) return; setTimeout(() => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), dura || 700); }, retardo || 0); }
// El actor se mueve: el rival embiste, se escuda, cura, manda el sobre de Spam, se potencia…; el compañero brinca.
function dcAnimaAccion(s, e, retardo) {
  if (e.comp !== undefined) return dcClase(s.querySelectorAll('.dc-comp')[e.comp], 'dc-brinca', retardo);
  const rv = s.querySelector('.dc-rival[data-rival="' + e.r + '"]'); if (!rv) return;
  dcClase(rv, 'dc-acto-' + e.tipo, retardo);
  setTimeout(() => play({ ataque: 'dcEmbiste', spam: 'dcPapel', defensa: 'dcEscudo', cura: 'heal', refuerzo: 'dcPoder', fuerza: 'dcPoder', debil: 'dcDebil', aturdido: 'deny' }[e.tipo] || 'pop'), retardo);
  if (e.tipo === 'spam') setTimeout(() => dcVuela(rv.querySelector('.dc-rival-arte'), s.querySelector('.dc-pila-desc'), 'spam', '#f3a6ff'), retardo + 120);
  if (e.tipo === 'ataque') setTimeout(() => dcVuela(rv.querySelector('.dc-rival-arte'), s.querySelector(e.blanco !== undefined ? '.dc-eq-jug[data-j="' + e.blanco + '"] .dc-eq-arte' : '.dc-lider-arte'), 'ataque', '#ff4b5c', 260), retardo + 60);
  if (e.tipo === 'cura' || e.tipo === 'refuerzo') setTimeout(() => dcImpacto(rv.querySelector('.dc-rival-arte'), e.tipo), retardo + 150);
}
// Una cifra flotante con su icono sobre quien la recibe.
function dcAnimaEvento(s, e, retardo) {
  const obj = e.j !== undefined ? s.querySelector('.dc-eq-jug[data-j="' + e.j + '"] .dc-eq-arte') : e.r < 0 ? s.querySelector('.dc-lider-arte') : s.querySelector('.dc-rival[data-rival="' + e.r + '"] .dc-rival-arte'); if (!obj) return;
  setTimeout(() => {
    const f = dcEl('span', 'dc-flot dc-flot-' + (e.t === 'falla' ? 'esquiva' : e.t), e.t === 'dano' ? '−' + e.n : e.t === 'cura' ? '+' + e.n : e.t === 'bloqueo' ? '+' + e.n : e.t === 'falla' ? tr('Sala llena') : tr('Bloqueado'));
    obj.append(f); setTimeout(() => f.remove(), 1300);
    if (e.t !== 'falla') dcImpacto(obj, e.t === 'dano' ? 'ataque' : e.t === 'cura' ? 'cura' : 'defensa');
    if (e.t === 'dano') dcClase(obj.parentElement, 'dc-tiembla', 0, 450);
    if (e.t === 'dano' && e.n >= 10) { dcClase(s.querySelector('.dc-escala'), 'dc-temblor', 0, 420); play('dcGolpeGordo'); }   // los golpes gordos sacuden la sala
    else play(e.t === 'dano' ? (e.r < 0 ? 'dcAuch' : 'dcGolpe') : e.t === 'bloqueo' ? 'dcEscudo' : e.t === 'cura' ? 'heal' : e.t === 'falla' ? 'deny' : 'clank');
  }, retardo);
}
// Un icono que estalla sobre un objetivo.
function dcImpacto(obj, icono) { if (!obj) return; const i = dcEl('span', 'dc-impacto dc-impacto-' + icono); i.append(dcSvg(icono)); obj.append(i); setTimeout(() => i.remove(), 700); }
// Un icono que vuela de un elemento a otro (el sobre de Spam hacia los descartes, el golpe hacia el líder).
function dcVuela(de, a, icono, color, dura) {
  if (!de || !a) return; const st = document.getElementById('stage').getBoundingClientRect(), r1 = de.getBoundingClientRect(), r2 = a.getBoundingClientRect();
  const v = dcEl('span', 'dc-vuelo'); v.append(dcSvg(icono)); v.style.color = color; v.style.left = (r1.left + r1.width / 2 - st.left - 16) + 'px'; v.style.top = (r1.top + r1.height / 2 - st.top - 16) + 'px';
  document.getElementById('stage').append(v);
  const dx = (r2.left + r2.width / 2) - (r1.left + r1.width / 2), dy = (r2.top + r2.height / 2) - (r1.top + r1.height / 2);
  if (v.animate) v.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 0 }, { transform: `translate(${dx * 0.3}px, ${dy * 0.3 - 30}px) scale(1.2)`, opacity: 1, offset: .35 }, { transform: `translate(${dx}px, ${dy}px) scale(.8)`, opacity: 0 }], { duration: dura || 520, easing: 'cubic-bezier(.3,.7,.4,1)' }).onfinish = () => v.remove(); else v.remove();
}
// Un rótulo que cruza la pantalla (turno nuevo, hora de cierre), con su sonido.
function dcRotulo(texto, alarma) {
  const s = document.getElementById('dc-combate'), viejo = s.querySelector('.dc-rotulo'); if (viejo) viejo.remove();
  const r = dcEl('div', 'dc-rotulo' + (alarma ? ' dc-rotulo-alarma' : '')); r.append(dcEl('b', 'ol', texto)); s.append(r);
  play(alarma ? 'horn' : 'dcTurno');
  setTimeout(() => r.remove(), 1300);
}
// Turno nuevo: las cartas salen del mazo una tras otra (con su chasquido) hasta su sitio en el abanico.
function dcReparteMano(mano, retardo) {
  [...mano.querySelectorAll('.dc-carta')].forEach((el, k) => {
    const d = retardo + k * 90; el.style.setProperty('--d', d + 'ms'); el.classList.add('dc-reparte');
    setTimeout(() => play('dcReparte'), d); setTimeout(() => el.classList.remove('dc-reparte'), d + 500);
  });
}
// Hacia dónde va una carta jugada: al rival que golpea, a la zona de rivales si es de área, o al líder si es para ti.
function dcDestinoJugada(C, c, k) {
  const s = document.getElementById('dc-combate'), fx = c ? dcFx(c) : {};
  if (fx.dano || fx.debil || fx.vulnerable || fx.aturde) {
    if (fx.obj === 'todos' || fx.cond === 'atacantes' || fx.companero || fx.protocolo) return s.querySelector('.dc-rivales');
    return s.querySelector('.dc-rival[data-rival="' + k + '"] .dc-rival-arte') || s.querySelector('.dc-rivales');
  }
  return s.querySelector('.dc-lider-arte');
}
// El sonido de su tipo y una onda de su color donde cae, con chispas.
const DC_SON_TIPO = { empleado: 'dcEmpleado', tarea: 'dcTarea', tramite: 'dcTramite', directiva: 'dcDirectiva', companero: 'dcCompanero', protocolo: 'dcProtocolo' };
const DC_COLOR_TIPO = { empleado: '#ff4b5c', tarea: '#2fc7b3', tramite: '#4aa8f0', directiva: '#ff9a3c', companero: '#f2b62a', protocolo: '#8f7bff' };
function dcEfectoJugada(c, destino, retardo) {
  const D = c && DC_CARTAS[c.id]; if (!D) return;
  play(DC_SON_TIPO[D.tipo] || 'card');
  setTimeout(() => dcOnda(destino, DC_COLOR_TIPO[D.tipo] || '#ffcb3d'), retardo || 0);
}
function dcOnda(el, color) {
  const st = document.getElementById('stage'); if (!el || !st) return;
  const sr = st.getBoundingClientRect(), r = el.getBoundingClientRect(), x = r.left + r.width / 2 - sr.left, y = r.top + r.height / 2 - sr.top;
  const o = dcEl('span', 'dc-onda'); o.style.left = x + 'px'; o.style.top = y + 'px'; o.style.setProperty('--tc', color); st.append(o); setTimeout(() => o.remove(), 650);
  if (!document.body.animate) return;
  for (let k = 0; k < 8; k++) {
    const ch = dcEl('span', 'dc-chispa'), a = k / 8 * Math.PI * 2 + Math.random() * .4, d = 46 + Math.random() * 34;
    ch.style.left = x + 'px'; ch.style.top = y + 'px'; ch.style.background = color; st.append(ch);
    ch.animate([{ transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(.2)`, opacity: 0 }], { duration: 480 + Math.random() * 160, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => ch.remove();
  }
}
// La carta i de la mano vuela hacia donde va (el rival k, la zona de rivales o el líder), crece un poco y estalla en su color.
function dcAnimaCarta(i, k) {
  const C = DCC.C, s = document.getElementById('dc-combate'), el = s.querySelector('.dc-mano .dc-carta[data-mano="' + i + '"]'), c = C.mano[i];
  const destino = dcDestinoJugada(C, c, k);
  if (!el || !el.animate) { dcEfectoJugada(c, destino); return; }
  const st = document.getElementById('stage').getBoundingClientRect(), a = el.getBoundingClientRect(), b = (destino || s).getBoundingClientRect();
  const g = dcClonaCarta(el); g.className = 'dc-carta dc-carta-vuela ' + el.className.replace('dc-elegida', ''); g.style.cssText = el.style.cssText;
  g.style.left = (a.left - st.left) + 'px'; g.style.top = (a.top - st.top) + 'px'; g.style.width = a.width + 'px';
  document.getElementById('stage').append(g);
  const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
  g.animate([{ transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 }, { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 40}px) rotate(${dx > 0 ? 8 : -8}deg) scale(1.2)`, opacity: 1, offset: 0.45 }, { transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(0.45)`, opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.3,.6,.4,1)' }).onfinish = () => g.remove();
  dcEfectoJugada(c, destino, 300);
}
