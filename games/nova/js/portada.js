// Fans of Nova · Portada del prototipo: el botón que abre el menú de naves y la partida (fase 1).
// Para pruebas: ?jugar=1 abre el menú; ?casco=caza|crucero|fragata empieza directo; &auto=1 pone al bot; &vel=4 acelera; &ff=150 adelanta la partida N segundos.
'use strict';
(function () {
  const portada = document.getElementById('nv-portada'), q = location.search;
  const b = document.getElementById('nv-jugar');
  nvMontaMenu();
  nvEntrada();
  nvCargaEnemigos();
  nvCargaArte(() => {   // el botón aparece cuando el arte está cargado (el menú enseña las naves)
    b.hidden = false;
    nvPortadaOpciones(q);
    nvPortadaArranca(q);
    nvPortadaPruebas(q);
  });
  portada.hidden = false;
})();
// Opciones de la dirección para pruebas: el bot, inmortal y la velocidad
function nvPortadaOpciones(q) {
  if (/[?&]auto=1/.test(q)) NVP.auto = true;
  if (/[?&]inmortal=1/.test(q)) NVP.inmortal = true;   // escenario de pruebas de rendimiento (con ?auto=1&casco=caza deja la partida sola)
  const v = /[?&]vel=(\d+)/.exec(q); if (v) NVP.vel = +v[1];
}
// Dónde empieza: una partida directa (?casco=), un menú, la galaxia, la nave capital o, con versión nueva, sus novedades
function nvPortadaArranca(q) {
  const c = /[?&]casco=(\w+)/.exec(q);
  if (c) { nvJugar(); document.getElementById('nv-paneles').textContent = ''; NVP.casco = c[1]; const k = /[?&]cap=(\w+)/.exec(q), o = /[?&]of=(\w+)/.exec(q); NVP.cap = k ? k[1] : 'progamer'; NVP.ofi = o ? o[1] : null; nvEmpieza(c[1], NVP.cap, NVP.ofi); }
  else if (/[?&]menu=capitan/.test(q)) { nvJugar(); nvMenuCapitan('caza'); }
  else if (/[?&]menu=oficial/.test(q)) { nvJugar(); nvMenuOficial('caza', 'bunny'); }
  else if (/[?&]jugar=1/.test(q)) nvJugar();
  else if (!/[?&](galaxia|capital|casco|menu)=/.test(q) && nvNovedadesPendientes()) setTimeout(nvNovedades, 500);   // versión nueva: sus novedades salen solas una vez
  else if (/[?&]galaxia=1/.test(q)) nvJugarCampana();
  else if (/[?&]capital=1/.test(q)) { nvJugarCampana(); nvNaveCapital(); }
}
// Solo pruebas: empezar en un rango (?rango=), en la estación (?estacion=1, &taller=1) o adelantar la partida (?ff=segundos)
function nvPortadaPruebas(q) {
  const S = NVP.S; if (!S) return;
  const rg = /[?&]rango=(\d+)/.exec(q);
  if (rg) nvPruebaRango(S, +rg[1]);
  if (/[?&]estacion=1/.test(q)) { S.estado = 'estacion'; S.est = { cd: 0 }; S.estTaller = /[?&]taller=1/.test(q) ? { sel: [] } : null; }
  const ff = /[?&]ff=(\d+)/.exec(q);
  if (ff) { NVP.auto = true; while (S.t < +ff[1] && S.estado !== 'derrota' && S.estado !== 'victoria') { if (S.estado === 'cartas') nvElegirCarta(S, 0); else if (S.estado === 'estacion') nvBotEstacion(S); else nvPaso(S, 1 / 30); } }
}
// Empezar en ese rango, con las ranuras llenas y sin morir
function nvPruebaRango(S, rango) {
  const n = S.nave; n.rango = rango; n.escala = nvEscalaRango(n.rango); n.r = 0.42 * n.rAncho * n.escala; n.hpMax = n.hp = 1e6; S.chat = nvUmbral(n.rango - 1); nvAjustaTamanos(S);
  const ps = ['railgun', 'flak', 'laser', 'lanzador', 'drones'];
  for (const sl of nvRanuras(n.rango, S)) if (!n.armas.some(w => w.slot === sl.id) && sl.cara !== 'popa' && sl.tipos.includes(ps[0]) || sl.tipos.includes(ps[1])) if (!n.armas.some(w => w.slot === sl.id)) { const pt = sl.tipos.filter(t => ps.includes(t))[0], cg = nvCargasDe(pt); n.armas.push(nvArmaNueva(sl, pt, cg[n.armas.length % cg.length])); }
}

