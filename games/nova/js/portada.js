// Fans of Nova · Portada del prototipo: el botón que abre el menú de naves y la partida (fase 1).
// Para pruebas: ?jugar=1 abre el menú; ?casco=caza|crucero|fragata empieza directo; &auto=1 pone al bot; &vel=4 acelera; &ff=150 adelanta la partida N segundos.
'use strict';
(function () {
  const portada = document.getElementById('nv-portada'), q = location.search;
  portada.querySelector('#nv-estado').textContent = tr('Fans of Nova · prototipo');
  const b = document.getElementById('nv-jugar');
  b.textContent = tr('Jugar el prototipo');
  b.onclick = nvJugarCampana;
  nvEntrada();
  nvCargaArte(() => {   // el botón aparece cuando el arte está cargado (el menú enseña las naves)
    b.hidden = false;
    if (/[?&]auto=1/.test(q)) NVP.auto = true;
    const v = /[?&]vel=(\d+)/.exec(q); if (v) NVP.vel = +v[1];
    const c = /[?&]casco=(\w+)/.exec(q);
    if (c) { nvJugar(); document.getElementById('nv-paneles').textContent = ''; NVP.casco = c[1]; const k = /[?&]cap=(\w+)/.exec(q), o = /[?&]of=(\w+)/.exec(q); NVP.cap = k ? k[1] : 'progamer'; NVP.ofi = o ? o[1] : null; nvEmpieza(c[1], NVP.cap, NVP.ofi); }
    else if (/[?&]menu=capitan/.test(q)) { nvJugar(); nvMenuCapitan('caza'); }
    else if (/[?&]menu=oficial/.test(q)) { nvJugar(); nvMenuOficial('caza', 'bunny'); }
    else if (/[?&]jugar=1/.test(q)) nvJugar();
    else if (/[?&]galaxia=1/.test(q)) nvJugarCampana();
    else if (/[?&]capital=1/.test(q)) { nvJugarCampana(); nvNaveCapital(); }
    const rg = /[?&]rango=(\d+)/.exec(q);   // solo pruebas: empezar en ese rango, con las ranuras llenas y sin morir
    if (rg && NVP.S) { const S = NVP.S, n = S.nave; n.rango = +rg[1]; n.escala = nvEscalaRango(n.rango); n.r = 0.42 * n.rAncho * n.escala; n.hpMax = n.hp = 1e6; S.chat = nvUmbral(n.rango - 1); nvAjustaTamanos(S); const ps = ['railgun', 'flak', 'laser', 'lanzador', 'drones'], cs = ['cinetica', 'energia', 'termica', 'em', 'explosiva']; for (const sl of nvRanuras(n.rango, S)) if (!n.armas.some(w => w.slot === sl.id) && sl.cara !== 'popa' && sl.tipos.includes(ps[0]) || sl.tipos.includes(ps[1])) if (!n.armas.some(w => w.slot === sl.id)) n.armas.push(nvArmaNueva(sl, sl.tipos.filter(t => ps.includes(t))[0], cs[n.armas.length % 5])); }
    if (/[?&]estacion=1/.test(q) && NVP.S) { NVP.S.estado = 'estacion'; NVP.S.est = { cd: 0 }; NVP.S.estTaller = /[?&]taller=1/.test(q) ? { sel: [] } : null; }   // solo pruebas
    const ff = /[?&]ff=(\d+)/.exec(q);
    if (ff && NVP.S) { const S = NVP.S; NVP.auto = true; while (S.t < +ff[1] && S.estado !== 'derrota' && S.estado !== 'victoria') { if (S.estado === 'cartas') nvElegirCarta(S, 0); else if (S.estado === 'estacion') nvBotEstacion(S); else nvPaso(S, 1 / 30); } }
  });
  portada.hidden = false;
})();
