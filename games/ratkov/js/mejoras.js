// Fans of Ratkov · EN QUÉ SE GASTAN LAS CHAPAS: las MEJORAS del refugio (pestaña MEJORAS: estufa, enfermería, gimnasio y estanterías, tres
// niveles cada una, con chapas y materiales del alijo), las REPARACIONES (chaleco, casco y abrecartas vuelven a estar como nuevos) y el
// SOBORNO del puente del este (si hoy está cerrado, el guardia lo abre por unas chapas). Los efectos se leen con nivelMejora('id').
'use strict';
const MEJORAS = [
  { id: 'estufa', n: 'Estufa de leña', d: 'Sales con el cuerpo caliente: en la incursión, el frío sube un 12 % más despacio por nivel.',
    niveles: [{ chapas: 1200, con: [['tela', 2], ['tornillos', 3]] }, { chapas: 3500, con: [['tuberia', 2], ['cables', 2]] }, { chapas: 8000, con: [['placa', 2], ['cinta', 3]] }] },
  { id: 'enfermeria', n: 'Enfermería de campaña', d: 'Un catre y un botiquín grande: +10 de vida máxima por nivel.',
    niveles: [{ chapas: 1500, con: [['tela', 3], ['alcohol', 1]] }, { chapas: 4000, con: [['alcohol', 2], ['chip', 1]] }, { chapas: 9000, con: [['chip', 2], ['cables', 2]] }] },
  { id: 'gimnasio', n: 'Gimnasio (sin cuota)', d: 'Microblizz no paga el gimnasio, así que te lo montas tú: el aguante dura un 15 % más por nivel.',
    niveles: [{ chapas: 1000, con: [['tornillos', 4], ['tuberia', 1]] }, { chapas: 3000, con: [['tuberia', 2], ['cinta', 2]] }, { chapas: 7000, con: [['placa', 1], ['cables', 3]] }] },
  { id: 'estanteria', n: 'Estanterías del alijo', d: 'Más sitio para tus cosas: +30 casillas en el alijo por nivel.',
    niveles: [{ chapas: 800, con: [['tornillos', 4], ['tela', 2]] }, { chapas: 2500, con: [['tuberia', 2], ['tornillos', 6]] }, { chapas: 6000, con: [['placa', 2], ['cinta', 2]] }] },
];
const nivelMejora = id => ((SAVE.mejoras || {})[id] || 0);
// el alijo crece con las estanterías
function ajustaAlijo() { ALIJO_MAX = 120 + 30 * nivelMejora('estanteria'); }
// el precio de dejar algo como nuevo: la mitad de lo que vale, por lo que le falta
const precioReparar = o => Math.max(20, Math.ceil(OBJ[o.id].v * 0.5 * (1 - o.dur / OBJ[o.id].dur)));
const PRECIO_SOBORNO = 800;

/* ---------- la pestaña MEJORAS ---------- */
function pintaMejoras(raiz) {
  if (!SAVE.mejoras) SAVE.mejoras = {};
  let h = '<section class="tarjeta prepara"><img class="retrato" alt="" src="' + retratoCastor() + '"><div><p class="sup">' + esc(tr('OBRAS EN EL REFUGIO')) + '</p><h2>' + esc(tr('Mejoras')) + '</h2><p>' + esc(tr('«Con chapas y chatarra te arreglo el refugio. Sin chapas, te arreglo la cara.» BoomBeaver, maestro de obras.')) + '</p></div></section>';
  for (const m of MEJORAS) {
    const nv = nivelMejora(m.id), sig = m.niveles[nv];
    h += '<section class="tarjeta mejora"><h3>' + esc(tr(m.n)) + ' <small class="' + (nv ? 'bien' : '') + '">' + esc(trf('NIVEL %1 DE %2', nv, m.niveles.length)) + '</small></h3><p>' + esc(tr(m.d)) + '</p>';
    h += '<div class="niveles">' + m.niveles.map((_, i) => '<i class="' + (i < nv ? 'hecho' : '') + '"></i>').join('') + '</div>';
    if (sig) {
      const falta = sig.con.filter(([id, n]) => cuantos(SAVE.alijo, id) < n), puede = SAVE.chapas >= sig.chapas && !falta.length;
      h += '<p class="datos">' + esc(tr('PARA EL SIGUIENTE')) + ': <b>' + miles(sig.chapas) + ' ' + esc(tr('chapas')) + '</b> · ' + sig.con.map(([id, n]) => '<span class="' + (cuantos(SAVE.alijo, id) >= n ? 'bien' : 'malo') + '">' + Math.min(n, cuantos(SAVE.alijo, id)) + '/' + n + ' ' + esc(tr(OBJ[id].n)) + '</span>').join(' · ') + '</p>';
      h += '<button type="button" class="btn" data-a="mejora" data-i="' + m.id + '"' + (puede ? '' : ' disabled') + '>' + esc(tr('CONSTRUIR')) + '</button>';
    } else h += '<p class="datos bien">' + esc(tr('Al máximo. BoomBeaver ya no sabe qué más ponerle.')) + '</p>';
    h += '</section>';
  }
  // las reparaciones
  const rotos = [['chaleco', SAVE.equipo.chaleco], ['casco', SAVE.equipo.casco], ...SAVE.alijo.map((o, i) => [String(i), o])]
    .filter(([, o]) => o && OBJ[o.id] && OBJ[o.id].dur && o.dur != null && o.dur < OBJ[o.id].dur && o.id !== 'llave-despacho');   // la llave de despacho no se arregla: se gasta
  h += '<section class="tarjeta"><h3>' + esc(tr('REPARACIONES')) + '</h3><p>' + esc(tr('El chaleco y el casco se gastan al parar balas; el abrecartas se mella al despedir. Aquí vuelven a estar como nuevos.')) + '</p><div class="lista">';
  if (!rotos.length) h += '<p class="vacio">' + esc(tr('No tienes nada roto. Sospechoso.')) + '</p>';
  for (const [k, o] of rotos) h += filaObj(o, boton(trf('REPARAR (%1)', miles(precioReparar(o))), 'repara', k, SAVE.chapas >= precioReparar(o) ? 'bien' : ''), '<em>' + Math.round(o.dur) + '/' + OBJ[o.id].dur + '</em>');
  h += '</div></section>';
  raiz.innerHTML = h;
  conClick(raiz, (a, i) => {
    if (a === 'mejora') {
      const m = MEJORAS.find(x => x.id === i), nv = nivelMejora(i), sig = m && m.niveles[nv]; if (!sig) return;
      if (SAVE.chapas < sig.chapas || sig.con.some(([id, n]) => cuantos(SAVE.alijo, id) < n)) { play('deny'); return; }
      SAVE.chapas -= sig.chapas; for (const [id, n] of sig.con) quitar(SAVE.alijo, id, n); compacta(SAVE.alijo);
      SAVE.mejoras[i] = nv + 1; ajustaAlijo(); guardaPartida(); play('levelup'); toast(trf('%1: nivel %2', tr(m.n), nv + 1), true); repinta();
    }
    if (a === 'repara') {
      const o = i === 'chaleco' || i === 'casco' ? SAVE.equipo[i] : SAVE.alijo[+i]; if (!o) return;
      const p = precioReparar(o); if (SAVE.chapas < p) { play('deny'); return; }
      SAVE.chapas -= p; o.dur = OBJ[o.id].dur; guardaPartida(); play('compra'); toast(tr('Como nuevo. O casi.'), true); repinta();
    }
  });
}

/* ---------- el soborno del puente (en la incursión) ---------- */
// si estás junto al puente del este y hoy está cerrado, el botón de registrar se vuelve SOBORNAR: pagas del alijo y se abre
function avanzaSoborno() {
  RAID.soborno = null;
  if (RAID.tuto || RAID.cerca) return;
  const s = SALIDAS.find(x => x.id === 'puente'); if (!s || RAID.salidas[s.id] || lejos(JUG.x, JUG.z, s.x, s.z) > s.r + 2.5) return;
  RAID.soborno = s;
  if (!(ENT.accion || pulsado('registrar'))) return;
  if (SAVE.chapas < PRECIO_SOBORNO) { if (!RAID.avisoSoborno) { avisa(trf('El guardia quiere %1 chapas y no las tienes.', miles(PRECIO_SOBORNO)), 'malo'); RAID.avisoSoborno = true; } return; }
  SAVE.chapas -= PRECIO_SOBORNO; RAID.salidas[s.id] = true; RAID.soborno = null; guardaPartida(); play('compra');
  avisa(tr('El guardia mira hacia otro lado. «Yo no he visto nada. Y tú tampoco.»'), 'bien');
}
