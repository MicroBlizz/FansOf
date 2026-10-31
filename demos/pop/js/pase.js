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
const ppEscalon = () => Math.min(PP_CFG.pase.escalones, Math.floor(ppPaseAlDia().puntos / PP_CFG.pase.puntos));
// los premios de cada escalón (k desde 1). El gratis: monedas y alguna ayuda; el premium: perlas, ayudas, corazones infinitos y,
// al final, una bandeja que solo da el pase
function ppPremioPase(k, premium) {
  if (!premium) return k % 5 === 0 ? { ayudas: { [['martillo', 'bomba', 'toques3', 'pista', 'deshacer', 'martillo'][(k / 5) - 1]]: 1 } } : { monedas: 20 + 5 * Math.floor(k / 3) };
  if (k === PP_CFG.pase.escalones) return { bandeja: 'dorada', perlas: 20 };
  if (k % 10 === 0) return { infinitas: 60 };
  if (k % 3 === 0) return { ayudas: { [['bomba', 'martillo', 'toques3', 'deshacer', 'pista'][(k / 3) % 5]]: 2 } };
  return { perlas: 3 + Math.floor(k / 10) };
}
function ppPaseHayPremio() {
  const P = ppPaseAlDia(), e = ppEscalon();
  for (let k = 1; k <= e; k++) if (!P.gratis[k] || (P.premium && !P.prem[k])) return true;
  return false;
}
function ppVentanaPase() {
  ppTutorial('pase');
  const P = ppPaseAlDia(), e = ppEscalon(), C = PP_CFG.pase, falta = C.puntos - (P.puntos % C.puntos);
  const finMes = new Date(); finMes.setMonth(finMes.getMonth() + 1, 1); finMes.setHours(0, 0, 0, 0);
  const t = ppAbre(`<h2>${tr('Pase de Pop')}</h2>
    <p class="pp-sub">${tr('Escalón {e} de {t}', { e, t: C.escalones })} · ${e < C.escalones ? tr('faltan {n} puntos para el siguiente', { n: falta }) : tr('¡pase completo!')}</p>
    <p class="pp-sub"><small>${tr('Ganas puntos al pasar niveles nuevos (uno más con 3 estrellas). Se renueva en {d} días.', { d: Math.ceil((finMes - Date.now()) / 86400000) })}</small></p>`, true);
  if (!P.premium) {
    const b = ppBoton('', 'pp-btn', () => ppCompraEuros(tr('Pase de Pop'), `<p>${tr('Desbloquea todos los premios premium de esta temporada.')}</p>`, C.id, () => { ppPaseAlDia().premium = true; ppGuarda(); ppVentanaPase(); ppPintaLateral(); }));
    b.innerHTML = `${ppIcono('i-pase', 30, '#ffd64a')} ${tr('DESBLOQUEAR PREMIUM · {p}', { p: C.precio })}`;
    t.appendChild(b);
  }
  const lista = document.createElement('div'); lista.className = 'pp-pase';
  for (let k = 1; k <= C.escalones; k++) {
    const fila = document.createElement('div'); fila.className = 'pp-pase-fila' + (k <= e ? ' pp-hecho' : '');
    fila.innerHTML = `<i>${k}</i>`;
    for (const premium of [false, true]) {
      const caja = document.createElement('button'); caja.type = 'button';
      const cogido = premium ? P.prem[k] : P.gratis[k], puede = k <= e && !cogido && (!premium || P.premium);
      caja.className = 'pp-pase-premio' + (premium ? ' pp-premium' : '') + (cogido ? ' pp-cogido' : '') + (puede ? ' pp-listo' : '');
      caja.innerHTML = ppPremioCandyHtml(ppPremioPase(k, premium), 24) + (premium && !P.premium ? '<s></s>' : '');
      caja.onclick = () => {
        if (!puede) return;
        play('ppPremio'); ppDaPremio(ppPremioPase(k, premium)); (premium ? P.prem : P.gratis)[k] = true; ppGuarda();
        const y = lista.scrollTop; ppVentanaPase(); const l = $pp('.pp-pase'); if (l) l.scrollTop = y; ppPintaLateral();
      };
      fila.appendChild(caja);
    }
    lista.appendChild(fila);
  }
  t.appendChild(lista);
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
  // abre por el primer premio que se puede recoger (o por donde vas)
  setTimeout(() => { const l = $pp('.pp-pase'), f = l && (l.querySelector('.pp-listo') || l.children[Math.max(0, e - 1)]); if (l && f) l.scrollTop = f.offsetTop - l.offsetTop - 10; }, 0);
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
    ppDaPremio(PP_REGALOS[hoy]); SAVE.regaloDia = ppHoy(); ppGuarda(); play('ppVictoria'); ppVibra([20, 30, 20]);
    const t2 = ppAbre(`<h2>${tr('¡Toma!')}</h2><div class="pp-cofre">${ppIcono('i-regalo', 100, '#9cf0a0')}</div>${ppPremioCandyHtml(PP_REGALOS[hoy], 40)}`);
    t2.appendChild(ppBoton(tr('¡GENIAL!'), 'pp-btn', ppCierra)); ppPintaLateral();
  }));
  else t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
}
// al llegar al camino: el regalo del día si no se ha abierto (una vez por sesión) o el pack de bienvenida cuando toca
function ppAlLlegarAlCamino() {
  if (PP_PANT.actual !== 'mapa' || !$pp('#pp-modal').hidden) return;   // solo si sigues en el camino (no al entrar en un nivel)
  if (ppMiraBienvenida()) return;
  if (SAVE.regaloDia !== ppHoy() && !PP_PASE_VISTO.regalo) { PP_PASE_VISTO.regalo = true; ppVentanaRegalo(); }
}
const PP_PASE_VISTO = { regalo: false };
