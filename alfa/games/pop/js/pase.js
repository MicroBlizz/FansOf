// Fans of Pop · PASE, RACHA y REGALO DIARIO («copiarnos de Candy Crush», Daniel, 30-10-2026). Todo fijo, sin azar (ADR 004).
// · PASE DE TEMPORADA (un mes natural): cada nivel nuevo superado da 1 punto (2 con 3 estrellas); cada PP_CFG.pase.puntos puntos
//   se sube un escalón. Cada escalón tiene un premio GRATIS y uno PREMIUM; el premium se desbloquea pagando el pase una vez por
//   temporada. Los premios se recogen a mano (el botón del pase brilla cuando hay alguno).
// · RACHA: cada nivel nuevo seguido sin perder un corazón suma 1 (hasta PP_CFG.racha.max) y da esos toques de más al empezar
//   los niveles normales (partida.js); perder un corazón la corta (monedero.js).
// · REGALO DIARIO: uno al día, el mismo para cada día de la semana (el domingo, el gordo). Como la ruleta de Candy Crush, pero sin
//   azar.
'use strict';
/* ---------- tras ganar un nivel nuevo ---------- */
function ppPremiosCandy(d, estrellas) {
  SAVE.racha = Math.min(PP_CFG.racha.max, (SAVE.racha || 0) + 1); ppTutorial('racha');
  ppMeteHucha(d.jefe);
  const P = ppPaseAlDia(); P.puntos += 1 + (estrellas === 3 ? 1 : 0);
  ppGuarda();
}
/* ---------- el pase ---------- */
const ppTemporada = () => ppHoy().slice(0, 7);   // «2026-10»
// el pase de esta temporada (si cambia el mes, empieza uno nuevo)
function ppPaseAlDia() {
  if (!SAVE.pase || SAVE.pase.t !== ppTemporada()) SAVE.pase = { t: ppTemporada(), puntos: 0, premium: false, gratis: {}, prem: {} };
  return SAVE.pase;
}
// el escalón: con el flag 'pase-nuevo', de los puntos nuevos (js/pase-nuevo.js); si no, el de siempre (uno cada 3 puntos)
const ppEscalon = () => (ppPaseNuevo() ? PP_PASE_R.escalon(ppPasePuntos()) : Math.min(PP_CFG.pase.escalones, Math.floor(ppPaseAlDia().puntos / PP_CFG.pase.puntos)));
// los premios de cada escalón (k desde 1). El gratis: monedas y alguna ayuda; el premium: perlas, ayudas, corazones infinitos y,
// al final, una bandeja que solo da el pase
function ppPremioPase(k, premium) {
  if (!premium) return k % 5 === 0 ? { ayudas: { [['martillo', 'bomba', 'toques3', 'pista', 'deshacer', 'martillo'][(k / 5) - 1]]: 1 } } : { monedas: 20 + 5 * Math.floor(k / 3) };
  if (k === PP_CFG.pase.escalones) return { bandeja: 'dorada', perlas: 20 };
  if (k % 10 === 0) return { infinitas: 60 };
  if (k % 3 === 0) return { ayudas: { [['bomba', 'martillo', 'toques3', 'deshacer', 'pista'][(k / 3) % 5]]: 2 } };
  return { perlas: 3 + Math.floor(k / 10) };
}
// el premio de un escalón tal como se ve y se da: con el flag `companeros`, el de siempre más su compañero (la Suricata en el gratis;
// la Luciérnaga y el Caballito de mar en el premium; js/companeros-datos.js, VIAS). Con el flag cerrado, el de siempre
function ppPremioPaseCon(k, premium) {
  if (ppPaseNuevo()) return ppPremioPaseNuevo(k, premium);   // los del tema del mes (js/pase-nuevo.js)
  const p = ppPremioPase(k, premium), id = ppCompanerosActivo() ? PP_COLE.delPase(k, premium) : null;
  return id ? { ...p, companero: id } : p;
}
// los premios por recoger (reglas en js/pase-reglas.js); con el flag 'pase-nuevo', también los escalones extra ({ extra: true })
const ppPaseListos = () => [...PP_PASE_R.listos(ppPaseAlDia(), ppEscalon()), ...(ppPaseNuevo() ? ppPaseExtrasListos() : [])];
const ppPaseHayPremio = () => ppPaseListos().length > 0;
// entrega un premio del pase (con su clave, para que el servidor no cobre dos veces sus perlas) y lo marca cogido
function ppPaseEntrega(k, premium, extra) {
  if (extra) { ppPaseEntregaExtra(); return; }   // un escalón extra (js/pase-nuevo.js)
  const P = ppPaseAlDia();
  ppDaPremio(ppPremioPaseCon(k, premium), { motivo: 'pase', clave: PP_PASE_R.clave(P.t, premium, k) });
  (premium ? P.prem : P.gratis)[k] = true;
}
// vuelve a pintar la ventana sin mover la lista
function ppPaseRepinta() {
  ppPintaLateral();
  if ($pp('#pp-modal').hidden || !$pp('#pp-tarjeta.pp-pase-ventana')) return;   // la cerraste mientras volaban: no se vuelve a abrir
  const l = $pp('.pp-pase'), y = l ? l.scrollTop : 0;
  ppVentanaPase(true); const l2 = $pp('.pp-pase'); if (l2) l2.scrollTop = y; ppPintaLateral();
}
function ppPaseCabecera(P, e) {
  const C = PP_CFG.pase, falta = C.puntos - (P.puntos % C.puntos);
  const finMes = new Date(); finMes.setMonth(finMes.getMonth() + 1, 1); finMes.setHours(0, 0, 0, 0);
  return `<h2>${tr('Pase de Pop')}</h2>
    <p class="pp-sub">${tr('Escalón {e} de {t}', { e, t: C.escalones })} · ${e < C.escalones ? tr('faltan {n} puntos para el siguiente', { n: falta }) : tr('¡pase completo!')}</p>
    <p class="pp-sub"><small>${tr('Ganas puntos al pasar niveles nuevos (uno más con 3 estrellas). Se renueva en {d} días.', { d: Math.ceil((finMes - Date.now()) / 86400000) })}</small></p>`;
}
function ppPaseBotonPremium(t) {
  const C = PP_CFG.pase;
  const b = ppBoton('', 'pp-btn', () => ppCompraEuros(tr('Pase de Pop'), `<p>${tr('Desbloquea todos los premios premium de esta temporada.')}</p>`, C.id, () => { ppPaseAlDia().premium = true; ppGuarda(); ppVentanaPase(); ppPintaLateral(); }));
  b.innerHTML = `${ppIcono('i-pase', 30, '#ffd64a')} ${tr('DESBLOQUEAR PREMIUM · {p}', { p: C.precio })}`;
  t.appendChild(b);
}
// la caja de un premio (gratis o dorado) del escalón k
function ppPaseCaja(P, e, k, premium) {
  const caja = document.createElement('button'); caja.type = 'button';
  const cogido = premium ? P.prem[k] : P.gratis[k], puede = k <= e && !cogido && (!premium || P.premium);
  caja.className = 'pp-pase-premio' + (premium ? ' pp-premium' : '') + (cogido ? ' pp-cogido' : '') + (puede ? ' pp-listo' : '');
  caja.dataset.k = k; caja.dataset.p = premium ? 'p' : 'g';
  caja.innerHTML = ppPremioCandyHtml(ppPremioPaseCon(k, premium), 24) + (premium && !P.premium ? '<s></s>' : '');
  caja.onclick = () => ppPaseRecoge([{ k, premium }]);
  return caja;
}
function ppVentanaPase(repinta = false) {
  if (ppPaseNuevo()) { ppVentanaPaseNueva(repinta); return; }   // el pase completo (js/pase-pantalla.js, tarea #165)
  if (!repinta) ppTutorial('pase');
  const P = ppPaseAlDia(), e = ppEscalon(), C = PP_CFG.pase, desde = { monedas: SAVE.monedas, perlas: SAVE.perlas || 0 };
  const t = ppAbre(ppPaseCabecera(P, e), true);
  t.classList.add('pp-pase-ventana');
  ppVicBarra(desde.monedas);   // la barra de arriba (corazones, monedas y perlas), la misma de la victoria (js/victoria-panel.js)
  if (!P.premium) ppPaseBotonPremium(t);
  const n = ppPaseListos().length, todo = ppBoton(n ? tr('RECOGER TODO ({n})', { n }) : tr('Nada que recoger'), 'pp-btn2 pp-verde pp-pase-todo', () => ppPaseRecoge(ppPaseListos()));
  todo.disabled = !n; t.appendChild(todo);
  const lista = document.createElement('div'); lista.className = 'pp-pase';
  for (let k = 1; k <= C.escalones; k++) {
    const fila = document.createElement('div'); fila.className = 'pp-pase-fila' + (k <= e ? ' pp-hecho' : '');
    fila.innerHTML = `<i>${k}</i>`;
    fila.append(ppPaseCaja(P, e, k, false), ppPaseCaja(P, e, k, true));
    lista.appendChild(fila);
  }
  t.appendChild(lista);
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
  // abre por el primer premio que se puede recoger (o por donde vas)
  if (!repinta) setTimeout(() => { const l = $pp('.pp-pase'), f = l && (l.querySelector('.pp-listo') || l.children[Math.max(0, e - 1)]); if (l && f) l.scrollTop = f.offsetTop - l.offsetTop - 10; }, 0);
}
/* ---------- recoger (uno o todos, tarea #166) ---------- */
// entrega los premios `lista` ([{ k, premium }]) y los hace volar a la barra de arriba; los números suben al llegar
function ppPaseRecoge(lista) {
  const listos = ppPaseListos().filter(p => lista.some(q => q.k === p.k && q.premium === p.premium && !q.extra === !p.extra));
  if (!listos.length) return;
  const antes = { monedas: SAVE.monedas, perlas: SAVE.perlas || 0 };
  const sel = p => (p.extra ? '.pp-pase-extra .pp-ico' : `.pp-pase-premio[data-k="${p.k}"][data-p="${p.premium ? 'p' : 'g'}"] .pp-ico`);
  const iconos = [...new Set(listos.flatMap(p => [...document.querySelectorAll(sel(p))]))].filter(ppPaseSeVe);
  for (const p of listos) ppPaseEntrega(p.k, p.premium, p.extra);
  ppGuarda(); play('ppPremio'); ppVibra([20, 30, 20]);
  document.querySelectorAll('.pp-pase-todo, .pp-pase-premio.pp-listo').forEach(b => { b.disabled = true; b.classList.remove('pp-listo'); });
  ppPaseVuela(iconos, antes, ppPaseRepinta);
}
// solo vuelan los iconos que se ven en la lista (los de las filas de fuera saldrían de debajo de la ventana)
function ppPaseSeVe(i) {
  const l = i.closest('.pp-pase'), a = i.getBoundingClientRect(), b = l ? l.getBoundingClientRect() : a;
  return a.bottom > b.top && a.top < b.bottom;
}
// cada icono vuela a su sitio de la barra (monedas, perlas o, lo demás, al centro); al final, `fin()`
function ppPaseVuela(iconos, antes, fin) {
  const barra = $pp('#pp-modal .pp-vic-arriba'), vuelan = iconos.slice(0, PP_PASE_VUELO.max);
  if (!barra || !vuelan.length) { fin(); return; }
  const destino = i => barra.querySelector(i.dataset.i === 'i-moneda' ? '.pp-vic-caja-mon .pp-ico' : i.dataset.i === 'i-perla' ? '.pp-vic-caja-per .pp-ico' : '.pp-vic-vidas') || barra;
  let llegadas = 0;
  const llega = () => {
    llegadas++; play('ppPop', llegadas);
    if (llegadas === 1) ppPaseCuentas(antes, vuelan.length);
    if (llegadas === vuelan.length) setTimeout(fin, 350);
  };
  vuelan.forEach((i, n) => ppVicVuelaNodo(i, i.getBoundingClientRect(), destino(i).getBoundingClientRect(), n * PP_PASE_VUELO.cada, llega));
}
const PP_PASE_VUELO = Object.freeze({ max: 16, cada: 70 });   // cuántos iconos vuelan como mucho y cada cuántos ms sale uno
// los números de la barra suben de lo que había a lo que hay mientras llegan los iconos
function ppPaseCuentas(antes, n) {
  const seg = (n * PP_PASE_VUELO.cada + 300) / 1000;
  ppVicCuenta($pp('#pp-modal .pp-vic-mon'), antes.monedas, SAVE.monedas, seg, 0);
  ppVicCuenta($pp('#pp-modal .pp-vic-per'), antes.perlas, SAVE.perlas || 0, seg, 0);
  document.querySelectorAll('#pp-modal .pp-vic-caja').forEach(c => { c.classList.remove('pp-brilla'); void c.offsetWidth; c.classList.add('pp-brilla'); });
}
/* ---------- regalo diario ---------- */
// el día de la semana (lunes = 0) decide el regalo; el domingo, el más gordo
const PP_REGALOS = [{ monedas: 30 }, { ayudas: { martillo: 1 } }, { monedas: 50 }, { ayudas: { toques3: 1 } }, { perlas: 2 }, { ayudas: { bomba: 1 } },
  { perlas: 5, ayudas: { martillo: 1, bomba: 1 }, infinitas: 30 }];
const ppDiaSemana = () => (new Date().getDay() + 6) % 7;
function ppVentanaRegalo() {
  ppTutorial('regalo');
  const hoy = ppDiaSemana(), cogido = SAVE.regaloDia === ppHoy();
  const dias = [tr('Lun'), tr('Mar'), tr('Mié'), tr('Jue'), tr('Vie'), tr('Sáb'), tr('Dom')];
  const t = ppAbre(`<h2>${tr('Regalo diario')}</h2><p class="pp-sub">${cogido ? tr('Ya has abierto el de hoy. ¡Vuelve mañana!') : tr('¡Uno cada día! El del domingo es el más gordo.')}</p>`, true);
  const sem = document.createElement('div'); sem.className = 'pp-semana';
  PP_REGALOS.forEach((p, k) => {
    const d = document.createElement('div'); d.className = 'pp-dia' + (k === hoy ? ' pp-hoy' : '') + (k === 6 ? ' pp-gordo' : '');
    d.innerHTML = `<b>${dias[k]}</b>${ppPremioCandyHtml(p, 22)}`; sem.appendChild(d);
  });
  t.appendChild(sem);
  if (!cogido) t.appendChild(ppBoton(tr('¡ABRIR!'), 'pp-btn', () => {
    ppDaPremio(PP_REGALOS[hoy], { motivo: 'regalo', clave: 'regalo:' + ppHoy() }); SAVE.regaloDia = ppHoy(); ppGuarda(); play('ppVictoria'); ppVibra([20, 30, 20]);
    const t2 = ppAbre(`<h2>${tr('¡Toma!')}</h2><div class="pp-cofre">${ppIcono('i-regalo', 100, '#9cf0a0')}</div>${ppPremioCandyHtml(PP_REGALOS[hoy], 40)}`);
    t2.appendChild(ppBoton(tr('¡GENIAL!'), 'pp-btn', ppCierra)); ppPintaLateral();
  }));
  else t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
}
// al llegar al camino: el regalo del día si no se ha abierto (una vez por sesión) o el pack de bienvenida cuando toca
function ppAlLlegarAlCamino() {
  if (PP_PANT.actual !== 'mapa' || !$pp('#pp-modal').hidden) return;   // solo si sigues en el camino (no al entrar en un nivel)
  if (ppPrimerosEstreno()) return;   // partida nueva: Lola estrena lo que se acaba de abrir (js/primeros-pasos-juego.js, tarea #140)
  if (ppMiraBienvenida()) return;
  if (ppPrimerosVe('feria') && ppFeriaAlLlegar()) return;   // premios de la feria entregados solos o su bienvenida (js/feria-pantalla.js)
  if (SAVE.regaloDia !== ppHoy() && !PP_PASE_VISTO.regalo && ppPrimerosVe('regalo')) { PP_PASE_VISTO.regalo = true; ppVentanaRegalo(); }
}
const PP_PASE_VISTO = { regalo: false };
