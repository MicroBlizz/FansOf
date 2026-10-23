// Fans of Rouflage · EL TÍTULO (el de 6 botones, boceto aprobado por Daniel el 23-10-2026): arriba tu galleta con tu nombre (abre el PERFIL) y tus
// monedas; la tira del premio diario; JUGAR (contra bots: abre la pantalla de papel y mapa con el último papel que elegiste); EN LÍNEA · PvP;
// dos tarjetas (misiones de hoy y talentos) y abajo ARMARIO, PASE, TIENDA y AMIGOS. Lo que antes eran botones sueltos del título vive ahora en otro
// sitio: el GACHAPÓN dentro de la TIENDA y MI ESCENARIO, PREMIO DIARIO, CÓMO SE JUEGA y OPCIONES dentro del PERFIL (pantallas-html.js).
// Todo se refresca al volver al título (irTitulo llama a refrescaTitulo).
'use strict';

const TIT = { nombre: '', pedido: false };

// las dos monedas en el título: la gota arcoíris (pintaGotas, diario.js) y la acción (el icono de la tienda)
function titMoneda(id, n, dibuja) {
  const el = E(id); if (!el) return;
  el.innerHTML = '';
  const k = arLienzo(22, 22); arPinta(k, (c, w) => dibuja(c, w)); el.appendChild(k);
  const b = document.createElement('b'); b.textContent = Number(n || 0).toLocaleString(IDIOMA_RF === 'en' ? 'en-US' : 'es-ES'); el.appendChild(b);
}

function refrescaTitulo() {
  ecoEstado();
  titMoneda('tit-gotas', SAVE.gotas, pintaGotas);
  titMoneda('tit-acciones', SAVE.acciones, pintaAcciones);
  // tu galleta vestida, tu nombre y el nivel del pase
  arPinta(E('tit-yo-dib'), (c, w, h) => ARD.vestida(c, w, h * 0.94, Object.assign({ esc: h / 96 }, ropaDe(null))));
  E('tit-nombre').textContent = TIT.nombre || tr('Fan sin nombre');
  E('tit-nivel').textContent = tr('Nivel {n}', { n: paseNivel() });
  // MI PERFIL brilla y lleva su punto hasta que lo abres por primera vez (dentro están MI ESCENARIO, OPCIONES…)
  let visto = false; try { visto = localStorage.getItem('rouflage-perfil-visto') === '1'; } catch (_) { /* sin guardar */ }
  E('b-perfil').classList.toggle('nuevo', !visto);
  if (!TIT.pedido && typeof CUENTA !== 'undefined' && CUENTA.perfil) {
    TIT.pedido = true;
    Promise.resolve(CUENTA.perfil()).then(p => { if (p && p.nombre) { TIT.nombre = p.nombre; E('tit-nombre').textContent = p.nombre; } }).catch(() => {});
  }
  // la tira del premio diario
  const d = diarioTira();
  E('tit-racha-t').textContent = d.t; E('tit-racha-s').textContent = d.s;
  E('tit-racha-b').textContent = d.b; E('tit-racha-b').hidden = !d.b;
  E('b-diario').classList.toggle('hecho', !d.b);
  // misiones de hoy
  const mis = misionesDeHoy(), hechas = mis.filter(m => misionHecha(m) || misionCobrada(m)).length, cobrar = mis.some(m => misionHecha(m) && !misionCobrada(m));
  E('tit-mis-t').textContent = cobrar ? tr('¡Premio por cobrar!') : tr('{n} de {t} hechas', { n: hechas, t: mis.length });
  E('tit-mis-b').style.width = Math.round(hechas / Math.max(1, mis.length) * 100) + '%';
  // talentos: el nivel de becario y el de colado
  const nb = talNivel('becario'), nc = talNivel('colado');
  E('tit-tal-t').textContent = tr('Becario {b} · Colado {c}', { b: nb, c: nc });
  E('tit-tal-b').style.width = Math.round((nb + nc) / (2 * TALENTOS.max) * 100) + '%';
  // la TIENDA lleva su cartel de OFERTA mientras no hayas cogido el Pack de inicio
  E('tit-oferta').hidden = !!(SAVE.tienda && SAVE.tienda.inicio);
  if (typeof titAmigosEnLinea === 'function') titAmigosEnLinea();
  titGuarda();
}

// GUARDA LO QUE HAS GANADO: a quien juega como invitado (sin cuenta), desde su tercera partida y como mucho una vez al día, se le recuerda que si
// borra el navegador o cambia de móvil lo pierde. GUARDAR abre la ventana de la cuenta (la de core: Google o email); es la misma cuenta, no se pierde nada
const titJugadas = () => { try { return +localStorage.getItem('rouflage-jugadas') || 0; } catch (_) { return 0; } };
function titGuarda() {
  const caja = E('tit-guarda'); if (!caja) return;
  let hoy = ''; try { hoy = localStorage.getItem('rouflage-guarda-visto') || ''; } catch (_) { /* sin guardar */ }
  const invitado = typeof CUENTA !== 'undefined' && CUENTA.activa && CUENTA.invitado;
  caja.hidden = !(invitado && titJugadas() >= 3 && hoy !== fechaHoy() && window.filaCuenta);
  if (!caja.hidden) {
    const [t] = arCuenta();
    E('tit-guarda-t').textContent = tr('Llevas {g} gotas y {c} cosas del armario. Si cambias de móvil o borras el navegador, se pierden.', { g: SAVE.gotas || 0, c: t });
  }
}

function preparaTitulo() {
  // JUGAR: la pantalla de papel y mapa, con el último papel que elegiste marcado
  let papel = 'camaleon'; try { papel = localStorage.getItem('rouflage-papel') === 'cazador' ? 'cazador' : 'camaleon'; } catch (_) { /* sin guardar */ }
  E('b-jugar').onclick = () => abreBots(papel);
  const jugar = E('b-bots-jugar').onclick;
  E('b-bots-jugar').onclick = ev => { papel = BOTS.modo; try { localStorage.setItem('rouflage-papel', papel); } catch (_) { /* sin guardar */ } jugar(ev); };
  // AMIGOS (amigos.js; mientras no esté, invitar a un amigo: referidos.js)
  E('b-social').onclick = () => { play('select'); if (typeof abreAmigos === 'function') abreAmigos(); else if (typeof abreInvita === 'function') abreInvita(); };
  E('b-perfil').addEventListener('click', () => { try { localStorage.setItem('rouflage-perfil-visto', '1'); } catch (_) { /* sin guardar */ } E('b-perfil').classList.remove('nuevo'); });
  // lo que ahora está dentro del PERFIL vuelve al PERFIL, no al título
  E('b-pf-diario').onclick = abreDiario;
  E('b-ayuda').onclick = () => { play('select'); muestraAyuda(abrePerfil); };
  E('b-opciones-ok').onclick = () => { play('select'); abrePerfil(); };
  // cuántas partidas llevas en este navegador (para el aviso de guardar el progreso): se cuenta al acabar cada una
  const fin = economiaPartida;
  economiaPartida = r => { try { localStorage.setItem('rouflage-jugadas', String(titJugadas() + 1)); } catch (_) { /* sin guardar */ } return fin(r); };
  const luego = () => { try { localStorage.setItem('rouflage-guarda-visto', fechaHoy()); } catch (_) { /* sin guardar */ } E('tit-guarda').hidden = true; };
  E('b-guarda-si').onclick = () => { play('select'); luego(); abreCuenta(); };
  E('b-guarda-no').onclick = () => { play('select'); luego(); };
  // el gachapón está dentro de la tienda: al salir vuelve a la tienda
  E('b-gacha-volver').onclick = () => { if (GACHA_UI.ocupado) return; clearInterval(_gachaReloj); abreTienda('titulo'); };
}
